import { POSITION_STALE_MS } from "../lib/van-location";
import crypto from "crypto";
import argon2 from "argon2";
import Stripe from "stripe";
import { AppointmentStatus, CareChannel, Prisma } from "@prisma/client";
import { Router, Response } from "express";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { awardVisitPoints } from "../lib/rewards";
import { londonDate, londonTimeToUtc } from "../lib/availability";
import { getCoverageBackend } from "../lib/van-coverage";
import { cancelAppointmentReminders } from "../lib/background-jobs";
import { createAuditLogWithIntegrity } from "../lib/audit-integrity";
import { endVanShift } from "../lib/van-shift-end";
import { passwordResetService } from "../lib/otp-service";
import { communicationService } from "../lib/communication-service";
import { safeError } from "../lib/log-safety";
import { decryptField } from "../lib/encryption";
import { buildVideoActivity } from "../lib/video-activity";
import { pseudonymiseIp } from "../lib/audit-security";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { validateParams, validateQuery, validateBody } from "../middleware/validate";
import {
  adminUsersQuerySchema,
  adminAppointmentsQuerySchema,
  appointmentIdParamsSchema,
  updateAppointmentStatusSchema,
  adminAuditLogsQuerySchema,
  adminPrescriptionsQuerySchema,
  adminConsentsQuerySchema,
  adminSarExportsQuerySchema,
  adminVanShiftsQuerySchema,
  createClinicianSchema,
  createOperatorSchema,
  createClinicSchema,
  createVanSchema,
  createServiceSchema,
  assignVanPolygonSchema,
  assignVanOperatorSchema,
  idParamsSchema,
  vanAssignmentParamsSchema,
  vanPolygonParamsSchema,
  serviceIdParamsSchema,
  updateClinicSchema,
  updateServiceSchema,
  updateVanSchema,
} from "../schemas/admin";
import { logFailure } from "../lib/best-effort";

