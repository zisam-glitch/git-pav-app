import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Input, Button, Badge, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useCurrentUser } from "@/features/auth/auth-store";
import { flushOfflineNotes, queueOfflineNote, sendVisitNote } from "@/features/van/offline-notes";

export default function OfflineCaptureScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const params = useLocalSearchParams<{
    stopId?: string;
    patientName?: string;
    procedure?: string;
  }>();

  const patientName = params.patientName || "this patient";
  const clinicianName = currentUser?.firstName
    ? `Dr. ${currentUser.firstName} ${currentUser.lastName}`
    : "Clinician";

  const [clinicalNotes, setClinicalNotes] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);

  const refreshQueued = useCallback(async () => {
    setQueuedCount(await flushOfflineNotes());
  }, []);

  useEffect(() => {
    void refreshQueued();
  }, [refreshQueued]);

  const handleSaveAndSync = async () => {
    if (!clinicalNotes.trim()) {
      Alert.alert("Missing Notes", "Please enter clinical notes before completing the visit.");
      return;
    }

    if (!params.stopId) {
      Alert.alert("Missing Stop ID", "Cannot complete visit without a valid stop ID.");
      return;
    }

    setIsSyncing(true);
    const notes = clinicalNotes.trim();
    let res: Response | null = null;
    try {
      res = await sendVisitNote({ stopId: params.stopId, notes });
    } catch {
      // No connection: queued below.
    }
    try {
      if (res?.ok) {
        void refreshQueued();
        setIsSavedOffline(true);
        router.replace("/(operator)/route" as any);
        return;
      }
      // The server answered but refused (for example the visit was already
      // completed or cancelled): say so instead of queueing it.
      if (res && res.status >= 400 && res.status < 500 && res.status !== 401 && res.status !== 408 && res.status !== 429) {
        const err = await res.json().catch(() => ({}));
        Alert.alert(
          "Couldn't complete the visit",
          (err as any).message || (err as any).error || "The visit couldn't be completed. Check the stop and try again."
        );
        return;
      }
      if (!currentUser) return;
      const count = await queueOfflineNote({
        stopId: params.stopId,
        notes,
        queuedAt: new Date().toISOString(),
        userId: currentUser.id,
      });
      setQueuedCount(count);
      setIsSavedOffline(true);
      Alert.alert(
        "Saved on this phone",
        "We couldn't reach the server. Your note is stored securely on this phone and will be sent automatically when you're back online.",
        [{ text: "OK", onPress: () => router.replace("/(operator)/route" as any) }]
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Offline Sync Status Banner */}
        <View style={styles.syncBanner}>
          <View style={styles.syncLeft}>
            <View style={styles.onlineDot} />
            <ThemedText variant="caption" style={styles.syncText}>
              {queuedCount > 0
                ? `${queuedCount} ${queuedCount === 1 ? "note" : "notes"} waiting to send · sends when you're online`
                : "Notes are sent as soon as you save them"}
            </ThemedText>
          </View>
          <Badge
            label={queuedCount > 0 ? `${queuedCount} waiting` : "All sent"}
            variant={queuedCount > 0 ? "warning" : "success"}
          />
        </View>

        <View style={styles.header}>
          <ThemedText variant="largeTitle" style={styles.title}>
            Clinical note & discharge
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            Logged by {clinicianName} for {patientName}.
          </ThemedText>
        </View>

        {/* Clinical Note Capture */}
        <Input
          label="Clinical consultation & treatment notes"
          multiline
          numberOfLines={6}
          placeholder="Enter examination findings, procedures performed, and any recommendations..."
          value={clinicalNotes}
          onChangeText={setClinicalNotes}
          containerStyle={styles.notesContainer}
        />


        {isSavedOffline ? (
          <View style={styles.successBanner}>
            <AppIcon name="checkCircle" size={16} color={colors.success} />
            <ThemedText variant="caption" style={styles.successText}>
              Note saved. Returning to your route…
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={isSyncing ? "Saving..." : "Save note & complete visit"}
          size="lg"
          loading={isSyncing}
          onPress={handleSaveAndSync}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  header: {
    gap: spacing.xxs,
  },
  notesContainer: {
    minHeight: 140,
  },
  onlineDot: {
    backgroundColor: colors.success,
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  successBanner: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: colors.successSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  successText: {
    color: colors.success,
    fontWeight: "600",
  },
  syncBanner: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.sm,
  },
  syncLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  syncText: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
});

