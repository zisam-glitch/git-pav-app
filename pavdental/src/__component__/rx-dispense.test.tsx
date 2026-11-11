import React from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Alert } from "react-native";
import { renderScreen } from "./test-utils";
import RxDispense from "@/app/(clinician)/rx-dispense";

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack, canGoBack: () => true }),
  useLocalSearchParams: () => ({ appointmentId: "a1" }),
}));
jest.mock("@/features/auth/auth-store", () => ({ useCurrentUser: () => ({ firstName: "Dr", lastName: "Example" }) }));

const mockAuthFetch = jest.fn();
jest.mock("@/features/auth/auth-api", () => ({
  apiUrl: (p: string) => `https://x.test${p}`,
  authFetch: (...a: unknown[]) => mockAuthFetch(...a),
}));

const json = (body: unknown, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthFetch.mockImplementation((url: string) => {
    if (url.includes("clinical-context")) {
      return json({
        appointmentId: "a1",
        patient: { id: "p1", firstName: "Pat", lastName: "Example", dob: null, address: null },
        medicalHistory: null,
      });
    }
    if (url === "/api/prescriptions") return json({ id: "rx1", reference: "RX-1" });
    return json({}, false);
  });
});

it("issues the prescription without ending the visit or writing a summary for the dentist", async () => {
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  renderScreen(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RxDispense />
    </QueryClientProvider>,
  );
  await waitFor(() => screen.getByLabelText("Medicine, strength and form"));
  fireEvent.changeText(screen.getByLabelText("Medicine, strength and form"), "Amoxicillin 500mg capsules");
  fireEvent.changeText(screen.getByLabelText("Dose and frequency"), "One three times a day for 5 days");
  fireEvent.changeText(screen.getByLabelText("Dispensing pharmacy"), "High Street Pharmacy");
  fireEvent(screen.getByRole("switch"), "valueChange", true);
  await act(async () => {
    fireEvent.press(screen.getByRole("button", { name: "Sign and save prescription" }));
  });
  await waitFor(() => expect(alertSpy).toHaveBeenCalled());

  const urls = mockAuthFetch.mock.calls.map((c) => c[0]);
  expect(urls).toContain("/api/prescriptions");
  expect(urls.some((u: string) => u.includes("end-consult"))).toBe(false);
  expect(String(alertSpy.mock.calls[0][1])).toContain("record the summary");
});
