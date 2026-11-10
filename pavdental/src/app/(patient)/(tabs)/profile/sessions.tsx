import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText, Button } from "@/components";
import { SessionItem, SessionData } from "@/components/settings/SessionItem";
import {
  useSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllOtherSessionsMutation,
} from "@/features/security/security-hooks";
import { colors, spacing, type } from "@/theme";

export default function SessionsScreen() {
  const { data: sessions = [], isLoading, refetch } = useSessionsQuery();
  const revokeSession = useRevokeSessionMutation();
  const revokeAllOthers = useRevokeAllOtherSessionsMutation();

  const displaySessions: SessionData[] = sessions.map((s, idx) => ({
    ...s,
    isCurrent: s.isCurrent ?? idx === 0,
  }));

  const hasOtherSessions = displaySessions.filter((s) => !s.isCurrent).length > 0;

  const handleRevokeSingle = (sessionId: string) => {
    Alert.alert(
      "Revoke Session?",
      "The selected device will be immediately signed out and must log in again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              await revokeSession.mutateAsync(sessionId);
              try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch {
                // optional
              }
              refetch();
            } catch {
              Alert.alert("Error", "Could not revoke session.");
            }
          },
        },
      ]
    );
  };

  const handleRevokeAllOthers = () => {
    Alert.alert(
      "Sign Out All Other Devices?",
      "This will revoke all active login tokens except for this current device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out Other Devices",
          style: "destructive",
          onPress: async () => {
            try {
              await revokeAllOthers.mutateAsync(displaySessions);
              try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch {
                // optional
              }
              Alert.alert("Success", "All other active sessions have been signed out.");
              refetch();
            } catch {
              Alert.alert("Error", "Could not sign out other devices.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <ThemedText variant="subhead" style={styles.headerSub}>
          Devices signed in
        </ThemedText>
        <ThemedText variant="caption" style={styles.headerDesc}>
          These are devices and browsers that currently have an active refresh session to your Pav Dental health record.
        </ThemedText>
      </View>

      <View style={styles.sessionList}>
        {displaySessions.length === 0 ? (
          <ThemedText variant="caption" style={styles.headerDesc}>
            No active device sessions found.
          </ThemedText>
        ) : (
          displaySessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              onRevoke={handleRevokeSingle}
              isRevoking={revokeSession.isPending}
            />
          ))
        )}
      </View>

      {hasOtherSessions && (
        <View style={styles.actionWrap}>
          <Button
            title={revokeAllOthers.isPending ? "Signing out others..." : "Sign out all other devices"}
            variant="destructive"
            onPress={handleRevokeAllOthers}
            disabled={revokeAllOthers.isPending}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionWrap: {
    marginTop: spacing.md,
  },
  centerContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerBox: {
    gap: spacing.xs,
  },
  headerDesc: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  headerSub: {
    ...type.overline,
  },
  sessionList: {
    gap: spacing.sm,
  },
});

