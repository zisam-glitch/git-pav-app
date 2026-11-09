import { Stack } from "expo-router";
import { stackScreenOptions } from "@/components";

export default function VideoLayout() {
  return (
    <Stack
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen name="intake" options={{ title: "Dental triage", headerTitle: "" }} />
      <Stack.Screen name="photos" options={{ title: "Photos of your teeth" }} />
      <Stack.Screen name="photo-review" options={{ title: "Review photos", headerTitle: "" }} />
      <Stack.Screen name="device-check" options={{ title: "Before your call" }} />
      <Stack.Screen name="waiting" options={{ title: "Waiting room", headerShown: false }} />
      <Stack.Screen name="call" options={{ headerShown: false }} />
      <Stack.Screen name="summary" options={{ title: "Consultation summary", headerShown: false }} />
    </Stack>
  );
}

