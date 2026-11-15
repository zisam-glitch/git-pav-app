import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { act, screen } from "@testing-library/react-native";
import { renderScreen } from "./test-utils";
import { NativeVideoCall } from "@/features/video/native-call";

jest.mock("expo-keep-awake", () => ({ useKeepAwake: jest.fn() }));
jest.mock("@/lib/call-events", () => ({ reportCallEvent: jest.fn() }));

type Handler = (event?: unknown) => void;
const handlers = new Map<string, Handler>();
const mockCall: Record<string, jest.Mock> = {
  on: jest.fn((event: string, cb: Handler) => {
    handlers.set(event, cb);
    return mockCall;
  }),
  join: jest.fn(() => Promise.resolve()),
  leave: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(() => Promise.resolve()),
  participants: jest.fn(() => ({ local: { local: true, tracks: {} } })),
  setLocalAudio: jest.fn(),
  setLocalVideo: jest.fn(),
  setNativeInCallAudioMode: jest.fn(),
  cycleCamera: jest.fn(() => Promise.resolve()),
};

jest.mock("@daily-co/react-native-daily-js", () => ({
  __esModule: true,
  default: { createCallObject: () => mockCall },
  DailyMediaView: () => null,
}));

describe("NativeVideoCall — backgrounding, interruption recovery, and a11y (V19/V22/V42)", () => {
  let appStateListener: ((state: AppStateStatus) => void) | null = null;
  let spy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    handlers.clear();
    appStateListener = null;
    spy = jest.spyOn(AppState, "addEventListener").mockImplementation((_type, listener) => {
      appStateListener = listener as (state: AppStateStatus) => void;
      return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
    });
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("pauses camera on background, restores video/audio/route on active, and labels self preview", async () => {
    renderScreen(
      <NativeVideoCall
        url="https://x.daily.co/room"
        token="tok"
        otherLabel="your dentist"
        onLeft={jest.fn()}
      />,
    );

    await act(async () => {
      handlers.get("joined-meeting")?.();
    });

    expect(screen.getByLabelText("Your camera is off")).toBeTruthy();

    act(() => {
      appStateListener?.("background");
    });
    expect(mockCall.setLocalVideo).toHaveBeenCalledWith(false);

    act(() => {
      appStateListener?.("active");
    });
    expect(mockCall.setLocalAudio).toHaveBeenCalledWith(true);
    expect(mockCall.setNativeInCallAudioMode).toHaveBeenCalledWith("video");
    expect(mockCall.setLocalVideo).toHaveBeenCalledWith(true);
  });
});
