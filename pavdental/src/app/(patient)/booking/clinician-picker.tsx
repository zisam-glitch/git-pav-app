import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, Card, Badge, AppIcon, FlowHeader, QueryState } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useBookingStore } from "@/features/booking/booking-store";
import { Clinician } from "@/features/booking/booking-types";
import { useClinicians } from "@/features/hooks/use-dental-api";

export default function ClinicianPickerScreen() {
  const router = useRouter();
  const { setClinician, channel } = useBookingStore();

  const { data: apiClinicians, isLoading, isError, refetch } = useClinicians(channel ?? undefined);
  const clinicians: Clinician[] = apiClinicians ?? [];

  const handleSelectClinician = (clinician: Clinician | null) => {
    setClinician(clinician);
    router.push("/(patient)/booking/slot-picker" as any);
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topNav}>
        <FlowHeader step={{ current: 3, total: 5 }} />
      </View>

      <View style={styles.header}>
        <ThemedText variant="largeTitle" style={styles.title}>
          Select a practitioner
        </ThemedText>
        <ThemedText variant="subhead" style={styles.sub}>
          Or choose 'First Available' for the earliest appointment slot.
        </ThemedText>
      </View>

      {/* First Available Option */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Any available clinician"
        onPress={() => handleSelectClinician(null)}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <Card style={styles.anyCard}>
          <View style={styles.anyIcon}>
            <AppIcon name="zap" size={20} color={colors.ink} />
          </View>
          <View style={styles.anyInfo}>
            <ThemedText variant="headline" style={styles.anyTitle}>
              Any practitioner (first available)
            </ThemedText>
            <ThemedText variant="caption" style={styles.anySub}>
              Recommended for urgent care or fastest booking dates.
            </ThemedText>
          </View>
          <AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />
        </Card>
      </Pressable>

      {/* Clinicians List */}
      <QueryState
        isLoading={isLoading}
        isError={isError}
        // Everyone is listed; the time picker then offers only the times they
        // work at the chosen clinic (slots come from each clinician's rota).
        data={apiClinicians === undefined ? undefined : clinicians}
        onRetry={() => refetch()}
        errorMessage="We couldn't load the clinicians. You can still choose Any Practitioner above, or try again."
        emptyHeading="No specific clinicians listed"
        emptyBody="Choose 'Any Practitioner (First Available)' above to see open slots."
        emptyIcon="profile"
      >
        {(list) => (
          <View style={styles.clinicianList}>
            {list.map((doc) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={doc.fullName}
                key={doc.id}
                onPress={() => handleSelectClinician(doc)}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <Card style={styles.card}>
                  <View style={styles.docRow}>
                    {doc.photoUrl ? (
                      <Image source={{ uri: doc.photoUrl }} style={styles.avatar} accessibilityIgnoresInvertColors />
                    ) : (
                      <View style={styles.avatar}>
                        <ThemedText variant="headline" style={styles.avatarText}>
                          {doc.fullName.replace(/^Dr\.?\s+/i, "").charAt(0) || "D"}
                        </ThemedText>
                      </View>
                    )}
                    <View style={styles.docInfo}>
                      <ThemedText variant="headline" style={styles.name}>
                        {doc.fullName}
                      </ThemedText>
                      <ThemedText variant="caption" style={styles.role}>
                        {doc.roleTitle} · GDC {doc.gdcNumber}
                      </ThemedText>
                      {doc.bio ? (
                        <ThemedText variant="caption" style={styles.bio} numberOfLines={2}>
                          {doc.bio}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.specialismsRow}>
                    {(doc.specialisms || []).map((spec) => (
                      <Badge key={spec} label={spec} variant="default" />
                    ))}
                  </View>

                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`View full profile for ${doc.fullName}`}
                    onPress={() =>
                      router.push({
                        pathname: "/(patient)/booking/provider-profile" as never,
                        params: { id: doc.id },
                      })
                    }
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <View style={styles.profileLink}>
                      <ThemedText variant="caption" style={styles.profileLinkText}>
                        View profile & reviews
                      </ThemedText>
                      <AppIcon name="chevronRight" size={13} color={colors.ink} />
                    </View>
                  </Pressable>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </QueryState>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  anyCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    borderColor: colors.separator,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  anyIcon: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
    borderColor: colors.separator,
    borderWidth: 1,
  },
  anyInfo: {
    flex: 1,
    gap: 2,
  },
  anySub: {
    color: colors.secondaryLabel,
  },
  anyTitle: {
    color: colors.ink,
    fontWeight: "600",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: colors.ink,
    fontWeight: "700",
  },
  bio: {
    color: colors.secondaryLabel,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    borderColor: colors.separator,
    gap: spacing.sm,
    padding: spacing.md,
  },
  clinicianList: {
    gap: spacing.md,
    marginTop: spacing.xs,
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
  docInfo: {
    flex: 1,
    gap: 2,
  },
  docRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  header: {
    gap: spacing.xxs,
    marginBottom: spacing.xs,
  },
  name: {
    color: colors.label,
    fontWeight: "600",
  },
  profileLink: {
    alignItems: "center",
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  profileLinkText: {
    color: colors.ink,
    fontWeight: "600",
  },
  role: {
    color: colors.secondaryLabel,
  },
  specialismsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
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
