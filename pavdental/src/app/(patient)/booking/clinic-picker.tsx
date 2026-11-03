import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, Card, AppIcon, EmptyState, ErrorState, Skeleton, FlowHeader } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useClinics } from "@/features/hooks/use-dental-api";
import { useBookingStore } from "@/features/booking/booking-store";
import { ClinicLocation } from "@/features/booking/booking-types";
import { formatOpeningHours } from "@/features/booking/uk-time";

export default function ClinicPickerScreen() {
  const router = useRouter();
  const { setClinic, service } = useBookingStore();
  const { data: apiClinics, isLoading, isError, refetch } = useClinics();

  const clinics: ClinicLocation[] = (apiClinics ?? []) as ClinicLocation[];

  const handleSelectClinic = (clinic: ClinicLocation) => {
    setClinic(clinic);
    router.push("/(patient)/booking/clinician-picker" as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topNav}>
        <FlowHeader step={{ current: 2, total: 5 }} />
      </View>

      <View style={styles.header}>
        <ThemedText variant="largeTitle" style={styles.title}>
          {service ? `Where for your\n${service.name}?` : "Select a Clinic"}
        </ThemedText>
        <ThemedText variant="subhead" style={styles.sub}>
          All clinics are fully CQC-registered with modern sterilization suites.
        </ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.clinicList}>
          <Skeleton height={96} borderRadius={20} />
          <Skeleton height={96} borderRadius={20} />
        </View>
      ) : isError ? (
        <ErrorState
          message="Could not load clinics. Please try again."
          onRetry={() => refetch()}
        />
      ) : clinics.length === 0 ? (
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
    backgroundColor: colors.background,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
    borderColor: colors.separator,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.label,
    fontWeight: "600",
  },
  sub: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
    fontWeight: "700",
  },
  topNav: {
    marginBottom: spacing.xs,
  },
});
