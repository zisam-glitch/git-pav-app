import React from "react";
import { act, fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import TreatmentPlanDetailScreen from "@/app/(patient)/records/plans/[id]";

let mockParams: { id?: string; signSheet?: string } = { id: "p1" };
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));
jest.mock("expo-local-authentication", () => ({
  hasHardwareAsync: jest.fn(async () => false),
  isEnrolledAsync: jest.fn(async () => false),
  authenticateAsync: jest.fn(async () => ({ success: true })),
}));
jest.mock("@/features/auth/auth-store", () => ({
  useCurrentUser: () => ({ id: "u1", firstName: "Pat", lastName: "Lee", email: "pat@example.test" }),
}));

const mockPlans = jest.fn();
const mockDecline = jest.fn();
jest.mock("@/features/hooks/use-dental-api", () => ({
  useTreatmentPlans: () => mockPlans(),
  useServices: () => ({ data: [] }),
  useSignTreatmentPlanMutation: () => ({ mutateAsync: jest.fn() }),
  useDeclineTreatmentPlanMutation: () => ({ mutateAsync: (...a: unknown[]) => mockDecline(...a) }),
}));

const plan = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  title: `Plan ${id}`,
  status: "proposed",
  totalCostPence: 12000,
  createdAt: "2026-11-01T10:00:00Z",
  items: [{ id: "i1", description: "Filling", costPence: 12000, code: "F1" }],
  clinician: { fullName: "Dr Example", roleTitle: "Dentist", gdcNumber: "12345" },
  ...over,
});
const withPlans = (data: unknown) => mockPlans.mockReturnValue({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { id: "p1" };
});

describe("TreatmentPlanDetailScreen", () => {
  it("shows the plan that was opened, awaiting review, with the clinician's own credentials", () => {
    withPlans([plan("p0"), plan("p1")]);
    renderScreen(<TreatmentPlanDetailScreen />);
    expect(screen.getByText("Plan p1")).toBeTruthy();
    expect(screen.queryByText("Plan p0")).toBeNull();
    expect(screen.getByText("Awaiting review")).toBeTruthy();
    expect(screen.getByText(/Dr Example · Dentist, GDC 12345/)).toBeTruthy();
  });

  it("shows an earlier answer instead of asking again", () => {
    withPlans([plan("p1", { status: "accepted" })]);
    renderScreen(<TreatmentPlanDetailScreen />);
    expect(screen.getByText("Read")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Decline" })).toBeNull();
  });

  it("says the plan is not available rather than showing another, when no id is given", () => {
    mockParams = {};
    withPlans([plan("p0")]);
    renderScreen(<TreatmentPlanDetailScreen />);
    expect(screen.getByText("This treatment plan is no longer available.")).toBeTruthy();
    expect(screen.queryByText("Plan p0")).toBeNull();
  });

  it("offers a retry when the plans could not be loaded", () => {
    mockPlans.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: jest.fn() });
    renderScreen(<TreatmentPlanDetailScreen />);
    expect(screen.getByText(/couldn't load this treatment plan/)).toBeTruthy();
  });

  it("asks before declining, then declines this plan and says the clinician is told", async () => {
    withPlans([plan("p1")]);
    mockDecline.mockResolvedValue({});
    renderScreen(<TreatmentPlanDetailScreen />);
    fireEvent.press(screen.getByRole("button", { name: "Decline" }));
    expect(mockDecline).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Decline plan" }));
    });
    expect(mockDecline).toHaveBeenCalledWith("p1");
    expect(screen.getByText("Treatment plan declined — clinician notified")).toBeTruthy();
    expect(screen.getByText("Declined")).toBeTruthy();
  });

  it("stays awaiting review and says why when declining fails", async () => {
    withPlans([plan("p1")]);
    mockDecline.mockRejectedValue(new TypeError("Network request failed"));
    renderScreen(<TreatmentPlanDetailScreen />);
    fireEvent.press(screen.getByRole("button", { name: "Decline" }));
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Decline plan" }));
    });
    expect(screen.getByText("We couldn't reach the server. Check your connection and try again.")).toBeTruthy();
    expect(screen.getByText("Awaiting review")).toBeTruthy();
  });
});
