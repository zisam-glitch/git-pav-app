import { Stack, useRouter, useSegments } from "expo-router";
import { useIsAuthenticated, useCurrentUser } from "@/features/auth/auth-store";
import { useEffect } from "react";
import { getMobilePortalPath } from "@/features/auth/auth-routing";

// Redirect authenticated users dynamically to their role portal
export default function AuthLayout() {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isAuthenticated && user) {
      const currentScreen = segments[segments.length - 1];
      const isRegistrationStep =
        currentScreen === "sign-up" ||
        currentScreen === "verify-email" ||
        currentScreen === "account-created";

      if (isRegistrationStep) {
        return;
      }

      // Admins are intentionally excluded from the mobile client. They use the
      // separate web dashboard and must not fall through to patient routes.
      if (user.role !== "admin" || segments.join("/") !== "(auth)/access-denied") {
        router.replace(getMobilePortalPath(user.role) as never);
      }
    }
  }, [isAuthenticated, user, router, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="account-created" />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="reset" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="biometric-unlock" />
      <Stack.Screen name="access-denied" />
    </Stack>
  );
}