const router = Router();

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
// Returns top-level KPI metrics for the Admin Dashboard
router.get("/overview", requireAuth, requireRole("admin"), async (_req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    totalPatients,
    totalClinicians,
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    totalVans,
    recentAuditCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "patient" } }),
    prisma.user.count({ where: { role: "clinician" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "confirmed" } }),
    prisma.appointment.count({ where: { status: "completed" } }),
    prisma.van.count({ where: { isActive: true } }),
    prisma.auditLog.count(),
  ]);

  // Aggregate revenue from confirmed & completed appointments
  const revenueAgg = await prisma.appointment.aggregate({
    _sum: {
      totalPricePence: true,
      depositPaidPence: true,
    },
    where: { status: { in: ["confirmed", "completed"] } },
  });

  const totalRevenuePence = revenueAgg._sum.totalPricePence || 0;
  const depositRevenuePence = revenueAgg._sum.depositPaidPence || 0;

  return res.json({
    kpis: {
      totalUsers,
      totalPatients,
      totalClinicians,
      totalAppointments,
      confirmedAppointments,
      completedAppointments,
      activeVans: totalVans,
      totalRevenueGbp: (totalRevenuePence / 100).toFixed(2),
      depositRevenueGbp: (depositRevenuePence / 100).toFixed(2),
      auditLogsRecorded: recentAuditCount,
      systemHealth: "OPTIMAL",
    },
    updatedAt: new Date().toISOString(),
  });
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// List all users with optional role filtering and search
router.get("/users", requireAuth, requireRole("admin"), validateQuery(adminUsersQuerySchema), async (req: AuthRequest, res: Response) => {
  const { role, search, page, limit } = req.query as unknown as { role?: string; search?: string; page: number; limit: number };
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (role) whereClause.role = role;
  if (search) {
    whereClause.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { patientProfile: { firstName: { contains: search, mode: "insensitive" } } },
      { patientProfile: { lastName: { contains: search, mode: "insensitive" } } },
      { clinicianProfile: { fullName: { contains: search, mode: "insensitive" } } },
      { operatorProfile: { fullName: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        patientProfile: { select: { firstName: true, lastName: true, city: true, postcode: true } },
        clinicianProfile: { select: { fullName: true, gdcNumber: true, roleTitle: true } },
        operatorProfile: { select: { fullName: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const formattedUsers = users.map((u) => {
    const name = u.patientProfile
      ? `${u.patientProfile.firstName} ${u.patientProfile.lastName}`.trim()
      : u.clinicianProfile?.fullName || u.operatorProfile?.fullName || u.email.split("@")[0];
    // Described by what the account actually is: a patient without a profile
    // used to fall through to "System Administrator".
    let details: string;
    if (u.clinicianProfile) details = `GDC #${u.clinicianProfile.gdcNumber} · ${u.clinicianProfile.roleTitle}`;
    else if (u.patientProfile)
      details = [u.patientProfile.city, u.patientProfile.postcode].filter(Boolean).join(", ") || "No address yet";
    else if (u.operatorProfile) details = "Mobile Van Operator";
    else if (u.role === "patient") details = "Profile not set up";
    else if (u.role === "admin") details = "Practice staff (admin)";
    else details = `No ${u.role} profile`;

    return {
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      name,
      details,
    };
  });

  return res.json({ users: formattedUsers, total, page, limit });
});

// Status changes staff may make by hand (CS-49).
const ALLOWED_ADMIN_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft_hold: ["cancelled"],
  confirmed: ["in_progress", "completed", "no_show", "cancelled"],
  in_progress: ["completed", "cancelled"],
  no_show: [],
  completed: [],
  cancelled: [],
};

// ─── GET /api/admin/appointments ──────────────────────────────────────────────
// List all appointments across clinic, van, and video channels, with the names
// staff need to recognise a visit and the status changes allowed from here.
router.get("/appointments", requireAuth, requireRole("admin"), validateQuery(adminAppointmentsQuerySchema), async (req: AuthRequest, res: Response) => {
  const { status, channel, from, to, page, limit } = req.query as unknown as {
    status?: AppointmentStatus;
    channel?: CareChannel;
    from?: string;
    to?: string;
    page: number;
    limit: number;
  };
  const skip = (page - 1) * limit;

  const where: Prisma.AppointmentWhereInput = {};
  if (status) where.status = status;
  if (channel) where.channel = channel;
  // The schema has already made these strings; the typeof checks say so to
  // the reader (and to CodeQL) where the values are used.
  const fromDay = typeof from === "string" ? from : undefined;
  const toDay = typeof to === "string" ? to : undefined;
  if (fromDay || toDay) {
    where.startTimeUtc = {
      ...(fromDay ? { gte: londonTimeToUtc(fromDay, 0) } : {}),
      ...(toDay ? { lt: londonTimeToUtc(toDay, 1440) } : {}),
    };
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { startTimeUtc: "desc" },
      take: limit,
      skip,
      include: {
        patient: { select: { firstName: true, lastName: true, erasedAt: true } },
        dependant: { select: { firstName: true } },
        clinician: { select: { fullName: true } },
        service: { select: { name: true } },
        clinic: { select: { name: true } },
        van: { select: { name: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  const formatted = appointments.map((a) => ({
    id: a.id,
    patientId: a.patientId,
    patientName: a.patient.erasedAt ? "Erased patient" : `${a.patient.firstName} ${a.patient.lastName}`.trim(),
    dependantName: a.dependant?.firstName ?? null,
    clinicianId: a.clinicianId,
    clinicianName: a.clinician?.fullName ?? null,
    serviceId: a.serviceId,
    serviceName: a.service.name,
    channel: a.channel,
    placeName: a.clinic?.name ?? a.van?.name ?? null,
    startTimeUtc: a.startTimeUtc,
    endTimeUtc: a.endTimeUtc,
    status: a.status,
    allowedStatuses: ALLOWED_ADMIN_STATUS_TRANSITIONS[a.status] ?? [],
    totalPricePence: a.totalPricePence,
    depositPaidPence: a.depositPaidPence,
    totalPriceGbp: (a.totalPricePence / 100).toFixed(2),
    depositPaidGbp: (a.depositPaidPence / 100).toFixed(2),
    stripePaymentId: a.stripePaymentId,
  }));

  return res.json({ appointments: formatted, total, page, limit });
});

// ─── GET /api/admin/appointments/:id/video-activity ───────────────────────────
// For one video visit: whether the call took place and which notices went to the
// patient (V41). Timing and delivery only: no message text, triage answers or provider errors.
router.get("/appointments/:id/video-activity", requireAuth, requireRole("admin"), validateParams(appointmentIdParamsSchema), async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    select: {
      channel: true,
      status: true,
      startTimeUtc: true,
      endTimeUtc: true,
      patientWaitingSince: true,
      triageData: true,
      patient: { select: { userId: true } },
    },
  });
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  if (appointment.channel !== "video") return res.status(409).json({ error: "Only a video visit has call activity" });

  const aboutThisVisit = { path: ["appointmentId"], equals: id };
  const [pushes, reminders, thread, triage] = await Promise.all([
    prisma.notificationHistory.findMany({
      where: { userId: appointment.patient.userId, data: aboutThisVisit },
      select: { type: true, title: true, sentAt: true, status: true },
      orderBy: { sentAt: "asc" },
      take: 50,
    }),
    prisma.scheduledNotification.findMany({
      where: { userId: appointment.patient.userId, data: aboutThisVisit },
      select: { title: true, scheduledFor: true, sentAt: true, status: true },
      orderBy: { scheduledFor: "asc" },
      take: 50,
    }),
    prisma.messageThread.findUnique({
      where: { appointmentId: id },
      select: { _count: { select: { messages: true } }, messages: { orderBy: { sentAt: "desc" }, take: 1, select: { sentAt: true } } },
    }),
    decryptField<Record<string, unknown> | null>(appointment.triageData),
  ]);

  return res.json(
    buildVideoActivity({
      status: appointment.status,
      startTimeUtc: appointment.startTimeUtc,
      endTimeUtc: appointment.endTimeUtc,
      patientWaitingSince: appointment.patientWaitingSince,
      triage: triage && typeof triage === "object" ? triage : null,
      pushes,
      reminders,
      thread: thread ? { messageCount: thread._count.messages, lastMessageAt: thread.messages[0]?.sentAt ?? null } : null,
    })
  );
});

// ─── PATCH /api/admin/appointments/:id/status ─────────────────────────────────
// Admin status override (CS-49: allowed transitions only, cancels through refund path, audit from and to)
router.patch("/appointments/:id/status", requireAuth, requireRole("admin"), validateParams(appointmentIdParamsSchema), validateBody(updateAppointmentStatusSchema), async (req: AuthRequest, res: Response) => {
  const appointmentId = String(req.params.id);
  const { status } = req.body;

  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, status: true, depositPaidPence: true, stripePaymentId: true, startTimeUtc: true },
  });
  if (!existing) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  if (existing.status === status) {
    return res.json({ id: existing.id, status: existing.status });
  }

  const allowed = ALLOWED_ADMIN_STATUS_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(status)) {
    return res.status(409).json({ error: `Cannot transition appointment from ${existing.status} to ${status}` });
  }

  // Same rule as the clinician's complete (CS-28, decisions log #24): a visit
  // can be completed on its UK calendar day or later, never ahead of it.
  // Completing is final (no way back, no refund) and awards loyalty points, so
  // a mis-click on a future booking must not be able to do either.
  if ((status === "completed" || status === "in_progress") && londonDate(existing.startTimeUtc) > londonDate(new Date())) {
    return res.status(400).json({ error: "Cannot start or complete an appointment scheduled for a future date" });
  }

  // If cancelling a booking where deposit was paid, issue refund through Stripe
  if (status === "cancelled" && existing.depositPaidPence > 0 && existing.stripePaymentId) {
    if (!env.isMockStripe && !existing.stripePaymentId.startsWith("pi_mock_")) {
      try {
        const stripe = new Stripe(env.stripeSecretKey, { apiVersion: "2025-02-24.acacia" as never });
        await stripe.refunds.create(
          { payment_intent: existing.stripePaymentId, amount: existing.depositPaidPence, reason: "requested_by_customer" },
          { idempotencyKey: `admin-cancel-refund:${existing.id}:${existing.depositPaidPence}` }
        );
      } catch (refundErr) {
        // Don't cancel without the refund (decisions log #22): the booking
        // stays as it was and staff can try again.
        console.error(
          "[Admin Status] Refund failed during admin cancellation:",
          refundErr instanceof Error ? refundErr.name : "unknown error"
        );
        return res.status(502).json({ error: "The deposit couldn't be refunded, so the appointment wasn't cancelled. Try again." });
      }
    }
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: status as any },
  });

  // Points for a completed visit (decisions log #14); a repeat is a no-op.
  if (updated.status === "completed") await awardVisitPoints(updated.id);

  // If status changed to cancelled, cancel pending reminders
  if (updated.status === "cancelled") {
    await cancelAppointmentReminders(appointmentId).catch(logFailure("reminder cancellation"));
  }

  await createAuditLogWithIntegrity({
    action: "admin.appointment.status_updated",
    actorId: req.user!.sub,
    resourceId: appointmentId,
    sessionId: req.user?.sessionId ?? null,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {
      fromStatus: existing.status,
      toStatus: status,
    },
  }).catch(logFailure("audit write admin.appointment.status_updated"));

  return res.json({ id: updated.id, status: updated.status, updatedAt: updated.updatedAt });
});

