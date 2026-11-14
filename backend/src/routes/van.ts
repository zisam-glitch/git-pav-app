import { Router, Response, NextFunction } from "express";
import crypto from "crypto";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { HttpError } from "../middleware/error-handler";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  shiftStartSchema,
  locationPingSchema,
  phaseUpdateSchema,
  vanRequestIdParamsSchema,
  createVanRequestSchema,
  availabilityQuerySchema,
} from "../schemas/van-dispatch";
import {
  etaSecondsToNewPatient,
  formatEtaLabel,
  Point,
  MAX_QUEUE_DEPTH,
  REQUEST_TIMEOUT_MS,
  roadRoute,
} from "../lib/van-eta";
import { clinicalRecordEncryptionService, decryptString } from "../lib/encryption";
import { haversineMetres, postcodeToCoordinates } from "../lib/geo";
import { countOpenStops, loadShiftQueue, quoteBestVan, stopsAheadOf } from "../lib/van-quote";
import { broadcastEtaUpdates, isMaterialDrift } from "../lib/van-eta-broadcast";
import { env } from "../config/env";
import {
  releaseVanDeposit,
  isDepositAuthorized,
} from "../lib/van-payments";
import { sendPatientNotification, sendUserNotification } from "../lib/patient-push";
import { judgePing } from "../lib/van-location";
import { customerEphemeralKey, ensureStripeCustomer } from "../lib/stripe-customer";
import { depositPaymentDetails } from "../lib/payment-details";
import { safeError } from "../lib/log-safety";
import { acceptVanRequest, cancelVanRequest, changeVanPhase, declineVanRequest, endVanShift, recordVanEvent } from "../lib/van-dispatch";

const router = Router();
const isMockStripe = env.isMockStripe;
const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as never,
});

// Max metres between the patient's GPS fix and the postcode centroid before
// the request is rejected as inconsistent (see create-request flow).
const POSTCODE_DISTANCE_TOLERANCE_M = parseInt(
  process.env.VAN_POSTCODE_TOLERANCE_M ?? "1000",
  10
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: `Requires ${role} role` });
    }
    return next();
  };
}

/** "SW1A 1AA" -> "SW1A 1": the postcode sector, a few thousand addresses. */
export function postcodeSector(postcode: unknown): string | null {
  if (typeof postcode !== "string") return null;
  const compact = postcode.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5) return null;
  return `${compact.slice(0, -3)} ${compact.slice(-3, -2)}`;
}

/** Two decimal places: roughly a kilometre, enough to judge the drive. */
const roundCoordinate = (value: unknown) => (typeof value === "number" ? Math.round(value * 100) / 100 : value);

/**
 * What an operator sees of a request before accepting it: the area, never
 * the address (VR-5). Coordinates are rounded to about 1 km and the
 * postcode cut to its sector; parking type stays because it decides
 * whether the van can take the job. Gate codes and notes are left out.
 */
export function sanitizeIncomingRequest(request: any) {
  const { accessDetails, ...sanitized } = request;
  // Initials only: the name is not needed to decide whether the van can take
  // the job, and the operator gets it once they accept (N16).
  if (sanitized.patient) {
    const initial = (name: unknown) => (typeof name === "string" && name.trim() ? `${name.trim()[0].toUpperCase()}.` : "");
    sanitized.patient = { firstName: initial(sanitized.patient.firstName), lastName: initial(sanitized.patient.lastName) };
  }
  sanitized.patientLat = roundCoordinate(sanitized.patientLat);
  sanitized.patientLng = roundCoordinate(sanitized.patientLng);
  if (accessDetails) {
    sanitized.accessDetails = {
      parkingType: accessDetails.parkingType,
      city: accessDetails.city,
      postcode: postcodeSector(accessDetails.postcode),
    };
  }
  return sanitized;
}

/**
 * The road route from the van to the patient, for the patient's map: only
 * while the van is driving to them and they may see where it is (call after
 * hideVanUnlessNext). Null otherwise, or when no route provider gives one.
 */
async function routeToPatient(request: {
  phase: string | null;
  patientLat: number;
  patientLng: number;
  shift: { lastLat: number | null; lastLng: number | null } | null;
}) {
  if (request.phase !== "en_route" || request.shift?.lastLat == null || request.shift?.lastLng == null) return null;
  return roadRoute(
    { lat: request.shift.lastLat, lng: request.shift.lastLng },
    { lat: request.patientLat, lng: request.patientLng }
  );
}

