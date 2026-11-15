// ─── Auth Zustand store ───────────────────────────────────────────────────────
// Access token lives ONLY in memory (this store) — never in SecureStore.
// Refresh token lives in SecureStore (see lib/token-store.ts).
import { create } from "zustand";
import type { UserRole } from "../../lib/domain-enums";

export type { UserRole };

export interface AuthUser {
  id: string;
  sub: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  isMfaEnabled: boolean;
  mfaEnabled: boolean;
  profileId?: string;
  gdcNumber?: string;
  roleTitle?: string;
}

interface AuthState {
  // Access token — in memory only (15-min lifetime, never persisted)
  accessToken: string | null;
  user: AuthUser | null;
  // true while SecureStore / token hydration is in progress at app start
  isHydrating: boolean;
  // true when the user has passed the biometric gate this session
  biometricUnlocked: boolean;

  // Actions
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setHydrating: (hydrating: boolean) => void;
  setBiometricUnlocked: (unlocked: boolean) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

// The fake signed-in patient exists only for screenshot builds made with
// EXPO_PUBLIC_DEMO_LOGIN=true (see scripts/capture.sh). Any other build ignores
// ?demo=patient and the pav_demo_patient flag.
const demoLoginEnabled = process.env.EXPO_PUBLIC_DEMO_LOGIN === "true";

const getInitialUser = (): { token: string | null; user: AuthUser | null; isHydrating: boolean } => {
  if (demoLoginEnabled && typeof window !== "undefined") {
    try {
      if (window.location?.search?.includes("demo=patient") || window.localStorage?.getItem("pav_demo_patient") === "true") {
        return {
          token: "mock-patient-token",
          user: {
            id: "usr_patient_demo",
            sub: "usr_patient_demo",
            email: "patient@example.test",
            firstName: "Alex",
            lastName: "Morgan",
            role: "patient",
            emailVerified: true,
            phoneVerified: true,
            isMfaEnabled: false,
            mfaEnabled: false,
          },
          isHydrating: false,
        };
      }
    } catch {
      // Storage unavailable or non-browser context
    }
  }
  return { token: null, user: null, isHydrating: true };
};

const initialAuth = getInitialUser();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: initialAuth.token,
  user: initialAuth.user,
  isHydrating: initialAuth.isHydrating,
  biometricUnlocked: Boolean(initialAuth.token),

  setAuth: (token, user) =>
    set({ accessToken: token, user, isHydrating: false }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      biometricUnlocked: false,
      isHydrating: false,
    }),

  setHydrating: (isHydrating) => set({ isHydrating }),

  setBiometricUnlocked: (biometricUnlocked) => set({ biometricUnlocked }),

  updateUser: (patch) =>
    set((state) =>
      state.user ? { user: { ...state.user, ...patch } } : state
    ),
}));

// ─── Derived selectors ────────────────────────────────────────────────────────
export const useIsAuthenticated = () =>
  useAuthStore((s) => !!s.accessToken && !!s.user);

export const useCurrentUser = () => useAuthStore((s) => s.user);

export const useUserRole = () => useAuthStore((s) => s.user?.role ?? null);

export const useAccessToken = () => useAuthStore((s) => s.accessToken);

