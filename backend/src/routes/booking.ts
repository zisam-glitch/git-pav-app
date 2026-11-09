import { Router, Response } from "express";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { pseudonymiseIp } from "../lib/audit-security";
import { isLateForHold, refundLateDeposit } from "../lib/late-deposit";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  appointmentCheckInSchema,
  appointmentIdParamsSchema,
  confirmAppointmentSchema,
  createAppointmentSchema,
  holdSlotSchema,
  rescheduleAppointmentSchema,
  saveAppointmentNotesSchema,
  slotsQuerySchema,
} from "../schemas/booking";
import { idempotencyKeyFrom, withIdempotency } from "../lib/idempotency";
import { checkRedFlags, clientTriage, validateTriageData } from "../lib/triage-escalation";
import { cancelAppointmentReminders, scheduleAppointmentReminderLadder } from "../lib/background-jobs";
import { depositDuePence } from "../lib/rewards";
import { ageInYears, DEPENDANT_MAX_AGE, parseIsoDate } from "../lib/age";
import { AvailabilityError, bookableClinician, londonDate, slotsForDay, SlotChannel, startOfLondonDay } from "../lib/availability";
import { encryptField, decryptField, decryptString, encryptAccessDetails, encryptClientAccessDetails, decryptAccessDetails } from "../lib/encryption";
import { safeError } from "../lib/log-safety";
import { logFailure } from "../lib/best-effort";
import { checkReschedulable } from "../lib/reschedule-policy";

const router = Router();
// One client for the process, as in payments.ts, not one per confirm (B12).
const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as never,
});

const SLOT_HOLD_SECONDS = 600; // 10 minutes
// Most appointments a list returns: the newest for a patient, the next for a
// clinician (BK-8).
const SCHEDULE_LIMIT = 200;

