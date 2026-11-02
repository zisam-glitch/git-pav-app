// Mobile van dispatch types

export type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  pricePence: number;
  depositPence: number;
  supportedChannels: string[];
  prepInstructions: string[];
  requiresPriorConsult: boolean;
  isActive: boolean;
};

export type VanShiftStatus = "offline" | "online" | "paused";

export type VanRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled"
  | "in_progress"
  | "completed"
  | "no_show";

export type VanStopPhase =
  | "queued"
  | "en_route"
  | "on_site"
  | "in_treatment"
  | "completed"
  | "cancelled"
  | "no_show";

export type VanAccessDetails = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
  parkingType: "private_driveway" | "permit_bay" | "visitor" | "other";
  gateCode?: string;
  accessNotes?: string;
};

export type VanShift = {
  id: string;
  vanId: string;
  operatorId: string;
  status: VanShiftStatus;
  startedAt: string;
  endedAt?: string | null;
  lastLat?: number | null;
  lastLng?: number | null;
  lastLocationAt?: string | null;
  van?: {
    id: string;
    name: string;
    registrationPlate: string;
  };
};

export type VanServiceRequest = {
  id: string;
  shiftId: string;
  vanId: string;
  patientId: string;
  serviceId: string;
  status: VanRequestStatus;
  phase: VanStopPhase;
  queuePosition?: number | null;
  patientLat: number;
  patientLng: number;
  accessDetails: VanAccessDetails;
  requestedAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
  treatmentStartedAt?: string | null;
  completedAt?: string | null;
  etaSecondsSnapshot?: number | null;
  etaSeconds?: number | null;
  etaLabel?: string | null;
  notes?: string | null;
  /** Whether the patient has authorized the manual-capture deposit hold */
  depositAuthorized?: boolean;
  service?: {
    name: string;
    durationMinutes: number;
    pricePence?: number;
  };
  patient?: {
    firstName: string;
    lastName: string;
  };
  van?: {
    name: string;
    registrationPlate: string;
  };
  shift?: {
    lastLat?: number | null;
    lastLng?: number | null;
    lastLocationAt?: string | null;
    status: VanShiftStatus;
  };
  /**
   * The road route from the van to the patient (Google encoded polyline).
   * Only sent to the patient who's next while the van is driving to them, and
   * only when the server has a road-routing key; otherwise null.
   */
  route?: { encodedPolyline: string; distanceMeters: number; durationSeconds: number } | null;
};

export type VanAvailability = {
  available: boolean;
  etaSeconds: number | null;
  etaLabel: string | null;
  queueLength: number;
  vanId: string | null;
  shiftId: string | null;
  message: string;
};

/** Response from POST /api/van/requests — includes deposit payment details */
export type CreateVanRequestResponse = VanServiceRequest & {
  /** Present when the patient must authorize the deposit via PaymentSheet */
  clientSecret?: string | null;
  // Present when the deposit is paid as the patient's Stripe Customer, so the
  // sheet can show their saved cards.
  customerId?: string;
  customerEphemeralKeySecret?: string;
  paymentIntentId?: string | null;
  depositAmount?: number;
  paymentRequired?: boolean;
  /** True when the backend is running in mock-Stripe mode (skip the sheet) */
  isMockPayment?: boolean;
};

/** Response from POST /api/van/requests/:id/payment-retry */
export type DepositRetryResponse = {
  /** Null when the deposit is already authorized — nothing to present */
  clientSecret: string | null;
  customerId?: string;
  customerEphemeralKeySecret?: string;
  paymentIntentId: string;
  depositAmount: number;
  alreadyAuthorized: boolean;
  isMockPayment: boolean;
};

