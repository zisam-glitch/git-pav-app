import React from "react";
import { act, fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import MessageThreadScreen from "@/app/(patient)/message-thread";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: "t1" }),
}));
jest.mock("expo-image", () => ({ Image: () => null }));
jest.mock("@/features/video/pick-photo", () => ({ pickTriagePhoto: jest.fn() }));
jest.mock("@/features/records/records-api", () => ({ uploadMessagePhoto: jest.fn() }));

const mockReply = jest.fn();
const mockMarkRead = jest.fn();
jest.mock("@/features/hooks/use-dental-api", () => ({
  useMessageThreads: () => ({
    data: [
      {
        id: "t1",
        subject: "My tooth",
        isRead: false,
        messages: [
          { id: "m2", senderRole: "clinician", senderName: "Dr Example", body: "How long has it hurt?", sentAtIso: "2026-11-10T10:05:00Z" },
          { id: "m1", senderRole: "patient", senderName: "Pat", body: "My tooth hurts", sentAtIso: "2026-11-10T10:00:00Z" },
        ],
      },
    ],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useReplyMessageThreadMutation: () => ({ mutateAsync: mockReply, isPending: false }),
  useMarkMessageThreadReadMutation: () => ({ mutate: mockMarkRead }),
}));

beforeEach(() => jest.clearAllMocks());

describe("MessageThreadScreen", () => {
  it("shows the whole conversation, oldest first, and marks it read", () => {
    renderScreen(<MessageThreadScreen />);
    const mine = screen.getByText("My tooth hurts");
    const theirs = screen.getByText("How long has it hurt?");
    expect(mine).toBeTruthy();
    expect(theirs).toBeTruthy();
    expect(screen.getByText("My tooth")).toBeTruthy();
    expect(mockMarkRead).toHaveBeenCalledWith("t1");
  });

  it("keeps what the patient typed and says it did not send when sending fails", async () => {
    mockReply.mockRejectedValueOnce(new Error("Network request failed"));
    renderScreen(<MessageThreadScreen />);
    const box = screen.getByLabelText("Your reply");
    fireEvent.changeText(box, "Since Monday");
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Send" }));
    });
    expect(mockReply).toHaveBeenCalledWith(expect.objectContaining({ threadId: "t1", body: "Since Monday" }));
    expect(screen.getByText("Network request failed")).toBeTruthy();
    expect(screen.getByLabelText("Your reply").props.value).toBe("Since Monday");
  });

  it("clears the box after a reply is sent", async () => {
    mockReply.mockResolvedValueOnce({});
    renderScreen(<MessageThreadScreen />);
    fireEvent.changeText(screen.getByLabelText("Your reply"), "Since Monday");
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Send" }));
    });
    expect(screen.getByLabelText("Your reply").props.value).toBe("");
  });
});