/**
 * Hides the van's position from a patient who isn't next in the queue. The
 * ETA is worked out from the real position first, so a patient further back
 * still gets one (VR-4).
 */
function hideVanUnlessNext(request: { queuePosition: number | null; shift: { lastLat: number | null; lastLng: number | null; lastLocationAt: Date | null } | null }) {
  if (request.queuePosition !== 1 && request.shift?.lastLat != null) {
    request.shift.lastLat = null;
    request.shift.lastLng = null;
    request.shift.lastLocationAt = null;
  }
}

/**
 * Decrypt sensitive fields in access details for authorized users
 */
async function decryptAccessDetails(accessDetails: any): Promise<any> {
  if (!accessDetails) return accessDetails;
  
  const decrypted = { ...accessDetails };
  
  if (accessDetails.gateCode && typeof accessDetails.gateCode === 'object') {
    try {
      decrypted.gateCode = await clinicalRecordEncryptionService.decryptField(accessDetails.gateCode);
    } catch (error) {
      console.error('Failed to decrypt gateCode:', safeError(error));
      decrypted.gateCode = '[ENCRYPTED]';
    }
  }
  
  if (accessDetails.accessNotes && typeof accessDetails.accessNotes === 'object') {
    try {
      decrypted.accessNotes = await clinicalRecordEncryptionService.decryptField(accessDetails.accessNotes);
    } catch (error) {
      console.error('Failed to decrypt accessNotes:', safeError(error));
      decrypted.accessNotes = '[ENCRYPTED]';
    }
  }
  
  return decrypted;
}

/** Get operator profile (no auto-creation) */
async function getOperatorProfile(userId: string) {
  const profile = await prisma.operatorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new HttpError(403, "Operator profile not found. Please contact administrator to set up your operator profile.");
  }
  return profile;
}

/** Get operator's active van assignment (no auto-assignment) */
async function getAssignedVan(operatorId: string) {
  const now = new Date();
  const assignment = await prisma.vanOperatorAssignment.findFirst({
    where: {
      operatorId,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      // A retired van (BE-10) can't go out on a shift.
      van: { isActive: true },
    },
    include: { van: { include: { servicePolygons: true } } },
    orderBy: { startsAt: "desc" },
  });

  if (!assignment) {
    return null;
  }

  return assignment.van;
}

/** Get current active shift for operator */
async function getActiveShift(operatorId: string) {
  return prisma.vanShift.findFirst({
    where: { operatorId, status: { in: ["online", "paused"] }, endedAt: null },
  });
}

/** True for a write refused by a unique index, such as the one-open-shift rule. */
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// Local pointInPolygon removed — unified coverage checking lives in
// lib/van-coverage.ts (PostGIS-first with JS fallback).

// ─── LEGACY routes removed for security reasons ─────────────────────────────
// These routes have been removed as they were superseded by the new dispatch system
// and had authorization vulnerabilities allowing any logged-in patient to access
// all van appointments and modify them. Use the new dispatch endpoints instead.

// ─── OPERATOR — Shift Management ──────────────────────────────────────────────