const appointmentInclude = {
  service: true,
  clinician: { select: { fullName: true } },
  clinic: { select: { name: true, address: true } },
  dependant: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.AppointmentInclude;

/** True when the insert hit the no-overlap constraint (CS-16). */
function isClinicianOverlap(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message;
  return (
    msg.includes("appointments_no_clinician_overlap") ||
    msg.includes("deadlock detected") ||
    msg.includes("40P01") ||
    msg.includes("23P01")
  );
}

function slotLockKey(slotId: string): string {
  return slotId.startsWith("slot:") ? slotId : `slot:${slotId}`;
}

// ─── GET /api/booking/slots ───────────────────────────────────────────────────
// Query: ?date=YYYY-MM-DD (UK date)&channel=clinic|van|video&clinicId=<uuid>
//        &clinicianId=<uuid>&serviceId=<id>
// Times come from the clinic's opening hours and the clinicians' rota
// (CS-30). Without a clinician, a time is free when any clinician is.
router.get("/slots", requireAuth, validateQuery(slotsQuerySchema), async (req: AuthRequest, res: Response) => {
  const { clinicianId, clinicId, serviceId } = req.query as Record<string, string | undefined>;
  // The schema has already made this a string; the typeof check says so to the
  // reader (and to CodeQL) where the value is used.
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const channel = (req.query.channel as SlotChannel | undefined) ?? "clinic";

  const service = serviceId ? await prisma.service.findUnique({ where: { id: serviceId } }) : null;
  const duration = service?.durationMinutes || 30;

  let daySlots;
  try {
    daySlots = await slotsForDay({ date: date!, channel, durationMinutes: duration, clinicianId, clinicId });
  } catch (err) {
    if (err instanceof AvailabilityError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  // One entry per start time: free if any matching clinician is free.
  const byStart = new Map<number, { startTimeUtc: Date; endTimeUtc: Date; available: boolean }>();
  for (const slot of daySlots) {
    const key = slot.startTimeUtc.getTime();
    const seen = byStart.get(key);
    if (seen) seen.available ||= slot.available;
    else byStart.set(key, { startTimeUtc: slot.startTimeUtc, endTimeUtc: slot.endTimeUtc, available: slot.available });
  }
  // Times that have already started aren't offered at all (BK-9).
  const now = Date.now();
  const rawSlots = [...byStart.values()].filter((s) => s.startTimeUtc.getTime() > now).map((s) => ({
    ...s,
    lockKey: `slot:${date}:${clinicianId || "any"}:${s.startTimeUtc.toISOString()}`,
  }));

  const lockKeys = rawSlots.map((s) => s.lockKey);
  const lockValues =
    lockKeys.length > 0
      ? await redis.mget(...lockKeys).catch(() => lockKeys.map(() => null))
      : [];

  const slots = rawSlots.map((s, idx) => ({
    id: s.lockKey,
    startTimeUtc: s.startTimeUtc.toISOString(),
    endTimeUtc: s.endTimeUtc.toISOString(),
    available: s.available && lockValues[idx] === null,
    durationMinutes: duration,
  }));

  return res.json(slots);
});

// ─── POST /api/booking/hold-slot ─────────────────────────────────────────────
router.post("/hold-slot", requireAuth, validateBody(holdSlotSchema), async (req: AuthRequest, res: Response) => {
  const { slotId } = req.body;
  const patientId = req.user!.sub;
  const lockKey = slotLockKey(slotId);

  // If Redis can't be reached the time isn't taken: say so, rather than
  // telling the patient someone else is holding it (B3).
  const holdUnavailable = () =>
    res.status(503).json({
      success: false,
      slotId,
      error: "We couldn't hold that time just now. Please try again in a moment.",
    });

  // SET NX EX — only set if not already held
  let acquired: string | null;
  try {
    acquired = await redis.set(lockKey, patientId, "EX", SLOT_HOLD_SECONDS, "NX");
  } catch (err) {
    logFailure("slot hold (redis set)")(err);
    return holdUnavailable();
  }

  if (!acquired) {
    let currentHolder: string | null;
    try {
      currentHolder = await redis.get(lockKey);
    } catch (err) {
      logFailure("slot hold (redis get)")(err);
      return holdUnavailable();
    }
    if (currentHolder !== patientId) {
      return res.status(409).json({
        success: false,
        slotId,
        error: "Slot already held by another patient",
        message: "Slot is already held by another patient",
      });
    }
  }

  return res.json({
    success: true,
    slotId,
    holdExpiresAt: Date.now() + SLOT_HOLD_SECONDS * 1000,
    holdDurationSeconds: SLOT_HOLD_SECONDS,
    message: "Slot held for 10 minutes. Complete deposit to confirm.",
  });
});

// ─── POST /api/booking/appointments ──────────────────────────────────────────
router.post("/appointments", requireAuth, validateBody(createAppointmentSchema), async (req: AuthRequest, res: Response) => {
  const {
    serviceId, channel, clinicianId, clinicId, vanId, dependantId,
    startTimeUtc, endTimeUtc, slotId, accessDetails, triageData,
  } = req.body;
  const patientId = req.user!.sub;
  // A retry is recognised by the client's Idempotency-Key, not by the booking
  // details: rebooking the same time after cancelling is a new booking (BK-3).
  // Without a key every call is a new attempt; the database still stops a
  // double booking.
  const keyHeader = idempotencyKeyFrom(req.header("Idempotency-Key"));
  if (keyHeader === "invalid") {
    return res.status(400).json({ error: "Idempotency-Key must be 8 to 128 letters, digits, '-', '_' or ':'" });
  }
  const idempotencyKey = keyHeader ? `create-appointment:${patientId}:${keyHeader}` : null;

  return withIdempotency(idempotencyKey, async () => {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: { id: true },
    });
    if (!profile) {
      return { error: "Patient profile not found", status: 404 };
    }

    // Only the child's own guardian books for them, and only while under 16.
    if (dependantId) {
      const dependant = await prisma.dependant.findFirst({
        where: { id: dependantId, guardianId: profile.id },
        select: { dob: true },
      });
      if (!dependant) return { error: "Dependant not found", status: 404 };
      const childDob = parseIsoDate(dependant.dob);
      if (!childDob || ageInYears(childDob) >= DEPENDANT_MAX_AGE) {
        return {
          error: "This child is now 16 or over and needs to book from their own account.",
          status: 422,
        };
      }
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return { error: "Service not found", status: 404 };
    }
    // A retired service (BE-10) stays on past bookings but takes no new ones.
    if (!service.isActive) {
      return { error: "This service is no longer offered", status: 409 };
    }
    // A service is only booked on a channel it offers (a video triage can't be
    // a clinic visit, a whitening can't be a video call).
    if (!service.supportedChannels.includes(channel)) {
      return { error: "This treatment can't be booked that way. Please choose another option.", status: 400 };
    }

    // Validate triage data if provided
    if (triageData) {
      const validation = validateTriageData(triageData);
      if (!validation.isValid) {
        return { error: "Invalid triage data", details: validation.errors, status: 400 };
      }

      // Check for red-flag symptoms
      const redFlagCheck = checkRedFlags(triageData);
      if (redFlagCheck.isRedFlag && redFlagCheck.shouldBlockBooking) {
        return {
          error: "Red-flag symptoms detected",
          message: redFlagCheck.emergencyInstructions,
          emergencyNumber: redFlagCheck.emergencyNumber,
          flagType: redFlagCheck.flagType,
          status: 403,
        };
      }
    }

    // The server owns the appointment length: end = start + service duration.
    const startDate = new Date(startTimeUtc);
    if (startDate.getTime() <= Date.now()) {
      return { error: "startTimeUtc must be in the future", status: 400 };
    }
    const endDate = new Date(startDate.getTime() + service.durationMinutes * 60 * 1000);

    if (slotId) {
      const lockHolder = await redis.get(slotLockKey(slotId)).catch(() => null);
      if (lockHolder && lockHolder !== patientId) {
        return {
          error: "Slot is currently held by another patient",
          status: 409,
        };
      }
    }

    // Tapping "pay" again for the same time (say after closing the payment
    // sheet) carries on with the patient's own live hold rather than being
    // told the slot is taken.
    const ownHold = await prisma.appointment.findFirst({
      where: {
        patientId: profile.id,
        dependantId: dependantId || null,
        serviceId,
        channel,
        clinicId: clinicId || null,
        ...(clinicianId ? { clinicianId } : {}),
        startTimeUtc: startDate,
        status: "draft_hold",
        holdExpiresAt: { gt: new Date() },
      },
      include: appointmentInclude,
    });
    if (ownHold) return { appointment: ownHold, status: 201 };

    // One person can't be at two appointments at once, even with different
    // clinicians: the account holder and each dependant are checked apart.
    const clash = await prisma.appointment.findFirst({
      where: {
        patientId: profile.id,
        dependantId: dependantId || null,
        startTimeUtc: { lt: endDate },
        endTimeUtc: { gt: startDate },
        OR: [
          { status: { in: ["confirmed", "in_progress"] } },
          { status: "draft_hold", holdExpiresAt: { gt: new Date() } },
        ],
      },
      select: { id: true },
    });
    if (clash) {
      return {
        error: dependantId
          ? "They already have an appointment at that time. Please choose another slot."
          : "You already have an appointment at that time. Please choose another slot.",
        status: 409,
      };
    }

    // Only a real free slot can be booked: inside the clinic's hours and the
    // clinician's rota (CS-30). Van visits are timed by the van dispatch flow.
    let assignedClinicianId: string | undefined = clinicianId;
    if (channel === "clinic" || channel === "video") {
      if (channel === "clinic" && !clinicId) {
        return { error: "Choose a clinic for this appointment", status: 400 };
      }
      let bookable: string | null;
      try {
        bookable = await bookableClinician({
          channel,
          durationMinutes: service.durationMinutes,
          startTimeUtc: startDate,
          clinicianId,
          clinicId,
        });
      } catch (err) {
        if (err instanceof AvailabilityError) return { error: err.message, status: err.status };
        throw err;
      }
      if (!bookable) {
        return { error: "That time isn't available. Please choose another slot.", status: 409 };
      }
      assignedClinicianId = bookable;
    }

    // DB-3: Encrypt triageData and accessDetails at rest. Only the answers a
    // patient may give are kept, and nothing arrives already "encrypted".
    const storedTriageData = triageData ? await encryptField(clientTriage(triageData)) : null;
    const storedAccessDetails = accessDetails ? await encryptClientAccessDetails(accessDetails) : null;
    if (accessDetails && !storedAccessDetails) {
      return { error: "Invalid access details", status: 400 };
    }

    // The constraint on appointments is what stops a double booking (BK-2);
    // this transaction clears expired holds in the way first, as the hold
    // sweeper would, and turns a clash into a friendly 409.
    let appointment;
    let clearedHolds: string[] = [];
    try {
      appointment = await prisma.$transaction(async (tx) => {
        if (assignedClinicianId) {
          const expired = await tx.appointment.findMany({
            where: {
              clinicianId: assignedClinicianId,
              status: "draft_hold",
              holdExpiresAt: { lte: new Date() },
              startTimeUtc: { lt: endDate },
              endTimeUtc: { gt: startDate },
            },
            select: { id: true },
          });
          clearedHolds = expired.map((a) => a.id);
          if (clearedHolds.length > 0) {
            await tx.appointment.updateMany({
              where: { id: { in: clearedHolds }, status: "draft_hold" },
              data: { status: "cancelled" },
            });
          }
        }
        return tx.appointment.create({
          data: {
            patientId: profile.id,
            dependantId: dependantId || null,
            clinicianId: assignedClinicianId || null,
            serviceId,
            channel,
            clinicId: clinicId || null,
            vanId: vanId || null,
            startTimeUtc: startDate,
            endTimeUtc: endDate,
            status: "draft_hold",
            holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            accessDetails: storedAccessDetails as any,
            triageData: storedTriageData as any,
            totalPricePence: service.pricePence,
            depositPaidPence: 0,
          },
          include: appointmentInclude,
        });
      });
    } catch (error) {
      if (isClinicianOverlap(error)) {
        return { error: "Appointment slot is already booked for this clinician", status: 409 };
      }
      throw error;
    }

    for (const id of clearedHolds) {
      await createAuditLogWithIntegrity({
        action: "appointment.hold_expired",
        actorId: null,
        resourceId: id,
        sessionId: null,
        ipHash: pseudonymiseIp("127.0.0.1"),
        metadata: { reason: "10-minute hold window elapsed without payment" },
      }).catch(logFailure("audit write appointment.hold_expired"));
    }

    // Release Redis hold now that it's in DB
    if (slotId) {
      await redis.del(slotLockKey(slotId)).catch(() => {});
    }

    return { appointment, status: 201 };
  }).then(async (result: any) => {
    if (result.error) {
      const { status, ...errorBody } = result;
      return res.status(status || 400).json(errorBody);
    }
    const apt = result.appointment;
    if (apt) {
      apt.triageData = await decryptField(apt.triageData);
      apt.accessDetails = await decryptAccessDetails(apt.accessDetails);
    }
    return res.status(result.status).json(apt);
  });
});

// ─── GET /api/booking/appointments ───────────────────────────────────────────
router.get("/appointments", requireAuth, async (req: AuthRequest, res: Response) => {
  const limitParam = req.query.limit ? Number(req.query.limit) : undefined;
  const pageParam = req.query.page ? Number(req.query.page) : undefined;
  const offsetParam = req.query.offset ? Number(req.query.offset) : undefined;

  const take = limitParam && !isNaN(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : SCHEDULE_LIMIT;
  const skip = offsetParam !== undefined && !isNaN(offsetParam)
    ? Math.max(offsetParam, 0)
    : pageParam && !isNaN(pageParam)
    ? (Math.max(pageParam, 1) - 1) * take
    : 0;

  // Clinicians get their own schedule (today forward, ascending); everyone
  // else gets their patient appointments. The mobile clinician schedule
  // screen consumes this via the same endpoint and response shape.
  if (req.user!.role === "clinician") {
    const clinician = await prisma.clinicianProfile.findUnique({
      where: { userId: req.user!.sub },
      select: { id: true },
    });
    if (!clinician) return res.status(404).json({ error: "Clinician profile not found" });

    // MB-4: Support date-scoped schedule query
    // If date query parameter is provided (e.g. "2026-10-24" or "?scope=today"), scope to that London day.
    // If no date filter is provided, return all upcoming appointments (today forward) to maintain backward compatibility.
    let dateFilter: { gte: Date; lt?: Date };
    if (req.query.scope === "today" || (req.query.date && typeof req.query.date === "string")) {
      const targetDate = req.query.date && req.query.date !== "today"
        ? new Date(req.query.date as string)
        : new Date();
      const startOfDay = startOfLondonDay(targetDate);
      // The next London midnight, exclusive: a 00:00 visit belongs to tomorrow.
      // (Not start + 24h, which is wrong on the days the clocks change.)
      const endOfDay = startOfLondonDay(new Date(startOfDay.getTime() + 26 * 60 * 60 * 1000));
      dateFilter = { gte: startOfDay, lt: endOfDay };
    } else {
      dateFilter = { gte: startOfLondonDay(new Date()) };
    }

    const schedule = await prisma.appointment.findMany({
      where: {
        clinicianId: clinician.id,
        startTimeUtc: dateFilter,
        status: { notIn: ["cancelled", "no_show"] },
      },
      include: {
        service: { select: { name: true, durationMinutes: true } },
        clinician: { select: { fullName: true, photoUrl: true, gdcNumber: true, roleTitle: true } },
        clinic: { select: { name: true, address: true } },
        patient: { select: { id: true, firstName: true, lastName: true, dob: true } },
        dependant: { select: { id: true, firstName: true, lastName: true, dob: true } },
        appointmentNote: { select: { id: true, notes: true, diagnosis: true, treatmentPlan: true, updatedAt: true } },
      },
      orderBy: { startTimeUtc: "asc" },
      take,
      skip,
    });

    return res.json(
      await Promise.all(
        schedule.map(async (a) => ({
          ...a,
          triageData: await decryptField(a.triageData),
          accessDetails: await decryptAccessDetails(a.accessDetails),
          // When a guardian booked for their child, the child is the one seen;
          // the guardian stays as the account holder.
          dependant: a.dependant
            ? {
                id: a.dependant.id,
                firstName: a.dependant.firstName,
                lastName: a.dependant.lastName,
                age: ageInYears(new Date(a.dependant.dob)),
              }
            : null,
          patient: a.patient
            ? {
                id: a.patient.id,
                firstName: a.patient.firstName,
                lastName: a.patient.lastName,
                age: a.patient.dob
                  ? Math.floor((Date.now() - new Date(a.patient.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
                  : null,
              }
            : null,
        }))
      )
    );
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { id: true },
  });
  if (!profile) return res.status(404).json({ error: "Patient profile not found" });

  // ?scope=upcoming: visits still to come, soonest first. A consult already
  // under way counts even though its start time has passed.
  const upcomingOnly = req.query.scope === "upcoming";

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: profile.id,
      ...(req.query.status ? { status: String(req.query.status) as any } : {}),
      ...(upcomingOnly
        ? {
            OR: [
              { status: "in_progress" as const },
              { status: "confirmed" as const, startTimeUtc: { gte: new Date() } },
            ],
          }
        : {}),
    },
    include: {
      service: { select: { name: true, durationMinutes: true } },
      clinician: { select: { fullName: true, photoUrl: true } },
      clinic: { select: { name: true, address: true } },
      dependant: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { startTimeUtc: upcomingOnly ? "asc" : "desc" },
    take,
    skip,
  });

  return res.json(
    await Promise.all(
      appointments.map(async (a) => ({
        ...a,
        triageData: await decryptField(a.triageData),
        accessDetails: await decryptAccessDetails(a.accessDetails),
      }))
    )
  );
});

// ─── GET /api/booking/appointments/:id ───────────────────────────────────────
// Fetches a single appointment by id for status polling and detail views.
// Accessible by the owning patient, the assigned clinician, or an admin.
router.get("/appointments/:id", requireAuth, validateParams(appointmentIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const appointmentId = String(req.params.id);

  let allowed = false;
  if (req.user!.role === "admin") {
    allowed = true;
  } else if (req.user!.role === "clinician") {
    const clinician = await prisma.clinicianProfile.findUnique({
      where: { userId: req.user!.sub },
      select: { id: true },
    });
    if (clinician) {
      const apt = await prisma.appointment.findFirst({
        where: { id: appointmentId, clinicianId: clinician.id },
        select: { id: true },
      });
      if (apt) allowed = true;
    }
  } else {
    // Patient
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.sub },
      select: { id: true },
    });
    if (profile) {
      const apt = await prisma.appointment.findFirst({
        where: { id: appointmentId, patientId: profile.id },
        select: { id: true },
      });
      if (apt) allowed = true;
    }
  }

  if (!allowed) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: { select: { name: true, durationMinutes: true } },
      clinician: { select: { fullName: true, photoUrl: true } },
      clinic: { select: { name: true, address: true } },
      dependant: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  return res.json({
    ...appointment,
    triageData: await decryptField(appointment.triageData),
    accessDetails: await decryptAccessDetails(appointment.accessDetails),
  });
});

