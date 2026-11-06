import { tokenStore } from "@/lib/token-store";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "./auth-store";
import { useBookingStore } from "../booking/booking-store";
import { useVanStore } from "../van/van-store";
import { useOnboardingStore } from "../onboarding/onboarding-store";
import { API_URL, apiUrl } from "@/config/api";
import { readAuthError } from "./auth-errors";

export { API_URL, apiUrl };

// ─── Push token of this device ───────────────────────────────────────────────
// Sent on sign-out so the server stops pushing to a device nobody is signed
// in on (MF-03). Set each launch when the token is registered.
let registeredPushToken: string | null = null;

export function rememberPushToken(token: string) {
  registeredPushToken = token;
}

// ─── In-flight refresh de-duplication ────────────────────────────────────────
let refreshPromise: Promise<string> | null = null;

/**
 * Fully purges local state on signOut or unrecoverable session expiry.
 * MA-2: Clears React Query cache and resets booking, van, and onboarding stores
 * to prevent patient health data leaking across sessions on shared devices.
 */
export async function clearSessionState() {
  useAuthStore.getState().clearAuth();
  await tokenStore.deleteRefreshToken();
  queryClient.clear();
  useBookingStore.getState().resetDraft();
  useVanStore.getState().resetDraft();
  useOnboardingStore.getState().reset();
}

// ─── Unauthenticated fetch for public endpoints ──────────────────────────────
// The only other place the app calls `fetch` directly (lint enforces this), so
// every request goes to API_URL and none skips the client by accident.
export function publicFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, options);
}

// ─── Core authenticated fetch with transparent refresh ───────────────────────
export async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken } = useAuthStore.getState();
  const token = accessToken ?? (await ensureValidToken());

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : "",
    ...(options.headers as Record<string, string>),
  };
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    try {
      const freshToken = await ensureValidToken(true);
      const retryHeaders: Record<string, string> = {
        ...headers,
        Authorization: `Bearer ${freshToken}`,
      };
      return await fetch(`${API_URL}${path}`, {
        ...options,
        headers: retryHeaders,
      });
    } catch {
      await clearSessionState();
      throw new Error("Session expired. Please sign in again.");
    }
  }

  return res;
}

export async function ensureValidToken(forceRefresh = false): Promise<string> {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && !forceRefresh) return accessToken;

  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<string> {
  const refreshToken = await tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearSessionState();
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  await tokenStore.setRefreshToken(data.refreshToken);
  useAuthStore.getState().setAuth(data.accessToken, data.user);
  return data.accessToken;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  checkEmail: async (email: string): Promise<{ exists: boolean; email: string }> => {
    const res = await fetch(`${API_URL}/api/auth/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).error ?? "Could not check email");
    }
    return res.json();
  },

  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
    referralCode?: string
  ) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName, phone, ...(referralCode ? { referralCode } : {}) }),
    });
    if (!res.ok) throw await readAuthError(res, "Registration failed");
    const data = await res.json();
    await tokenStore.setRefreshToken(data.refreshToken);
    useAuthStore.getState().setAuth(data.accessToken, data.user);
    return data;
  },

  // Staff (and patients who turned it on) get { mfaRequired: true } first and
  // a security code by SMS or email; calling again with the code signs in.
  signIn: async (email: string, password: string, mfaCode?: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, ...(mfaCode ? { mfaCode } : {}) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Sign-in failed");
    }
    const data = await res.json();
    if (data.mfaRequired) return { mfaRequired: true as const };
    await tokenStore.setRefreshToken(data.refreshToken);
    useAuthStore.getState().setAuth(data.accessToken, data.user);
    return data;
  },

  signOut: async (pushToken: string | null = registeredPushToken) => {
    try {
      await authFetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pushToken ? { pushToken } : {}),
      });
    } catch {
      // Network failure on logout shouldn't prevent clearing local state
    } finally {
      registeredPushToken = null;
      await clearSessionState();
    }
  },

  requestPhoneOtp: async (phone: string) => {
    const res = await fetch(`${API_URL}/api/auth/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) throw new Error("Could not send OTP");
    return res.json();
  },

  verifyPhoneOtp: async (phone: string, code: string) => {
    const res = await fetch(`${API_URL}/api/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    if (!res.ok) throw new Error("Invalid or expired code");
    const data = await res.json();
    await tokenStore.setRefreshToken(data.refreshToken);
    useAuthStore.getState().setAuth(data.accessToken, data.user);
    return data;
  },

  forgotPassword: async (email: string) => {
    // Fire-and-forget — always 200 to prevent email enumeration
    await fetch(`${API_URL}/api/auth/password-reset/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/password-reset/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    if (!res.ok) throw new Error("Reset link expired or invalid");
    return res.json();
  },

  confirmEmailVerification: async (token: string) => {
    const res = await fetch(`${API_URL}/api/auth/verify-email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw await readAuthError(res, "Invalid or expired verification code");
    return res.json();
  },

  /** The six-digit code from the verification email. Needs the address too. */
  confirmEmailCode: async (email: string, code: string) => {
    const res = await fetch(`${API_URL}/api/auth/verify-email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (!res.ok) throw await readAuthError(res, "Invalid or expired verification code");
    return res.json();
  },

  resendEmailVerification: async (email: string) => {
    const res = await fetch(`${API_URL}/api/auth/verify-email/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw await readAuthError(res, "Could not resend verification email");
    return res.json();
  },

  listSessions: async () => {
    const res = await authFetch("/api/auth/sessions");
    if (!res.ok) throw new Error("Could not fetch sessions");
    return res.json();
  },

  revokeSession: async (sessionId: string) => {
    const res = await authFetch(`/api/auth/sessions/${sessionId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Could not revoke session");
  },

  refresh: async () => {
    // MA-5: Use the same single flight-safe refresh path as authFetch
    const token = await ensureValidToken(true);
    return { accessToken: token, user: useAuthStore.getState().user };
  },
};
