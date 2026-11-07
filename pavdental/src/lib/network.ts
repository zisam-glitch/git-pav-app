// Native modules are loaded lazily so this file also runs in the Node tests.
/* eslint-disable @typescript-eslint/no-var-requires */
import { onlineManager } from "@tanstack/react-query";
import { create } from "zustand";
import { API_URL } from "../config/api";

let NetInfo: any = null;
try {
  NetInfo = require("@react-native-community/netinfo").default ?? require("@react-native-community/netinfo");
} catch {
  // Not available on this platform.
}

let Platform: any = { OS: "web" };
try {
  Platform = require("react-native").Platform ?? require("react-native-web").Platform;
} catch {
  try {
    Platform = require("react-native-web").Platform;
  } catch {
  // Not available on this platform.
}
}

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  setNetworkState: (state: { isConnected: boolean; isInternetReachable: boolean | null }) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  setNetworkState: (state) => set(state),
}));

/**
 * How the OS check decides "the internet is reachable". By default it probes a
 * Google address; where that is slow, filtered or captive-portalled the app
 * called itself offline and its data layer paused every request, so screens
 * looked frozen while our own API was fine. We probe our own API instead, and
 * any answer at all (even a 503 while a free-tier host wakes up) proves the
 * network works. The app's own requests report their own errors.
 */
export const REACHABILITY_CONFIG = {
  reachabilityUrl: `${API_URL}/health`,
  reachabilityMethod: "GET" as const,
  reachabilityTest: async () => true,
  reachabilityShortTimeout: 5 * 1000,
  reachabilityLongTimeout: 30 * 1000,
  reachabilityRequestTimeout: 15 * 1000,
};

export function setupNetworkMonitoring(): () => void {
  let unsubscribeNetInfo: (() => void) | undefined;
  if (Platform.OS !== "web" && NetInfo?.addEventListener) {
    NetInfo.configure?.(REACHABILITY_CONFIG);
    onlineManager.setEventListener((setOnline) => {
      unsubscribeNetInfo = NetInfo.addEventListener((state: any) => {
        const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
        setOnline(isOnline);
        useNetworkStore.getState().setNetworkState({
          isConnected: Boolean(state.isConnected),
          isInternetReachable: state.isInternetReachable,
        });
      });
      return () => {
        if (unsubscribeNetInfo) unsubscribeNetInfo();
      };
    });
  }
  return () => {
    if (unsubscribeNetInfo) unsubscribeNetInfo();
  };
}

export function useIsOnline(): boolean {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isInternetReachable = useNetworkStore((s) => s.isInternetReachable);
  return isConnected && isInternetReachable !== false;
}