// ─── GET /api/admin/vans ──────────────────────────────────────────────────────
router.get("/vans", requireAuth, requireRole("admin"), async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const vans = await prisma.van.findMany({
    include: {
      servicePolygons: { select: { id: true, sectorName: true, polygonGeoJson: true, createdAt: true } },
      // Every operator assigned now (a van can have more than one), plus any
      // that start later. Ended assignments are left out.
      assignments: {
        where: { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        include: { operator: { select: { fullName: true, phone: true } } },
        orderBy: { startsAt: "desc" },
      },
      _count: { select: { appointments: true } },
    },
    orderBy: { name: "asc" },
  });

  return res.json(vans);
});

// ─── POST /api/admin/vans ─────────────────────────────────────────────────────
router.post("/vans", requireAuth, requireRole("admin"), validateBody(createVanSchema), async (req: AuthRequest, res: Response) => {
  const { name, registrationPlate, vehicleModel, isActive } = req.body;

  const existingPlate = await prisma.van.findUnique({ where: { registrationPlate } });
  if (existingPlate) {
    return res.status(409).json({ error: "Van with this registration plate already exists" });
  }

  const van = await prisma.van.create({
    data: {
      name,
      registrationPlate,
      vehicleModel,
      isActive: isActive ?? true,
    },
  });

  await createAuditLogWithIntegrity({
    action: "admin.van_created",
    actorId: req.user!.sub,
    resourceId: van.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { vanId: van.id, registrationPlate },
  });

  return res.status(201).json(van);
});

/** Upcoming bookings that still name this clinic, van or service, so staff know who to contact. */
const upcomingBookings = (where: Prisma.AppointmentWhereInput) =>
  prisma.appointment.count({
    where: { ...where, startTimeUtc: { gte: new Date() }, status: { in: ["draft_hold", "confirmed"] } },
  });

async function auditEdit(req: AuthRequest, action: string, resourceId: string, fields: string[]) {
  await createAuditLogWithIntegrity({
    action,
    actorId: req.user!.sub,
    resourceId,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { fields },
  });
}

// ─── PATCH /api/admin/vans/:id ────────────────────────────────────────────────
// BE-10: fix a van's details or retire it. A van out on a shift can't be
// retired until the shift ends.
router.patch("/vans/:id", requireAuth, requireRole("admin"), validateParams(idParamsSchema), validateBody(updateVanSchema), async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.van.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return res.status(404).json({ error: "Van not found" });

  if (req.body.isActive === false) {
    const openShift = await prisma.vanShift.findFirst({ where: { vanId: id, endedAt: null }, select: { id: true } });
    if (openShift) return res.status(409).json({ error: "This van is on a shift. End the shift before retiring the van." });
  }

  try {
    const van = await prisma.van.update({ where: { id }, data: req.body });
    await auditEdit(req, "admin.van_updated", id, Object.keys(req.body));
    return res.json({ ...van, upcomingBookings: await upcomingBookings({ vanId: id }) });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(409).json({ error: "Another van already has this registration plate" });
    }
    throw err;
  }
});

