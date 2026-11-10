import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import AppointmentDetailScreen from "@/app/(patient)/appointments/[id]";

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "appt-1" }),
}));

const mockUseMyAppointments = jest.fn();
const mockCancel = jest.fn();
jest.mock("@/features/hooks/use-dental-api", () => ({
  useMyAppointments: (...args: unknown[]) => mockUseMyAppointments(...args),
  useCancelAppointmentMutation: () => ({ mutate: mockCancel, isPending: false }),
}));

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

function booking(overrides: Record<string, unknown> = {}) {
  return {
    id: "appt-1",
    status: "confirmed",
    channel: "clinic",
    startTimeUtc: hoursFromNow(30),
    endTimeUtc: hoursFromNow(31),
    depositPaidPence: 2500,
    totalPricePence: 8500,
    service: { name: "Check-up" },
    clinician: { fullName: "Dr Example" },
    clinic: { name: "Pav Dental", address: "786 Leeds Road", postcode: "BD3 9TY" },
    accessDetails: null,
    ...overrides,
  };
}

function withAppointments(list: unknown[]) {
  mockUseMyAppointments.mockReturnValue({ data: list, isLoading: false, isError: false, refetch: jest.fn() });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AppointmentDetailScreen", () => {
  it("shows the address, price and balance for a confirmed visit", () => {
    withAppointments([booking()]);
    renderScreen(<AppointmentDetailScreen />);
    expect(screen.getByText("Pav Dental, 786 Leeds Road, BD3 9TY")).toBeTruthy();
    expect(screen.getByText("£85.00")).toBeTruthy();
    expect(screen.getByText("£60.00")).toBeTruthy();
  });

  it("offers check-in for a confirmed visit inside the window", () => {
    withAppointments([booking()]);
    renderScreen(<AppointmentDetailScreen />);
    expect(screen.getByLabelText("Check in for your visit")).toBeTruthy();
  });

  it("does not offer check-in for a cancelled visit, and offers to book again", () => {
    withAppointments([booking({ status: "cancelled" })]);
    renderScreen(<AppointmentDetailScreen />);
    expect(screen.queryByLabelText("Check in for your visit")).toBeNull();
    expect(screen.getByText("Cancelled")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Book this again" })).toBeTruthy();
  });

  it("does not offer check-in once the patient has checked in, and says so", () => {
    withAppointments([booking({ accessDetails: { checkedIn: true } })]);
    renderScreen(<AppointmentDetailScreen />);
    expect(screen.queryByLabelText("Check in for your visit")).toBeNull();
    expect(screen.getByText("You're checked in")).toBeTruthy();
  });

  it("says the load failed, not that the booking is missing, and retries", () => {
    const refetch = jest.fn();
    mockUseMyAppointments.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    renderScreen(<AppointmentDetailScreen />);
    expect(screen.getByText("We couldn't load this appointment")).toBeTruthy();
    expect(screen.queryByText(/belongs to another account/)).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("asks before cancelling, shows the real policy, then cancels this booking", () => {
    withAppointments([booking({ startTimeUtc: hoursFromNow(72), endTimeUtc: hoursFromNow(73) })]);
    renderScreen(<AppointmentDetailScreen />);
    fireEvent.press(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText(/refunds your deposit in full/)).toBeTruthy();
    expect(mockCancel).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole("button", { name: "Cancel appointment" }));
    expect(mockCancel).toHaveBeenCalledWith("appt-1", expect.any(Object));
  });
});
