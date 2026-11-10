import React from "react";
import { act, fireEvent, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import VideoCallScreen from "@/app/(patient)/video/call";

const mockReplace = jest.fn();
let mockParams: { appointmentId?: string } = { appointmentId: "a1" };
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

const mockAuthFetch = jest.fn();
jest.mock("@/features/auth/auth-api", () => ({ authFetch: (...a: unknown[]) => mockAuthFetch(...a) }));

// The native call itself needs a phone; a stand-in shows what the screen gave it
// and lets a test end the call either way.
jest.mock("@/features/video/native-call", () => {
  const { Pressable, Text } = jest.requireActual("react-native");
  return {
    NativeVideoCall: ({ token, onLeft }: { token: string; onLeft: (r: "left" | "ended") => void }) => (
      <>
        <Text>{`In call with token ${token}`}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="stand-in leave" onPress={() => onLeft("left")}>
          <Text>leave</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="stand-in ended" onPress={() => onLeft("ended")}>
          <Text>ended</Text>
        </Pressable>
      </>
    ),
  };
});

const room = (token: string) => ({ ok: true, json: async () => ({ url: "https://x.daily.co/r", token }) });

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { appointmentId: "a1" };
});

const open = async () => {
  renderScreen(<VideoCallScreen />);
  await act(async () => {});
};

describe("VideoCallScreen", () => {
  it("asks for the room for this appointment and offers to join", async () => {
    mockAuthFetch.mockResolvedValueOnce(room("t1"));
    await open();
    expect(mockAuthFetch).toHaveBeenCalledWith("/api/video/rooms", { method: "POST", body: JSON.stringify({ appointmentId: "a1" }) });
    expect(screen.getByText("Your clinician is ready")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Join video call" })).toBeTruthy();
  });

  it("puts the person in the call with the token it was given", async () => {
    mockAuthFetch.mockResolvedValueOnce(room("t1"));
    await open();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Join video call" }));
    });
    expect(screen.getByText("In call with token t1")).toBeTruthy();
  });

  it("says why it can't join, and tries again", async () => {
    mockAuthFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Your clinician hasn't let you in yet." }) });
    await open();
    expect(screen.getByText("Can't join yet")).toBeTruthy();
    expect(screen.getByText("Your clinician hasn't let you in yet.")).toBeTruthy();
    mockAuthFetch.mockResolvedValueOnce(room("t2"));
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    });
    expect(screen.getByText("Your clinician is ready")).toBeTruthy();
  });

  it("says the person seems to be offline when the request cannot be sent", async () => {
    mockAuthFetch.mockRejectedValueOnce(new TypeError("Network request failed"));
    await open();
    expect(screen.getByText(/seem to be offline/)).toBeTruthy();
  });

  it("does not ask the server at all without an appointment", async () => {
    mockParams = {};
    await open();
    expect(mockAuthFetch).not.toHaveBeenCalled();
    expect(screen.getByText("Can't join yet")).toBeTruthy();
  });

  it("asks for a fresh token when rejoining after leaving", async () => {
    mockAuthFetch.mockResolvedValueOnce(room("t1")).mockResolvedValueOnce(room("t2"));
    await open();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Join video call" }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "stand-in leave" }));
    });
    expect(screen.getByText("You left the call")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Rejoin video call" }));
    });
    expect(mockAuthFetch).toHaveBeenCalledTimes(2);
    expect(screen.getByText("In call with token t2")).toBeTruthy();
  });

  it("goes straight to the summary when the dentist ends the consultation", async () => {
    mockAuthFetch.mockResolvedValueOnce(room("t1"));
    await open();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Join video call" }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "stand-in ended" }));
    });
    expect(mockReplace).toHaveBeenCalledWith({ pathname: "/(patient)/video/summary", params: { appointmentId: "a1" } });
  });

  it("stays on the call screen when the person only left", async () => {
    mockAuthFetch.mockResolvedValueOnce(room("t1"));
    await open();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Join video call" }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "stand-in leave" }));
    });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "I've finished the call" })).toBeTruthy();
  });
});