// ─── POST /api/admin/vans/:id/polygons ────────────────────────────────────────
router.post("/vans/:id/polygons", requireAuth, requireRole("admin"), validateParams(idParamsSchema), validateBody(assignVanPolygonSchema), async (req: AuthRequest, res: Response) => {
  const vanId = String(req.params.id);
  const { sectorName, polygonGeoJson } = req.body;

  const van = await prisma.van.findUnique({ where: { id: vanId } });
  if (!van) {
    return res.status(404).json({ error: "Van not found" });
  }

  // PostGIS stores a ring that crosses itself, but answers "is this address
  // inside?" unreliably for it, so such shapes are refused with the reason.
  if ((await getCoverageBackend()).mode === "postgis") {
    const [check] = await prisma.$queryRaw<{ valid: boolean; reason: string }[]>`
      SELECT ST_IsValid(g) AS valid, ST_IsValidReason(g) AS reason
      FROM (SELECT ST_GeomFromGeoJSON(${JSON.stringify(polygonGeoJson)}) AS g) AS shape`;
    if (!check?.valid) {
      return res.status(400).json({ error: `That shape isn't a valid area: ${check?.reason ?? "invalid geometry"}` });
    }
  }

  let polygon;
  try {
    polygon = await prisma.vanServicePolygon.create({
      data: { vanId, sectorName, polygonGeoJson: polygonGeoJson as Prisma.InputJsonValue },
    });
  } catch (err) {
    // The database turns the GeoJSON into a PostGIS polygon and refuses shapes
    // it can't use (for example a ring that crosses itself).
    console.warn("[ADMIN] Van service area refused:", safeError(err));
    return res.status(400).json({ error: "That shape isn't a valid area. Check the ring doesn't cross itself." });
  }

  await createAuditLogWithIntegrity({
    action: "admin.van_polygon_assigned",
    actorId: req.user!.sub,
    resourceId: polygon.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { vanId, sectorName, polygonId: polygon.id },
  });

  return res.status(201).json(polygon);
});

// ─── POST /api/admin/vans/:id/assignments ─────────────────────────────────────
router.post("/vans/:id/assignments", requireAuth, requireRole("admin"), validateParams(idParamsSchema), validateBody(assignVanOperatorSchema), async (req: AuthRequest, res: Response) => {
  const vanId = String(req.params.id);
  const { operatorId, startsAt, endsAt } = req.body;

  const [van, operator] = await Promise.all([
    prisma.van.findUnique({ where: { id: vanId } }),
    prisma.operatorProfile.findUnique({ where: { id: operatorId } }),
  ]);

  if (!van) return res.status(404).json({ error: "Van not found" });
  if (!operator) return res.status(404).json({ error: "Operator not found" });

  const starts = startsAt ? new Date(startsAt) : new Date();
  const ends = endsAt ? new Date(endsAt) : null;
  if (ends && ends <= starts) {
    return res.status(400).json({ error: "The assignment must end after it starts" });
  }

  // An operator drives one van at a time: a new assignment ends any open one.
  const assignment = await prisma.$transaction(async (tx) => {
    await tx.vanOperatorAssignment.updateMany({
      where: { operatorId, OR: [{ endsAt: null }, { endsAt: { gt: starts } }], startsAt: { lte: starts } },
      data: { endsAt: starts },
    });
    return tx.vanOperatorAssignment.create({
      data: { vanId, operatorId, startsAt: starts, endsAt: ends },
    });
  });

  await createAuditLogWithIntegrity({
    action: "admin.van_operator_assigned",
    actorId: req.user!.sub,
    resourceId: assignment.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { vanId, operatorId, assignmentId: assignment.id },
  });

  return res.status(201).json(assignment);
});

// ─── POST /api/admin/vans/:id/assignments/:assignmentId/end ──────────────────
// Ends an operator's assignment to a van now. A shift already under way keeps
// running; the operator can't start a new one on this van afterwards.
router.post(
  "/vans/:id/assignments/:assignmentId/end",
  requireAuth,
  requireRole("admin"),
  validateParams(vanAssignmentParamsSchema),
  async (req: AuthRequest, res: Response) => {
    const vanId = String(req.params.id);
    const assignmentId = String(req.params.assignmentId);
    const now = new Date();
    const assignment = await prisma.vanOperatorAssignment.findFirst({ where: { id: assignmentId, vanId } });
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    if (assignment.endsAt && assignment.endsAt <= now) {
      return res.status(409).json({ error: "This assignment has already ended" });
    }
    const ended = await prisma.vanOperatorAssignment.update({
      where: { id: assignmentId },
      data: { endsAt: now },
    });
    await createAuditLogWithIntegrity({
      action: "admin.van_operator_unassigned",
      actorId: req.user!.sub,
      resourceId: assignmentId,
      sessionId: req.user!.sessionId,
      ipHash: pseudonymiseIp(req.ip || ""),
      metadata: { vanId, operatorId: assignment.operatorId, assignmentId },
    });
    return res.json(ended);
  }
);

// ─── DELETE /api/admin/vans/:id/polygons/:polygonId ───────────────────────────
// Removes one service area. Patients there are no longer covered by this van.
router.delete(
  "/vans/:id/polygons/:polygonId",
  requireAuth,
  requireRole("admin"),
  validateParams(vanPolygonParamsSchema),
  async (req: AuthRequest, res: Response) => {
    const vanId = String(req.params.id);
    const polygonId = String(req.params.polygonId);
    const polygon = await prisma.vanServicePolygon.findFirst({ where: { id: polygonId, vanId } });
    if (!polygon) return res.status(404).json({ error: "Service area not found" });
    await prisma.vanServicePolygon.delete({ where: { id: polygonId } });
    await createAuditLogWithIntegrity({
      action: "admin.van_polygon_removed",
      actorId: req.user!.sub,
      resourceId: polygonId,
      sessionId: req.user!.sessionId,
      ipHash: pseudonymiseIp(req.ip || ""),
      metadata: { vanId, sectorName: polygon.sectorName, polygonId },
    });
    return res.status(204).end();
  }
);

