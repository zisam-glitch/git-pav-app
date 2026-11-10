import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText, AppIcon, ErrorState, Skeleton } from "@/components";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useNotificationPermissions,
} from "@/features/notifications/notification-hooks";
import { colors, spacing, type } from "@/theme";

export default function NotificationsScreen() {
  const { data: prefs, isLoading, isError, refetch } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const { requestPermissions, permissions } = useNotificationPermissions();

  // Local state initialized with prefs
  const [pushEnabled, setPushEnabled] = useState(prefs?.pushEnabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState(prefs?.emailEnabled ?? true);
  const [smsEnabled, setSmsEnabled] = useState(prefs?.smsEnabled ?? true);
  const [appointmentReminders, setAppointmentReminders] = useState(prefs?.appointmentReminders ?? true);
  const [appointmentConfirmations, setAppointmentConfirmations] = useState(prefs?.appointmentConfirmations ?? true);
  const [marketingUpdates, setMarketingUpdates] = useState(prefs?.marketingUpdates ?? false);

  useEffect(() => {
    if (!prefs) return;
    if (typeof prefs.pushEnabled === "boolean") setPushEnabled(prefs.pushEnabled);
    if (typeof prefs.emailEnabled === "boolean") setEmailEnabled(prefs.emailEnabled);
    if (typeof prefs.smsEnabled === "boolean") setSmsEnabled(prefs.smsEnabled);
    if (typeof prefs.appointmentReminders === "boolean") {
      setAppointmentReminders(prefs.appointmentReminders);
    }
    if (typeof prefs.appointmentConfirmations === "boolean") {
      setAppointmentConfirmations(prefs.appointmentConfirmations);
    }
    if (typeof prefs.marketingUpdates === "boolean") {
      setMarketingUpdates(prefs.marketingUpdates);
    }
  }, [prefs]);

  const handleTogglePush = async (value: boolean) => {
    if (value && !permissions.granted) {
      const granted = await requestPermissions?.();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notification permissions for Pav Dental in your device settings."
        );
        return;
      }
    }
    setPushEnabled(value);
    savePreference({ pushEnabled: value });
  };

  const handleTogglePushStub = (_value: boolean) => {
    // No-op for disabled toggle
  };

  // Disable push toggle if notifications are not available (Expo Go)
  const isPushAvailable = requestPermissions !== undefined;

  const savePreference = (updated: Record<string, boolean>) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // optional
    }
    updatePrefs.mutate({
      pushEnabled,
      emailEnabled,
      smsEnabled,
      appointmentReminders,
      appointmentConfirmations,
      marketingUpdates,
      ...updated,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={76} />
          <Skeleton height={76} />
        </View>
      </View>
    );
  }

  if (isError && prefs === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="We couldn't load your notification settings. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Channels */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Delivery channels
        </ThemedText>

        <ToggleSwitch
          label="Push notifications"
          description={!isPushAvailable ? "Not available in Expo Go - requires development build" : "Instant alerts for booking changes and arrival updates"}
          value={pushEnabled}
          onValueChange={isPushAvailable ? handleTogglePush : handleTogglePushStub}
          disabled={!isPushAvailable}
          icon={<AppIcon name="smartphone" size={18} color={colors.label} />}
        />

        <ToggleSwitch
          label="Email notifications"
          description="Booking confirmations, changes and reminders"
          value={emailEnabled}
          onValueChange={(val) => {
            setEmailEnabled(val);
            savePreference({ emailEnabled: val });
          }}
          icon={<AppIcon name="mail" size={18} color={colors.label} />}
        />

        {/* No SMS switch until text messages are built: a switch that does nothing is not shown. */}
      </View>

      {/* Appointment & Clinical Alerts */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Appointments & clinical
        </ThemedText>

        <ToggleSwitch
          label="Appointment reminders"
          description="Receive notifications 24 hours and 2 hours before your slot"
          value={appointmentReminders}
          onValueChange={(val) => {
            setAppointmentReminders(val);
            savePreference({ appointmentReminders: val });
          }}
          icon={<AppIcon name="clock" size={18} color={colors.label} />}
        />

        <ToggleSwitch
          label="Appointment confirmations"
          description="Immediate confirmations when new bookings or deposits succeed"
          value={appointmentConfirmations}
          onValueChange={(val) => {
            setAppointmentConfirmations(val);
            savePreference({ appointmentConfirmations: val });
          }}
          icon={<AppIcon name="calendarCheck" size={18} color={colors.label} />}
        />
      </View>

      {/* Preferences & Marketing */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Marketing & updates
        </ThemedText>

        <ToggleSwitch
          label="Oral health tips & promotions"
          description="Occasional updates on dental hygiene products & whitening"
          value={marketingUpdates}
          onValueChange={(val) => {
            setMarketingUpdates(val);
            savePreference({ marketingUpdates: val });
          }}
          icon={<AppIcon name="sparkle" size={18} color={colors.label} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...type.overline,
  },
});

