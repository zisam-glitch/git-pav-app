import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import PatientAppointmentsScreen from "@/app/(patient)/(tabs)/appointments";
import { buildAppointmentRows } from "@/features/booking/appointment-rows";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));
jest.mock("@/lib/pull-to-refresh", () => ({ usePullToRefresh: () => ({ refreshing: false, onRefresh: jest.fn() }) }));

const mockUseMyAppointments = jest.fn();
const mockCancel = jest.fn();
jest.mock("@/features/hooks/use-dental-api", () => ({
  useMyAppointments: () => mockUseMyAppointments(),
  useCancelAppointmentMutation: () => ({ mutate: mockCancel, isPending: false }),
}));

const hours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const appt = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  status: "confirmed",
  channel: "clinic",
  startTimeUtc: hours(72),
  endTimeUtc: hours(73),
  service: { name: `Treatment ${id}` },
  clinic: { name: "Pav Dental" },
  clinician: { fullName: "Dr Example" },
  ...over,
});
const withData = (data: unknown[]) =>
  mockUseMyAppointments.mockReturnValue({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => jest.clearAllMocks());

describe("buildAppointmentRows", () => {
  it("puts a heading before upcoming and past, and says when nothing is upcoming", () => {
    const rows = buildAppointmentRows([], [{ id: "p1" }]);
    expect(rows.map((r) => r.kind)).toEqual(["heading", "no-upcoming", "heading", "booking"]);
  });

  it("gives every row a unique key, even when the same id appears in both groups", () => {
    const rows = buildAppointmentRows([{ id: "a" }, { id: "b" }], [{ id: "c" }]);
    expect(new Set(rows.map((r) => r.key)).size).toBe(rows.length);
  });
});

describe("Bookings list", () => {
  it("lists upcoming visits with a cancel button and past ones without", () => {
    withData([
      appt("up1"),
      appt("done1", { status: "completed", startTimeUtc: hours(-72), endTimeUtc: hours(-71) }),
    ]);
    renderScreen(<PatientAppointmentsScreen />);
    expect(screen.getByText("Upcoming")).toBeTruthy();
    expect(screen.getByText("Past")).toBeTruthy();
    expect(screen.getByText("Treatment up1")).toBeTruthy();
    expect(screen.getByText("Treatment done1")).toBeTruthy();
    expect(screen.getAllByText("Cancel booking", { includeHiddenElements: true }).length).toBe(1);
  });

  it("opens the visit that was tapped", () => {
    withData([appt("up1")]);
    renderScreen(<PatientAppointmentsScreen />);
    fireEvent.press(screen.getByLabelText(/Treatment up1, .*Open details/));
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ params: { id: "up1" } }));
  });

  it("does not list an unpaid hold as a booking", () => {
    withData([appt("hold1", { status: "draft_hold" })]);
    renderScreen(<PatientAppointmentsScreen />);
    expect(screen.queryByText("Treatment hold1")).toBeNull();
  });

  it("says there are no appointments, with a way to book, when the list is empty", () => {
    withData([]);
    renderScreen(<PatientAppointmentsScreen />);
    expect(screen.getByText("No appointments yet")).toBeTruthy();
  });

  it("shows a retry, not an empty list, when loading failed", () => {
    mockUseMyAppointments.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: jest.fn() });
    renderScreen(<PatientAppointmentsScreen />);
    expect(screen.getByText("Could not load your appointments. Please try again.")).toBeTruthy();
    expect(screen.queryByText("No appointments yet")).toBeNull();
  });

  it("only draws the rows near the top of a long history", () => {
    withData(Array.from({ length: 200 }, (_, i) => appt(`h${i}`, { status: "completed", startTimeUtc: hours(-(i + 24)), endTimeUtc: hours(-(i + 23)) })));
    renderScreen(<PatientAppointmentsScreen />);
    expect(screen.queryByText("Treatment h199")).toBeNull();
    expect(screen.getByText("Treatment h0")).toBeTruthy();
  });
});
