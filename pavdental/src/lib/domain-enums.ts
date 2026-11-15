import type { ApiCareChannel } from "@/features/api-contract.gen";

export const CARE_CHANNELS = {
  CLINIC: "clinic",
  VAN: "van",
  VIDEO: "video",
} as const satisfies Record<string, ApiCareChannel>;

export type CareChannel = ApiCareChannel;

export function isClinicChannel(channel?: string | null): boolean {
  return channel === CARE_CHANNELS.CLINIC;
}

export function isVanChannel(channel?: string | null): boolean {
  return channel === CARE_CHANNELS.VAN;
}

export function isVideoChannel(channel?: string | null): boolean {
  return channel === CARE_CHANNELS.VIDEO;
}

export const APPOINTMENT_STATUS = {
  DRAFT_HOLD: "draft_hold",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

type WithStatus = { status?: string | null } | string | null | undefined;

function readStatus(target: WithStatus): string {
  const raw = typeof target === "string" ? target : target?.status;
  return typeof raw === "string" ? raw.toLowerCase() : "";
}

export function isDraftHold(target: WithStatus): boolean {
  return readStatus(target) === APPOINTMENT_STATUS.DRAFT_HOLD;
}

export function isConfirmed(target: WithStatus): boolean {
  return readStatus(target) === APPOINTMENT_STATUS.CONFIRMED;
}

export function isInProgress(target: WithStatus): boolean {
  return readStatus(target) === APPOINTMENT_STATUS.IN_PROGRESS;
}

export function isCompleted(target: WithStatus): boolean {
  return readStatus(target) === APPOINTMENT_STATUS.COMPLETED;
}

export function isCancelled(target: WithStatus): boolean {
  return readStatus(target) === APPOINTMENT_STATUS.CANCELLED;
}

export function isNoShow(target: WithStatus): boolean {
  return readStatus(target) === APPOINTMENT_STATUS.NO_SHOW;
}

export function isActiveAppointment(target: WithStatus): boolean {
  const status = readStatus(target);
  return status === APPOINTMENT_STATUS.CONFIRMED || status === APPOINTMENT_STATUS.IN_PROGRESS;
}

export const USER_ROLES = {
  PATIENT: "patient",
  CLINICIAN: "clinician",
  OPERATOR: "operator",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

type WithRole = { role?: string | null } | string | null | undefined;

function readRole(target: WithRole): string {
  const raw = typeof target === "string" ? target : target?.role;
  return typeof raw === "string" ? raw : "";
}

export function isPatient(target: WithRole): boolean {
  return readRole(target) === USER_ROLES.PATIENT;
}

export function isClinician(target: WithRole): boolean {
  return readRole(target) === USER_ROLES.CLINICIAN;
}

export function isOperator(target: WithRole): boolean {
  return readRole(target) === USER_ROLES.OPERATOR;
}

export function isAdmin(target: WithRole): boolean {
  return readRole(target) === USER_ROLES.ADMIN;
}

export const VAN_SHIFT_STATUS = {
  ONLINE: "online",
  PAUSED: "paused",
  OFFLINE: "offline",
} as const;

export const VAN_REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const PRESCRIPTION_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

export const TREATMENT_PLAN_STATUS = {
  DRAFT: "draft",
  PROPOSED: "proposed",
  ACCEPTED: "accepted",
  COMPLETED: "completed",
  DECLINED: "declined",
} as const;
