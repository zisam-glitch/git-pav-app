import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, EmptyState, ErrorState, Skeleton, FlowHeader, ListRow, IconTile } from "@/components";
import { colors, spacing } from "@/theme";
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
        <FlowHeader step={{ current: 2, total: 5 }} />
      </View>

      <View style={styles.header}>
        <ThemedText variant="largeTitle" style={styles.title}>
          {service ? `Where for your\n${service.name}?` : "Select a clinic"}
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
            <ListRow
              key={clinic.id}
              inset="flush"
              title={clinic.name}
              subtitle={`${clinic.address}, ${clinic.postcode}\n${clinic.openingHours ? formatOpeningHours(clinic.openingHours) : clinic.operatingHours}`}
              left={<IconTile icon="mapPin" />}
              chevron
              onPress={() => handleSelectClinic(clinic)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  clinicList: {
    gap: spacing.xxs,
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
