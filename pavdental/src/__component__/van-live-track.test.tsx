import React from "react";
import { Alert } from "react-native";
import { act, fireEvent, screen } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderScreen } from "./test-utils";
import VanLiveTrackScreen from "@/app/(patient)/van/live-track";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => ({ requestId: "r1" }),
}));
jest.mock("@stripe/stripe-react-native", () => ({
  useStripe: () => ({ initPaymentSheet: jest.fn(), presentPaymentSheet: jest.fn() }),
}));
jest.mock("@/features/van/van-tracking-map", () => ({ VanTrackingMap: () => null }));

const mockFetchRequest = jest.fn();
const mockRetry = jest.fn();
jest.mock("@/features/van/van-api", () => {
  class DepositCanceledError extends Error {}
  return {
    fetchVanRequest: (...a: unknown[]) => mockFetchRequest(...a),
    fetchActiveVanRequest: jest.fn(async () => null),
    cancelVanRequest: jest.fn(),
    retryDepositAuthorization: (...a: unknown[]) => mockRetry(...a),
    presentVanDepositSheet: jest.fn(),
    DepositCanceledError,
  };
});

const request = (over: Record<string, unknown> = {}) => ({
  id: "r1",
  status: "pending",
  phase: "queued",
  expiresAt: new Date(Date.now() + 245_000).toISOString(),
  depositAuthorized: true,
  accessDetails: { addressLine1: "1 Example Street" },
  service: { name: "Check-up" },
  shift: null,
  route: null,
  van: null,
  ...over,
});

function open() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchInterval: false } } });
  renderScreen(
    <QueryClientProvider client={client}>
      <VanLiveTrackScreen />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
});

describe("VanLiveTrackScreen", () => {
  it("says there is no active request when the server has none", async () => {
    mockFetchRequest.mockResolvedValue(null);
    open();
    expect(await screen.findByText("No active van request")).toBeTruthy();
    expect(screen.getByText(/mobile dental van visit/)).toBeTruthy();
  });

  it("shows the time left for a van to accept a pending request", async () => {
    mockFetchRequest.mockResolvedValue(request());
    open();
    expect(await screen.findByText(/4:0\d left/)).toBeTruthy();
  });

  it("offers to authorise the deposit when the hold is missing, and says nothing was charged", async () => {
    mockFetchRequest.mockResolvedValue(request({ depositAuthorized: false }));
    open();
    expect(await screen.findByText(/You haven't been charged/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Authorize deposit" })).toBeTruthy();
  });

  it("asks the server for a fresh payment secret when authorising", async () => {
    mockFetchRequest.mockResolvedValue(request({ depositAuthorized: false }));
    mockRetry.mockResolvedValue({ alreadyAuthorized: true });
    open();
    const button = await screen.findByRole("button", { name: "Authorize deposit" });
    await act(async () => {
      fireEvent.press(button);
    });
    expect(mockRetry).toHaveBeenCalledWith("r1");
  });

  it("promises the deposit back when cancelling before the van sets off", async () => {
    mockFetchRequest.mockResolvedValue(request());
    open();
    await screen.findByText(/left/);
    fireEvent.press(screen.getByRole("button", { name: /Cancel/ }));
    expect(Alert.alert).toHaveBeenCalledWith("Cancel van request", expect.stringContaining("Your deposit will be returned"), expect.any(Array));
  });

  it("warns the deposit is kept when cancelling with the van on its way", async () => {
    mockFetchRequest.mockResolvedValue(request({ status: "accepted", phase: "en_route" }));
    open();
    await screen.findByText("No active van request").catch(() => undefined);
    fireEvent.press(await screen.findByRole("button", { name: /Cancel/ }));
    expect(Alert.alert).toHaveBeenCalledWith("Cancel van request", expect.stringContaining("deposit will be kept"), expect.any(Array));
  });
});