// ─── GET /api/admin/operators ─────────────────────────────────────────────────
// Van operators with the van they're assigned to now, if any.
router.get("/operators", requireAuth, requireRole("admin"), async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const operators = await prisma.operatorProfile.findMany({
    include: {
      user: { select: { email: true, isActive: true } },
      assignments: {
        where: { startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        include: { van: { select: { id: true, name: true } } },
        orderBy: { startsAt: "desc" },
        take: 1,
      },
    },
    orderBy: { fullName: "asc" },
  });
  return res.json(
    operators.map((o) => ({
      id: o.id,
      fullName: o.fullName,
      phone: o.phone,
      email: o.user.email,
      isActive: o.user.isActive,
      currentAssignment: o.assignments[0]
        ? {
            id: o.assignments[0].id,
            vanId: o.assignments[0].van.id,
            vanName: o.assignments[0].van.name,
            startsAt: o.assignments[0].startsAt,
            endsAt: o.assignments[0].endsAt,
          }
        : null,
    }))
  );
});

// ─── POST /api/admin/clinicians ───────────────────────────────────────────────
// Onboards a clinician without direct SQL
router.post("/clinicians", requireAuth, requireRole("admin"), validateBody(createClinicianSchema), async (req: AuthRequest, res: Response) => {
  const { email, password, fullName, gdcNumber, roleTitle, specialisms, bio, photoUrl, isTelehealthActive } = req.body;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return res.status(409).json({ error: "User with this email already exists" });
  }

  const existingGdc = await prisma.clinicianProfile.findUnique({ where: { gdcNumber } });
  if (existingGdc) {
    return res.status(409).json({ error: "Clinician with this GDC number already exists" });
  }

  const pwd = password || crypto.randomUUID();
  const passwordHash = await argon2.hash(pwd);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: "clinician",
        emailVerified: true,
      },
    });
    const profile = await tx.clinicianProfile.create({
      data: {
        userId: user.id,
        fullName,
        gdcNumber,
        roleTitle,
        specialisms,
        bio: bio ?? null,
        photoUrl: photoUrl ?? null,
        isTelehealthActive: isTelehealthActive ?? true,
      },
    });
    return { user, profile };
  });

  await createAuditLogWithIntegrity({
    action: "admin.clinician_created",
    actorId: req.user!.sub,
    resourceId: result.profile.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { clinicianId: result.profile.id, gdcNumber },
  });

  const inviteSent = password ? false : await sendStaffInvite(result.user.id, result.user.email, "clinician");

  return res.status(201).json({
    inviteSent,
    id: result.profile.id,
    userId: result.user.id,
    email: result.user.email,
    fullName: result.profile.fullName,
    gdcNumber: result.profile.gdcNumber,
    roleTitle: result.profile.roleTitle,
    specialisms: result.profile.specialisms,
    bio: result.profile.bio,
    photoUrl: result.profile.photoUrl,
    isTelehealthActive: result.profile.isTelehealthActive,
    createdAt: result.profile.createdAt,
  });
});

// Staff added without a password get an emailed link to set their own.
const STAFF_INVITE_TTL_MS = 72 * 60 * 60 * 1000;

async function sendStaffInvite(userId: string, email: string, roleLabel: string): Promise<boolean> {
  try {
    const { token, hashedToken } = passwordResetService.generateResetToken();
    await prisma.passwordResetToken.create({
      data: { userId, token: hashedToken, expiresAt: new Date(Date.now() + STAFF_INVITE_TTL_MS) },
    });
    return await communicationService.sendStaffInviteEmail(email, token, roleLabel);
  } catch (err) {
    console.error("[ADMIN] Staff invite failed:", safeError(err));
    return false;
  }
}

// ─── POST /api/admin/operators ────────────────────────────────────────────────
// Onboards a van operator without direct SQL
router.post("/operators", requireAuth, requireRole("admin"), validateBody(createOperatorSchema), async (req: AuthRequest, res: Response) => {
  const { email, password, fullName, phone } = req.body;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return res.status(409).json({ error: "User with this email already exists" });
  }

  const pwd = password || crypto.randomUUID();
  const passwordHash = await argon2.hash(pwd);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: "operator",
        emailVerified: true,
      },
    });
    const profile = await tx.operatorProfile.create({
      data: {
        userId: user.id,
        fullName,
        phone: phone ?? null,
      },
    });
    return { user, profile };
  });

  await createAuditLogWithIntegrity({
    action: "admin.operator_created",
    actorId: req.user!.sub,
    resourceId: result.profile.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { operatorId: result.profile.id },
  });

  const inviteSent = password ? false : await sendStaffInvite(result.user.id, result.user.email, "van operator");

  return res.status(201).json({
    inviteSent,
    id: result.profile.id,
    userId: result.user.id,
    email: result.user.email,
    fullName: result.profile.fullName,
    phone: result.profile.phone,
    createdAt: result.profile.createdAt,
  });
});

// ─── POST /api/admin/clinics ──────────────────────────────────────────────────
router.post("/clinics", requireAuth, requireRole("admin"), validateBody(createClinicSchema), async (req: AuthRequest, res: Response) => {
  const { name, address, postcode, city, phone, operatingHours, isActive } = req.body;

  const clinic = await prisma.clinic.create({
    data: {
      name,
      address,
      postcode,
      city,
      phone,
      operatingHours,
      isActive: isActive ?? true,
    },
  });

  await createAuditLogWithIntegrity({
    action: "admin.clinic_created",
    actorId: req.user!.sub,
    resourceId: clinic.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { clinicId: clinic.id, name },
  });

  return res.status(201).json(clinic);
});