// POST /api/van/shift/start
router.post("/shift/start", requireAuth, requireRole("operator"), validateBody(shiftStartSchema), async (req: AuthRequest, res: Response) => {
  const operatorId = req.user!.sub;

  // Ensure operator profile exists (throws HttpError 403 when missing)
  const opProfile = await getOperatorProfile(operatorId);

  // Check no active shift exists
  const existing = await getActiveShift(opProfile.id);
  if (existing) {
    return res.status(409).json({ error: "Shift already active", shiftId: existing.id });
  }

  // Get assigned van
  const van = await getAssignedVan(opProfile.id);
  if (!van) {
    return res.status(403).json({ 
      error: "No van assigned to this operator", 
      message: "Please contact your administrator to assign you to a van before starting a shift." 
    });
  }

  // Check no other active shift on this van
  const vanActiveShift = await prisma.vanShift.findFirst({
    where: { vanId: van.id, status: { in: ["online", "paused"] }, endedAt: null },
  });
  if (vanActiveShift) {
    return res.status(409).json({ error: "Another operator already has an active shift on this van." });
  }

  const { lat, lng, accuracyM } = req.body;

  // The checks above give a helpful message; the partial unique indexes on
  // open shifts stop two starts that race past them (VR-6).
  let shift;
  try {
    shift = await prisma.vanShift.create({
      data: {
        vanId: van.id,
        operatorId: opProfile.id,
        status: "online",
        lastLat: lat ?? null,
        lastLng: lng ?? null,
        lastLocationAt: lat != null ? new Date() : null,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({ error: "Shift already active", message: "This operator or van already has an open shift." });
    }
    throw error;
  }

  if (lat != null && lng != null) {
    await prisma.vanLocationPing.create({
      data: { shiftId: shift.id, lat, lng, accuracyM: accuracyM ?? null },
    });
  }

  return res.status(201).json({ ...shift, van: { id: van.id, name: van.name, registrationPlate: van.registrationPlate } });
});

// POST /api/van/shift/pause
router.post("/shift/pause", requireAuth, requireRole("operator"), async (req: AuthRequest, res: Response) => {
  const opProfile = await getOperatorProfile(req.user!.sub);

  const shift = await getActiveShift(opProfile.id);
  if (!shift) return res.status(404).json({ error: "No active shift" });
  if (shift.status === "paused") return res.json({ message: "Already paused", shift });

  const updated = await prisma.vanShift.update({ where: { id: shift.id }, data: { status: "paused" } });
  return res.json(updated);
});

// POST /api/van/shift/resume
router.post("/shift/resume", requireAuth, requireRole("operator"), async (req: AuthRequest, res: Response) => {
  const opProfile = await getOperatorProfile(req.user!.sub);

  const shift = await getActiveShift(opProfile.id);
  if (!shift) return res.status(404).json({ error: "No active shift" });

  const updated = await prisma.vanShift.update({ where: { id: shift.id }, data: { status: "online" } });
  return res.json(updated);
});

// POST /api/van/shift/end
router.post("/shift/end", requireAuth, requireRole("operator"), async (req: AuthRequest, res: Response) => {
  const opProfile = await getOperatorProfile(req.user!.sub);

  const shift = await getActiveShift(opProfile.id);
  if (!shift) return res.status(404).json({ error: "No active shift" });

  const result = await endVanShift(shift);
  if (!result.ended) {
    return res.status(409).json({
      error: "Cannot end shift with open stops",
      message: `Complete or cancel all ${result.openStops} active stop(s) before ending your shift.`,
      openStops: result.openStops,
    });
  }

  return res.json(result.shift);
});

// POST /api/van/shift/location — GPS ping
router.post("/shift/location", requireAuth, requireRole("operator"), validateBody(locationPingSchema), async (req: AuthRequest, res: Response) => {
  const opProfile = await getOperatorProfile(req.user!.sub);

  const shift = await getActiveShift(opProfile.id);
  if (!shift) return res.status(404).json({ error: "No active shift" });

  const { lat, lng, accuracyM, recordedAt } = req.body;

  const previousLat = shift.lastLat;
  const previousLng = shift.lastLng;

  // Believe a report only if it is recent, accurate, newer than the last one
  // and physically possible (N18). A refused report is still a 200: the phone
  // has nothing to retry, the next fix replaces it.
  const verdict = judgePing(
    shift.lastLat != null && shift.lastLng != null
      ? { lat: shift.lastLat, lng: shift.lastLng, at: shift.lastLocationAt }
      : null,
    { lat, lng, accuracyM, recordedAt: recordedAt ? new Date(recordedAt) : null }
  );
  if (!verdict.accept) return res.json({ ok: true, accepted: false, reason: verdict.reason });

  await prisma.$transaction([
    prisma.vanLocationPing.create({
      data: { shiftId: shift.id, lat, lng, accuracyM: accuracyM ?? null, recordedAt: verdict.recordedAt },
    }),
    prisma.vanShift.update({
      where: { id: shift.id },
      data: { lastLat: lat, lastLng: lng, lastLocationAt: verdict.recordedAt },
    }),
  ]);

  // Live ETA re-push: only when the van has materially moved (threshold
  // scales with queue length). Fire-and-forget — the ping response stays
  // instant and push/DB failures inside the broadcast are swallowed.
  const activeStopCount = await prisma.vanServiceRequest.count({
    where: { shiftId: shift.id, status: { in: ["accepted", "in_progress"] } },
  });
  if (isMaterialDrift(previousLat, previousLng, lat, lng, activeStopCount)) {
    void broadcastEtaUpdates(shift.id).catch((err) =>
      console.error("[VAN ETA PUSH] broadcast failed:", safeError(err))
    );
  }

  return res.json({ ok: true, accepted: true });
});

// GET /api/van/shift/current — operator dashboard data
router.get("/shift/current", requireAuth, requireRole("operator"), async (req: AuthRequest, res: Response) => {
  const opProfile = await getOperatorProfile(req.user!.sub);

  const shift = await getActiveShift(opProfile.id);
  if (!shift) return res.json({ shift: null });

  const [queue, incoming, van] = await Promise.all([
    prisma.vanServiceRequest.findMany({
      where: { shiftId: shift.id, status: { in: ["accepted", "in_progress"] } },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        service: { select: { name: true, durationMinutes: true } },
      },
      orderBy: { queuePosition: "asc" },
    }),
    prisma.vanServiceRequest.findMany({
      where: { shiftId: shift.id, status: "pending" },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        service: { select: { name: true, durationMinutes: true } },
      },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.van.findUnique({ where: { id: shift.vanId }, select: { name: true, registrationPlate: true } }),
  ]);

  const decryptedQueue = await Promise.all(
    queue.map(async (item) => ({
      ...item,
      accessDetails: item.accessDetails ? await decryptAccessDetails(item.accessDetails) : item.accessDetails,
      notes: item.notes ? await decryptString(item.notes) : item.notes,
    }))
  );

  // Sanitize incoming requests to remove sensitive data before acceptance
  const sanitizedIncoming = incoming.map(sanitizeIncomingRequest);

  return res.json({ shift, van, queue: decryptedQueue, incoming: sanitizedIncoming });
});

// POST /api/van/requests/:id/accept
// POST /api/van/requests/:id/decline
//
// Both are safe to tap twice or retry. The rules (who may answer what, the
// lock, the deposit, the appointment, the history, what the patient is told)
// live in lib/van-dispatch.ts.
router.post("/requests/:id/accept", requireAuth, requireRole("operator"), validateParams(vanRequestIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const opProfile = await getOperatorProfile(req.user!.sub);

  const shift = await getActiveShift(opProfile.id);
  if (!shift) return res.status(404).json({ error: "No active shift" });

  const result = await acceptVanRequest({ shiftId: shift.id, requestId: String(req.params.id), actorRole: "operator" });
  return res.status(result.status).json(result.body);
});

router.post("/requests/:id/decline", requireAuth, requireRole("operator"), validateParams(vanRequestIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const opProfile = await getOperatorProfile(req.user!.sub);

  const shift = await getActiveShift(opProfile.id);
  if (!shift) return res.status(404).json({ error: "No active shift" });

  const result = await declineVanRequest({ shiftId: shift.id, requestId: String(req.params.id), actorRole: "operator" });
  return res.status(result.status).json(result.body);
});

// POST /api/van/requests/:id/phase
// The rules (allowed moves, queue order, repeat-safety, real appointment times,
// history, what the patient is told) live in lib/van-dispatch.ts.
router.post("/requests/:id/phase", requireAuth, requireRole("operator"), validateParams(vanRequestIdParamsSchema), validateBody(phaseUpdateSchema), async (req: AuthRequest, res: Response) => {
  const opProfile = await getOperatorProfile(req.user!.sub);

  const shift = await getActiveShift(opProfile.id);
  if (!shift) return res.status(404).json({ error: "No active shift" });

  const { phase, notes } = req.body;
  const result = await changeVanPhase({
    shiftId: shift.id,
    requestId: String(req.params.id),
    phase,
    notes,
    actorRole: "operator",
  });
  return res.status(result.status).json(result.body);
});

// ─── PATIENT — Availability & Requests ────────────────────────────────────────

// GET /api/van/availability?lat=&lng=
router.get("/availability", requireAuth, async (req: AuthRequest, res: Response) => {
  const latNum = parseFloat(String(req.query.lat));
  const lngNum = parseFloat(String(req.query.lng));
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: "Invalid lat or lng query parameter" });
  }
  const patientPoint: Point = { lat: latNum, lng: lngNum };

  // The best van for this address, counting requests still waiting for an
  // answer as part of each van's queue (N7). Same quote as the request itself.
  const quote = await quoteBestVan(patientPoint);

  if (quote.kind === "no_van") {
    return res.json({
      available: false,
      etaSeconds: null,
      etaLabel: null,
      queueLength: 0,
      vanId: null,
      shiftId: null,
      message: "No van on duty — try clinic, video, or check back later.",
    });
  }

  if (quote.kind === "none_available") {
    return res.json({
      available: false,
      etaSeconds: null,
      etaLabel: null,
      queueLength: 0,
      vanId: null,
      shiftId: null,
      message: "Van is busy or queue is full in your area. Try again shortly.",
    });
  }

  const { best } = quote;
  return res.json({
    available: true,
    etaSeconds: best.etaSeconds,
    etaLabel: formatEtaLabel(best.etaSeconds),
    queueLength: best.queueLength,
    vanId: best.shift.vanId,
    shiftId: best.shift.id,
    message: `Van available · ${formatEtaLabel(best.etaSeconds)} estimated arrival`,
  });
});

