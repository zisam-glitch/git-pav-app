import { Stack } from "expo-router";
import { stackScreenOptions } from "@/components";
import { colors } from "@/theme";

export default function ProfileSubLayout() {
  return (
    <Stack
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="personal-info"
        options={{
          title: "Personal information",
        }}
      />
      <Stack.Screen
        name="medical-history"
        options={{
          title: "Medical history",
        }}
      />
      <Stack.Screen
        name="emergency-contact"
        options={{
          title: "Emergency contact",
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: "Security & privacy",
        }}
      />
      <Stack.Screen
        name="sessions"
        options={{
          title: "Active sessions",
        }}
      />
      <Stack.Screen
        name="consent"
        options={{
          title: "Privacy and consent",
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notification preferences",
        }}
      />
      <Stack.Screen
        name="payment-methods"
        options={{
          title: "Payment methods",
        }}
      />
      <Stack.Screen
        name="refer"
        options={{
          title: "Refer a friend",
        }}
      />
      <Stack.Screen
        name="dependants"
        options={{
          title: "Dependants & family",
        }}
      />
      <Stack.Screen
        name="delete-account"
        options={{
          title: "Delete account",
          headerTintColor: colors.danger,
        }}
      />
    </Stack>
  );
}

