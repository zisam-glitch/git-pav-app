import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import MessagesScreen from "@/app/(patient)/(tabs)/messages";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));
jest.mock("@/lib/pull-to-refresh", () => ({ usePullToRefresh: () => ({ refreshing: false, onRefresh: jest.fn() }) }));
jest.mock("@/components/emergency-triage-modal", () => ({ EmergencyTriageModal: () => null }));

const mockThreads = jest.fn();
jest.mock("@/features/hooks/use-dental-api", () => ({
  useMessageThreads: () => mockThreads(),
  usePracticeHours: () => ({ hoursText: "Mon-Fri 09:00-17:30" }),
  useCreateMessageThreadMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

const thread = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  subject: `Subject ${id}`,
  from: "Dr Example",
  preview: `Preview ${id}`,
  sentAtIso: "2026-11-10T10:00:00Z",
  isRead: true,
  hasAttachment: false,
  ...over,
});
const withThreads = (data: unknown[]) =>
  mockThreads.mockReturnValue({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => jest.clearAllMocks());

describe("Messages list", () => {
  it("lists the conversations and opens the one that is tapped", () => {
    withThreads([thread("a"), thread("b", { isRead: false })]);
    renderScreen(<MessagesScreen />);
    expect(screen.getByText("Subject a")).toBeTruthy();
    expect(screen.getByText("1 new")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Message from Dr Example: Subject b"));
    expect(mockPush).toHaveBeenCalledWith({ pathname: "/(patient)/message-thread", params: { id: "b" } });
  });

  it("filters by what the patient types in search", () => {
    withThreads([thread("a"), thread("b", { subject: "Invoice question" })]);
    renderScreen(<MessagesScreen />);
    fireEvent.changeText(screen.getByLabelText("Search messages"), "invoice");
    expect(screen.getByText("Invoice question")).toBeTruthy();
    expect(screen.queryByText("Subject a")).toBeNull();
  });

  it("says nothing matches, rather than an empty inbox, when a search finds nothing", () => {
    withThreads([thread("a")]);
    renderScreen(<MessagesScreen />);
    fireEvent.changeText(screen.getByLabelText("Search messages"), "zzz");
    expect(screen.getByText("No messages found")).toBeTruthy();
  });

  it("shows a clear inbox when there are no conversations", () => {
    withThreads([]);
    renderScreen(<MessagesScreen />);
    expect(screen.getByText("Your inbox is clear")).toBeTruthy();
  });

  it("shows a retry when loading failed", () => {
    mockThreads.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: jest.fn() });
    renderScreen(<MessagesScreen />);
    expect(screen.getByText(/couldn't load your messages/)).toBeTruthy();
  });

  it("keeps the search box while the list is shown, and only draws rows near the top of a long inbox", () => {
    withThreads(Array.from({ length: 300 }, (_, i) => thread(`t${i}`)));
    renderScreen(<MessagesScreen />);
    expect(screen.getByLabelText("Search messages")).toBeTruthy();
    expect(screen.queryByText("Subject t299")).toBeNull();
  });
});
