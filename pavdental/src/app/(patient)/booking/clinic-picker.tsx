import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, Card, AppIcon, EmptyState, ErrorState, Skeleton, ProgressPills, IconButton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useClinics } from "@/features/hooks/use-dental-api";
import { useBookingStore } from "@/features/booking/booking-store";
import { ClinicLocation } from "@/features/booking/booking-types";
import { formatOpeningHours } from "@/features/booking/uk-time";
import { useIsOnline } from "@/lib/network";
import { resolveQueryState } from "@/lib/query-state-resolver";

export default function ClinicPickerScreen() {
  const router = useRouter();
  const { setClinic, service } = useBookingStore();
  const { data: apiClinics, isLoading, isError, refetch } = useClinics();

  const isOnline = useIsOnline();
  const clinics: ClinicLocation[] = (apiClinics ?? []) as ClinicLocation[];
  // Offline, the query is paused (no error, no data): that is a failure, not "no clinics".
  const view = resolveQueryState({ isOnline, isLoading, isError, data: apiClinics });

  const handleSelectClinic = (clinic: ClinicLocation) => {
    setClinic(clinic);
    router.push("/(patient)/booking/clinician-picker" as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topNav}>
        <IconButton
          icon="arrowLeft"
          label="Go back"
          variant="soft"
          size={22}
          onPress={() => router.back()}
        />
        <View style={styles.progressWrap}>
          <ProgressPills total={5} current={2} />
        </View>
      </View>

      <View style={styles.header}>
        <ThemedText variant="largeTitle" style={styles.title}>
          {service ? `Where for your\n${service.name}?` : "Select a Clinic"}
        </ThemedText>
        <ThemedText variant="subhead" style={styles.sub}>
          All clinics are fully CQC-registered with modern sterilization suites.
        </ThemedText>
      </View>

      {view === "loading" ? (
        <View style={styles.clinicList}>
          <Skeleton height={96} borderRadius={20} />
          <Skeleton height={96} borderRadius={20} />
        </View>
      ) : view === "error" || view === "offline" ? (
        <ErrorState
          message={
            view === "offline"
              ? "You appear to be offline. Check your connection and try again."
              : "Could not load clinics. Please try again."
          }
          onRetry={() => refetch()}
        />
      ) : view === "empty" ? (
        <EmptyState
          heading="No clinics available"
          body="Practice locations will appear here once configured."
          icon="mapPin"
        />
      ) : (
        <View style={styles.clinicList}>
          {clinics.map((clinic) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={clinic.name}
              key={clinic.id}
              onPress={() => handleSelectClinic(clinic)}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <Card style={styles.card}>
                <View style={styles.iconBox}>
                  <AppIcon name="mapPin" size={20} color={colors.ink} />
                </View>
                <View style={styles.info}>
                  <ThemedText variant="headline" style={styles.name}>
                    {clinic.name}
                  </ThemedText>
                  <ThemedText variant="subhead" style={styles.address}>
                    {clinic.address}, {clinic.postcode}
                  </ThemedText>
                  <View style={styles.hoursRow}>
                    <AppIcon name="clock" size={13} color={colors.secondaryLabel} />
                    <ThemedText variant="caption" style={styles.hours}>
                      {clinic.openingHours ? formatOpeningHours(clinic.openingHours) : clinic.operatingHours}
                    </ThemedText>
                  </View>
                </View>
                <AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  address: {
    color: colors.secondaryLabel,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    borderColor: colors.separator,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  clinicList: {
    gap: spacing.md,
  },
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
  header: {
    gap: spacing.xxs,
    marginBottom: spacing.xs,
  },
  hoursRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  hours: {
    color: colors.secondaryLabel,
    flex: 1,
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.lg,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.label,
    fontWeight: "600",
  },
  progressWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  sub: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
    fontWeight: "700",
  },
  topNav: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
});
