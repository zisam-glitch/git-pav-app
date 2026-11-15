// Generated from backend/src/contracts/app-api.ts by `npm run contract:app`
// in backend/. Don't edit by hand: change the schema there and regenerate.
// The backend's app-contract test checks real responses against the same
// schemas, and fails if this file is out of date.

export type ApiCareChannel = "clinic" | "van" | "video";

export type ApiService = {
  id: string;
  name: string;
  category: "checkup" | "hygiene" | "emergency" | "restorative" | "cosmetic";
  description: string;
  durationMinutes: number;
  pricePence: number;
  depositPence: number;
  supportedChannels: ApiCareChannel[];
  prepInstructions: string[];
  requiresPriorConsult: boolean;
  isActive: boolean;
};

export type ApiClinic = {
  id: string;
  name: string;
  address: string;
  postcode: string;
  city: string;
  phone: string;
  /** Free-text summary; openingHours is what slots are built from. */
  operatingHours: string;
  isActive: boolean;
  createdAt: string;
  /** UK time, minutes after midnight; weekday 0 is Sunday. */
  openingHours: Array<{
    weekday: number;
    opensMinute: number;
    closesMinute: number;
  }>;
  /** Closure days from today, at most 30. */
  closures: Array<{
    date: string;
    reason: string | null;
  }>;
};

export type ApiClinician = {
  id: string;
  fullName: string;
  gdcNumber: string;
  roleTitle: string;
  specialisms: string[];
  bio: string | null;
  /** https link or uploaded image, set on the dashboard's Dentist profiles page. */
  photoUrl: string | null;
  isTelehealthActive: boolean;
};

export type ApiSlot = {
  /** Also the hold key passed to POST /api/booking/hold-slot. */
  id: string;
  startTimeUtc: string;
  endTimeUtc: string;
  available: boolean;
  durationMinutes: number;
};

export type ApiHoldSlotResponse = {
  success: true;
  slotId: string;
  /** Epoch milliseconds. */
  holdExpiresAt: number;
  holdDurationSeconds: number;
  message: string;
};

export type ApiAppointmentStatus = "draft_hold" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export type ApiAppointmentListItem = {
  id: string;
  patientId: string;
  clinicianId: string | null;
  serviceId: string;
  channel: ApiCareChannel;
  clinicId: string | null;
  vanId: string | null;
  startTimeUtc: string;
  endTimeUtc: string;
  status: ApiAppointmentStatus;
  holdExpiresAt: string | null;
  patientWaitingSince: string | null;
  patientLastSeenAt: string | null;
  intraoralPhotos: string[];
  totalPricePence: number;
  depositPaidPence: number;
  depositDiscountPence: number;
  stripePaymentId: string | null;
  dependantId: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    name: string;
    durationMinutes: number;
  };
  clinician: {
    fullName: string;
    photoUrl: string | null;
  } | null;
  clinic: {
    name: string;
    address: string;
  } | null;
  dependant: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type ApiAppointmentDetail = {
  id: string;
  patientId: string;
  clinicianId: string | null;
  serviceId: string;
  channel: ApiCareChannel;
  clinicId: string | null;
  vanId: string | null;
  startTimeUtc: string;
  endTimeUtc: string;
  status: ApiAppointmentStatus;
  holdExpiresAt: string | null;
  patientWaitingSince: string | null;
  patientLastSeenAt: string | null;
  intraoralPhotos: string[];
  totalPricePence: number;
  depositPaidPence: number;
  depositDiscountPence: number;
  stripePaymentId: string | null;
  dependantId: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    name: string;
    durationMinutes: number;
  };
  clinician: {
    fullName: string;
    photoUrl: string | null;
  } | null;
  clinic: {
    name: string;
    address: string;
  } | null;
  dependant: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  triageData: Record<string, unknown> | null;
  accessDetails: Record<string, unknown> | null;
};
