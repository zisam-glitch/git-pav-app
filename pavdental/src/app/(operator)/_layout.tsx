import { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { useCurrentUser } from "@/features/auth/auth-store";
import { getMobilePortalPath, isAllowedInPortal } from "@/features/auth/auth-routing";
import { stackScreenOptions } from "@/components";
import { stopShiftBackgroundLocation } from "@/features/van/background-location";
import { useOfflineNotesSync } from "@/features/van/offline-notes";

export default function OperatorLayout() {
  const user = useCurrentUser();
  // MF-05: send visit notes saved offline as soon as the phone is back online.
  useOfflineNotesSync();

  // D-21: signing out ends background location sharing.
  useEffect(() => {
    if (user?.role !== "operator") void stopShiftBackgroundLocation();
  }, [user?.role]);

  if (!isAllowedInPortal(user?.role, "operator")) {
    return <Redirect href={user ? (getMobilePortalPath(user.role) as never) : "/(auth)/welcome"} />;
  }

  return (
    <Stack
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen name="shift" options={{ title: "Van dispatch console", headerTitle: "" }} />
      <Stack.Screen name="operator-settings" options={{ title: "Settings" }} />
      <Stack.Screen name="incoming" options={{ title: "Incoming requests", headerTitle: "" }} />
      <Stack.Screen name="route" options={{ title: "Live van queue", headerTitle: "" }} />
      <Stack.Screen name="van-check-in" options={{ title: "Patient arrival check-in", headerTitle: "" }} />
      <Stack.Screen name="offline-capture" options={{ title: "Clinical note & complete stop", headerTitle: "" }} />
    </Stack>
  );
}
