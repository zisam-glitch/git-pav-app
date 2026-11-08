import { StyleSheet, View } from "react-native";
import { colors, spacing, radius } from "@/theme";
import { ThemedText } from "./themed-text";
import { Button } from "./button";
import { AppIcon, type AppIconName } from "./app-icon";
import { Illustration, type IllustrationName } from "./illustrations";

interface EmptyStateProps {
  /** Short, empathetic heading */
  heading: string;
  /** Optional supporting copy explaining what to do */
  body?: string;
  /** Primary CTA label */
  actionLabel?: string;
  onAction?: () => void;
  /** Icon inside the branded mark, used when there is no illustration */
  icon?: AppIconName;
  /** Spot illustration in place of the icon mark */
  illustration?: IllustrationName;
}

/**
 * EmptyState — never show a blank list.
 * Always explain *why* it is empty and offer the relevant next action.
 * Branded line-art mark echoes the reference's soft blob treatment.
 */
export function EmptyState({
  heading,
  body,
  actionLabel,
  onAction,
  icon = "check",
  illustration,
}: EmptyStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel={`${heading}${body ? `. ${body}` : ""}`}
    >
      {illustration ? (
        <Illustration name={illustration} size={180} />
      ) : (
        <View style={styles.illustration}>
          <AppIcon name={icon} size={36} color={colors.ink} />
        </View>
      )}

      <ThemedText variant="title" style={styles.heading}>
        {heading}
      </ThemedText>

      {body ? (
        <ThemedText variant="subhead" style={styles.body}>
          {body}
        </ThemedText>
      ) : null}

      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.secondaryLabel,
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  cta: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  heading: {
    textAlign: "center",
  },
  illustration: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 120,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 120,
  },
});