// ─── GET /api/booking/appointments/:id/clinical-context ──────────────────────
// What a clinician needs on screen to prescribe or treat for this appointment:
// who the patient is and their recorded allergies, medications and conditions.
// Only the appointment's own clinician may read it, and every read is audited.
router.get("/appointments/:id/clinical-context", requireAuth, requireRole("clinician"), validateParams(appointmentIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const clinician = await prisma.clinicianProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { id: true },
  });
  if (!clinician) return res.status(403).json({ error: "Clinician profile required" });

  const appointment = await prisma.appointment.findFirst({
    where: { id: String(req.params.id), clinicianId: clinician.id },
    include: {
      patient: {
        select: {
          id: true, firstName: true, lastName: true, dob: true,
          addressLine1: true, addressLine2: true, city: true, postcode: true,
          medicalHistory: true,
        },
      },
      dependant: { select: { id: true, firstName: true, lastName: true, dob: true } },
    },
  });
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });

  if (appointment.patient) {
    (appointment.patient as any).medicalHistory = await decryptField(appointment.patient.medicalHistory);
  }

  await createAuditLogWithIntegrity({
    action: "clinical_record.read.appointment_context",
    actorId: req.user!.sub,
    resourceId: appointment.patient.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { appointmentId: appointment.id },
  });

  const p = appointment.patient;
  const address = [p.addressLine1, p.addressLine2, p.city, p.postcode].filter(Boolean).join(", ") || null;
  const child = appointment.dependant;
  if (child) {
    // The child is the patient. The guardian's own medical history must not
    // be shown as the child's, and the child has none recorded yet.
    return res.json({
      appointmentId: appointment.id,
      startTimeUtc: appointment.startTimeUtc,
      patient: { id: child.id, firstName: child.firstName, lastName: child.lastName, dob: child.dob, address },
      guardian: { id: p.id, firstName: p.firstName, lastName: p.lastName },
      medicalHistory: null,
    });
  }

  return res.json({
    appointmentId: appointment.id,
    startTimeUtc: appointment.startTimeUtc,
    patient: {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      dob: p.dob,
      address,
    },
    guardian: null,
    // As recorded by the patient; the app shows "Not recorded" when null.
    medicalHistory: p.medicalHistory ?? null,
  });
});

