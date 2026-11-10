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
import { sendPatientNotification } from "../lib/patient-push";

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
        enable_chat: true,
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
    console.error("[VIDEO ROOM ERROR]", err?.statusCode ?? "network", err?.message);
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

    let existingAppointment: {
      id: string;
      triageData: unknown;
      intraoralPhotos: string[];
      patient: { id: string; userId: string };
      clinician: { userId: string } | null;
    } | null = null;

    if (appointmentId) {
      existingAppointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, clinician: true },
      });

      if (!existingAppointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      const isAuthorized =
        req.user!.sub === existingAppointment.patient.userId ||
        req.user!.sub === existingAppointment.clinician?.userId ||
        req.user!.role === "admin";

      if (!isAuthorized) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    const ext = req.file.mimetype === "image/png" ? "png" : req.file.mimetype === "image/webp" ? "webp" : "jpg";
    const keyScope = appointmentId || req.user!.sub;
    const fileKey = `triage/${keyScope}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploaded = await objectStorage.upload(fileKey, req.file.buffer, req.file.mimetype, {
      uploadedBy: req.user!.sub,
      appointmentId: appointmentId || "unlinked",
      slotLabel: slotLabel || "intraoral",
    });

    // Record in patient's DocumentVault if patient profile exists
    const targetPatientId =
      existingAppointment?.patient.id ??
      (
        await prisma.patientProfile.findUnique({
          where: { userId: req.user!.sub },
          select: { id: true },
        })
      )?.id;

    if (targetPatientId) {
      await prisma.documentVault.create({
        data: {
          patientId: targetPatientId,
          docType: "intraoral_photo",
          title: slotLabel ? `Triage Photo — ${slotLabel}` : "Telehealth Triage Photo",
          fileKey: uploaded.key,
          fileSizeBytes: String(uploaded.size),
        },
      });
    }

    if (existingAppointment) {
      await prisma.appointment.update({
        where: { id: existingAppointment.id },
        data: {
          intraoralPhotos: [...(existingAppointment.intraoralPhotos || []), uploaded.key],
        },
      });
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
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: { include: { user: true } } },
    });

    if (!appointment) {
      return { error: "Appointment not found", status: 404 };
    }

    if (appointment.patient.user.id !== userId) {
      return { error: "Unauthorized", status: 403 };
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

    // VD-3: Merge triage data rather than replacing wholesale (preserves photos, admittedAt, etc.)
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

    const encryptedTriage = await encryptField(mergedTriage);

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        triageData: encryptedTriage as any,
      },
    });

    return {
      triageData: mergedTriage,
      redFlag: redFlagResult.isRedFlag ? redFlagResult : null,
      status: 200,
    };
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
    startTimeUtc: appointment.startTimeUtc.toISOString(),
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
router.get("/triage-photos/:appointmentId", requireAuth, async (req: AuthRequest, res: Response) => {
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

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

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
    const updatedTriage = {
      ...currentTriage,
      admittedAt: new Date().toISOString(),
      admittedBy: clinician.id,
    };
    const encryptedTriage = await encryptField(updatedTriage);

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "in_progress",
        triageData: encryptedTriage as any,
      },
    });

    // Tell a patient who has put the phone down. Only the first admit: a repeat
    // (the clinician tapping again) must not buzz the phone twice. Neutral text.
    if (appointment.status === "confirmed") {
      void sendPatientNotification(
        appointment.patientId,
        "Your clinician is ready",
        "Open the Pav Dental app to join your video consultation.",
        { appointmentId }
      );
    }

    return { appointment: { ...updated, triageData: updatedTriage }, status: 200 };
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

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  if (appointment.clinicianId !== clinician.id) {
    return res.status(403).json({ error: "Not assigned to this clinician" });
  }

  if (appointment.channel !== "video" || (appointment.status !== "in_progress" && appointment.status !== "confirmed")) {
    return res.status(409).json({ error: "Only an in-progress or confirmed video consultation can be completed" });
  }

  const currentTriage = (await decryptField<Record<string, unknown>>(appointment.triageData)) || {};
  const completedAt = new Date().toISOString();

  const consultationSummary = {
    completedAt,
    completedBy: clinician.fullName,
    notes: notes || null,
    diagnosis: diagnosis || null,
    treatmentPlan: treatmentPlan || null,
    followUpRecommended: followUpRecommended || "none",
  };

  const updatedTriage = {
    ...currentTriage,
    consultationSummary,
  };

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: "completed",
      triageData: (await encryptField(updatedTriage)) as any,
    },
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
