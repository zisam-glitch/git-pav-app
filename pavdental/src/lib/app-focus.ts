import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as ExpoRouter from "expo-router";

/**
 * Returns `intervalMs` when both the screen is focused and the app is in the
 * foreground, or `false` to pause polling otherwise.
 */
export function activePollInterval(
  isFocused: boolean,
  isForeground: boolean,
  intervalMs: number,
): number | false {
  return isFocused && isForeground ? intervalMs : false;
}

/**
 * Safe wrapper around `expo-router`'s `useIsFocused` that defaults to `true`
 * when a component test mocks `expo-router` without `useIsFocused`.
 */
export function useScreenFocused(): boolean {
  return typeof ExpoRouter.useIsFocused === "function"
    ? ExpoRouter.useIsFocused()
    : true;
}

/** Tracks whether the app is currently in the foreground (`AppState === "active"`). */
export function useAppIsForeground(): boolean {
  const [isForeground, setIsForeground] = useState(
    () => AppState.currentState === "active",
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        setIsForeground(nextState === "active");
      },
    );
    return () => subscription.remove();
  }, []);

  return isForeground;
}

/** True only when the current screen is focused and the app is in the foreground. */
export function useScreenIsActive(): boolean {
  const isFocused = useScreenFocused();
  const isForeground = useAppIsForeground();
  return isFocused && isForeground;
}

/**
 * Returns `intervalMs` when the current screen is focused and the app is in
 * the foreground, or `false` to pause React Query `refetchInterval`.
 */
export function useScreenPollInterval(intervalMs: number): number | false {
  const isFocused = useScreenFocused();
  const isForeground = useAppIsForeground();
  return activePollInterval(isFocused, isForeground, intervalMs);
}
