import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ThemedText, Illustration } from "@/components";
import { colors, spacing } from "@/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page not found" }} />
      <View style={styles.container}>
        <Illustration name="notFound" size={180} />
        <ThemedText variant="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText variant="body" style={styles.linkText}>
            Return to home screen
          </ThemedText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.lg,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkText: {
    color: colors.ink,
    fontWeight: "600",
  },
});