// ─── PATCH /api/booking/appointments/:id/confirm ─────────────────────────────
// Confirms a held appointment only after the server has verified its deposit.
// The PaymentIntent is the one create-intent stored on the appointment; the
// amount recorded comes from Stripe (or the service price in mock mode), never
// from the request. The webhook confirms the same way, so whichever arrives
// first wins and the other is a no-op.
router.patch("/appointments/:id/confirm", requireAuth, validateParams(appointmentIdParamsSchema), validateBody(confirmAppointmentSchema), async (req: AuthRequest, res: Response) => {
  const apptId = String(req.params.id);
  const { stripePaymentId } = req.body as { stripePaymentId?: string };
  const patientId = req.user!.sub;

  // No response cache here: a "not paid yet" answer must not be replayed after
  // the patient pays. The handler is idempotent by itself (conditional update,
  // and an already-confirmed appointment returns its stored state).
  return (async (): Promise<any> => {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: patientId },
      select: { id: true },
    });
    if (!profile) {
      return { error: "Patient not found", status: 404 };
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: apptId, patientId: profile.id },
      include: { service: { select: { depositPence: true } } },
    });

    if (!appointment) {
      return { error: "Appointment not found", status: 404 };
    }

    if (appointment.status === "confirmed") {
      // Already confirmed - return existing data
      return {
        id: appointment.id,
        appointmentStatus: appointment.status,
        depositPaidPence: appointment.depositPaidPence,
        message: "Appointment already confirmed",
        httpStatus: 200,
      };
    }

    // A cancelled booking can still have a deposit in flight: verify it below
    // and refund it rather than confirm (CS-17).
    const late = isLateForHold(appointment);
    if (appointment.status !== "draft_hold" && !late) {
      return { error: "Cannot confirm appointment in current status", status: 400 };
    }

    const paymentIntentId = appointment.stripePaymentId;
    if (!paymentIntentId) {
      return { error: "No deposit payment has been started for this appointment", status: 402 };
    }
    if (stripePaymentId && stripePaymentId !== paymentIntentId) {
      return { error: "Payment does not belong to this appointment", status: 409 };
    }

    let depositPaidPence: number;
    if (env.isMockStripe) {
      // Development and test only (env.ts rejects mock keys when deployed).
      if (paymentIntentId !== `pi_mock_${appointment.id.replaceAll("-", "")}`) {
        return { error: "Payment does not belong to this appointment", status: 409 };
      }
      depositPaidPence = depositDuePence(appointment);
    } else {
      let intent: Stripe.PaymentIntent;
      try {
        intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      } catch {
        return { error: "Failed to verify Stripe PaymentIntent", status: 502 };
      }
      if (intent.metadata?.appointmentId !== appointment.id) {
        return { error: "Payment does not belong to this appointment", status: 409 };
      }
      if (intent.status !== "succeeded") {
        return {
          error: `PaymentIntent has not succeeded (status: ${intent.status})`,
          status: 402,
        };
      }
      if (intent.currency !== "gbp" || intent.amount_received !== depositDuePence(appointment)) {
        return { error: "Payment amount does not match the deposit for this service", status: 409 };
      }
      depositPaidPence = intent.amount_received;
    }

    if (late) {
      try {
        await refundLateDeposit({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          paymentIntentId,
          amountPence: depositPaidPence,
        });
      } catch {
        return { error: "Your booking hold expired and the automatic refund failed. Please contact the practice.", status: 502 };
      }
      return {
        error: "Your booking hold ran out before payment went through, so your deposit has been refunded. Please choose a new time.",
        status: 409,
        depositRefunded: true,
      };
    }

    // Conditional update: if the webhook confirmed it in the meantime, this is
    // a no-op and the reminder ladder is not scheduled twice.
    const result = await prisma.appointment.updateMany({
      where: { id: apptId, status: "draft_hold", stripePaymentId: paymentIntentId },
      data: {
        status: "confirmed",
        depositPaidPence,
        holdExpiresAt: null,
      },
    });
    if (result.count === 1) {
      await scheduleAppointmentReminderLadder(apptId).catch((err) => {
        console.error("[Booking] Failed to schedule reminders:", safeError(err));
      });
    }

    const confirmed = await prisma.appointment.findUniqueOrThrow({ where: { id: apptId } });
    if (confirmed.status !== "confirmed") {
      return { error: "Cannot confirm appointment in current status", status: 409 };
    }

    return {
      id: confirmed.id,
      appointmentStatus: confirmed.status,
      depositPaidPence: confirmed.depositPaidPence,
      message: "Appointment confirmed successfully",
      httpStatus: 200,
    };
  })().then((result: any) => {
    if (result.error) {
      const body: Record<string, unknown> = { error: result.error };
      if (result.depositRefunded) body.depositRefunded = true;
      return res.status(result.httpStatus || result.status || 400).json(body);
    }
    const statusCode = result.httpStatus || result.status || 200;
    const { httpStatus, status, ...responseData } = result;
    return res.status(statusCode).json(responseData);
  });
});

