import { Modal, ScrollView, StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";
import { ThemedText } from "./themed-text";
import { IconButton } from "./icon-button";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** One line under the title */
  subtitle?: string;
  children: React.ReactNode;
  /** Sticky footer, e.g. the sheet's primary button */
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Sheet — Wise page sheet: round close button top left, bold title under it,
 * scrolling white content and an optional sticky footer kept above the home
 * indicator. Use it for forms and option lists; use ConfirmSheet for yes/no.
 */
export function Sheet({ visible, onClose, title, subtitle, children, footer, contentStyle }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="close" label="Close" variant="soft" onPress={onClose} />
          <ThemedText variant="largeTitle" accessibilityRole="header">
            {title}
          </ThemedText>
          {subtitle ? <ThemedText variant="subhead">{subtitle}</ThemedText> : null}
        </View>
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer ? (
          <View style={[styles.footer, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>{footer}</View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.sheet,
    flex: 1,
  },
  header: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
});
