import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { hasCareRelationship } from "../middleware/patient-access";
import multer from "multer";
import { withIdempotency, idempotencyKeyFrom } from "../lib/idempotency";
import { validateBody, validateParams } from "../middleware/validate";
import { HttpError } from "../middleware/error-handler";
import { createVideoRoomSchema, submitTriageSchema, admitPatientSchema, endConsultSchema, videoAppointmentParamsSchema } from "../schemas/video";
import { dailyApiClient } from "../lib/api-client";
import { objectStorage } from "../lib/object-storage";
import { checkRedFlags, TriageData } from "../lib/triage-escalation";
import { encryptField, decryptField } from "../lib/encryption";
import { cancelAppointmentReminders } from "../lib/background-jobs";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { safeError } from "../lib/log-safety";
import { isPlaceholderCredential } from "../config/placeholder";
import { logFailure } from "../lib/best-effort";
import { withLockedAppointment, sniffImageMime, MAX_TRIAGE_PHOTOS } from "../lib/video-triage";

const router = Router();

export const VIDEO_QUEUE_LIMIT = 50;

// A missing or template key (`replace_with_daily_api_key`) means video is
// not set up, so rooms are refused rather than requested with a junk key.
const DAILY_API_KEY = isPlaceholderCredential(process.env.DAILY_API_KEY)
  ? "daily_dev_placeholder"
  : process.env.DAILY_API_KEY!.trim();

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new HttpError(400, "Only JPEG, PNG, and WebP image files are allowed"));
    }
  },
});

// ─── POST /api/video/rooms ───────────────────────────────────────────────────
// Joins the private Daily room for one video appointment. There is one room
// per appointment, and only that appointment's clinician and patient get a
// meeting token for it; the patient only once the clinician has admitted them.
// A room URL on its own lets nobody in.
const ROOM_GRACE_SECONDS = 30 * 60;
const ROOM_LATE_LIMIT_MS = 2 * 60 * 60 * 1000;

const roomNameFor = (appointmentId: string) => `pav-${appointmentId}`;

async function getOrCreatePrivateRoom(name: string, expSeconds: number) {
  const headers = { Authorization: `Bearer ${DAILY_API_KEY}` };
  try {
    return await dailyApiClient.get<{ name: string; url: string; privacy?: string }>(`/rooms/${name}`, { headers });
  } catch (err: any) {
    if (err?.statusCode !== 404) throw err;
  }
  return dailyApiClient.post<{ name: string; url: string; privacy?: string }>(
    "/rooms",
    {
      name,
      privacy: "private",
      properties: {
        exp: expSeconds,
        eject_at_room_exp: true,
        // The app has no in-call chat; messages go through the inbox (V24).
        enable_chat: false,
        enable_screenshare: false,
        enable_prejoin_ui: false,
        start_video_off: false,
        start_audio_off: false,
      },
    },
    { headers }
  );
}

