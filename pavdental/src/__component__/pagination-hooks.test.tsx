import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDocumentVault, useMyAppointments } from "@/features/hooks/use-dental-api";
import { APPOINTMENT_PAGE_SIZE } from "@/features/booking/booking-api";
import { DOCUMENT_PAGE_SIZE } from "@/features/records/records-api";

const mockAuthFetch = jest.fn();
jest.mock("@/features/auth/auth-api", () => ({
  authFetch: (...args: unknown[]) => mockAuthFetch(...args),
  rememberPushToken: jest.fn(),
}));
jest.mock("@/features/auth/auth-store", () => ({
  useIsAuthenticated: () => true,
}));

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("B9 pagination hooks", () => {
  it("useMyAppointments pages with limit/offset, stops on a short page, and deduplicates by id", async () => {
    const page1 = Array.from({ length: APPOINTMENT_PAGE_SIZE }, (_, i) => ({
      id: `a${i}`,
      status: "confirmed",
      channel: "clinic",
      startTimeUtc: "2026-11-20T10:00:00.000Z",
      endTimeUtc: "2026-11-20T10:30:00.000Z",
    }));
    // Overlapping id "a29" simulates a new row inserted at the top shifting page 2 by one.
    const page2 = [
      { ...page1[APPOINTMENT_PAGE_SIZE - 1] },
      {
        id: "a_last",
        status: "completed",
        channel: "clinic",
        startTimeUtc: "2026-11-10T10:00:00.000Z",
        endTimeUtc: "2026-11-10T10:30:00.000Z",
      },
    ];

    mockAuthFetch
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
      .mockResolvedValueOnce({ ok: true, json: async () => page2 });

    const client = makeClient();
    const { result } = renderHook(() => useMyAppointments(), { wrapper: wrapperFor(client) });

    await waitFor(() => expect(result.current.data?.length).toBe(APPOINTMENT_PAGE_SIZE));
    expect(mockAuthFetch).toHaveBeenCalledWith(
      `/api/booking/appointments?limit=${APPOINTMENT_PAGE_SIZE}&offset=0`,
    );
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.length).toBe(APPOINTMENT_PAGE_SIZE + 1));
    expect(mockAuthFetch).toHaveBeenLastCalledWith(
      `/api/booking/appointments?limit=${APPOINTMENT_PAGE_SIZE}&offset=${APPOINTMENT_PAGE_SIZE}`,
    );
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.data?.map((a) => a.id)).toContain("a_last");
  });

  it("useDocumentVault pages with limit/offset, stops on a short page, and deduplicates by id", async () => {
    const page1 = Array.from({ length: DOCUMENT_PAGE_SIZE }, (_, i) => ({
      id: `d${i}`,
      docType: "invoice",
      title: `Doc ${i}`,
      createdAt: "2026-11-01T10:00:00.000Z",
    }));
    const page2 = [
      { ...page1[DOCUMENT_PAGE_SIZE - 1] },
      { id: "d_last", docType: "xray", title: "X-ray", createdAt: "2026-10-01T10:00:00.000Z" },
    ];

    mockAuthFetch
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
      .mockResolvedValueOnce({ ok: true, json: async () => page2 });

    const client = makeClient();
    const { result } = renderHook(() => useDocumentVault("u1"), { wrapper: wrapperFor(client) });

    await waitFor(() => expect(result.current.data?.length).toBe(DOCUMENT_PAGE_SIZE));
    expect(mockAuthFetch).toHaveBeenCalledWith(
      `/api/patients/u1/documents?limit=${DOCUMENT_PAGE_SIZE}&offset=0`,
    );
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.length).toBe(DOCUMENT_PAGE_SIZE + 1));
    expect(mockAuthFetch).toHaveBeenLastCalledWith(
      `/api/patients/u1/documents?limit=${DOCUMENT_PAGE_SIZE}&offset=${DOCUMENT_PAGE_SIZE}`,
    );
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.data?.map((d) => d.id)).toContain("d_last");
  });
});
