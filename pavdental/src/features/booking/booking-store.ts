import { create } from "zustand";
import { CareChannel, DentalService, ClinicLocation, Clinician, TimeSlot } from "./booking-types";

interface BookingDraftState {
  channel: CareChannel | null;
  service: DentalService | null;
  clinic: ClinicLocation | null;
  clinician: Clinician | null;
  slot: TimeSlot | null;
  holdExpiresAt: number | null; // epoch timestamp

  // Actions
  setChannel: (channel: CareChannel) => void;
  setService: (service: DentalService) => void;
  setClinic: (clinic: ClinicLocation) => void;
  setClinician: (clinician: Clinician | null) => void;
  setSlot: (slot: TimeSlot) => void;
  setHoldExpiry: (expiresAt: number | null) => void;
  resetDraft: () => void;
}

export const useBookingStore = create<BookingDraftState>((set) => ({
  channel: null,
  service: null,
  clinic: null,
  clinician: null,
  slot: null,
  holdExpiresAt: null,

  // A video consult has no clinic, so switching to video drops any clinic left
  // from an earlier booking.
  setChannel: (channel) => set(channel === "video" ? { channel, clinic: null } : { channel }),
  setService: (service) => set({ service }),
  setClinic: (clinic) => set({ clinic }),
  setClinician: (clinician) => set({ clinician }),
  setSlot: (slot) => set({ slot }),
  setHoldExpiry: (holdExpiresAt) => set({ holdExpiresAt }),
  resetDraft: () =>
    set({
      channel: null,
      service: null,
      clinic: null,
      clinician: null,
      slot: null,
      holdExpiresAt: null,
    }),
}));

