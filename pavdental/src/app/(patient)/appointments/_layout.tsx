import { Stack } from "expo-router";
import { stackScreenOptions } from "@/components";

export default function AppointmentsLayout() {
  return (
    <Stack
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen name="[id]" options={{ title: "Appointment details", headerShown: false }} />
      <Stack.Screen name="reschedule" options={{ title: "Choose a new time", headerShown: false }} />
      <Stack.Screen name="cancelled" options={{ title: "Appointment cancelled", headerShown: false }} />
    </Stack>
  );
}