// POST /api/van/requests — create request
router.post("/requests", requireAuth, validateBody(createVanRequestSchema), async (req: AuthRequest, res: Response) => {
  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
  });
  if (!patientProfile) return res.status(403).json({ error: "Patient profile required" });

  // Check for an existing open request
  const existingRequest = await prisma.vanServiceRequest.findFirst({
    where: {
      patientId: patientProfile.id,
      status: { in: ["pending", "accepted", "in_progress"] },
    },
  });
  if (existingRequest) {
    return res.status(409).json({
      error: "You already have an active van request",
      requestId: existingRequest.id,
    });
  }

  const { serviceId, accessDetails } = req.body;
  const patientPoint: Point = { lat: accessDetails.lat, lng: accessDetails.lng };

  // Validate that the provided coordinates are reasonable for the given postcode
  if (accessDetails.postcode) {
    const postcodeCoords = await postcodeToCoordinates(accessDetails.postcode);
    if (postcodeCoords) {
      const distance = haversineMetres(patientPoint, postcodeCoords);
      // Tolerance for postcode-boundary cases. Postcode centroids can sit
      // well over 1 km from the actual door in rural districts, so the limit
      // is env-tunable (default 1000 m).
      if (distance > POSTCODE_DISTANCE_TOLERANCE_M) {
        return res.status(400).json({
          error: "Address coordinates too far from postcode",
          message: "The provided location coordinates are too far from the given postcode. Please check your location or postcode.",
        });
      }
    }
  }

  // Encrypt sensitive fields before storage
  const encryptedAccessDetails = { ...accessDetails };
  if (accessDetails.gateCode) {
    const encryptedGateCode = await clinicalRecordEncryptionService.encryptField(accessDetails.gateCode);
    encryptedAccessDetails.gateCode = encryptedGateCode;
  }
  if (accessDetails.accessNotes) {
    const encryptedNotes = await clinicalRecordEncryptionService.encryptField(accessDetails.accessNotes);
    encryptedAccessDetails.accessNotes = encryptedNotes;
  }

  // Same quote as the availability check (lib/van-quote.ts).
  const quote = await quoteBestVan(patientPoint);
  if (quote.kind !== "best") {
    return res.status(409).json({
      error: "No van available in your area",
      message: "The van may be offline or queue is full. Try again shortly.",
    });
  }
  const bestShift = quote.best.shift;
  const bestEta = quote.best.etaSeconds;

  // Validate service exists
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return res.status(404).json({ error: "Service not found" });
  if (!service.isActive) return res.status(409).json({ error: "This service is no longer offered" });
  // Only treatments the van can do (N1); clinic and video bookings check theirs.
  if (!service.supportedChannels.includes("van")) {
    return res.status(409).json({ error: "This treatment isn't available by van", message: "Choose a treatment the van offers, or book at the clinic." });
  }

  // The id is chosen up front so the deposit intent carries it from the
  // start; no follow-up metadata update can fail and leave "pending" (VR-11).
  const requestId = crypto.randomUUID();

  // Create Stripe PaymentIntent for deposit (manual capture)
  let paymentIntentId: string | null = null;
  let clientSecret: string | null = null;
  let customerId: string | null = null;
  let customerEphemeralKeySecret: string | null = null;

  if (isMockStripe) {
    paymentIntentId = `pi_mock_van_${Date.now()}`;
    clientSecret = `${paymentIntentId}_secret_mock`;
  } else {
    try {
      // As the patient's Customer, so the sheet offers saved cards (decisions log #15).
      customerId = await ensureStripeCustomer(stripe, req.user!.sub);
      if (customerId) customerEphemeralKeySecret = await customerEphemeralKey(stripe, customerId);
      const payer = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: { email: true } });
      const paymentIntent = await stripe.paymentIntents.create({
        amount: service.depositPence,
        currency: "gbp",
        ...(customerId ? { customer: customerId } : {}),
        ...depositPaymentDetails("van", payer?.email),
        capture_method: "manual", // Capture when operator accepts
        metadata: {
          vanServiceRequestId: requestId,
          patientUserId: req.user!.sub,
          serviceName: service.name,
          channel: "van",
        },
        automatic_payment_methods: { enabled: true },
      },
        // Per-attempt UUID: prevents same-ms duplicate intents under
        // concurrency. Cross-retry protection comes from the duplicate-
        // active-request guard; a stable key here would be harmful because
        // Stripe replays the same (possibly released) intent for 24h.
        { idempotencyKey: `van-request-deposit:${crypto.randomUUID()}` }
      );
      
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
    } catch (error) {
      console.error("Failed to create Stripe PaymentIntent:", safeError(error));
      return res.status(500).json({ error: "Failed to initialize payment" });
    }
  }

  // The quote above was taken without a lock, so two patients can both see
  // room for one more. The last check and the insert run together under the
  // shift lock, with no Stripe call inside it (N7).
  let request;
  try {
    request = await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${bestShift.id}`}))`;
        if ((await countOpenStops(tx, bestShift.id)) >= MAX_QUEUE_DEPTH) return null;
        const created = await tx.vanServiceRequest.create({
          data: {
            id: requestId,
            shiftId: bestShift.id,
            vanId: bestShift.vanId,
            patientId: patientProfile.id,
            serviceId,
            patientLat: patientPoint.lat,
            patientLng: patientPoint.lng,
            accessDetails: encryptedAccessDetails,
            expiresAt: new Date(Date.now() + REQUEST_TIMEOUT_MS),
            etaSecondsSnapshot: Math.round(bestEta),
            paymentIntentId,
          },
        });
        await recordVanEvent(tx, { requestId: created.id, type: "requested", actorRole: "patient" });
        return created;
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
  } catch (error) {
    // A second request that raced past the open-request check above: the
    // unique index refuses it. Its unconfirmed intent is cancelled.
    if (isUniqueViolation(error)) {
      if (paymentIntentId) await releaseVanDeposit(paymentIntentId, "duplicate_request");
      return res.status(409).json({ error: "You already have an active van request" });
    }
    throw error;
  }

  if (!request) {
    // The van filled up while this request was being set up: lift the hold.
    if (paymentIntentId) await releaseVanDeposit(paymentIntentId, "queue_full");
    return res.status(409).json({
      error: "No van available in your area",
      message: "The van may be offline or queue is full. Try again shortly.",
    });
  }

  // Send notification to patient about request creation
  await sendPatientNotification(
    patientProfile.id,
    "Van Request Submitted",
    "Your van visit request has been submitted and is pending operator acceptance.",
    { requestId: request.id, status: "pending" }
  );

  // Tell the operator's phone: a four-minute window is missed by anyone who
  // is driving or treating unless something alerts them (N13). No address or
  // name in the push. Never throws.
  const operatorUser = await prisma.operatorProfile.findFirst({
    where: { shifts: { some: { id: bestShift.id } } },
    select: { userId: true },
  });
  if (operatorUser) {
    void sendUserNotification(
      operatorUser.userId,
      "New van request",
      "A patient in your area needs a visit. Open the app to accept or decline.",
      { type: "van_request_incoming" }
    );
  }

  // VR-10: Strip encrypted accessDetails ciphertext from response DTO
  const { accessDetails: _, ...sanitizedRequest } = request;

  return res.status(201).json({
    ...sanitizedRequest,
    etaLabel: formatEtaLabel(Math.round(bestEta)),
    paymentRequired: true,
    depositAmount: service.depositPence,
    ...(clientSecret && { clientSecret }),
    ...(customerId && customerEphemeralKeySecret && { customerId, customerEphemeralKeySecret }),
    ...(paymentIntentId && { paymentIntentId }),
    isMockPayment: isMockStripe,
  });
});

