import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { DefaultTheme, type Theme } from "expo-router/react-navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";
import { IconButton } from "./icon-button";
import { ThemedText } from "./themed-text";

// ─── Navigation chrome shared by every stack ──────────────────────────────────
// Wise nav bar: white canvas, no hairline, round grey back button on the
// left and, when the screen has one, a centred 16pt semibold title. A root
// screen with no title and nothing to go back to gets no bar at all, only the
// status-bar inset (it used to show an empty band).

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

type HeaderProps = {
  options: { headerTitle?: unknown; title?: string };
  navigation: { goBack: () => void; canGoBack: () => boolean };
};

function AppHeader({ options, navigation }: HeaderProps) {
  const insets = useSafeAreaInsets();
  // canGoBack() also looks at parent stacks, so the first screen of a nested
  // stack (booking, records) keeps its back button.
  const back = navigation.canGoBack();
  // headerTitle: "" hides the title (screens with their own large title).
  const title =
    typeof options.headerTitle === "string" ? options.headerTitle : options.headerTitle == null ? options.title : "";
  if (!back && !title) return <View style={{ height: insets.top, backgroundColor: colors.background }} />;
  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.side}>{back ? <HeaderBackButton onPress={() => navigation.goBack()} /> : null}</View>
      <ThemedText variant="headline" style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title ?? ""}
      </ThemedText>
      <View style={styles.side} />
    </View>
  );
}

/** Screen options for every header-showing Stack in the app. */
export const stackScreenOptions = {
  headerShown: true,
  contentStyle: { backgroundColor: colors.background },
  header: (props: HeaderProps) => <AppHeader {...props} />,
};

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    backgroundColor: colors.background,
    flexDirection: "row",
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.gutter,
  },
  side: {
    minWidth: 44,
  },
  title: {
    color: colors.label,
    flex: 1,
    textAlign: "center",
  },
});