// ─── PATCH /api/admin/clinics/:id ─────────────────────────────────────────────
// BE-10: fix a clinic's details or retire it. Opening hours and closures are
// edited on their own endpoints (admin-schedule.ts).
router.patch("/clinics/:id", requireAuth, requireRole("admin"), validateParams(idParamsSchema), validateBody(updateClinicSchema), async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.clinic.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return res.status(404).json({ error: "Clinic not found" });

  const clinic = await prisma.clinic.update({ where: { id }, data: req.body });
  await auditEdit(req, "admin.clinic_updated", id, Object.keys(req.body));
  return res.json({ ...clinic, upcomingBookings: await upcomingBookings({ clinicId: id }) });
});

// ─── Services ─────────────────────────────────────────────────────────────────
router.get("/services", requireAuth, requireRole("admin"), async (_req: AuthRequest, res: Response) => {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });
  return res.json(services);
});

router.post("/services", requireAuth, requireRole("admin"), validateBody(createServiceSchema), async (req: AuthRequest, res: Response) => {
  const {
    name,
    description,
    category,
    durationMinutes,
    pricePence,
    depositPence,
    supportedChannels,
    prepInstructions,
    requiresPriorConsult,
    isActive,
  } = req.body;

  const id = `srv_${crypto.randomUUID().slice(0, 8)}`;
  const service = await prisma.service.create({
    data: {
      id,
      name,
      description,
      category: category ?? "checkup",
      durationMinutes,
      pricePence,
      depositPence,
      supportedChannels: supportedChannels ?? ["clinic", "van", "video"],
      prepInstructions: prepInstructions ?? [],
      requiresPriorConsult: requiresPriorConsult ?? false,
      isActive: isActive ?? true,
    },
  });

  await createAuditLogWithIntegrity({
    action: "admin.service_created",
    actorId: req.user!.sub,
    resourceId: service.id,
    sessionId: req.user!.sessionId,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: { serviceId: service.id, name, pricePence },
  });

  return res.status(201).json(service);
});

// ─── PATCH /api/admin/services/:id ────────────────────────────────────────────
// BE-10: fix a service or retire it. A new price or deposit applies to new
// bookings only: each booking keeps the price it was made at.
router.patch("/services/:id", requireAuth, requireRole("admin"), validateParams(serviceIdParamsSchema), validateBody(updateServiceSchema), async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const existing = await prisma.service.findUnique({ where: { id }, select: { pricePence: true, depositPence: true } });
  if (!existing) return res.status(404).json({ error: "Service not found" });

  const pricePence = req.body.pricePence ?? existing.pricePence;
  const depositPence = req.body.depositPence ?? existing.depositPence;
  if (depositPence > pricePence) {
    return res.status(400).json({ error: "The deposit can't be more than the price" });
  }

  const service = await prisma.service.update({ where: { id }, data: req.body });
  await auditEdit(req, "admin.service_updated", id, Object.keys(req.body));
  return res.json({ ...service, upcomingBookings: await upcomingBookings({ serviceId: id }) });
});

