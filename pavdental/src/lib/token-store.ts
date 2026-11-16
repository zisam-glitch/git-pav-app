/* eslint-disable @typescript-eslint/no-var-requires -- reason: native modules are loaded lazily in try/catch so this file also runs in Node tests */
let Platform: { OS: string } = { OS: "web" };
try {
  Platform = require("react-native").Platform ?? require("react-native-web").Platform;
} catch {
  try {
    Platform = require("react-native-web").Platform;
  } catch {
  // Not available on this platform.
}
}

type SecureStoreLike = {
  getItemAsync?: (key: string) => Promise<string | null>;
  setItemAsync?: (key: string, value: string, options?: Record<string, unknown>) => Promise<void>;
  deleteItemAsync?: (key: string) => Promise<void>;
  WHEN_UNLOCKED_THIS_DEVICE_ONLY?: number;
};

let SecureStore: SecureStoreLike | null = null;
try {
  SecureStore = require("expo-secure-store");
} catch {
  // Not available on this platform.
}
/* eslint-enable @typescript-eslint/no-var-requires */

// ─── SecureStore key constants ────────────────────────────────────────────────
// NEVER store access tokens here — they live in memory only.
// Only the rotating refresh token and biometric-flag are stored here.
const REFRESH_TOKEN_KEY = "pav_refresh_token";
export const BIOMETRIC_LOCK_KEY = "pavdental_biometric_app_lock_enabled";
const SESSION_ID_KEY = "pav_session_id";

const isWeb = Platform.OS === "web";
const memoryStore = new Map<string, string>();

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      if (typeof window !== "undefined") {
        if (key === REFRESH_TOKEN_KEY) {
          return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key) ?? memoryStore.get(key) ?? null;
        }
        return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key) ?? memoryStore.get(key) ?? null;
      }
      return memoryStore.get(key) ?? null;
    } catch {
      return memoryStore.get(key) ?? null;
    }
  }
  if (!SecureStore?.getItemAsync) {
    return memoryStore.get(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string, options?: Record<string, unknown>): Promise<void> {
  memoryStore.set(key, value);
  if (isWeb) {
    try {
      if (typeof window !== "undefined") {
        if (key === REFRESH_TOKEN_KEY) {
          window.sessionStorage.setItem(key, value);
          // Purge from persistent localStorage to avoid lingering credentials on shared computers
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, value);
        }
      }
    } catch {
      // Not available on this platform.
    }
    return;
  }
  if (!SecureStore?.setItemAsync) return;
  return SecureStore.setItemAsync(key, value, options);
}

async function deleteItem(key: string): Promise<void> {
  memoryStore.delete(key);
  if (isWeb) {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(key);
        window.localStorage.removeItem(key);
      }
    } catch {
      // Not available on this platform.
    }
    return;
  }
  if (!SecureStore?.deleteItemAsync) return;
  return SecureStore.deleteItemAsync(key);
}

export const tokenStore = {
  // Refresh token — persisted, rotated on every use
  getRefreshToken: () => getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) =>
    setItem(REFRESH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore?.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  deleteRefreshToken: () => deleteItem(REFRESH_TOKEN_KEY),

  // Biometric preference
  getBiometricEnabled: async () => {
    const val = await getItem(BIOMETRIC_LOCK_KEY);
    return val === "true";
  },
  setBiometricEnabled: (enabled: boolean) =>
    setItem(BIOMETRIC_LOCK_KEY, String(enabled)),

  // Session ID (for the current device session, used in audit logs)
  getSessionId: () => getItem(SESSION_ID_KEY),
  setSessionId: (id: string) =>
    setItem(SESSION_ID_KEY, id),
  deleteSessionId: () => deleteItem(SESSION_ID_KEY),
};
