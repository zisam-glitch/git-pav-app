import { Redirect, Stack } from "expo-router";
import { useCurrentUser } from "@/features/auth/auth-store";
import { getMobilePortalPath, isAllowedInPortal } from "@/features/auth/auth-routing";
import { stackScreenOptions } from "@/components";
import { useProtectedScreen } from "@/features/screen-security/screen-security";

export default function ClinicianLayout() {
  // D-14: every clinician screen shows patient records.
  useProtectedScreen("clinician");
  const user = useCurrentUser();

  if (!isAllowedInPortal(user?.role, "clinician")) {
    return <Redirect href={user ? (getMobilePortalPath(user.role) as never) : "/(auth)/welcome"} />;
  }

  return (
    <Stack
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen name="schedule" options={{ title: "Clinician daily schedule" }} />
      <Stack.Screen name="clinician-settings" options={{ title: "Settings" }} />
      <Stack.Screen name="inbox" options={{ title: "Clinician messages" }} />
      <Stack.Screen name="consult-room" options={{ headerShown: false }} />
      <Stack.Screen name="rx-dispense" options={{ title: "Private prescription", headerTitle: "" }} />
      <Stack.Screen name="patient-record" options={{ title: "Patient clinical record", headerTitle: "" }} />
      <Stack.Screen name="odontogram-editor" options={{ title: "Odontogram editor", headerTitle: "" }} />
      <Stack.Screen name="treatment-plan-builder" options={{ title: "Treatment plan builder", headerTitle: "" }} />
      <Stack.Screen name="appointment-notes" options={{ title: "Examination notes", headerTitle: "" }} />
    </Stack>
  );
}