router.post("/rooms", requireAuth, validateBody(createVideoRoomSchema), async (req: AuthRequest, res: Response) => {
  const { appointmentId } = req.body as { appointmentId: string };

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { userId: true, firstName: true } },
      clinician: { select: { userId: true, fullName: true } },
    },
  });
  const isPatient = !!appointment && req.user!.sub === appointment.patient.userId;
  const isClinician = !!appointment && !!appointment.clinician && req.user!.sub === appointment.clinician.userId;
  // Same answer for "no such appointment" and "not yours".
  if (!appointment || (!isPatient && !isClinician)) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  if (appointment.channel !== "video") {
    return res.status(409).json({ error: "This appointment isn't a video consultation" });
  }
  if (appointment.status !== "confirmed" && appointment.status !== "in_progress") {
    return res.status(409).json({ error: "This consultation isn't open" });
  }
  if (Date.now() > appointment.endTimeUtc.getTime() + ROOM_LATE_LIMIT_MS) {
    return res.status(409).json({ error: "This consultation has ended" });
  }
  // Admitting the patient moves the appointment to in_progress; that status is
  // the server's record of admission, not anything stored in the triage blob.
  const admitted = appointment.status === "in_progress";
  if (isPatient && !admitted) {
    return res.status(409).json({ error: "Your clinician hasn't let you in yet. Please wait in the waiting room." });
  }

  if (DAILY_API_KEY === "daily_dev_placeholder" || !DAILY_API_KEY) {
    return res.status(503).json({ error: "Video consultations aren't set up yet. Please contact the practice." });
  }

  const expSeconds = Math.floor(Math.max(Date.now(), appointment.endTimeUtc.getTime()) / 1000) + ROOM_GRACE_SECONDS;
  try {
    const room = await getOrCreatePrivateRoom(roomNameFor(appointment.id), expSeconds);
    const { token } = await dailyApiClient.post<{ token: string }>(
      "/meeting-tokens",
      {
        properties: {
          room_name: room.name,
          is_owner: isClinician,
          // First name for the patient, full name for the clinician: what the
          // other person sees in the call.
          user_name: isClinician ? appointment.clinician!.fullName : appointment.patient.firstName,
          exp: expSeconds,
          eject_at_token_exp: true,
        },
      },
      { headers: { Authorization: `Bearer ${DAILY_API_KEY}` } }
    );

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        accessDetails: {
          ...((appointment.accessDetails as Record<string, unknown>) || {}),
          roomName: room.name,
          roomUrl: room.url,
        },
      },
    });

    return res.status(201).json({
      roomName: room.name,
      url: room.url,
      token,
      isOwner: isClinician,
      expiresAt: new Date(expSeconds * 1000).toISOString(),
      isMock: false,
    });
  } catch (err: any) {
    console.error("[VIDEO ROOM ERROR]", { status: err?.statusCode ?? "network" });
    return res.status(502).json({ error: "The video service didn't respond. Please try again." });
  }
});