// ─── POST /api/booking/appointments/:id/reschedule ───────────────────────────
// Moves a paid clinic or video booking to another time (owner decision, 5 Nov):
// free with 48 hours' notice or more, and the deposit stays with the booking, so
// no payment is touched. Inside 48 hours the patient cancels and rebooks, and
// the cancellation terms apply. The service, place and dentist stay the same,
// the server works out the new end time, and the new time has to be free.
router.post("/appointments/:id/reschedule", requireAuth, validateParams(appointmentIdParamsSchema), validateBody(rescheduleAppointmentSchema), async (req: AuthRequest, res: Response) => {
  const appointmentId = String(req.params.id);
  const { startTimeUtc } = req.body as { startTimeUtc: string };

  const profile = await prisma.patientProfile.findUnique({ where: { userId: req.user!.sub }, select: { id: true } });
  if (!profile) return res.status(404).json({ error: "Patient profile not found" });

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, patientId: profile.id },
    include: { service: { select: { durationMinutes: true } } },
  });
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });

  const newStart = new Date(startTimeUtc);
  const summary = (a: { id: string; startTimeUtc: Date; endTimeUtc: Date; status: string; clinicianId: string | null }, changed: boolean) => ({
    id: a.id,
    status: a.status,
    startTimeUtc: a.startTimeUtc,
    endTimeUtc: a.endTimeUtc,
    clinicianId: a.clinicianId,
    changed,
  });

  // Asking for the time it already has is a no-op, so a retry after a lost
  // response doesn't come back as an error.
  if (newStart.getTime() === appointment.startTimeUtc.getTime() && appointment.status === "confirmed") {
    return res.json(summary(appointment, false));
  }

  const check = checkReschedulable(appointment);
  if (!check.ok) {
    return res.status(check.status).json({ error: check.error, hoursUntilVisit: Math.round(check.hoursUntilVisit * 10) / 10 });
  }
  if (newStart.getTime() <= Date.now()) {
    return res.status(400).json({ error: "startTimeUtc must be in the future" });
  }

  const endTime = new Date(newStart.getTime() + appointment.service.durationMinutes * 60 * 1000);

  let bookable: string | null;
  try {
    bookable = await bookableClinician({
      channel: appointment.channel as SlotChannel,
      durationMinutes: appointment.service.durationMinutes,
      startTimeUtc: newStart,
      clinicianId: appointment.clinicianId ?? undefined,
      clinicId: appointment.clinicId ?? undefined,
    });
  } catch (err) {
    if (err instanceof AvailabilityError) return res.status(err.status).json({ error: err.message });
    throw err;
  }
  if (!bookable) {
    return res.status(409).json({ error: "That time isn't available. Please choose another slot." });
  }

  // The database stops two live visits overlapping for one dentist, and the
  // update only applies if the booking is still confirmed at its old time.
  let moved;
  try {
    moved = await prisma.appointment.updateMany({
      where: { id: appointment.id, status: "confirmed", startTimeUtc: appointment.startTimeUtc },
      data: { startTimeUtc: newStart, endTimeUtc: endTime, clinicianId: bookable },
    });
  } catch (error) {
    if (isClinicianOverlap(error)) {
      return res.status(409).json({ error: "That time isn't available. Please choose another slot." });
    }
    throw error;
  }
  if (moved.count === 0) {
    return res.status(409).json({ error: "The booking changed while moving it. Please refresh and try again." });
  }

  // Reminders were set for the old time.
  await cancelAppointmentReminders(appointment.id).catch(logFailure("reminder cancellation"));
  await scheduleAppointmentReminderLadder(appointment.id).catch((err) => {
    console.error("[Booking] Failed to schedule reminders after reschedule:", safeError(err));
  });

  await createAuditLogWithIntegrity({
    action: "appointment.rescheduled",
    actorId: req.user!.sub,
    resourceId: appointment.id,
    sessionId: req.user?.sessionId ?? null,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {
      fromStartUtc: appointment.startTimeUtc.toISOString(),
      toStartUtc: newStart.toISOString(),
      hoursNoticeGiven: Math.round(check.hoursUntilVisit * 10) / 10,
      channel: appointment.channel,
    },
  }).catch(logFailure("audit write appointment.rescheduled"));

  const updated = await prisma.appointment.findUniqueOrThrow({ where: { id: appointment.id } });
  return res.json(summary(updated, true));
});

