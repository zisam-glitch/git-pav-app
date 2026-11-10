import React from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { ThemedText, Card, ListRow, IconTile } from "@/components";
import { colors, spacing } from "@/theme";
import { usePracticeHours } from "@/features/hooks/use-dental-api";
import { helpActions, IF_THE_APP_FAILS } from "@/features/help/help-content";

const ICONS = { call: "phone", email: "mail", urgent: "heart", emergency: "alert" } as const;

export default function HelpScreen() {
  const { hoursText } = usePracticeHours();
  const actions = helpActions(hoursText);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card padding="none">
          {actions.map((a) => (
            <ListRow
              key={a.id}
              title={a.title}
              subtitle={a.detail}
              left={<IconTile icon={ICONS[a.id] as never} />}
              chevron
              onPress={() => Linking.openURL(a.url).catch(() => {})}
              accessibilityLabel={`${a.title}. ${a.detail}`}
            />
          ))}
        </Card>
        <ThemedText variant="caption" style={styles.note}>
          {IF_THE_APP_FAILS}
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.md, padding: spacing.gutter },
  note: { color: colors.secondaryLabel, lineHeight: 18 },
});
