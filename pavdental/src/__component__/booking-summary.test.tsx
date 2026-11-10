import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import BookingSummaryScreen from "@/app/(patient)/booking/summary";
import { useBookingStore } from "@/features/booking/booking-store";

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

jest.mock("@stripe/stripe-react-native", () => ({
  useStripe: () => ({ isPlatformPaySupported: async () => false }),
}));
jest.mock("@/features/booking/use-stripe-pay", () => ({ useStripePay: () => ({}) }));
jest.mock("@/features/hooks/use-dental-api", () => ({ useRewards: () => ({ data: undefined }) }));
jest.mock("@/features/account/account-hooks", () => ({ useDependants: () => ({ data: [] }) }));
jest.mock("@/features/booking/booking-api", () => ({
  ...jest.requireActual("@/features/booking/booking-api"),
  createAppointment: jest.fn(),
  createPaymentIntent: jest.fn(),
  confirmAppointment: jest.fn(),
  newBookingAttemptKey: () => "key-1",
}));

const mockRun = jest.fn();
jest.mock("@/features/booking/booking-payment", () => ({
  runBookingPayment: (...args: unknown[]) => mockRun(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  useBookingStore.setState({
    channel: "clinic",
    service: { id: "check-up", name: "Check-up", pricePence: 8500, depositPence: 2500 } as never,
    clinic: { id: "c1", name: "Pav Dental" } as never,
    clinician: null,
    slot: { id: "s1", startTimeUtc: "2026-11-20T10:00:00Z", endTimeUtc: "2026-11-20T10:30:00Z", displayTime: "10:00", dateFormatted: "Fri 20 Nov" } as never,
    holdExpiresAt: Date.now() + 600_000,
  });
});

const pay = () => screen.getByTestId("booking-pay-card");

describe("BookingSummaryScreen", () => {
  it("goes to the confirmed screen for the booking that was paid", async () => {
    mockRun.mockResolvedValueOnce({ kind: "confirmed", appointmentId: "appt-9" });
    renderScreen(<BookingSummaryScreen />);
    await act(async () => {
      fireEvent.press(pay());
    });
    expect(mockPush).toHaveBeenCalledWith("/(patient)/booking/confirmed?appointmentId=appt-9");
  });

  it("hands the payment code the chosen treatment, time and attempt key", async () => {
    mockRun.mockResolvedValueOnce({ kind: "cancelled" });
    renderScreen(<BookingSummaryScreen />);
    await act(async () => {
      fireEvent.press(pay());
    });
    const input = mockRun.mock.calls[0][1];
    expect(input).toMatchObject({ service: { id: "check-up" }, slot: { id: "s1" }, channel: "clinic", attemptKey: "key-1", method: "card" });
  });

  it("stays quiet and on the screen when the patient closes the payment sheet", async () => {
    mockRun.mockResolvedValueOnce({ kind: "cancelled" });
    renderScreen(<BookingSummaryScreen />);
    await act(async () => {
      fireEvent.press(pay());
    });
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("tells the patient plainly when payment fails, and does not move on", async () => {
    mockRun.mockResolvedValueOnce({ kind: "failed", title: "Payment failed", message: "Your payment didn't go through." });
    renderScreen(<BookingSummaryScreen />);
    await act(async () => {
      fireEvent.press(pay());
    });
    expect(Alert.alert).toHaveBeenCalledWith("Payment failed", "Your payment didn't go through.");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("sends the patient back to choose a time when the slot is incomplete", async () => {
    mockRun.mockResolvedValueOnce({ kind: "incomplete", redirect: "slot-picker", title: "Invalid Slot", message: "Choose another." });
    renderScreen(<BookingSummaryScreen />);
    await act(async () => {
      fireEvent.press(pay());
    });
    expect(mockReplace).toHaveBeenCalledWith("/(patient)/booking/slot-picker");
  });
});
