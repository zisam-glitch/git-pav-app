import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { CareChannel, DentalService, ClinicLocation, Clinician, TimeSlot } from "./booking-types";

export const BOOKING_DRAFT_STORAGE_KEY = "pav_booking_draft";

export interface BookingDraftFields {
  channel: CareChannel | null;
  service: DentalService | null;
  clinic: ClinicLocation | null;
  clinician: Clinician | null;
  slot: TimeSlot | null;
  holdExpiresAt: number | null; // epoch timestamp
}

interface BookingDraftState extends BookingDraftFields {
  // Actions
  setChannel: (channel: CareChannel) => void;
  setService: (service: DentalService) => void;
  setClinic: (clinic: ClinicLocation) => void;
  setClinician: (clinician: Clinician | null) => void;
  setSlot: (slot: TimeSlot) => void;
  setHoldExpiry: (expiresAt: number | null) => void;
  /** Drop the held slot and its countdown, keeping what the patient chose. */
  releaseSlot: () => void;
  resetDraft: () => void;
}

const memoryFallback = new Map<string, string>();

function getAsyncStorage(): StateStorage {
  return {
    getItem: async (name) => {
      try {
        return await AsyncStorage.getItem(name);
      } catch {
        return memoryFallback.get(name) ?? null;
      }
    },
    setItem: async (name, value) => {
      try {
        await AsyncStorage.setItem(name, value);
      } catch {
        memoryFallback.set(name, value);
      }
    },
    removeItem: async (name) => {
      try {
        await AsyncStorage.removeItem(name);
      } catch {
        memoryFallback.delete(name);
      }
    },
  };
}

/**
 * Drops an expired slot hold on app restart while keeping the patient's
 * non-clinical treatment, clinic, and clinician choices (B8).
 */
export function sanitizeRehydratedBookingDraft(
  state: Partial<BookingDraftFields> | undefined,
  now: number = Date.now(),
): Partial<BookingDraftFields> {
  if (!state) return {};
  if (state.holdExpiresAt != null && state.holdExpiresAt <= now) {
    return { ...state, slot: null, holdExpiresAt: null };
  }
  return state;
}

const EMPTY_DRAFT: BookingDraftFields = {
  channel: null,
  service: null,
  clinic: null,
  clinician: null,
  slot: null,
  holdExpiresAt: null,
};

export const useBookingStore = create<BookingDraftState>()(
  persist(
    (set) => ({
      ...EMPTY_DRAFT,

      // A video consult has no clinic, so switching to video drops any clinic left
      // from an earlier booking.
      setChannel: (channel) => set(channel === "video" ? { channel, clinic: null } : { channel }),
      setService: (service) => set({ service }),
      setClinic: (clinic) => set({ clinic }),
      setClinician: (clinician) => set({ clinician }),
      setSlot: (slot) => set({ slot }),
      setHoldExpiry: (holdExpiresAt) => set({ holdExpiresAt }),
      releaseSlot: () => set({ slot: null, holdExpiresAt: null }),
      resetDraft: () => set({ ...EMPTY_DRAFT }),
    }),
    {
      name: BOOKING_DRAFT_STORAGE_KEY,
      storage: createJSONStorage(getAsyncStorage),
      // Persist only non-clinical draft choices; never persist health answers.
      partialize: (state): BookingDraftFields => ({
        channel: state.channel,
        service: state.service,
        clinic: state.clinic,
        clinician: state.clinician,
        slot: state.slot,
        holdExpiresAt: state.holdExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const cleaned = sanitizeRehydratedBookingDraft(state);
        if (cleaned.slot === null && state.slot !== null) {
          state.releaseSlot();
        }
      },
    },
  ),
);