// ─── POST /api/video/upload-triage-photo ─────────────────────────────────────
// Persists binary triage photo to ObjectStorage (S3 / durable encrypted disk)
// and records metadata in DocumentVault & Appointment.
router.post("/upload-triage-photo", requireAuth, upload.single("photo"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({ error: "No valid photo file provided" });
    }

    const { appointmentId, slotLabel } = req.body as { appointmentId?: string; slotLabel?: string };
    // A photo always belongs to one consultation (V29).
    if (!appointmentId || !videoAppointmentParamsSchema.safeParse({ appointmentId }).success) {
      return res.status(400).json({ error: "A valid appointmentId is required" });
    }

    // The type the phone claims is not trusted; the bytes decide.
    const realMime = sniffImageMime(req.file.buffer);
    if (!realMime) {
      return res.status(400).json({ error: "Only JPEG, PNG, and WebP image files are allowed" });
    }

    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, clinician: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    const isAuthorized =
      req.user!.sub === existing.patient.userId ||
      req.user!.sub === existing.clinician?.userId ||
      req.user!.role === "admin";
    if (!isAuthorized) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (existing.channel !== "video" || (existing.status !== "confirmed" && existing.status !== "in_progress")) {
      return res.status(409).json({ error: "Photos can only be added to an open video consultation" });
    }
    if ((existing.intraoralPhotos?.length ?? 0) >= MAX_TRIAGE_PHOTOS) {
      return res.status(409).json({ error: `You can add up to ${MAX_TRIAGE_PHOTOS} photos` });
    }

    const ext = realMime === "image/png" ? "png" : realMime === "image/webp" ? "webp" : "jpg";
    const fileKey = `triage/${appointmentId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploaded = await objectStorage.upload(fileKey, req.file.buffer, realMime, {
      uploadedBy: req.user!.sub,
      appointmentId,
      slotLabel: slotLabel || "intraoral",
    });

    // Add the photo under the appointment's row lock, so uploads sent in
    // parallel cannot lose each other's photo (V25), and recheck the cap there.
    const added = await withLockedAppointment(appointmentId, async (tx, appointment) => {
      if (!appointment) return false;
      if (appointment.intraoralPhotos.length >= MAX_TRIAGE_PHOTOS) return false;
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { intraoralPhotos: { push: uploaded.key } },
      });
      await tx.documentVault.create({
        data: {
          patientId: appointment.patientId,
          docType: "intraoral_photo",
          title: slotLabel ? `Triage Photo — ${slotLabel}` : "Telehealth Triage Photo",
          fileKey: uploaded.key,
          fileSizeBytes: String(uploaded.size),
        },
      });
      return true;
    });
    if (!added) {
      await objectStorage.delete(uploaded.key).catch(logFailure("triage photo cleanup"));
      return res.status(409).json({ error: `You can add up to ${MAX_TRIAGE_PHOTOS} photos` });
    }

    return res.status(201).json({
      url: uploaded.url,
      key: uploaded.key,
      size: uploaded.size,
      sha256: uploaded.sha256,
    });
  } catch (error) {
    console.error("[TRIAGE PHOTO UPLOAD ERROR]", safeError(error));
    return res.status(500).json({ error: "Failed to upload triage photo" });
  }
});

// ─── POST /api/video/submit-triage ───────────────────────────────────────────
// Submit triage data for video consultation
router.post("/submit-triage", requireAuth, validateBody(submitTriageSchema), async (req: AuthRequest, res: Response) => {
  const { appointmentId, chiefComplaint, painLevel, duration, symptoms, photos } = req.body;
  const userId = req.user!.sub;
  const clientKey = idempotencyKeyFrom(req.header("Idempotency-Key"));
  if (clientKey === "invalid") {
    return res.status(400).json({ error: "Idempotency-Key must be 8 to 128 letters, digits, '-', '_' or ':'" });
  }
  // Scoped to the caller, so another user presenting the same key gets nothing replayed.
  const idempotencyKey = clientKey ? `submit-triage:${userId}:${clientKey}` : null;

  return withIdempotency(idempotencyKey, async () => {
    return withLockedAppointment(appointmentId, async (tx, appointment) => {
      if (!appointment) {
        return { error: "Appointment not found", status: 404 };
      }

      if (appointment.patient.user.id !== userId) {
        return { error: "Unauthorized", status: 403 };
      }

      // Answers only make sense for an open video consultation (V28).
      if (appointment.channel !== "video") {
        return { error: "This appointment isn't a video consultation", status: 409 };
      }
      if (appointment.status !== "confirmed" && appointment.status !== "in_progress") {
        return { error: "This consultation isn't open", status: 409 };
      }

      // VD-2: Run red-flag symptom checking on submitted triage data
      const symptomsList = (symptoms || []).map((s: string) => s.toLowerCase());
      const triageInput: TriageData = {
        chiefComplaint,
        painLevel,
        symptoms,
        duration,
        difficultyBreathing: symptomsList.some((s: string) => s.includes("breath") || s.includes("chok") || s.includes("airway")),
        swelling: symptomsList.some((s: string) => s.includes("swell")),
        bleeding: symptomsList.some((s: string) => s.includes("bleed")),
        fever: symptomsList.some((s: string) => s.includes("fever") || s.includes("temperature")),
      };
      const redFlagResult = checkRedFlags(triageInput);

      // VD-3: Merge triage data rather than replacing wholesale (preserves photos, admittedAt, etc.).
      // The row is locked, so this read-merge-write cannot lose a concurrent change (V25).
      const currentTriage = (await decryptField<Record<string, unknown>>(appointment.triageData)) || {};
      const mergedPhotos = photos && photos.length > 0 ? photos : (currentTriage.photos || []);

      const mergedTriage = {
        ...currentTriage,
        chiefComplaint,
        painLevel,
        duration,
        symptoms,
        photos: mergedPhotos,
        redFlag: redFlagResult.isRedFlag ? redFlagResult : null,
        submittedAt: new Date().toISOString(),
      };

      await tx.appointment.update({
        where: { id: appointmentId },
        data: { triageData: (await encryptField(mergedTriage)) as any },
      });

      return {
        triageData: mergedTriage,
        redFlag: redFlagResult.isRedFlag ? redFlagResult : null,
        status: 200,
      };
    });
  }).then((result) => {
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json(result);
  });
});

// ─── GET /api/video/status/:appointmentId ────────────────────────────────────
// Real-time room admission check for telehealth waiting room
router.get("/status/:appointmentId", requireAuth, validateParams(videoAppointmentParamsSchema), async (req: AuthRequest, res: Response) => {
  const appointmentId = String(req.params.appointmentId);
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      clinician: { select: { userId: true, fullName: true, gdcNumber: true } },
      patient: { select: { userId: true } },
    },
  });

  if (!appointment) {
    return res.status(404).json({ error: "Consultation appointment not found" });
  }

  // Admins get no clinical-record access by default, and this carries the summary.
  const isAuthorized =
    req.user!.sub === appointment.patient.userId || req.user!.sub === appointment.clinician?.userId;

  if (!isAuthorized) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const triageData = (await decryptField<Record<string, unknown>>(appointment.triageData)) || {};
  const accessDetails = (appointment.accessDetails as Record<string, unknown>) || {};
  const isAdmitted = appointment.status === "in_progress";

  return res.json({
    appointmentId: appointment.id,
    status: appointment.status,
    admitted: isAdmitted,
    admittedAt: isAdmitted ? triageData.admittedAt || null : null,
    // No invented title when nobody is assigned yet (B13).
    clinicianName: appointment.clinician?.fullName ?? null,
    roomUrl: accessDetails.roomUrl || null,
    roomName: accessDetails.roomName || null,
    consultationSummary: triageData.consultationSummary || null,
  });
});

// ─── GET /api/video/triage-photos/:appointmentId ─────────────────────────────
// Fresh short-lived links to the intraoral photos sent for one consultation.
// The links saved at upload time expire after 15 minutes, so the clinician
// asks for new ones when they open the consult room.
router.get("/triage-photos/:appointmentId", requireAuth, validateParams(videoAppointmentParamsSchema), async (req: AuthRequest, res: Response) => {
  const appointmentId = String(req.params.appointmentId);
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      intraoralPhotos: true,
      clinician: { select: { userId: true } },
      patient: { select: { userId: true } },
    },
  });
  if (!appointment) {
    return res.status(404).json({ error: "Consultation appointment not found" });
  }
  // The treating clinician and the patient only; admins get no clinical-record access by default.
  const isClinician = req.user!.sub === appointment.clinician?.userId;
  if (!isClinician && req.user!.sub !== appointment.patient.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const photos = await Promise.all(
    (appointment.intraoralPhotos || []).map(async (key) => {
      const signed = await objectStorage.getSignedUrl(key, 900);
      return { url: signed.url, expiresAt: signed.expiresAt.toISOString() };
    })
  );

  if (isClinician && photos.length > 0) {
    await createAuditLogWithIntegrity({
      action: "video.triage_photos.viewed",
      actorId: req.user!.sub,
      resourceId: appointmentId,
      metadata: { count: photos.length },
    }).catch(logFailure("audit write video.triage_photos.viewed"));
  }

  return res.json({ photos });
});

// ─── GET /api/video/clinician-queue ───────────────────────────────────────────
// Get clinician's video consultation queue (clinician only)
router.get("/clinician-queue", requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "clinician") {
    return res.status(403).json({ error: "Clinician access required" });
  }

  const clinician = await prisma.clinicianProfile.findUnique({
    where: { userId: req.user!.sub },
  });

  if (!clinician) {
    return res.status(404).json({ error: "Clinician profile not found" });
  }

  // VD-4: Window from 60 minutes before start so consultation does not disappear the minute it begins
  const queueWindowStart = new Date(Date.now() - 60 * 60 * 1000);
  const queue = await prisma.appointment.findMany({
    where: {
      clinicianId: clinician.id,
      channel: "video",
      status: { in: ["confirmed", "in_progress"] },
      startTimeUtc: { gte: queueWindowStart },
    },
    include: {
      patient: {
        select: { firstName: true, lastName: true },
      },
      service: { select: { name: true } },
    },
    orderBy: { startTimeUtc: "asc" },
    // A clinician sees at most a day's worth; the rest wait their turn (B11).
    take: VIDEO_QUEUE_LIMIT,
  });

  const decryptedQueue = await Promise.all(
    queue.map(async (item) => ({
      ...item,
      triageData: await decryptField(item.triageData),
    }))
  );

  return res.json(decryptedQueue);
});

// ─── POST /api/video/admit-patient ────────────────────────────────────────────
// Admit patient to video consultation (clinician only)
router.post("/admit-patient", requireAuth, validateBody(admitPatientSchema), async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "clinician") {
    return res.status(403).json({ error: "Clinician access required" });
  }

  const { appointmentId } = req.body;
  const clinicianId = req.user!.sub;
  const clientKey = idempotencyKeyFrom(req.header("Idempotency-Key"));
  if (clientKey === "invalid") {
    return res.status(400).json({ error: "Idempotency-Key must be 8 to 128 letters, digits, '-', '_' or ':'" });
  }
  // Scoped to the caller, so another user presenting the same key gets nothing replayed.
  const idempotencyKey = clientKey ? `admit-patient:${clinicianId}:${clientKey}` : null;

  return withIdempotency(idempotencyKey, async () => {
    const clinician = await prisma.clinicianProfile.findUnique({
      where: { userId: clinicianId },
    });

    if (!clinician) {
      return { error: "Clinician profile not found", status: 404 };
    }

    return withLockedAppointment(appointmentId, async (tx, appointment) => {
      if (!appointment) {
        return { error: "Appointment not found", status: 404 };
      }

      if (appointment.clinicianId !== clinician.id) {
        return { error: "Not assigned to this clinician", status: 403 };
      }

      if (appointment.channel !== "video" || (appointment.status !== "confirmed" && appointment.status !== "in_progress")) {
        return { error: "Only an open video consultation can be joined", status: 409 };
      }

      const currentTriage = (await decryptField<Record<string, unknown>>(appointment.triageData)) || {};
      // Admitting twice keeps the first admission time.
      const updatedTriage = {
        ...currentTriage,
        admittedAt: (currentTriage.admittedAt as string | undefined) ?? new Date().toISOString(),
        admittedBy: (currentTriage.admittedBy as string | undefined) ?? clinician.id,
      };

      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "in_progress",
          triageData: (await encryptField(updatedTriage)) as any,
        },
      });

      return { appointment: { ...updated, triageData: updatedTriage }, status: 200 };
    });
  }).then((result) => {
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json(result);
  });
});

// ─── POST /api/video/end-consult ──────────────────────────────────────────────
// Clinician ends and completes a video consultation (VD-4)
router.post("/end-consult", requireAuth, validateBody(endConsultSchema), async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "clinician") {
    return res.status(403).json({ error: "Clinician access required" });
  }

  const { appointmentId, notes, diagnosis, treatmentPlan, followUpRecommended } = req.body;
  const clinician = await prisma.clinicianProfile.findUnique({
    where: { userId: req.user!.sub },
  });

  if (!clinician) {
    return res.status(404).json({ error: "Clinician profile not found" });
  }

  type EndResult =
    | { kind: "error"; status: number; error: string }
    | { kind: "done"; appointmentId: string; status: string; completedAt: string; summary: Record<string, unknown>; first: boolean };

  const outcome: EndResult = await withLockedAppointment(appointmentId, async (tx, appointment): Promise<EndResult> => {
    if (!appointment) return { kind: "error", status: 404, error: "Appointment not found" };
    if (appointment.clinicianId !== clinician.id) {
      return { kind: "error", status: 403, error: "Not assigned to this clinician" };
    }
    if (appointment.channel !== "video") {
      return { kind: "error", status: 409, error: "Only a video consultation can be completed" };
    }

    const currentTriage = (await decryptField<Record<string, unknown>>(appointment.triageData)) || {};

    // Safe to send twice: a second call returns the summary already saved (V26).
    if (appointment.status === "completed" && currentTriage.consultationSummary) {
      const saved = currentTriage.consultationSummary as Record<string, unknown>;
      return {
        kind: "done",
        appointmentId: appointment.id,
        status: appointment.status,
        completedAt: String(saved.completedAt ?? ""),
        summary: saved,
        first: false,
      };
    }
    // A consult nobody was let into did not happen, so it cannot be completed (V26).
    if (appointment.status !== "in_progress") {
      return { kind: "error", status: 409, error: "The patient hasn't been let in, so this consultation can't be completed" };
    }

    const completedAt = new Date().toISOString();
    const consultationSummary = {
      completedAt,
      completedBy: clinician.fullName,
      notes: notes || null,
      diagnosis: diagnosis || null,
      treatmentPlan: treatmentPlan || null,
      followUpRecommended: followUpRecommended || "none",
    };

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "completed",
        triageData: (await encryptField({ ...currentTriage, consultationSummary })) as any,
      },
    });
    return {
      kind: "done",
      appointmentId: updated.id,
      status: updated.status,
      completedAt,
      summary: consultationSummary,
      first: true,
    };
  });

  if (outcome.kind === "error") {
    return res.status(outcome.status).json({ error: outcome.error });
  }
  if (!outcome.first) {
    return res.json({
      appointmentId: outcome.appointmentId,
      status: outcome.status,
      completedAt: outcome.completedAt,
      summary: outcome.summary,
    });
  }
  const completedAt = outcome.completedAt;
  const consultationSummary = outcome.summary;
  const updated = { id: outcome.appointmentId, status: outcome.status };

  // Close the Daily room so the other person is not left in an open call (V27).
  await dailyApiClient
    .delete(`/rooms/${roomNameFor(appointmentId)}`, { headers: { Authorization: `Bearer ${DAILY_API_KEY}` } })
    .catch((err: { statusCode?: number }) => {
      if (err?.statusCode !== 404) logFailure("close daily room")(err);
    });

  // Cancel any lingering appointment reminders since consult is completed
  await cancelAppointmentReminders(appointmentId).catch(logFailure("reminder cancellation"));

  // Audit completion
  await createAuditLogWithIntegrity({
    action: "video.consult.completed",
    actorId: req.user!.sub,
    resourceId: appointmentId,
    metadata: {
      channel: "video",
      followUpRecommended,
      hasDiagnosis: !!diagnosis,
    },
  }).catch(logFailure("audit write video.consult.completed"));

  return res.json({
    appointmentId: updated.id,
    status: updated.status,
    completedAt,
    summary: consultationSummary,
  });
});

// ─── GET /api/video/summary/:appointmentId ────────────────────────────────────
// Real consultation summary for patient and clinician (MC-3)
router.get("/summary/:appointmentId", requireAuth, validateParams(videoAppointmentParamsSchema), async (req: AuthRequest, res: Response) => {
  const appointmentId = String(req.params.appointmentId);
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      clinician: { select: { fullName: true, gdcNumber: true } },
      patient: { select: { userId: true, firstName: true, lastName: true } },
      service: { select: { name: true } },
    },
  });

  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  // The patient, the appointment's clinician, or a clinician with the patient
  // in their care. Admins get no clinical-record access by default.
  let isAuthorized = req.user!.sub === appointment.patient.userId;
  if (!isAuthorized && req.user!.role === "clinician") {
    const clinician = await prisma.clinicianProfile.findUnique({
      where: { userId: req.user!.sub },
      select: { id: true },
    });
    isAuthorized =
      !!clinician &&
      (clinician.id === appointment.clinicianId || (await hasCareRelationship(clinician.id, appointment.patientId)));
  }

  if (!isAuthorized) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const triageData = (await decryptField<Record<string, unknown>>(appointment.triageData)) || {};
  const summary = (triageData.consultationSummary as Record<string, unknown>) || null;

  return res.json({
    appointmentId: appointment.id,
    status: appointment.status,
    serviceName: appointment.service.name,
    clinicianName: appointment.clinician?.fullName ?? null,
    gdcNumber: appointment.clinician?.gdcNumber || null,
    startTimeUtc: appointment.startTimeUtc,
    endTimeUtc: appointment.endTimeUtc,
    summary,
  });
});

export default router;
