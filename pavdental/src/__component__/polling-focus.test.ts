import { AppState, type AppStateStatus } from "react-native";
import { act, renderHook } from "@testing-library/react-native";
import {
  activePollInterval,
  useScreenIsActive,
  useScreenPollInterval,
} from "@/lib/app-focus";

const mockUseIsFocused = jest.fn(() => true);
jest.mock("expo-router", () => ({
  useIsFocused: () => mockUseIsFocused(),
}));

describe("activePollInterval", () => {
  it("returns the interval only when both focused and foregrounded", () => {
    expect(activePollInterval(true, true, 10_000)).toBe(10_000);
    expect(activePollInterval(false, true, 10_000)).toBe(false);
    expect(activePollInterval(true, false, 10_000)).toBe(false);
    expect(activePollInterval(false, false, 10_000)).toBe(false);
  });
});

describe("useScreenPollInterval & useScreenIsActive", () => {
  let appStateListener: ((state: AppStateStatus) => void) | null = null;
  let spy: jest.SpyInstance;
  const originalState = AppState.currentState;

  beforeEach(() => {
    mockUseIsFocused.mockReturnValue(true);
    Object.defineProperty(AppState, "currentState", {
      value: "active",
      configurable: true,
    });
    appStateListener = null;
    spy = jest.spyOn(AppState, "addEventListener").mockImplementation((_type, listener) => {
      appStateListener = listener as (state: AppStateStatus) => void;
      return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
    });
  });

  afterEach(() => {
    spy.mockRestore();
    Object.defineProperty(AppState, "currentState", {
      value: originalState,
      configurable: true,
    });
  });

  it("pauses polling when the app moves to background and resumes on active", () => {
    const { result } = renderHook(() => useScreenPollInterval(5000));
    expect(result.current).toBe(5000);

    act(() => {
      appStateListener?.("background");
    });
    expect(result.current).toBe(false);

    act(() => {
      appStateListener?.("active");
    });
    expect(result.current).toBe(5000);
  });

  it("pauses polling when the screen loses focus", () => {
    mockUseIsFocused.mockReturnValue(true);
    const { result, rerender } = renderHook(() => ({
      active: useScreenIsActive(),
      interval: useScreenPollInterval(10_000),
    }));
    expect(result.current).toEqual({ active: true, interval: 10_000 });

    mockUseIsFocused.mockReturnValue(false);
    rerender({});
    expect(result.current).toEqual({ active: false, interval: false });
  });
});