// GET /api/van/requests/mine/active
router.get("/requests/mine/active", requireAuth, async (req: AuthRequest, res: Response) => {
  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
  });
  if (!patientProfile) return res.status(403).json({ error: "Patient profile required" });

  const request = await prisma.vanServiceRequest.findFirst({
    where: {
      patientId: patientProfile.id,
      status: { in: ["pending", "accepted", "in_progress"] },
    },
    include: {
      service: { select: { name: true, durationMinutes: true } },
      van: { select: { name: true, registrationPlate: true } },
      shift: { select: { lastLat: true, lastLng: true, lastLocationAt: true, status: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  if (!request) return res.json(null);

  // Decrypt sensitive fields for the requesting patient
  if (request.accessDetails) {
    request.accessDetails = await decryptAccessDetails(request.accessDetails);
  }
  if (request.notes) {
    request.notes = await decryptString(request.notes);
  }

  // Compute live ETA from the van's real position, then hide it below
  // unless this patient is next (VR-4).
  let etaSeconds: number | null = null;
  let etaLabel: string | null = null;
  if (request.shift && request.shift.lastLat != null && request.shift.lastLng != null) {
    const vanPoint: Point = { lat: request.shift.lastLat, lng: request.shift.lastLng };
    // Only stops ahead of this patient: the accepted stops before their place,
    // or for a pending request every accepted stop and the earlier pending ones.
    const stopsAhead = stopsAheadOf(await loadShiftQueue(prisma, request.shiftId), request);
    etaSeconds = await etaSecondsToNewPatient(vanPoint, stopsAhead, {
      lat: request.patientLat,
      lng: request.patientLng,
    });
    etaLabel = formatEtaLabel(etaSeconds);
  }
  hideVanUnlessNext(request);

  const depositAuthorized = await isDepositAuthorized(
    request.paymentIntentId,
    request.depositAuthorizedAt
  );

  return res.json({ ...request, etaSeconds, etaLabel, depositAuthorized, route: await routeToPatient(request) });
});

// GET /api/van/requests/:id
router.get("/requests/:id", requireAuth, validateParams(vanRequestIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const requestId = String(req.params.id);
  const request = await prisma.vanServiceRequest.findUnique({
    where: { id: requestId },
    include: {
      service: { select: { name: true, durationMinutes: true } },
      van: { select: { name: true, registrationPlate: true } },
      shift: { select: { id: true, operatorId: true, lastLat: true, lastLng: true, lastLocationAt: true, status: true } },
    },
  });

  if (!request) return res.status(404).json({ error: "Request not found" });

  if (req.user!.role === "operator") {
    const opProfile = await getOperatorProfile(req.user!.sub);
    if (request.shift?.operatorId !== opProfile.id) {
      return res.status(403).json({ error: "Request not on your shift" });
    }
    if (request.status === "pending") {
      return res.json(sanitizeIncomingRequest(request));
    }
    if (request.accessDetails && (request.status === "accepted" || request.status === "in_progress")) {
      request.accessDetails = await decryptAccessDetails(request.accessDetails);
    }
    if (request.notes) {
      request.notes = await decryptString(request.notes);
    }
  } else {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.sub },
    });
    if (!patientProfile) return res.status(403).json({ error: "Patient profile required" });
    if (request.patientId !== patientProfile.id) return res.status(403).json({ error: "Not your request" });

    // Decrypt sensitive fields for the requesting patient
    if (request.accessDetails) {
      request.accessDetails = await decryptAccessDetails(request.accessDetails);
    }
    if (request.notes) {
      request.notes = await decryptString(request.notes);
    }
  }

  let etaSeconds: number | null = null;
  let etaLabel: string | null = null;
  if (request.status === "accepted" || request.status === "in_progress") {
    if (request.shift?.lastLat != null && request.shift?.lastLng != null) {
      const vanPoint: Point = { lat: request.shift.lastLat, lng: request.shift.lastLng };
      const stopsAhead = stopsAheadOf(await loadShiftQueue(prisma, request.shiftId), request);
      etaSeconds = await etaSecondsToNewPatient(vanPoint, stopsAhead, {
        lat: request.patientLat,
        lng: request.patientLng,
      });
      etaLabel = formatEtaLabel(etaSeconds);
    }
  }
  if (req.user!.role !== "operator") hideVanUnlessNext(request);

  const depositAuthorized = await isDepositAuthorized(
    request.paymentIntentId,
    request.depositAuthorizedAt
  );

  const route = req.user!.role === "operator" ? null : await routeToPatient(request);
  return res.json({ ...request, etaSeconds, etaLabel, depositAuthorized, route });
});

