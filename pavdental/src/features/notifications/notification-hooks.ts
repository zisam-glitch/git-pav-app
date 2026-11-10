import React from "react";
import { reportCaughtError } from "@/lib/caught-errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useIsAuthenticated } from "../auth/auth-store";
import { authFetch, rememberPushToken } from "../auth/auth-api";

// Conditionally import expo-notifications to prevent crash in Expo Go
let Notifications: any;
try {
  Notifications = require("expo-notifications");
} catch (error) {
  console.warn("expo-notifications not available (likely running in Expo Go)");
  Notifications = null;
}

interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  appointmentReminders: boolean;
  appointmentConfirmations: boolean;
  marketingUpdates: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}


interface NotificationHistory {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: any;
  sentAt: Date;
  status: string;
}

// Configure notification permissions
export function useNotificationPermissions() {
  const [permissions, setPermissions] = React.useState<{
    granted: boolean | null;
    canAskAgain: boolean;
  }>({
    granted: null,
    canAskAgain: true,
  });

  const requestPermissions = async () => {
    if (!Notifications) {
      setPermissions({ granted: false, canAskAgain: false });
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissions({
        granted: finalStatus === "granted",
        canAskAgain: existingStatus !== "granted",
      });

      return finalStatus === "granted";
    } catch (error) {
      reportCaughtError(error, "error requesting notification permissions");
      setPermissions({ granted: false, canAskAgain: false });
      return false;
    }
  };

  const checkPermissions = async () => {
    if (!Notifications) {
      return false;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissions({
        granted: status === "granted",
        canAskAgain: status !== "granted",
      });
      return status === "granted";
    } catch (error) {
      reportCaughtError(error, "error checking notification permissions");
      return false;
    }
  };

  return {
    permissions,
    requestPermissions: Notifications ? requestPermissions : undefined,
    checkPermissions: Notifications ? checkPermissions : undefined,
  };
}

// Register push token
export function useRegisterPushToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expoPushToken: string) => {
      const platform = Platform.OS;

      const response = await authFetch("/api/notifications/register-token", {
        method: "POST",
        body: JSON.stringify({ expoPushToken, platform }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to register push token");
      }

      return response.json();
    },
    onSuccess: (_data, expoPushToken) => {
      rememberPushToken(expoPushToken);
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}

// Get notification preferences
// MA-5: Gate on isAuthenticated so guest screens don't fire 401s on every page
export function useNotificationPreferences() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const response = await authFetch("/api/notifications/preferences");

      if (!response.ok) {
        throw new Error("Failed to fetch notification preferences");
      }

      return response.json() as Promise<NotificationPreferences>;
    },
    enabled: isAuthenticated,
  });
}

// Update notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const response = await authFetch("/api/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update notification preferences");
      }

      return response.json() as Promise<NotificationPreferences>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}

// Get notification history
// MA-5: Gate on isAuthenticated so guest screens don't fire 401s on every page
export function useNotificationHistory(limit: number = 20, offset: number = 0) {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: ["notification-history", limit, offset],
    queryFn: async () => {
      const response = await authFetch(
        `/api/notifications/history?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notification history");
      }

      return response.json() as Promise<NotificationHistory[]>;
    },
    enabled: isAuthenticated,
  });
}

interface NotificationResponseLike {
  notification?: { request?: { content?: { data?: unknown } } };
}

/**
 * Calls `onTap` with a notification's data when the person taps it, including
 * the tap that launched the app from closed. Returns a function that stops
 * listening. Does nothing where notifications are not available (Expo Go).
 */
export function listenForNotificationTaps(onTap: (data: unknown) => void): () => void {
  if (!Notifications) return () => {};
  let handledLaunch = false;
  const dataOf = (response: NotificationResponseLike | null | undefined) =>
    response?.notification?.request?.content?.data;
  Notifications.getLastNotificationResponseAsync?.()
    .then((response: NotificationResponseLike | null) => {
      if (response && !handledLaunch) onTap(dataOf(response));
    })
    .catch(() => {});
  const subscription = Notifications.addNotificationResponseReceivedListener((response: NotificationResponseLike) => {
    handledLaunch = true;
    onTap(dataOf(response));
  });
  return () => subscription?.remove?.();
}

// Combined notification management hook
export function useNotificationManager() {
  const permissions = useNotificationPermissions();
  const registerToken = useRegisterPushToken();
  const preferences = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const history = useNotificationHistory();

  const setupNotifications = async () => {
    if (!Notifications) {
      console.warn("Notifications not available in Expo Go");
      return false;
    }

    // Request permissions
    const granted = await permissions.requestPermissions?.();
    if (!granted) {
      console.warn("Notification permissions not granted");
      return false;
    }

    // Get push token with configured EAS projectId (CG-1)
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId ??
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    if (token) {
      await registerToken.mutateAsync(token.data);
    }

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    return true;
  };

  return {
    permissions,
    registerToken,
    preferences,
    updatePreferences,
    history,
    setupNotifications,
  };
}
