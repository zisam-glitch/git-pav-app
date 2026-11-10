import { Stack } from "expo-router";
import { stackScreenOptions } from "@/components";
import { useProtectedScreen } from "@/features/screen-security/screen-security";

export default function RecordsLayout() {
  // D-14: no screenshots or screen recording of medical records.
  useProtectedScreen("patient-records");
  return (
    <Stack
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen name="odontogram" options={{ title: "Dental odontogram", headerShown: false }} />
      <Stack.Screen name="plans" options={{ title: "Treatment plans", headerTitle: "" }} />
      <Stack.Screen name="plans/[id]" options={{ title: "Plan details" }} />
      <Stack.Screen name="prescriptions" options={{ title: "Prescriptions & meds" }} />
      <Stack.Screen name="prescriptions/[id]" options={{ title: "Prescription details" }} />
      <Stack.Screen name="vault" options={{ title: "Documents", headerTitle: "" }} />
      <Stack.Screen name="financing" options={{ title: "Payment plans", headerTitle: "" }} />
      <Stack.Screen name="insights" options={{ title: "Oral health insights", headerTitle: "" }} />
    </Stack>
  );
}

