import React from "react";
import { FlatList } from "react-native";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import NotificationsScreen from "@/app/(patient)/notifications";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, back: jest.fn() }) }));

const mockHistory = jest.fn();
jest.mock("@/features/notifications/notification-hooks", () => ({
  useNotificationHistoryPages: () => mockHistory(),
}));

const note = (id: string) => ({
  id, userId: "u", type: "push", title: `Title ${id}`, body: "Body", data: {}, sentAt: "2026-11-10T10:00:00Z", status: "sent",
});
const state = (over: Record<string, unknown> = {}) => ({
  data: [note("a"), note("b")], isLoading: false, isError: false, refetch: jest.fn(),
  hasNextPage: false, isFetchingNextPage: false, fetchNextPage: jest.fn(), ...over,
});

beforeEach(() => jest.clearAllMocks());

describe("Notifications list", () => {
  it("lists what was sent", () => {
    mockHistory.mockReturnValue(state());
    renderScreen(<NotificationsScreen />);
    expect(screen.getByText("Title a")).toBeTruthy();
    expect(screen.getByText("Title b")).toBeTruthy();
  });

  it("loads older notifications when the end is reached, not before there are any", () => {
    const fetchNextPage = jest.fn();
    mockHistory.mockReturnValue(state({ hasNextPage: true, fetchNextPage }));
    renderScreen(<NotificationsScreen />);
    fireEvent(screen.UNSAFE_getByType(FlatList), "endReached");
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("does not load more when this was the last page", () => {
    const fetchNextPage = jest.fn();
    mockHistory.mockReturnValue(state({ fetchNextPage }));
    renderScreen(<NotificationsScreen />);
    fireEvent(screen.UNSAFE_getByType(FlatList), "endReached");
    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
