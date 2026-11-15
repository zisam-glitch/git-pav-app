import type {
  ApiAppointmentDetail,
  ApiAppointmentListItem,
  ApiAppointmentStatus,
  ApiCareChannel,
  ApiClinic,
  ApiClinician,
  ApiService,
} from "../api-contract.gen";

// ─── Dental Service Catalogue Models ──────────────────────────────────────────
// These are the API's own shapes, generated from the backend's contract
// (api-contract.gen.ts). Don't add fields here that the API doesn't send:
// add them to backend/src/contracts/app-api.ts and regenerate.
export type CareChannel = ApiCareChannel;
export type DentalService = ApiService;
export type ClinicLocation = ApiClinic;
export type Clinician = ApiClinician;
export type AppointmentStatus = ApiAppointmentStatus;

/**
 * Row returned by GET /api/booking/appointments.
 * Patient requests return ApiAppointmentListItem; clinician schedule requests
 * include patient, dependant.age, appointmentNote, triageData and accessDetails.
 */
export type AppointmentListItem = ApiAppointmentListItem & {
  dependant: (NonNullable<ApiAppointmentListItem["dependant"]> & { age?: number }) | null;
  patient?: { id: string; firstName: string; lastName: string; age: number | null } | null;
  triageData?: Record<string, unknown> | null;
  accessDetails?: Record<string, unknown> | null;
  appointmentNote?: {
    id: string;
    notes: string;
    diagnosis: string | null;
    treatmentPlan: string | null;
    updatedAt: string;
  } | null;
  van?: { name?: string } | null;
  patientName?: string;
};

/** Full appointment returned by GET /api/booking/appointments/:id. */
export type AppointmentDetail = Omit<ApiAppointmentDetail, "clinic"> & {
  clinic: (NonNullable<ApiAppointmentDetail["clinic"]> & { postcode?: string }) | null;
  van?: { name?: string } | null;
};

export interface TimeSlot {
  id: string;
  clinicianId: string;
  clinicId?: string;
  startTimeUtc: string; // ISO 8601 UTC
  endTimeUtc: string;   // ISO 8601 UTC
  displayTime: string;  // e.g., "10:30 AM"
  dateFormatted: string; // e.g., "Mon 22 Sep"
  channel: CareChannel;
  isAvailable: boolean;
}

export interface BookingSummary {
  serviceId: string;
  serviceName: string;
  channel: CareChannel;
  clinicId?: string;
  clinicName?: string;
  clinicianId: string;
  clinicianName: string;
  slotId: string;
  startTimeUtc: string;
  displayDateTime: string;
  totalPricePence: number;
  depositDuePence: number;
  cancellationPolicy: string;
}

