import React from "react";
import { act, renderHook } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useCancelAppointmentMutation,
  useMarkMessageThreadReadMutation,
} from "@/features/hooks/use-dental-api";
import { useUpdateNotificationPreferences } from "@/features/notifications/notification-hooks";
import { queryKeys } from "@/lib/query-keys";
import { APPOINTMENT_STATUS } from "@/lib/domain-enums";

const mockAuthFetch = jest.fn();
jest.mock("@/features/auth/auth-api", () => ({
  authFetch: (...args: unknown[]) => mockAuthFetch(...args),
  rememberPushToken: jest.fn(),
}));
jest.mock("@/features/auth/auth-store", () => ({
  useIsAuthenticated: () => true,
}));

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("B6 optimistic updates", () => {
  it("optimistically marks a cancelled appointment and rolls back on failure", async () => {
    const client = makeClient();
    client.setQueryData(queryKeys.appointments.list(), [
      { id: "a1", status: APPOINTMENT_STATUS.CONFIRMED },
      { id: "a2", status: APPOINTMENT_STATUS.CONFIRMED },
    ]);
    client.setQueryData(queryKeys.appointments.detail("a1"), {
      id: "a1",
      status: APPOINTMENT_STATUS.CONFIRMED,
    });

    let rejectReq!: (err: Error) => void;
    mockAuthFetch.mockImplementationOnce(
      () =>
        new Promise((_res, rej) => {
          rejectReq = rej;
        }),
    );

    const { result } = renderHook(() => useCancelAppointmentMutation(), {
      wrapper: wrapperFor(client),
    });

    let mutationPromise: Promise<unknown>;
    await act(async () => {
      mutationPromise = result.current.mutateAsync("a1").catch(() => {});
    });

    expect(client.getQueryData<any[]>(queryKeys.appointments.list())?.[0].status).toBe(
      APPOINTMENT_STATUS.CANCELLED,
    );
    expect(client.getQueryData<any>(queryKeys.appointments.detail("a1"))?.status).toBe(
      APPOINTMENT_STATUS.CANCELLED,
    );

    await act(async () => {
      rejectReq(new Error("Server error"));
      await mutationPromise;
    });

    expect(client.getQueryData<any[]>(queryKeys.appointments.list())?.[0].status).toBe(
      APPOINTMENT_STATUS.CONFIRMED,
    );
    expect(client.getQueryData<any>(queryKeys.appointments.detail("a1"))?.status).toBe(
      APPOINTMENT_STATUS.CONFIRMED,
    );
  });

  it("optimistically marks a cancelled appointment inside paged InfiniteData and rolls back on failure", async () => {
    const client = makeClient();
    client.setQueryData(queryKeys.appointments.list(), {
      pages: [
        [{ id: "a1", status: APPOINTMENT_STATUS.CONFIRMED }],
        [{ id: "a2", status: APPOINTMENT_STATUS.CONFIRMED }],
      ],
      pageParams: [0, 30],
    });

    let rejectReq!: (err: Error) => void;
    mockAuthFetch.mockImplementationOnce(
      () =>
        new Promise((_res, rej) => {
          rejectReq = rej;
        }),
    );

    const { result } = renderHook(() => useCancelAppointmentMutation(), {
      wrapper: wrapperFor(client),
    });

    let mutationPromise: Promise<unknown>;
    await act(async () => {
      mutationPromise = result.current.mutateAsync("a2").catch(() => {});
    });

    const optimistic = client.getQueryData<{ pages: Array<Array<{ id: string; status: string }>> }>(
      queryKeys.appointments.list(),
    );
    expect(optimistic?.pages[0][0].status).toBe(APPOINTMENT_STATUS.CONFIRMED);
    expect(optimistic?.pages[1][0].status).toBe(APPOINTMENT_STATUS.CANCELLED);

    await act(async () => {
      rejectReq(new Error("Server error"));
      await mutationPromise;
    });

    const rolledBack = client.getQueryData<{ pages: Array<Array<{ id: string; status: string }>> }>(
      queryKeys.appointments.list(),
    );
    expect(rolledBack?.pages[1][0].status).toBe(APPOINTMENT_STATUS.CONFIRMED);
  });

  it("optimistically clears unreadCount when marking a thread read and rolls back on failure", async () => {
    const client = makeClient();
    client.setQueryData(queryKeys.messages.threads("full"), [
      { id: "t1", unreadCount: 3 },
      { id: "t2", unreadCount: 1 },
    ]);

    let rejectReq!: (err: Error) => void;
    mockAuthFetch.mockImplementationOnce(
      () =>
        new Promise((_res, rej) => {
          rejectReq = rej;
        }),
    );

    const { result } = renderHook(() => useMarkMessageThreadReadMutation(), {
      wrapper: wrapperFor(client),
    });

    let mutationPromise: Promise<unknown>;
    await act(async () => {
      mutationPromise = result.current.mutateAsync("t1").catch(() => {});
    });

    expect(client.getQueryData<any[]>(queryKeys.messages.threads("full"))?.[0].unreadCount).toBe(0);
    expect(client.getQueryData<any[]>(queryKeys.messages.threads("full"))?.[1].unreadCount).toBe(1);

    await act(async () => {
      rejectReq(new Error("Network error"));
      await mutationPromise;
    });

    expect(client.getQueryData<any[]>(queryKeys.messages.threads("full"))?.[0].unreadCount).toBe(3);
  });

  it("optimistically updates notification preferences and rolls back on failure", async () => {
    const client = makeClient();
    client.setQueryData(queryKeys.notifications.preferences(), {
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      appointmentReminders: true,
      appointmentConfirmations: true,
      marketingUpdates: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    });

    let rejectReq!: (err: Error) => void;
    mockAuthFetch.mockImplementationOnce(
      () =>
        new Promise((_res, rej) => {
          rejectReq = rej;
        }),
    );

    const { result } = renderHook(() => useUpdateNotificationPreferences(), {
      wrapper: wrapperFor(client),
    });

    let mutationPromise: Promise<unknown>;
    await act(async () => {
      mutationPromise = result.current.mutateAsync({ emailEnabled: false }).catch(() => {});
    });

    expect(client.getQueryData<any>(queryKeys.notifications.preferences())?.emailEnabled).toBe(false);

    await act(async () => {
      rejectReq(new Error("Failed"));
      await mutationPromise;
    });

    expect(client.getQueryData<any>(queryKeys.notifications.preferences())?.emailEnabled).toBe(true);
  });
});
