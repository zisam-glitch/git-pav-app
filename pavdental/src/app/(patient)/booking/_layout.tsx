import { Stack } from "expo-router";
import { stackScreenOptions } from "@/components";

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen name="service-catalog" options={{ title: "Select treatment", headerShown: false }} />
      <Stack.Screen name="clinic-picker" options={{ title: "Choose practice", headerShown: false }} />
      <Stack.Screen name="clinician-picker" options={{ title: "Choose practitioner", headerShown: false }} />
      <Stack.Screen name="provider-profile" options={{ title: "Practitioner profile" }} />
      <Stack.Screen name="slot-picker" options={{ title: "Available times", headerShown: false }} />
      <Stack.Screen name="summary" options={{ title: "Review & deposit", headerShown: false }} />
      <Stack.Screen name="confirmed" options={{ headerShown: false }} />
    </Stack>
  );
}

