import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Card, Button, AppIcon, ChipPill } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useClinicians } from "@/features/hooks/use-dental-api";
import { useBookingStore } from "@/features/booking/booking-store";
import { Clinician } from "@/features/booking/booking-types";

// ─── Clinician profile ────────────────────────────────────────────────────────
// Photo, role, GDC number, bio and specialisms, all edited by staff on the
// dashboard's Dentist profiles page. No star rating or reviews: the practice
// doesn't collect them (D-04). Reached from the clinician picker; "Book
// with…" hands the clinician to the draft.

export default function ProviderProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const setClinician = useBookingStore((s) => s.setClinician);

  const { data: apiClinicians } = useClinicians();
  const clinicians = (apiClinicians ?? []) as Clinician[];
  const clinician = (id ? clinicians.find((c) => c.id === id) : clinicians[0]) ?? null;

  if (!clinician) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText variant="body" style={styles.muted}>
          Practitioner details are unavailable right now.
        </ThemedText>
      </View>
    );
  }

  const shortName = clinician.fullName.replace(/^Dr\.?\s+/i, "");

  const handleBook = () => {
    setClinician(clinician);
    router.push("/(patient)/booking/slot-picker");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: clinician.fullName,
          headerTitleStyle: { color: colors.label, fontWeight: "700" },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Identity */}
        <View style={styles.identity}>
          {clinician.photoUrl ? (
            <Image
              source={{ uri: clinician.photoUrl }}
              style={styles.avatar}
              accessibilityLabel={`Photo of ${clinician.fullName}`}
            />
          ) : (
            <View style={styles.avatar}>
              <ThemedText variant="title" style={styles.avatarText}>
                {shortName.charAt(0)}
              </ThemedText>
            </View>
          )}
          <View style={styles.identityInfo}>
            <ThemedText variant="title">{clinician.fullName}</ThemedText>
            <ThemedText variant="caption" style={styles.muted}>
              {clinician.roleTitle} · GDC {clinician.gdcNumber}
            </ThemedText>
          </View>
        </View>

        {/* Bio */}
        {clinician.bio || clinician.specialisms.length > 0 ? (
          <Card style={styles.card}>
            <ThemedText variant="overline">About</ThemedText>
            {clinician.bio ? (
              <ThemedText variant="body" style={styles.bioText}>
                {clinician.bio}
              </ThemedText>
            ) : null}
            {clinician.specialisms.length > 0 ? (
              <View style={styles.chipWrap}>
                {clinician.specialisms.map((spec) => (
                  <ChipPill key={spec} label={spec} />
                ))}
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* Payment (D-07) */}
        <Card elevation="flat" style={styles.card}>
          <View style={styles.paymentRow}>
            <AppIcon name="creditCard" size={16} color={colors.ink} />
            <ThemedText variant="body" style={styles.paymentText}>
              Paying for your visit
            </ThemedText>
          </View>
          <ThemedText variant="caption" style={styles.muted}>
            Some treatments need a deposit when you book. You pay the rest at your visit.
          </ThemedText>
        </Card>
      </ScrollView>

      {/* Sticky book CTA */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button title={`Book with ${shortName}`} size="lg" onPress={handleBook} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: colors.ink,
    fontWeight: "700",
  },
  bioText: {
    color: colors.label,
    lineHeight: 22,
  },
  card: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
    marginTop: spacing.xxs,
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
  footerBar: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  identity: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  identityInfo: {
    flex: 1,
    gap: 2,
  },
  muted: {
    color: colors.secondaryLabel,
  },
  paymentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  paymentText: {
    color: colors.label,
    fontWeight: "600",
  },
});
