import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderScreen } from "./test-utils";
import OdontogramEditor from "@/app/(clinician)/odontogram-editor";
import AppointmentNotes from "@/app/(clinician)/appointment-notes";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ patientId: "p1", appointmentId: "a1", patientName: "Pat Example" }),
}));

const mockFetchOdontogram = jest.fn();
const mockFetchNotes = jest.fn();
const mockUpdateOdontogram = jest.fn();
const mockSaveNotes = jest.fn();
jest.mock("@/features/records/records-api", () => ({
  fetchOdontogram: (...a: unknown[]) => mockFetchOdontogram(...a),
  fetchOdontogramHistory: jest.fn().mockResolvedValue([]),
  updateOdontogram: (...a: unknown[]) => mockUpdateOdontogram(...a),
  fetchAppointmentNotes: (...a: unknown[]) => mockFetchNotes(...a),
  saveAppointmentNotes: (...a: unknown[]) => mockSaveNotes(...a),
  completeAppointment: jest.fn(),
  markAppointmentNoShow: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("Dental chart editor", () => {
  it("does not show a healthy mouth, or allow saving, when the chart failed to load", async () => {
    mockFetchOdontogram.mockRejectedValue(new Error("Could not load odontogram"));
    renderScreen(<OdontogramEditor />);
    await waitFor(() => expect(screen.getByText(/can't be edited safely/)).toBeTruthy());
    expect(screen.queryByText(/Save chart/i)).toBeNull();
    expect(mockUpdateOdontogram).not.toHaveBeenCalled();
  });

  it("retries the load when asked", async () => {
    mockFetchOdontogram.mockRejectedValueOnce(new Error("x")).mockResolvedValue([]);
    renderScreen(<OdontogramEditor />);
    await waitFor(() => screen.getByText(/can't be edited safely/));
    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(mockFetchOdontogram).toHaveBeenCalledTimes(2));
  });
});

describe("Examination notes", () => {
  it("does not offer the form when the saved notes failed to load", async () => {
    mockFetchNotes.mockRejectedValue(new Error("Could not load clinical notes"));
    renderScreen(
      <QueryClientProvider client={new QueryClient()}>
        <AppointmentNotes />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByText(/can't be edited safely/)).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Save notes" })).toBeNull();
    expect(mockSaveNotes).not.toHaveBeenCalled();
  });

  it("shows the form, empty, when there are no notes yet", async () => {
    mockFetchNotes.mockResolvedValue(null);
    renderScreen(
      <QueryClientProvider client={new QueryClient()}>
        <AppointmentNotes />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "Save notes" })).toBeTruthy());
  });
});
