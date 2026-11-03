import { router } from "expo-router";
import { DefaultTheme, type Theme } from "expo-router/react-navigation";
import { colors, type } from "@/theme";
import { IconButton } from "./icon-button";

// ─── Navigation chrome shared by every stack ──────────────────────────────────
// Wise nav bar: white canvas, no hairline, centred 16pt semibold title,
// round grey back button on the left.

/** React Navigation theme — makes every screen and header sit on the canvas. */
export const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.ink,
    background: colors.background,
    card: colors.background,
    text: colors.label,
    border: "transparent",
    notification: colors.info,
  },
};

/** Round grey back button used in place of the platform chevron. */
export function HeaderBackButton({ onPress }: { onPress?: () => void }) {
  return (
    <IconButton
      icon="arrowLeft"
      label="Go back"
      variant="soft"
      onPress={onPress ?? (() => router.back())}
    />
  );
}

/** Screen options for every header-showing Stack in the app. */
export const stackScreenOptions = {
  headerShown: true,
  headerTitleAlign: "center" as const,
  headerShadowVisible: false,
  headerBackVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { ...type.headline, color: colors.label },
  headerTintColor: colors.ink,
  contentStyle: { backgroundColor: colors.background },
  headerLeft: ({ canGoBack }: { canGoBack?: boolean }) =>
    canGoBack ? <HeaderBackButton /> : null,
};
