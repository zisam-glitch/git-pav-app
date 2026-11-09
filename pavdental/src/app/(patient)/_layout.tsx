import { Redirect, Stack } from "expo-router";
import { useCurrentUser } from "@/features/auth/auth-store";
import { getMobilePortalPath, isAllowedInPortal } from "@/features/auth/auth-routing";
import { stackScreenOptions } from "@/components";

export default function PatientLayout() {
  const user = useCurrentUser();

  if (!isAllowedInPortal(user?.role, "patient")) {
    return <Redirect href={user ? (getMobilePortalPath(user.role) as never) : "/(auth)/welcome"} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="records" />
      <Stack.Screen name="van" />
      <Stack.Screen name="video" />
      <Stack.Screen name="check-in" options={{ ...stackScreenOptions, title: "Pre-visit check-in", headerTitle: "" }} />
      <Stack.Screen name="perks" />
      <Stack.Screen name="notifications" options={{ ...stackScreenOptions, title: "Notifications", headerTitle: "" }} />
    </Stack>
  );
}