// ─── PATCH /api/booking/appointments/:id/cancel ──────────────────────────────
// Retired (decisions log #8): it cancelled without refunding the deposit.
// Older app builds are pointed at the one cancel path.
router.patch("/appointments/:id/cancel", requireAuth, validateParams(appointmentIdParamsSchema), (_req: AuthRequest, res: Response) => {
  return res.status(410).json({
    error: "Please update the app to cancel this appointment.",
    use: "POST /api/booking/appointments/:id/cancel-with-refund",
  });
});

// ─── POST /api/booking/appointments/:id/check-in ─────────────────────────────
router.post("/appointments/:id/check-in", requireAuth, validateParams(appointmentIdParamsSchema), validateBody(appointmentCheckInSchema), async (req: AuthRequest, res: Response) => {
  const apptId = String(req.params.id);
  const { completedTasks } = req.body as { completedTasks: string[] };

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: req.user!.sub },
    select: { id: true },
  });
  if (!profile) return res.status(404).json({ error: "Patient not found" });

  const appointment = await prisma.appointment.findFirst({
    where: { id: apptId, patientId: profile.id },
  });
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  if (appointment.status !== "confirmed") {
    return res.status(409).json({ error: "Only confirmed appointments can be checked in" });
  }

  // BK-7 / CS-06: Check-in time window check (opens 48h before slot, closes 2h after end)
  const nowMs = Date.now();
  const startMs = appointment.startTimeUtc.getTime();
  const endMs = appointment.endTimeUtc.getTime();
  const CHECK_IN_OPEN_WINDOW_MS = 48 * 60 * 60 * 1000;
  const CHECK_IN_CLOSE_WINDOW_MS = 2 * 60 * 60 * 1000;

  if (nowMs < startMs - CHECK_IN_OPEN_WINDOW_MS) {
    return res.status(400).json({ error: "Check-in window is not yet open for this appointment" });
  }
  if (nowMs > endMs + CHECK_IN_CLOSE_WINDOW_MS) {
    return res.status(400).json({ error: "Check-in window has closed for this appointment" });
  }

  const checkedInAt = new Date().toISOString();
  const currentAccess = (await decryptAccessDetails(appointment.accessDetails)) || {};
  const updatedAccess = {
    ...currentAccess,
    checkedIn: true,
    checkedInAt,
    completedTasks: [...new Set(completedTasks)],
  };
  const encryptedAccess = await encryptAccessDetails(updatedAccess);

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      accessDetails: encryptedAccess as any,
    },
  });

  return res.json({
    id: updated.id,
    checkedIn: true,
    checkedInAt,
    status: updated.status,
  });
});