// POST /api/van/requests/:id/payment-retry
// Returns the deposit PaymentIntent client secret so a patient who closed the
// app mid-PaymentSheet (or whose authorisation failed) can retry without
// creating a new request. Pending requests only.
router.post("/requests/:id/payment-retry", requireAuth, validateParams(vanRequestIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
  });
  if (!patientProfile) return res.status(403).json({ error: "Patient profile required" });

  const requestId = String(req.params.id);
  const request = await prisma.vanServiceRequest.findUnique({
    where: { id: requestId },
    include: { service: { select: { depositPence: true } } },
  });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.patientId !== patientProfile.id) return res.status(403).json({ error: "Not your request" });
  if (request.status !== "pending") {
    return res.status(409).json({ error: `Deposit can only be authorized while the request is pending (current: ${request.status})` });
  }
  if (!request.paymentIntentId) {
    return res.status(409).json({ error: "No deposit payment attached to this request" });
  }

  if (isMockStripe) {
    return res.json({
      clientSecret: `${request.paymentIntentId}_secret_mock`,
      paymentIntentId: request.paymentIntentId,
      depositAmount: request.service.depositPence,
      alreadyAuthorized: false,
      isMockPayment: true,
    });
  }

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.retrieve(request.paymentIntentId);
  } catch (error) {
    console.error("payment-retry: failed to retrieve PaymentIntent:", safeError(error));
    return res.status(502).json({ error: "Payment service unavailable. Please try again." });
  }

  // Already authorised — nothing for the patient to do.
  if (intent.status === "requires_capture") {
    return res.json({
      clientSecret: null,
      paymentIntentId: request.paymentIntentId,
      depositAmount: request.service.depositPence,
      alreadyAuthorized: true,
      isMockPayment: false,
    });
  }

  if (intent.status !== "requires_payment_method") {
    return res.status(409).json({
      error: `Deposit is not awaiting authorization (status: ${intent.status})`,
    });
  }

  // The intent's own Customer, so the sheet shows that patient's saved cards.
  const customerId = typeof intent.customer === "string" ? intent.customer : intent.customer?.id ?? null;
  const customerEphemeralKeySecret = customerId ? await customerEphemeralKey(stripe, customerId) : null;

  return res.json({
    clientSecret: intent.client_secret,
    paymentIntentId: request.paymentIntentId,
    depositAmount: request.service.depositPence,
    alreadyAuthorized: false,
    isMockPayment: false,
    ...(customerId && customerEphemeralKeySecret && { customerId, customerEphemeralKeySecret }),
  });
});

// POST /api/van/requests/:id/cancel
router.post("/requests/:id/cancel", requireAuth, validateParams(vanRequestIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
  });
  if (!patientProfile) return res.status(403).json({ error: "Patient profile required" });

  const requestId = String(req.params.id);
  const request = await prisma.vanServiceRequest.findUnique({ where: { id: requestId } });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.patientId !== patientProfile.id) return res.status(403).json({ error: "Not your request" });

  // One cancel path for the tracking screen and the appointment screen (N3).
  const outcome = await cancelVanRequest(request.id);
  return res.status(outcome.status).json(outcome.body);
});

export default router;
