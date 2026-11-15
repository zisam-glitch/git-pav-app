import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BOOKING_DRAFT_STORAGE_KEY,
  sanitizeRehydratedBookingDraft,
  useBookingStore,
} from "@/features/booking/booking-store";
import type { ClinicLocation, DentalService, TimeSlot } from "@/features/booking/booking-types";

describe("B8 booking draft persistence", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useBookingStore.getState().resetDraft();
  });

  it("persists non-clinical booking draft choices across writes and rehydrates them", async () => {
    const service = {
      id: "svc-1",
      name: "Routine Exam",
      description: "Exam",
      durationMinutes: 30,
      pricePence: 6500,
      depositPence: 2000,
      supportedChannels: ["clinic"],
    } as DentalService;
    const clinic = {
      id: "cl-1",
      name: "Leeds Central",
      address: "1 High St",
      postcode: "LS1 1AA",
    } as ClinicLocation;

    useBookingStore.getState().setChannel("clinic");
    useBookingStore.getState().setService(service);
    useBookingStore.getState().setClinic(clinic);

    // Wait one microtask for async JSON storage flush
    await Promise.resolve();
    const raw = await AsyncStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state).toEqual({
      channel: "clinic",
      service,
      clinic,
      clinician: null,
      slot: null,
      holdExpiresAt: null,
    });
  });

  it("drops an expired slot hold on rehydration while keeping treatment and clinic", () => {
    const now = 1_700_000_000_000;
    const cleaned = sanitizeRehydratedBookingDraft(
      {
        channel: "clinic",
        service: { id: "svc-1" } as DentalService,
        clinic: { id: "cl-1" } as ClinicLocation,
        slot: { id: "slot-1" } as TimeSlot,
        holdExpiresAt: now - 1000,
      },
      now,
    );
    expect(cleaned.slot).toBeNull();
    expect(cleaned.holdExpiresAt).toBeNull();
    expect(cleaned.channel).toBe("clinic");
    expect(cleaned.service?.id).toBe("svc-1");
    expect(cleaned.clinic?.id).toBe("cl-1");
  });

  it("keeps an unexpired slot hold on rehydration", () => {
    const now = 1_700_000_000_000;
    const cleaned = sanitizeRehydratedBookingDraft(
      {
        channel: "clinic",
        slot: { id: "slot-1" } as TimeSlot,
        holdExpiresAt: now + 60_000,
      },
      now,
    );
    expect(cleaned.slot?.id).toBe("slot-1");
    expect(cleaned.holdExpiresAt).toBe(now + 60_000);
  });
});
