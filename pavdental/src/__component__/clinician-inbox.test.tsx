import { act, fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import ClinicianInboxScreen from "@/app/(clinician)/inbox";

jest.mock("expo-image", () => ({ Image: () => null }));
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: "success" },
}));

const mockThreads = jest.fn();
const mockThread = jest.fn();
const mockReply = jest.fn();
const mockMarkRead = jest.fn();

jest.mock("@/features/hooks/use-dental-api", () => ({
  useMessageThreads: (...args: unknown[]) => mockThreads(...args),
  useMessageThread: (...args: unknown[]) => mockThread(...args),
  usePracticeHours: () => ({ hoursText: "Mon–Fri 08:00–18:00" }),
  useReplyMessageThreadMutation: () => ({ mutateAsync: mockReply, isPending: false }),
  useMarkMessageThreadReadMutation: () => ({ mutate: mockMarkRead }),
}));

const threadSummary = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  from: `Patient ${id}`,
  subject: `Subject ${id}`,
  preview: `Preview ${id}`,
  sentAtIso: "2026-11-12T10:00:00Z",
  isRead: false,
  ...over,
});

const threadPage = {
  id: "t1",
  subject: "Tooth sensitivity",
  isRead: false,
  hasMore: false,
  nextBefore: null,
  messages: [
    { id: "m1", senderRole: "patient", senderName: "Pat Smith", body: "Cold water hurts", sentAtIso: "2026-11-12T10:00:00Z" },
    { id: "m2", senderRole: "clinician", senderName: "Dr Patel", body: "Since when?", sentAtIso: "2026-11-12T10:05:00Z" },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockThreads.mockReturnValue({
    data: [threadSummary("t1")],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  });
  mockThread.mockReturnValue({
    data: { pages: [threadPage] },
    isLoading: false,
    isError: false,
    refetch: jest.fn().mockResolvedValue({}),
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
  });
});

describe("ClinicianInboxScreen", () => {
  it("requests summary threads and opens a full paged conversation when tapped", () => {
    renderScreen(<ClinicianInboxScreen />);
    expect(mockThreads).toHaveBeenCalledWith("summary");
    fireEvent.press(screen.getByLabelText("Message from Patient t1: Subject t1"));
    expect(mockMarkRead).toHaveBeenCalledWith("t1");
    expect(mockThread).toHaveBeenCalledWith("t1");
    expect(screen.getByText("Cold water hurts")).toBeTruthy();
    expect(screen.getByText("Since when?")).toBeTruthy();
    expect(screen.getByText("Dr Patel")).toBeTruthy();
    expect(screen.queryByText("You (Clinician)")).toBeNull();
  });

  it("offers Show earlier messages when older pages exist", () => {
    const fetchNextPage = jest.fn();
    mockThread.mockReturnValue({
      data: { pages: [threadPage] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      hasNextPage: true,
      fetchNextPage,
      isFetchingNextPage: false,
    });
    renderScreen(<ClinicianInboxScreen />);
    fireEvent.press(screen.getByLabelText("Message from Patient t1: Subject t1"));
    fireEvent.press(screen.getByRole("button", { name: "Show earlier messages" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("keeps what the dentist typed and shows an error toast if sending fails", async () => {
    mockReply.mockRejectedValueOnce(new Error("Could not reach server"));
    renderScreen(<ClinicianInboxScreen />);
    fireEvent.press(screen.getByLabelText("Message from Patient t1: Subject t1"));
    fireEvent.changeText(screen.getByLabelText("Reply to the patient"), "Book a check-up");
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Send reply"));
    });
    expect(screen.getByText("Could not reach server")).toBeTruthy();
    expect(screen.getByLabelText("Reply to the patient").props.value).toBe("Book a check-up");
  });

  it("clears the reply box and refreshes the thread when a reply succeeds", async () => {
    mockReply.mockResolvedValueOnce({});
    const refetchThread = jest.fn().mockResolvedValue({});
    mockThread.mockReturnValue({
      data: { pages: [threadPage] },
      isLoading: false,
      isError: false,
      refetch: refetchThread,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });
    renderScreen(<ClinicianInboxScreen />);
    fireEvent.press(screen.getByLabelText("Message from Patient t1: Subject t1"));
    fireEvent.changeText(screen.getByLabelText("Reply to the patient"), "Book a check-up");
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Send reply"));
    });
    expect(mockReply).toHaveBeenCalledWith({ threadId: "t1", body: "Book a check-up" });
    expect(refetchThread).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Reply to the patient").props.value).toBe("");
  });
});