// ─── GET /api/admin/audit-logs ────────────────────────────────────────────────
// Newest first. Filter by the start of the action name or by the record it is
// about. Hashes and session ids stay out: staff need who, what and when.
router.get("/audit-logs", requireAuth, requireRole("admin"), validateQuery(adminAuditLogsQuerySchema), async (req: AuthRequest, res: Response) => {
  const { action, resourceId, page, limit } = req.query as unknown as { action?: string; resourceId?: string; page: number; limit: number };
  const skip = (page - 1) * limit;
  const where: Prisma.AuditLogWhereInput = {
    ...(action ? { action: { startsWith: action } } : {}),
    ...(resourceId ? { resourceId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: [{ timestampUtc: "desc" }, { id: "desc" }],
      take: limit,
      skip,
      include: { actor: { select: { email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const formattedLogs = logs.map((log) => ({
    id: log.id.toString(),
    action: log.action,
    actorId: log.actorId,
    actorEmail: log.actor?.email ?? null,
    actorRole: log.actor?.role ?? null,
    resourceId: log.resourceId,
    metadata: log.metadata,
    timestampUtc: log.timestampUtc,
    archived: log.archived,
  }));

  return res.json({ logs: formattedLogs, total, page, limit });
});

// ─── GET /api/admin/prescriptions ─────────────────────────────────────────────
// Register of prescriptions issued, newest first: reference, who issued it,
// when, whether it was signed and whether it was sent. Staff need to know a
// prescription exists and who stands behind it. They don't need what was
// prescribed or for whom, so medication, dosage, the patient and the signed
// content stay out, the same as the audit log keeps hashes out.
router.get("/prescriptions", requireAuth, requireRole("admin"), validateQuery(adminPrescriptionsQuerySchema), async (req: AuthRequest, res: Response) => {
  const { from, to, clinicianId, page, limit } = req.query as unknown as {
    from?: string;
    to?: string;
    clinicianId?: string;
    page: number;
    limit: number;
  };
  // The schema has already made these strings; the typeof checks say so to
  // the reader (and to CodeQL) where the values are used.
  const fromDay = typeof from === "string" ? from : undefined;
  const toDay = typeof to === "string" ? to : undefined;
  const byClinician = typeof clinicianId === "string" ? clinicianId : undefined;
  const where: Prisma.PrescriptionWhereInput = {
    ...(fromDay || toDay
      ? {
          createdAt: {
            ...(fromDay ? { gte: londonTimeToUtc(fromDay, 0) } : {}),
            ...(toDay ? { lt: londonTimeToUtc(toDay, 1440) } : {}),
          },
        }
      : {}),
    ...(byClinician ? { clinicianId: byClinician } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        reference: true,
        appointmentId: true,
        clinicianId: true,
        createdAt: true,
        dispatchedAt: true,
        signature: true,
        signingKeyId: true,
        clinician: { select: { fullName: true, roleTitle: true } },
      },
    }),
    prisma.prescription.count({ where }),
  ]);

  return res.json({
    prescriptions: rows.map((p) => ({
      id: p.id,
      reference: p.reference,
      appointmentId: p.appointmentId,
      clinicianId: p.clinicianId,
      clinicianName: p.clinician?.fullName ?? null,
      clinicianRole: p.clinician?.roleTitle ?? null,
      issuedAt: p.createdAt,
      signed: Boolean(p.signature),
      signingKeyId: p.signingKeyId,
      dispatchedAt: p.dispatchedAt,
    })),
    total,
    page,
    limit,
  });
});

// ─── GET /api/admin/consents ──────────────────────────────────────────────────
// Consent records, newest first: who agreed to what, on what lawful basis, and
// whether it has been withdrawn. IP addresses and the free-form metadata stay
// out; staff need the decision, not the device it was made on.
router.get("/consents", requireAuth, requireRole("admin"), validateQuery(adminConsentsQuerySchema), async (req: AuthRequest, res: Response) => {
  const { consentType, status, patientId, page, limit } = req.query as unknown as {
    consentType?: string;
    status?: "granted" | "withdrawn";
    patientId?: string;
    page: number;
    limit: number;
  };
  // The schema has already made these strings; the typeof checks say so to
  // the reader (and to CodeQL) where the values are used.
  const type = typeof consentType === "string" ? consentType : undefined;
  const patient = typeof patientId === "string" ? patientId : undefined;
  const where: Prisma.ConsentRecordWhereInput = {
    ...(type ? { consentType: type } : {}),
    ...(patient ? { patientProfileId: patient } : {}),
    ...(status === "granted" ? { isGranted: true } : {}),
    ...(status === "withdrawn" ? { isGranted: false } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.consentRecord.findMany({
      where,
      orderBy: [{ grantedAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        patientProfileId: true,
        consentType: true,
        version: true,
        lawfulBasis: true,
        isGranted: true,
        grantedAt: true,
        withdrawnAt: true,
        patientProfile: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.consentRecord.count({ where }),
  ]);

  return res.json({
    consents: rows.map((c) => ({
      id: c.id,
      patientId: c.patientProfileId,
      patientName: `${c.patientProfile.firstName} ${c.patientProfile.lastName}`.trim(),
      consentType: c.consentType,
      version: c.version,
      lawfulBasis: c.lawfulBasis,
      isGranted: c.isGranted,
      grantedAt: c.grantedAt,
      withdrawnAt: c.withdrawnAt,
    })),
    total,
    page,
    limit,
  });
});

// ─── GET /api/admin/sar-exports ───────────────────────────────────────────────
// Subject access bundles patients have generated for themselves, newest first.
// A bundle is the patient's own copy: staff can see that one was made and when
// (the one-month clock for a request), never its contents or a way to download
// it, and the file key stays out.
router.get("/sar-exports", requireAuth, requireRole("admin"), validateQuery(adminSarExportsQuerySchema), async (req: AuthRequest, res: Response) => {
  const { from, to, patientId, page, limit } = req.query as unknown as {
    from?: string;
    to?: string;
    patientId?: string;
    page: number;
    limit: number;
  };
  const fromDay = typeof from === "string" ? from : undefined;
  const toDay = typeof to === "string" ? to : undefined;
  const patient = typeof patientId === "string" ? patientId : undefined;
  const where: Prisma.DocumentVaultWhereInput = {
    docType: "gdpr_sar_export",
    ...(fromDay || toDay
      ? {
          createdAt: {
            ...(fromDay ? { gte: londonTimeToUtc(fromDay, 0) } : {}),
            ...(toDay ? { lt: londonTimeToUtc(toDay, 1440) } : {}),
          },
        }
      : {}),
    ...(patient ? { patientId: patient } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.documentVault.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        patientId: true,
        createdAt: true,
        fileSizeBytes: true,
        patient: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.documentVault.count({ where }),
  ]);

  return res.json({
    exports: rows.map((d) => ({
      id: d.id,
      patientId: d.patientId,
      patientName: `${d.patient.firstName} ${d.patient.lastName}`.trim(),
      createdAt: d.createdAt,
      fileSizeBytes: Number(d.fileSizeBytes) || 0,
    })),
    total,
    page,
    limit,
  });
});

// ─── GET /api/admin/van-shifts ────────────────────────────────────────────────
// Who is out on a van now, and recent shifts. Live shifts come first, then the
// newest. Staff need to know a van is working, when it last reported in and
// how many requests it has open. Where it is, and who the requests are from,
// stay out: that is the operator's and the patients' business, and patients
// only ever see a van that is next in line.
router.get("/van-shifts", requireAuth, requireRole("admin"), validateQuery(adminVanShiftsQuerySchema), async (req: AuthRequest, res: Response) => {
  const { state, vanId, page, limit } = req.query as unknown as {
    state?: "live" | "ended";
    vanId?: string;
    page: number;
    limit: number;
  };
  const van = typeof vanId === "string" ? vanId : undefined;
  const where: Prisma.VanShiftWhereInput = {
    ...(state === "live" ? { endedAt: null } : {}),
    ...(state === "ended" ? { endedAt: { not: null } } : {}),
    ...(van ? { vanId: van } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.vanShift.findMany({
      where,
      // Postgres sorts NULLs first when descending, which puts live shifts
      // (no end time) at the top.
      orderBy: [{ endedAt: { sort: "desc", nulls: "first" } }, { startedAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        vanId: true,
        status: true,
        startedAt: true,
        endedAt: true,
        lastLocationAt: true,
        van: { select: { name: true, registrationPlate: true } },
        operator: { select: { fullName: true } },
        _count: { select: { requests: { where: { status: { in: ["pending", "accepted", "in_progress"] } } } } },
      },
    }),
    prisma.vanShift.count({ where }),
  ]);

  return res.json({
    shifts: rows.map((shift) => ({
      id: shift.id,
      vanId: shift.vanId,
      vanName: shift.van.name,
      registrationPlate: shift.van.registrationPlate,
      operatorName: shift.operator.fullName,
      status: shift.status,
      live: shift.endedAt === null,
      startedAt: shift.startedAt,
      endedAt: shift.endedAt,
      lastSeenAt: shift.lastLocationAt,
      openRequests: shift._count.requests,
    })),
    total,
    page,
    limit,
  });
});

// ─── GET /api/admin/attention ─────────────────────────────────────────────────
// What needs a person today, as counts only: today's visits (UK day), threads
// waiting for staff, erasure requests (and which are past their month), failed
// card payments in the last week, van deposits that couldn't be released, and
// vans out now. No names, amounts or message text: each count links to the
// screen that has the detail.
const OPEN_VISIT_STATUSES: AppointmentStatus[] = ["confirmed", "in_progress"];
const TODAY_VISIT_STATUSES: AppointmentStatus[] = ["confirmed", "in_progress", "completed", "no_show"];

router.get("/attention", requireAuth, requireRole("admin"), async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ukToday = now.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const dayStart = londonTimeToUtc(ukToday, 0);
  const dayEnd = londonTimeToUtc(ukToday, 1440);
  const today = { startTimeUtc: { gte: dayStart, lt: dayEnd } };

  const [
    visitsToday,
    visitsLeftToday,
    unreadThreads,
    erasureOpen,
    erasureOverdue,
    cardFailures,
    depositReleaseFailures,
    vansOut,
    quietVans,
  ] = await Promise.all([
    prisma.appointment.count({ where: { ...today, status: { in: TODAY_VISIT_STATUSES } } }),
    prisma.appointment.count({ where: { ...today, status: { in: OPEN_VISIT_STATUSES } } }),
    prisma.messageThread.count({ where: { staffUnread: true } }),
    prisma.erasureRequest.count({ where: { status: "pending" } }),
    prisma.erasureRequest.count({ where: { status: "pending", dueAt: { lt: now } } }),
    prisma.auditLog.count({
      where: { action: { startsWith: "stripe.payment_intent.payment_failed" }, timestampUtc: { gte: weekAgo } },
    }),
    prisma.vanServiceRequest.count({ where: { depositReleaseStatus: "failed" } }),
    prisma.vanShift.count({ where: { endedAt: null, status: { in: ["online", "paused"] } } }),
    // Online but no position report for a while: patients are no longer offered
    // this van, and the crew may not know (N14).
    prisma.vanShift.count({
      where: { endedAt: null, status: "online", lastLocationAt: { lt: new Date(now.getTime() - POSITION_STALE_MS) } },
    }),
  ]);

  return res.json({
    visitsToday,
    visitsLeftToday,
    unreadThreads,
    erasureOpen,
    erasureOverdue,
    cardFailuresLastWeek: cardFailures,
    depositReleaseFailures,
    vansOut,
    quietVans,
    asOf: now.toISOString(),
  });
});

// ─── POST /api/admin/van-shifts/:id/end ───────────────────────────────────────
// Ends a shift that was left running (the operator's phone died, they forgot),
// which would otherwise block that van and that operator from starting
// another. Same rules as the operator ending their own shift: stops already
// accepted or under way must be completed or cancelled first, because those
// patients are waiting with a deposit taken; pending requests are expired and
// their deposit holds released. Recorded in the audit log.
router.post("/van-shifts/:id/end", requireAuth, requireRole("admin"), validateParams(idParamsSchema), async (req: AuthRequest, res: Response) => {
  const shiftId = String(req.params.id);
  const shift = await prisma.vanShift.findUnique({
    where: { id: shiftId },
    select: { id: true, vanId: true, operatorId: true, endedAt: true },
  });
  if (!shift) return res.status(404).json({ error: "Shift not found" });
  if (shift.endedAt) return res.status(409).json({ error: "That shift has already ended" });

  const result = await endVanShift(shift);
  if (!result.ended) {
    // The dashboard shows `error` as it is, so the instructions go in it.
    return res.status(409).json({
      error: `Can't end this shift yet: ${result.openStops} accepted or in-progress stop(s) are still open. Cancel or complete those visits first, then end the shift.`,
      openStops: result.openStops,
    });
  }

  await createAuditLogWithIntegrity({
    action: "admin.van_shift.ended",
    actorId: req.user!.sub,
    resourceId: shift.id,
    sessionId: req.user?.sessionId ?? null,
    ipHash: pseudonymiseIp(req.ip || ""),
    metadata: {
      vanId: shift.vanId,
      operatorId: shift.operatorId,
      expiredRequests: result.expiredRequests,
      depositReleasesFailed: result.failedReleases.length,
    },
  }).catch(logFailure("audit write admin.van_shift.ended"));

  return res.json({
    id: result.shift.id,
    status: result.shift.status,
    endedAt: result.shift.endedAt,
    expiredRequests: result.expiredRequests,
    depositReleasesFailed: result.failedReleases.length,
  });
});

export default router;
