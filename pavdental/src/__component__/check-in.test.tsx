import React from "react";
import { act, fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import CheckInScreen from "@/app/(patient)/check-in";

const mockReplace = jest.fn();
let mockParams: { appointmentId?: string } = { appointmentId: "appt-1" };
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const mockInvalidate = jest.fn(async () => undefined);
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
}));

jest.mock("@/features/hooks/use-dental-api", () => ({
  // The screen asks for the one appointment it was opened for.
  useAppointment: (id: string | undefined) => ({
    data: id ? { id, startTimeUtc: new Date(Date.now() + 5 * 3600_000).toISOString(), service: { name: "Check-up" } } : undefined,
  }),
}));

const mockCheckIn = jest.fn();
jest.mock("@/features/records/records-api", () => ({
  completeAppointmentCheckIn: (...args: unknown[]) => mockCheckIn(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { appointmentId: "appt-1" };
});

describe("CheckInScreen", () => {
  it("checks in the booking it was opened for, recording no tasks, and goes back to it", async () => {
    mockCheckIn.mockResolvedValueOnce({});
    renderScreen(<CheckInScreen />);
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Check in" }));
    });
    expect(mockCheckIn).toHaveBeenCalledWith("appt-1", { completedTasks: [] });
    expect(mockInvalidate).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(expect.objectContaining({ params: { id: "appt-1" } }));
  });

  it("never checks in some other booking when it has no id", () => {
    mockParams = {};
    renderScreen(<CheckInScreen />);
    expect(screen.getByText("Nothing to check in for")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Check in" })).toBeNull();
    expect(mockCheckIn).not.toHaveBeenCalled();
  });

  it("stays on the screen and says so when check-in fails", async () => {
    mockCheckIn.mockRejectedValueOnce(new Error("Check-in window is not yet open"));
    renderScreen(<CheckInScreen />);
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Check in" }));
    });
    expect(screen.getByText("Check-in window is not yet open")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