// ─── POST /api/booking/appointments/:id/notes ────────────────────────────────
// Records or updates clinical notes, examination findings, and plan (PT-3, gaps §2)
router.post(
  "/appointments/:id/notes",
  requireAuth,
  validateParams(appointmentIdParamsSchema),
  validateBody(saveAppointmentNotesSchema),
  async (req: AuthRequest, res: Response) => {
    const appointmentId = String(req.params.id);
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { clinician: true, patient: true },
    });

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    // Authorization: Assigned clinician or admin
    const clinician = await prisma.clinicianProfile.findUnique({
      where: { userId: req.user!.sub },
    });

    const isAssignedClinician = clinician && appointment.clinicianId === clinician.id;
    const isAdmin = req.user!.role === "admin";

    if (!isAssignedClinician && !isAdmin) {
      return res.status(403).json({ error: "Only the assigned clinician or admin can record appointment notes" });
    }

    const effectiveClinicianId = clinician?.id || appointment.clinicianId;
    if (!effectiveClinicianId) {
      return res.status(400).json({ error: "Appointment has no assigned clinician" });
    }

    const { notes, diagnosis, treatmentPlan } = req.body;

    const encNotes = JSON.stringify(await encryptField(notes));
    const encDiagnosis = diagnosis ? JSON.stringify(await encryptField(diagnosis)) : null;
    const encTreatmentPlan = treatmentPlan ? JSON.stringify(await encryptField(treatmentPlan)) : null;

    const record = await prisma.appointmentNote.upsert({
      where: { appointmentId },
      update: {
        notes: encNotes,
        diagnosis: encDiagnosis,
        treatmentPlan: encTreatmentPlan,
      },
      create: {
        appointmentId,
        clinicianId: effectiveClinicianId,
        patientId: appointment.patientId,
        notes: encNotes,
        diagnosis: encDiagnosis,
        treatmentPlan: encTreatmentPlan,
      },
    });

    await createAuditLogWithIntegrity({
      action: "appointment.notes.updated",
      actorId: req.user!.sub,
      resourceId: appointmentId,
      metadata: {
        appointmentId,
        hasDiagnosis: !!diagnosis,
        hasTreatmentPlan: !!treatmentPlan,
      },
    }).catch(logFailure("audit write appointment.notes.updated"));

    return res.json({
      id: record.id,
      appointmentId: record.appointmentId,
      clinicianId: record.clinicianId,
      patientId: record.patientId,
      notes,
      diagnosis: diagnosis || null,
      treatmentPlan: treatmentPlan || null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
);

// ─── GET /api/booking/appointments/:id/notes ─────────────────────────────────
// Reads clinical examination notes for an appointment
router.get(
  "/appointments/:id/notes",
  requireAuth,
  validateParams(appointmentIdParamsSchema),
  async (req: AuthRequest, res: Response) => {
    const appointmentId = String(req.params.id);
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        clinician: { select: { userId: true, fullName: true, gdcNumber: true } },
        patient: { select: { userId: true } },
      },
    });

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const isPatient = appointment.patient.userId === req.user!.sub;
    const isClinician = appointment.clinician?.userId === req.user!.sub;
    const isAdmin = req.user!.role === "admin";

    if (!isPatient && !isClinician && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const note = await prisma.appointmentNote.findUnique({
      where: { appointmentId },
    });

    if (!note) return res.json(null);

    return res.json({
      id: note.id,
      appointmentId: note.appointmentId,
      clinicianId: note.clinicianId,
      patientId: note.patientId,
      notes: await decryptString(note.notes),
      diagnosis: note.diagnosis ? await decryptString(note.diagnosis) : null,
      treatmentPlan: note.treatmentPlan ? await decryptString(note.treatmentPlan) : null,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  }
);

// ─── POST /api/booking/appointments/:id/complete ─────────────────────────────
// Clinician marks an in-person, van, or video appointment completed
router.post(
  "/appointments/:id/complete",
  requireAuth,
  validateParams(appointmentIdParamsSchema),
  async (req: AuthRequest, res: Response) => {
    const appointmentId = String(req.params.id);
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { clinician: true },
    });

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const clinician = await prisma.clinicianProfile.findUnique({
      where: { userId: req.user!.sub },
    });
    const isAssigned = clinician && appointment.clinicianId === clinician.id;
    const isAdmin = req.user!.role === "admin";

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({ error: "Only the assigned clinician or admin can complete an appointment" });
    }

    if (appointment.status !== "confirmed" && appointment.status !== "in_progress") {
      return res.status(409).json({ error: "Only confirmed or in-progress appointments can be completed" });
    }

    // CS-28: an appointment can be completed on its UK calendar day or later,
    // never ahead of that day (decisions log #24).
    if (londonDate(appointment.startTimeUtc) > londonDate(new Date())) {
      return res.status(400).json({ error: "Cannot complete an appointment scheduled for a future date" });
    }

    const completedCount = await prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        status: { in: ["confirmed", "in_progress"] },
      },
      data: { status: "completed" },
    });
    if (completedCount.count === 0) {
      return res.status(409).json({ error: "Appointment cannot be completed from its current status" });
    }
    const updated = await prisma.appointment.findUniqueOrThrow({ where: { id: appointmentId } });

    await cancelAppointmentReminders(appointmentId).catch(logFailure("reminder cancellation"));

    await createAuditLogWithIntegrity({
      action: "appointment.completed",
      actorId: req.user!.sub,
      resourceId: appointmentId,
      metadata: { previousStatus: appointment.status, channel: appointment.channel },
    }).catch(logFailure("audit write appointment.completed"));

    return res.json({ id: updated.id, status: updated.status });
  }
);

