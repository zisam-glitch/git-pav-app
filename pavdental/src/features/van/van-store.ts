import { create } from "zustand";
import { VanAvailability, VanAccessDetails } from "./van-types";

interface VanDispatchDraftState {
  // Location & Coverage
  postcode: string;
  lat: number;
  lng: number;
  isCovered: boolean;
  availability: VanAvailability | null;

  // Selected Service
  serviceId: string;
  serviceName: string;
  servicePricePence: number;
  serviceDurationMinutes: number;
  serviceDepositPence: number | null;

  // Property & Parking Access
  addressLine1: string;
  addressLine2: string;
  city: string;
  parkingType: "private_driveway" | "permit_bay" | "visitor" | "other";
  gateCode: string;
  accessNotes: string;

  // Active Request
  activeRequestId: string | null;

  // Actions
  setLocationCoverage: (data: {
    postcode: string;
    lat: number;
    lng: number;
    isCovered: boolean;
    availability: VanAvailability | null;
  }) => void;
  setService: (data: {
    serviceId: string;
    serviceName: string;
    servicePricePence: number;
    serviceDurationMinutes: number;
    serviceDepositPence?: number | null;
  }) => void;
  setAccessDetails: (details: Partial<{
    postcode: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    parkingType: "private_driveway" | "permit_bay" | "visitor" | "other";
    gateCode: string;
    accessNotes: string;
  }>) => void;
  setActiveRequestId: (id: string | null) => void;
  getAccessDetailsPayload: () => VanAccessDetails;
  resetDraft: () => void;
}

export const useVanStore = create<VanDispatchDraftState>((set, get) => ({
  postcode: "",
  lat: 51.5074,
  lng: -0.1278,
  isCovered: false,
  availability: null,

  // Empty until the patient picks a real service on the access details screen.
  serviceId: "",
  serviceName: "",
  servicePricePence: 0,
  serviceDurationMinutes: 0,
  serviceDepositPence: null,

  addressLine1: "",
  addressLine2: "",
  city: "",
  parkingType: "private_driveway",
  gateCode: "",
  accessNotes: "",

  activeRequestId: null,

  setLocationCoverage: (data) => set((state) => ({ ...state, ...data })),
  setService: (data) => set((state) => ({ ...state, ...data })),
  setAccessDetails: (details) => set((state) => ({ ...state, ...details })),
  setActiveRequestId: (id) => set({ activeRequestId: id }),
  getAccessDetailsPayload: () => {
    const s = get();
    // Normalize postcode to ensure space format
    const normalizePostcode = (postcode: string) => {
      const cleaned = postcode.toUpperCase().replace(/\s/g, '');
      if (cleaned.length >= 5) {
        const inward = cleaned.slice(-3);
        const outward = cleaned.slice(0, -3);
        return `${outward} ${inward}`;
      }
      return cleaned;
    };
    
    return {
      // No demo fallbacks: blank required fields must reach the API as empty
      // strings so zod validation stops the dispatch instead of silently
      // sending the van to a placeholder address.
      addressLine1: s.addressLine1.trim(),
      addressLine2: s.addressLine2.trim() || undefined,
      city: s.city.trim(),
      postcode: normalizePostcode(s.postcode.trim()),
      lat: s.lat,
      lng: s.lng,
      parkingType: s.parkingType,
      gateCode: s.gateCode || undefined,
      accessNotes: s.accessNotes || undefined,
    };
  },
  resetDraft: () =>
    set({
      postcode: "",
      lat: 51.5074,
      lng: -0.1278,
      isCovered: false,
      availability: null,
      serviceId: "",
      serviceName: "",
      servicePricePence: 0,
      serviceDurationMinutes: 0,
      serviceDepositPence: null,
      addressLine1: "",
      addressLine2: "",
      city: "",
      parkingType: "private_driveway",
      gateCode: "",
      accessNotes: "",
      activeRequestId: null,
    }),
}));

