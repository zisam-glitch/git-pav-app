import { Prisma, PrismaClient } from "@prisma/client";
import { decryptField, decryptString } from "./encryption";

export interface SarContext {
  userId: string;
  profileId: string;
}

export type ModelExtractor = (
  prisma: PrismaClient,
  ctx: SarContext
) => Promise<unknown>;

/**
 * Registry of all Prisma models holding patient or clinical personal data.
 * SAR-1: Build the export from a per-model registry with a test that fails
 * when a model holding personal data isn't covered.
 */
export const PATIENT_DATA_EXTRACTORS: Record<string, ModelExtractor> = {
  User: async (prisma, { userId }) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        mfaEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  PatientProfile: async (prisma, { profileId }) => {
    const profile = await prisma.patientProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dob: true,
        gender: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        postcode: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        medicalHistory: true,
        consents: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!profile) return null;
    return {
      ...profile,
      medicalHistory: profile.medicalHistory ? await decryptField(profile.medicalHistory) : profile.medicalHistory,
    };
  },

  Dependant: async (prisma, { profileId }) => {
    return prisma.dependant.findMany({
      where: { guardianId: profileId },
      orderBy: { createdAt: "asc" },
    });
  },

  Appointment: async (prisma, { profileId }) => {
    const appts = await prisma.appointment.findMany({
      where: { patientId: profileId },
      include: {
        service: { select: { name: true, durationMinutes: true } },
        clinic: { select: { name: true, address: true } },
        van: { select: { name: true, registrationPlate: true, vehicleModel: true } },
        clinician: { select: { fullName: true } },
      },
      orderBy: { startTimeUtc: "desc" },
    });
    return Promise.all(
      appts.map(async (a) => ({
        ...a,
        triageData: a.triageData ? await decryptField(a.triageData) : a.triageData,
        accessDetails: a.accessDetails ? await decryptField(a.accessDetails) : a.accessDetails,
      }))
    );
  },

  ToothRecord: async (prisma, { profileId }) => {
    const teeth = await prisma.toothRecord.findMany({
      where: { patientId: profileId },
      orderBy: { toothNumber: "asc" },
    });
    return Promise.all(
      teeth.map(async (t) => ({
        ...t,
        notes: t.notes ? await decryptString(t.notes) : null,
      }))
    );
  },

  TreatmentPlan: async (prisma, { profileId }) => {
    return prisma.treatmentPlan.findMany({
      where: { patientId: profileId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  Prescription: async (prisma, { profileId }) => {
    return prisma.prescription.findMany({
      where: { appointment: { patientId: profileId } },
      orderBy: { createdAt: "desc" },
    });
  },

  DocumentVault: async (prisma, { profileId }) => {
    return prisma.documentVault.findMany({
      where: { patientId: profileId },
      select: {
        id: true,
        docType: true,
        title: true,
        fileSizeBytes: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  MessageThread: async (prisma, { userId }) => {
    const threads = await prisma.messageThread.findMany({
      where: { patientUserId: userId },
      include: {
        messages: {
          select: {
            id: true,
            senderRole: true,
            senderName: true,
            body: true,
            sentAt: true,
          },
          orderBy: { sentAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return Promise.all(
      threads.map(async (t) => ({
        ...t,
        messages: await Promise.all(
          t.messages.map(async (m) => ({
            ...m,
            body: await decryptString(m.body),
          }))
        ),
      }))
    );
  },

  Message: async (prisma, { userId }) => {
    const messages = await prisma.message.findMany({
      where: { thread: { patientUserId: userId } },
      select: {
        id: true,
        threadId: true,
        senderRole: true,
        senderName: true,
        body: true,
        sentAt: true,
      },
      orderBy: { sentAt: "desc" },
    });
    return Promise.all(
      messages.map(async (m) => ({
        ...m,
        body: await decryptString(m.body),
      }))
    );
  },

  VanServiceRequest: async (prisma, { profileId }) => {
    const requests = await prisma.vanServiceRequest.findMany({
      where: { patientId: profileId },
      select: {
        id: true,
        patientLat: true,
        patientLng: true,
        accessDetails: true,
        notes: true,
        status: true,
        requestedAt: true,
      },
      orderBy: { requestedAt: "desc" },
    });
    return Promise.all(
      requests.map(async (r) => ({
        ...r,
        accessDetails: r.accessDetails ? await decryptField(r.accessDetails) : r.accessDetails,
        notes: r.notes ? await decryptString(r.notes) : r.notes,
      }))
    );
  },

  NotificationHistory: async (prisma, { userId }) => {
    return prisma.notificationHistory.findMany({
      where: { userId },
      orderBy: { sentAt: "desc" },
    });
  },

  NotificationPreference: async (prisma, { userId }) => {
    return prisma.notificationPreference.findUnique({
      where: { userId },
    });
  },

  ConsentRecord: async (prisma, { profileId }) => {
    return prisma.consentRecord.findMany({
      where: { patientProfileId: profileId },
      orderBy: { version: "desc" },
    });
  },

  SavedPaymentMethod: async (prisma, { userId }) => {
    return prisma.savedPaymentMethod.findMany({
      where: { userId },
      select: {
        id: true,
        brand: true,
        last4: true,
        expMonth: true,
        expYear: true,
        isDefault: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  FinancingApplication: async (prisma, { userId }) => {
    return prisma.financingApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  RewardPointsAward: async (prisma, { userId }) => {
    return prisma.rewardPointsAward.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  RewardRedemption: async (prisma, { userId }) => {
    return prisma.rewardRedemption.findMany({
      where: { userId },
      orderBy: { redeemedAt: "desc" },
    });
  },

  ReferralCode: async (prisma, { userId }) => {
    return prisma.referralCode.findMany({ where: { userId }, select: { code: true, createdAt: true } });
  },

  // The patient's own side of each referral only: vouchers they earned, and
  // when they joined with a code. Never the other person's identity.
  Referral: async (prisma, { userId }) => {
    const [asReferrer, asReferred] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerUserId: userId },
        select: { createdAt: true, voucherCode: true, voucherPence: true, voucherIssuedAt: true, voucherUsedAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.referral.findMany({ where: { referredUserId: userId }, select: { createdAt: true } }),
    ]);
    return [
      ...asReferrer.map((r) => ({ role: "referrer", ...r })),
      ...asReferred.map((r) => ({ role: "joined_with_code", ...r })),
    ];
  },

  WaitlistEntry: async (prisma, { userId }) => {
    return prisma.waitlistEntry.findMany({
      where: { userId },
      orderBy: { joinedAt: "desc" },
    });
  },

  OralHealthMetric: async (prisma, { userId }) => {
    const metric = await prisma.oralHealthMetric.findUnique({
      where: { userId },
    });
    return metric ? [metric] : [];
  },

  ErasureRequest: async (prisma, { userId }) => {
    return prisma.erasureRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: "desc" },
    });
  },

  ToothHistory: async (prisma, { profileId }) => {
    if (!profileId) return [];
    const rows = await prisma.toothHistory.findMany({
      where: { patientId: profileId },
      orderBy: { createdAt: "desc" },
    });
    return Promise.all(
      rows.map(async (r) => ({
        ...r,
        id: r.id.toString(),
        notes: r.notes ? await decryptString(r.notes) : null,
      }))
    );
  },

  AppointmentNote: async (prisma, { profileId }) => {
    if (!profileId) return [];
    const notes = await prisma.appointmentNote.findMany({
      where: { patientId: profileId },
      orderBy: { createdAt: "desc" },
    });
    return Promise.all(
      notes.map(async (n) => ({
        ...n,
        notes: await decryptString(n.notes),
        diagnosis: n.diagnosis ? await decryptString(n.diagnosis) : null,
        treatmentPlan: n.treatmentPlan ? await decryptString(n.treatmentPlan) : null,
      }))
    );
  },

  AuditLog: async (prisma, { userId, profileId }) => {
    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [{ actorId: userId }, { resourceId: profileId }],
      },
      select: {
        id: true,
        action: true,
        timestampUtc: true,
        metadata: true,
      },
      orderBy: { timestampUtc: "desc" },
      take: 1000,
    });
    return logs.map((log) => ({ ...log, id: log.id.toString() }));
  },
};

/**
 * Models explicitly excluded from Subject Access Request bundles,
 * with legal/technical justification (system infrastructure, staff rota, tokens).
 */
export const NON_PATIENT_DATA_MODELS: Record<string, string> = {
  AuthSession: "Internal session state with refresh token hashes (security sensitive)",
  EmailVerificationToken: "Ephemeral email verification tokens",
  PasswordResetToken: "Ephemeral password reset tokens",
  MfaCode: "Ephemeral MFA security verification codes",
  MfaVerification: "Internal MFA challenge flow state",
  ProcessedStripeEvent: "Webhook idempotency replay deduplication logs",
  JobLease: "Which API instance is running a background job; holds no personal data",
  ScheduledNotification: "Internal worker queue for future scheduled notification jobs",
  PushToken: "Device hardware tokens for push notification routing",
  PushTicket: "Expo delivery tickets for a device token, kept at most a day until the receipt is checked",
  ClinicianProfile: "Clinician directory and professional registration",
  ClinicianRotaBlock: "Clinician working shifts and clinic duty rota",
  ClinicianRotaOverride: "Clinician rota exception rules",
  Clinic: "Clinic facility addresses and contact details",
  ClinicOpeningHours: "Clinic practice opening schedule",
  ClinicClosure: "Clinic practice closure holidays",
  Van: "Mobile dental clinic vehicle fleet records",
  VanServicePolygon: "Geographic van service coverage boundaries",
  VanShift: "Operator driving shifts",
  VanLocationPing: "Vehicle GPS telemetry pings",
  VanRequestEvent: "Operational history of a van visit (event, phase, role, time); no personal data, the visit itself is in VanServiceRequest",
  VanOperatorAssignment: "Operator vehicle assignments",
  OperatorProfile: "Van driver staff profile records",
  Service: "Catalogue of dental treatments and baseline pricing",
  TreatmentPlanItem: "Line items embedded directly inside TreatmentPlan",
};

/**
 * Validates that every model declared in prisma/schema.prisma is explicitly categorized
 * as either a patient personal data model or a non-patient data model.
 * Fails if an engineer adds a model without declaring its SAR classification.
 */
export function verifyModelCoverage(): {
  coveredModels: string[];
  excludedModels: string[];
  totalModels: number;
} {
  const allModels = Prisma.dmmf.datamodel.models.map((m) => m.name);
  const coveredSet = new Set(Object.keys(PATIENT_DATA_EXTRACTORS));
  const excludedSet = new Set(Object.keys(NON_PATIENT_DATA_MODELS));

  const unclassifiedModels: string[] = [];
  for (const model of allModels) {
    if (!coveredSet.has(model) && !excludedSet.has(model)) {
      unclassifiedModels.push(model);
    }
  }

  if (unclassifiedModels.length > 0) {
    throw new Error(
      `SAR model registry incomplete! The following Prisma models have no SAR classification: ${unclassifiedModels.join(
        ", "
      )}. Every model must either be in PATIENT_DATA_EXTRACTORS or NON_PATIENT_DATA_MODELS.`
    );
  }

  return {
    coveredModels: Array.from(coveredSet),
    excludedModels: Array.from(excludedSet),
    totalModels: allModels.length,
  };
}

export interface SarBundle {
  requestId: string;
  standard: string;
  requestedAt: string;
  user: unknown;
  profile: unknown;
  dependants: unknown[];
  appointments: unknown[];
  odontogram: unknown[];
  toothHistory: unknown[];
  appointmentNotes: unknown[];
  treatmentPlans: unknown[];
  prescriptions: unknown[];
  documents: unknown[];
  messageThreads: unknown[];
  messages: unknown[];
  vanServiceRequests: unknown[];
  notifications: unknown[];
  notificationPreference: unknown;
  consents: unknown[];
  savedPaymentMethods: unknown[];
  financingApplications: unknown[];
  rewardPointsAwards: unknown[];
  rewardRedemptions: unknown[];
  referralCodes: unknown[];
  referrals: unknown[];
  waitlistEntries: unknown[];
  oralHealthMetrics: unknown[];
  erasureRequests: unknown[];
  auditLogs: unknown[];
  recordCounts: Record<string, number>;
}

/**
 * Builds the complete Subject Access Request bundle across all patient-data models.
 */
export async function buildSubjectAccessRequestBundle(
  prisma: PrismaClient,
  ctx: SarContext,
  requestId: string = crypto.randomUUID()
): Promise<SarBundle> {
  // Execute sequentially to avoid saturating PostgreSQL connection pool
  const user: any = await PATIENT_DATA_EXTRACTORS.User(prisma, ctx);
  const profile: any = await PATIENT_DATA_EXTRACTORS.PatientProfile(prisma, ctx);
  const dependants: any = await PATIENT_DATA_EXTRACTORS.Dependant(prisma, ctx);
  const appointments: any = await PATIENT_DATA_EXTRACTORS.Appointment(prisma, ctx);
  const odontogram: any = await PATIENT_DATA_EXTRACTORS.ToothRecord(prisma, ctx);
  const treatmentPlans: any = await PATIENT_DATA_EXTRACTORS.TreatmentPlan(prisma, ctx);
  const prescriptions: any = await PATIENT_DATA_EXTRACTORS.Prescription(prisma, ctx);
  const documents: any = await PATIENT_DATA_EXTRACTORS.DocumentVault(prisma, ctx);
  const messageThreads: any = await PATIENT_DATA_EXTRACTORS.MessageThread(prisma, ctx);
  const messages: any = await PATIENT_DATA_EXTRACTORS.Message(prisma, ctx);
  const vanServiceRequests: any = await PATIENT_DATA_EXTRACTORS.VanServiceRequest(prisma, ctx);
  const notifications: any = await PATIENT_DATA_EXTRACTORS.NotificationHistory(prisma, ctx);
  const notificationPreference: any = await PATIENT_DATA_EXTRACTORS.NotificationPreference(prisma, ctx);
  const consents: any = await PATIENT_DATA_EXTRACTORS.ConsentRecord(prisma, ctx);
  const savedPaymentMethods: any = await PATIENT_DATA_EXTRACTORS.SavedPaymentMethod(prisma, ctx);
  const financingApplications: any = await PATIENT_DATA_EXTRACTORS.FinancingApplication(prisma, ctx);
  const rewardPointsAwards: any = await PATIENT_DATA_EXTRACTORS.RewardPointsAward(prisma, ctx);
  const rewardRedemptions: any = await PATIENT_DATA_EXTRACTORS.RewardRedemption(prisma, ctx);
  const referralCodes = (await PATIENT_DATA_EXTRACTORS.ReferralCode(prisma, ctx)) as unknown[];
  const referrals = (await PATIENT_DATA_EXTRACTORS.Referral(prisma, ctx)) as unknown[];
  const waitlistEntries: any = await PATIENT_DATA_EXTRACTORS.WaitlistEntry(prisma, ctx);
  const oralHealthMetrics: any = await PATIENT_DATA_EXTRACTORS.OralHealthMetric(prisma, ctx);
  const erasureRequests: any = await PATIENT_DATA_EXTRACTORS.ErasureRequest(prisma, ctx);
  const toothHistory: any = await PATIENT_DATA_EXTRACTORS.ToothHistory(prisma, ctx);
  const appointmentNotes: any = await PATIENT_DATA_EXTRACTORS.AppointmentNote(prisma, ctx);
  const auditLogs: any = await PATIENT_DATA_EXTRACTORS.AuditLog(prisma, ctx);

  return {
    requestId,
    standard: "UK GDPR Article 15 Subject Access Request (DSAR)",
    requestedAt: new Date().toISOString(),
    user,
    profile,
    dependants: dependants ?? [],
    appointments: appointments ?? [],
    odontogram: odontogram ?? [],
    toothHistory: toothHistory ?? [],
    appointmentNotes: appointmentNotes ?? [],
    treatmentPlans: treatmentPlans ?? [],
    prescriptions: prescriptions ?? [],
    documents: documents ?? [],
    messageThreads: messageThreads ?? [],
    messages: messages ?? [],
    vanServiceRequests: vanServiceRequests ?? [],
    notifications: notifications ?? [],
    notificationPreference: notificationPreference ?? null,
    consents: consents ?? [],
    savedPaymentMethods: savedPaymentMethods ?? [],
    financingApplications: financingApplications ?? [],
    rewardPointsAwards: rewardPointsAwards ?? [],
    rewardRedemptions: rewardRedemptions ?? [],
    referralCodes: referralCodes ?? [],
    referrals: referrals ?? [],
    waitlistEntries: waitlistEntries ?? [],
    oralHealthMetrics: oralHealthMetrics ?? [],
    erasureRequests: erasureRequests ?? [],
    auditLogs: auditLogs ?? [],
    recordCounts: {
      dependants: dependants?.length ?? 0,
      appointments: appointments?.length ?? 0,
      odontogram: odontogram?.length ?? 0,
      toothHistory: toothHistory?.length ?? 0,
      appointmentNotes: appointmentNotes?.length ?? 0,
      treatmentPlans: treatmentPlans?.length ?? 0,
      prescriptions: prescriptions?.length ?? 0,
      documents: documents?.length ?? 0,
      messages: messages?.length ?? 0,
      vanServiceRequests: vanServiceRequests?.length ?? 0,
      notifications: notifications?.length ?? 0,
      consents: consents?.length ?? 0,
      savedPaymentMethods: savedPaymentMethods?.length ?? 0,
      financingApplications: financingApplications?.length ?? 0,
      rewardPointsAwards: rewardPointsAwards?.length ?? 0,
      rewardRedemptions: rewardRedemptions?.length ?? 0,
      referralCodes: referralCodes?.length ?? 0,
      referrals: referrals?.length ?? 0,
      waitlistEntries: waitlistEntries?.length ?? 0,
      oralHealthMetrics: oralHealthMetrics?.length ?? 0,
      erasureRequests: erasureRequests?.length ?? 0,
      auditLogs: auditLogs?.length ?? 0,
    },
  };
}

const csvEscape = (val: unknown): string => `"${String(val ?? "").replace(/"/g, '""')}"`;

export function safeJsonStringify(value: unknown, space?: number): string {
  return JSON.stringify(
    value,
    (_key, val) => (typeof val === "bigint" ? val.toString() : val),
    space
  );
}

/**
 * Formats a Subject Access Request bundle into comprehensive CSV lines
 * containing all sections and clinical data (SAR-1).
 */
export function formatSarBundleAsCsv(bundle: SarBundle): string {
  const rows: string[] = ["section,recordId,field,value"];

  const add = (section: string, recordId: string, field: string, value: unknown) => {
    rows.push(
      `${csvEscape(section)},${csvEscape(recordId)},${csvEscape(field)},${csvEscape(
        typeof value === "object" && value !== null ? safeJsonStringify(value) : value
      )}`
    );
  };

  // Meta
  add("meta", bundle.requestId, "standard", bundle.standard);
  add("meta", bundle.requestId, "requestedAt", bundle.requestedAt);

  // User
  if (bundle.user && typeof bundle.user === "object") {
    for (const [k, v] of Object.entries(bundle.user)) {
      add("user", (bundle.user as any).id, k, v);
    }
  }

  // Profile
  if (bundle.profile && typeof bundle.profile === "object") {
    for (const [k, v] of Object.entries(bundle.profile)) {
      add("profile", (bundle.profile as any).id, k, v);
    }
  }

  // Dependants
  for (const dep of bundle.dependants as any[]) {
    for (const [k, v] of Object.entries(dep)) {
      add("dependant", dep.id, k, v);
    }
  }

  // Appointments
  for (const apt of bundle.appointments as any[]) {
    for (const [k, v] of Object.entries(apt)) {
      add("appointment", apt.id, k, v);
    }
  }

  // Odontogram
  for (const tooth of bundle.odontogram as any[]) {
    for (const [k, v] of Object.entries(tooth)) {
      add("odontogram", tooth.id, k, v);
    }
  }

  // Treatment plans
  for (const plan of bundle.treatmentPlans as any[]) {
    for (const [k, v] of Object.entries(plan)) {
      add("treatmentPlan", plan.id, k, v);
    }
  }

  // Prescriptions
  for (const rx of bundle.prescriptions as any[]) {
    for (const [k, v] of Object.entries(rx)) {
      add("prescription", rx.id, k, v);
    }
  }

  // Documents
  for (const doc of bundle.documents as any[]) {
    for (const [k, v] of Object.entries(doc)) {
      add("documentVault", doc.id, k, v);
    }
  }

  // Messages
  for (const msg of bundle.messages as any[]) {
    for (const [k, v] of Object.entries(msg)) {
      add("message", msg.id, k, v);
    }
  }

  // Van requests
  for (const req of bundle.vanServiceRequests as any[]) {
    for (const [k, v] of Object.entries(req)) {
      add("vanServiceRequest", req.id, k, v);
    }
  }

  // Notifications
  for (const notif of bundle.notifications as any[]) {
    for (const [k, v] of Object.entries(notif)) {
      add("notification", notif.id, k, v);
    }
  }

  // Consents
  for (const c of bundle.consents as any[]) {
    for (const [k, v] of Object.entries(c)) {
      add("consentRecord", c.id, k, v);
    }
  }

  // Saved payment methods
  for (const pm of bundle.savedPaymentMethods as any[]) {
    for (const [k, v] of Object.entries(pm)) {
      add("savedPaymentMethod", pm.id, k, v);
    }
  }

  // Financing
  for (const fa of bundle.financingApplications as any[]) {
    for (const [k, v] of Object.entries(fa)) {
      add("financingApplication", fa.id, k, v);
    }
  }

  // Rewards
  for (const award of bundle.rewardPointsAwards as any[]) {
    for (const [k, v] of Object.entries(award)) {
      add("rewardPointsAward", award.id, k, v);
    }
  }
  for (const red of bundle.rewardRedemptions as any[]) {
    for (const [k, v] of Object.entries(red)) {
      add("rewardRedemption", red.id, k, v);
    }
  }

  // Waitlist
  for (const w of bundle.waitlistEntries as any[]) {
    for (const [k, v] of Object.entries(w)) {
      add("waitlistEntry", w.id, k, v);
    }
  }

  // Oral health metrics
  for (const m of bundle.oralHealthMetrics as any[]) {
    for (const [k, v] of Object.entries(m)) {
      add("oralHealthMetric", m.id, k, v);
    }
  }

  // Erasure requests
  for (const er of bundle.erasureRequests as any[]) {
    for (const [k, v] of Object.entries(er)) {
      add("erasureRequest", er.id, k, v);
    }
  }

  // Audit logs
  for (const a of bundle.auditLogs as any[]) {
    for (const [k, v] of Object.entries(a)) {
      add("auditLog", a.id, k, v);
    }
  }

  return rows.join("\n");
}
