import React from "react";
import { Alert } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import OperatorRouteScreen from "@/app/(operator)/route";

jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }));
jest.mock("@/features/van/use-operator-location", () => ({
  useOperatorLocation: () => ({ lastPosition: null }),
}));
jest.mock("@/features/van/nav-links", () => ({
  openDrivingDirections: jest.fn(() => Promise.resolve()),
}));

const mockCantMake = jest.fn();
const mockShiftData = jest.fn();

jest.mock("@/features/van/van-api", () => {
  const actual = jest.requireActual("@/features/van/van-api");
  return {
    ...actual,
    fetchCurrentShift: () => mockShiftData(),
    cantMakeVisit: (...args: unknown[]) => mockCantMake(...args),
  };
});

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: () => ({ data: mockShiftData(), isLoading: false, isError: false, refetch: jest.fn() }),
  };
});

const renderRoute = () =>
  renderScreen(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <OperatorRouteScreen />
    </QueryClientProvider>
  );

describe("OperatorRouteScreen — Can't make this visit (N4)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCantMake.mockResolvedValue({});
  });

  it("offers reason choices and calls cantMakeVisit for a queued stop", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockShiftData.mockReturnValue({
      shift: { id: "sh1" },
      van: { name: "Van 1" },
      queue: [
        {
          id: "req-1",
          phase: "queued",
          service: { name: "Check-up" },
          patient: { firstName: "Pat", lastName: "Example" },
          accessDetails: { addressLine1: "10 High St", postcode: "BD3 9TY" },
        },
      ],
    });

    renderRoute();
    fireEvent.press(screen.getByRole("button", { name: "Can't make this visit" }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Can't make this visit",
      expect.stringContaining("refunded in full"),
      expect.any(Array)
    );
    const buttons = alertSpy.mock.calls[0][2] as Array<{ text: string; onPress?: () => void }>;
    const vehicleProblem = buttons.find((b) => b.text === "Vehicle problem");
    expect(vehicleProblem).toBeTruthy();
    await act(async () => {
      vehicleProblem?.onPress?.();
    });
    expect(mockCantMake).toHaveBeenCalledWith("req-1", "vehicle_problem");
    alertSpy.mockRestore();
  });

  it("does not offer Can't make this visit while treatment is under way", () => {
    mockShiftData.mockReturnValue({
      shift: { id: "sh1" },
      van: { name: "Van 1" },
      queue: [
        {
          id: "req-2",
          phase: "in_treatment",
          service: { name: "Check-up" },
          patient: { firstName: "Pat", lastName: "Example" },
          accessDetails: { addressLine1: "10 High St", postcode: "BD3 9TY" },
        },
      ],
    });

    renderRoute();
    expect(screen.queryByRole("button", { name: "Can't make this visit" })).toBeNull();
  });

  it("shows the 10-minute on-site no-show countdown while waiting on site (N23)", () => {
    jest.useFakeTimers();
    const now = Date.parse("2026-11-15T10:04:00Z");
    jest.setSystemTime(now);
    mockShiftData.mockReturnValue({
      shift: { id: "sh1" },
      van: { name: "Van 1" },
      queue: [
        {
          id: "req-3",
          phase: "on_site",
          arrivedAt: "2026-11-15T10:00:00Z",
          service: { name: "Check-up" },
          patient: { firstName: "Pat", lastName: "Example" },
          accessDetails: { addressLine1: "10 High St", postcode: "BD3 9TY" },
        },
      ],
    });

    const view = renderRoute();
    expect(screen.getByText(/On-site wait: 6:00 left before no-show is allowed/)).toBeTruthy();
    view.unmount();
    jest.useRealTimers();
  });
});