// ─── POST /api/booking/appointments/:id/no-show ──────────────────────────────
// Clinician marks a patient no-show
router.post(
  "/appointments/:id/no-show",
  requireAuth,
  validateParams(appointmentIdParamsSchema),
  async (req: AuthRequest, res: Response) => {
    const appointmentId = String(req.params.id);
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { clinician: true },
    });

    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const clinician = await prisma.clinicianProfile.findUnique({
      where: { userId: req.user!.sub },
    });
    const isAssigned = clinician && appointment.clinicianId === clinician.id;
    const isAdmin = req.user!.role === "admin";

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({ error: "Only the assigned clinician or admin can mark a no-show" });
    }

    if (appointment.status !== "confirmed" && appointment.status !== "in_progress" && appointment.status !== "draft_hold") {
      return res.status(409).json({ error: "Appointment cannot be marked as no-show from its current status" });
    }

    const noShowCount = await prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        status: { in: ["confirmed", "in_progress", "draft_hold"] },
      },
      data: { status: "no_show" },
    });
    if (noShowCount.count === 0) {
      return res.status(409).json({ error: "Appointment cannot be marked as no-show from its current status" });
    }
    const updated = await prisma.appointment.findUniqueOrThrow({ where: { id: appointmentId } });

    await cancelAppointmentReminders(appointmentId).catch(logFailure("reminder cancellation"));

    await createAuditLogWithIntegrity({
      action: "appointment.no_show",
      actorId: req.user!.sub,
      resourceId: appointmentId,
      metadata: { previousStatus: appointment.status, channel: appointment.channel },
    }).catch(logFailure("audit write appointment.no_show"));

    return res.json({ id: updated.id, status: updated.status });
  }
);

export default router;
