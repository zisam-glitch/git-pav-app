/**
 * Central React Query key factory for the mobile app (B2).
 * Keeps cache reads and invalidations consistent instead of scattering bare
 * string arrays across hooks and screens.
 */
export const queryKeys = {
  services: () => ["services"] as const,
  clinics: () => ["clinics"] as const,
  clinicians: (channel?: string) => ["clinicians", channel] as const,
  slots: {
    all: () => ["slots"] as const,
    list: (params: {
      clinicianId?: string;
      clinicId?: string;
      serviceId?: string;
      date: string;
      channel?: string;
    }) => ["slots", params] as const,
  },
  appointments: {
    all: () => ["my-appointments"] as const,
    list: (params?: { scope?: string; date?: string }) => ["my-appointments", params] as const,
    detail: (id?: string) => ["my-appointments", "detail", id] as const,
  },
  patientProfile: (userId?: string) => ["patient-profile", userId] as const,
  odontogram: (userId?: string) => ["odontogram", userId] as const,
  treatmentPlans: (userId?: string) => ["treatment-plans", userId] as const,
  prescriptions: (userId?: string) => ["patient-prescriptions", userId] as const,
  documentVault: (userId?: string) => ["document-vault", userId] as const,
  messages: {
    all: () => ["message-threads"] as const,
    threads: (view: "summary" | "full") => ["message-threads", view] as const,
    thread: (threadId?: string) => ["message-threads", "thread", threadId] as const,
  },
  financing: () => ["financing"] as const,
  rewards: () => ["rewards"] as const,
  oralHealthInsights: () => ["oral-health-insights"] as const,
  notifications: {
    preferences: () => ["notification-preferences"] as const,
    history: (limit: number, offset: number) => ["notification-history", limit, offset] as const,
    historyPages: () => ["notification-history", "pages"] as const,
  },
  paymentMethods: () => ["payment-methods"] as const,
  van: {
    liveRequestAll: () => ["van-request-live"] as const,
    liveRequest: (requestId?: string) => ["van-request-live", requestId] as const,
    operatorShift: () => ["operator-shift"] as const,
  },
  consents: {
    all: () => ["consents"] as const,
    current: () => ["consents", "current"] as const,
    history: (includeWithdrawn = true) => ["consents", "history", includeWithdrawn] as const,
  },
  clinicalContext: (appointmentId?: string) => ["clinical-context", appointmentId] as const,
  video: {
    summary: (appointmentId?: string) => ["video", "summary", appointmentId] as const,
    triageDraft: (appointmentId?: string) => ["video", "triage-draft", appointmentId] as const,
    triagePhotos: (appointmentId?: string) => ["video", "triage-photos", appointmentId] as const,
    presence: (appointmentId?: string) => ["video", "presence", appointmentId] as const,
    appointmentMessage: (appointmentId?: string) => ["appointment-messages", appointmentId] as const,
  },
} as const;
