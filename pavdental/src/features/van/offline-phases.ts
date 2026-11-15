import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authFetch } from "../auth/auth-api";
import { useAuthStore } from "../auth/auth-store";
import type { KeyValueStore } from "./offline-notes-queue";
import {
  enqueuePhaseChange,
  flushPhaseQueue,
  type PhaseSendResult,
  type QueuedPhaseChange,
} from "./offline-phase-queue";

const store: KeyValueStore =
  Platform.OS === "web"
    ? {
        get: async (k) => (typeof window !== "undefined" ? window.localStorage.getItem(k) : null),
        set: async (k, v) => void (typeof window !== "undefined" && window.localStorage.setItem(k, v)),
        remove: async (k) => void (typeof window !== "undefined" && window.localStorage.removeItem(k)),
      }
    : {
        get: (k) => SecureStore.getItemAsync(k),
        set: (k, v) => SecureStore.setItemAsync(k, v, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
        remove: (k) => SecureStore.deleteItemAsync(k),
      };

async function sendQueuedPhase(item: QueuedPhaseChange): Promise<PhaseSendResult> {
  const res = await authFetch(`/api/van/requests/${item.stopId}/phase`, {
    method: "POST",
    body: JSON.stringify({ phase: item.phase }),
  });
  if (res.ok) return "sent";
  // 4xx means the stop already moved past this transition or is closed; drop so it doesn't block the queue.
  if (res.status >= 400 && res.status < 500) return "drop";
  return "retry";
}

export function queueOfflinePhaseChange(item: QueuedPhaseChange): Promise<number> {
  return enqueuePhaseChange(store, item);
}

let flushing: Promise<number> | null = null;

/** Flushes this operator's queued phase changes; resolves to how many remain. */
export function flushOfflinePhases(): Promise<number> {
  const user = useAuthStore.getState().user;
  if (user?.role !== "operator") return Promise.resolve(0);
  flushing ??= flushPhaseQueue(store, user.id, sendQueuedPhase).finally(() => {
    flushing = null;
  });
  return flushing;
}

/** Mount once in the operator portal alongside useOfflineNotesSync (N17). */
export function useOfflinePhasesSync(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const sync = () => {
      void flushOfflinePhases().then(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.van.operatorShift() });
      });
    };
    sync();
    let wasConnected: boolean | null = null;
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      if (state.isConnected && wasConnected === false) sync();
      wasConnected = state.isConnected;
    });
    const appState = AppState.addEventListener("change", (next) => {
      if (next === "active") sync();
    });
    return () => {
      unsubscribeNet();
      appState.remove();
    };
  }, [queryClient]);
}
