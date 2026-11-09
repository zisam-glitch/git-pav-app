import { create } from 'zustand';
import { reportCaughtError } from "@/lib/caught-errors";
import { tokenStore } from '@/lib/token-store';
import { useAuthStore } from '@/features/auth/auth-store';

let localAuthModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- loaded lazily so this file also runs in the Node tests
  localAuthModule = require('expo-local-authentication');
} catch {
  // Not available on this platform.
}

export function setLocalAuthModuleForTesting(mock: any) {
  localAuthModule = mock;
}

export function getLocalAuthModule() {
  return localAuthModule;
}

interface AppLockState {
  isLocked: boolean;
  backgroundedAt: number | null;
  lockTimeoutMs: number; // Time in background before lock is required
  requiresBiometric: boolean;

  lock: () => void;
  unlock: () => Promise<boolean>;
  setRequiresBiometric: (enabled: boolean) => void;
  hydrateBiometricPreference: () => Promise<void>;
  checkLockRequired: () => boolean;
  setBackgrounded: () => void;
  setForegrounded: () => void;
}

export const useAppLockStore = create<AppLockState>((set, get) => ({
  isLocked: false,
  backgroundedAt: null,
  lockTimeoutMs: 60 * 1000, // 1 minute default
  requiresBiometric: false,

  lock: () => {
    set({ isLocked: true });
    useAuthStore.getState().setBiometricUnlocked(false);
  },

  setRequiresBiometric: (enabled: boolean) => {
    set({ requiresBiometric: enabled, isLocked: enabled ? get().isLocked : false });
  },

  hydrateBiometricPreference: async () => {
    try {
      const enabled = await tokenStore.getBiometricEnabled();
      set({
        requiresBiometric: enabled,
        // MA-3: When biometric lock is enabled, start locked on hydrate (cold start)
        isLocked: enabled ? true : false,
      });
      if (enabled) {
        useAuthStore.getState().setBiometricUnlocked(false);
      } else {
        useAuthStore.getState().setBiometricUnlocked(true);
      }
    } catch {
      set({ requiresBiometric: false, isLocked: false });
    }
  },

  unlock: async () => {
    try {
      // MA-3: Do NOT auto-unlock if device has no biometrics enrolled or lacks hardware.
      // Always prompt authenticateAsync which uses device passcode fallback (disableDeviceFallback: false).
      if (!localAuthModule?.authenticateAsync) {
        return false;
      }

      const result = await localAuthModule.authenticateAsync({
        promptMessage: 'Authenticate to access your health data',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        set({ isLocked: false });
        useAuthStore.getState().setBiometricUnlocked(true);
        return true;
      }

      return false;
    } catch (error) {
      reportCaughtError(error, "app lock authentication error");
      return false;
    }
  },

  checkLockRequired: () => {
    const { backgroundedAt, lockTimeoutMs, requiresBiometric } = get();
    if (!requiresBiometric || !backgroundedAt) return false;
    const timeInBackground = Date.now() - backgroundedAt;
    return timeInBackground > lockTimeoutMs;
  },

  setBackgrounded: () => set({ backgroundedAt: Date.now() }),

  setForegrounded: () => {
    const { backgroundedAt, lockTimeoutMs, requiresBiometric } = get();

    // If biometric lock is enabled and app was backgrounded longer than timeout, lock
    if (requiresBiometric && backgroundedAt) {
      const timeInBackground = Date.now() - backgroundedAt;
      if (timeInBackground > lockTimeoutMs) {
        set({ isLocked: true });
        useAuthStore.getState().setBiometricUnlocked(false);
      }
    }

    set({ backgroundedAt: null });
  },
}));

// Hydrate stored biometric preference on module load
useAppLockStore.getState().hydrateBiometricPreference().catch(() => {});
