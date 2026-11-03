import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { safeHaptics } from "@/lib/haptics";
import {
  ThemedText,
  Card,
  Button,
  Badge,
  AppIcon,
  ServiceHeroCard,
  EmergencyTriageModal,
  ErrorState,
  IconButton,
  IconTile,
  ListRow,
  SectionHeader,
} from "@/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius } from "@/theme";
import { useCurrentUser } from "@/features/auth/auth-store";
import { fetchActiveVanRequest } from "@/features/van/van-api";
import { useBookingStore } from "@/features/booking/booking-store";
import { bookingChannelFor, firstBookingStep } from "@/features/booking/start-booking";
import { useServices, useRewards, useMyAppointments } from "@/features/hooks/use-dental-api";
import { DentalService } from "@/features/booking/booking-types";
import { formatGbp } from "@/features/booking/booking-api";
import { toLabel } from "@/lib/text";

type CategoryKey = "all" | "checkup" | "hygiene" | "emergency" | "restorative" | "cosmetic";

interface CategoryFilter {
  key: CategoryKey;
  label: string;
}

const CATEGORIES: CategoryFilter[] = [
  { key: "all", label: "All" },
  { key: "checkup", label: "Checkup" },
  { key: "hygiene", label: "Hygiene" },
  { key: "emergency", label: "Emergency" },
  { key: "restorative", label: "Surgery" },
  { key: "cosmetic", label: "Aesthetics" },
];

function getHeroImage(category?: string, name?: string) {
  const lower = `${category || ""} ${name || ""}`.toLowerCase();
  if (lower.includes("implant") || lower.includes("restor") || lower.includes("emerg")) {
    return require("../../../../assets/images/implant.jpg");
  }
  return require("../../../../assets/images/smile-restoration.jpg");
}

export default function PatientHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const { setService, setChannel } = useBookingStore();
  const params = useLocalSearchParams<{ triageModal?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [showBalance, setShowBalance] = useState<boolean>(true);

  // Services, points, and bookings from API
  const { data: apiServices, isError: servicesError, refetch: refetchServices } = useServices();
  const { data: rewards } = useRewards();
  const { data: upcomingAppointments } = useMyAppointments({ scope: "upcoming" });
  const nextAppointment =
    Array.isArray(upcomingAppointments) && upcomingAppointments.length > 0
      ? (upcomingAppointments[0] as any)
      : null;
  const pointsBalance: number | undefined = (rewards as any)?.pointsBalance;

  useEffect(() => {
    if (params.triageModal === "true") {
      setShowEmergencyModal(true);
    }
  }, [params.triageModal]);

  const { data: activeVanRequest } = useQuery({
    queryKey: ["active-van-request"],
    queryFn: fetchActiveVanRequest,
    refetchInterval: 10000,
  });

  const userName = user?.firstName || "Patient";
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayedServices = useMemo(() => {
    const source: DentalService[] = Array.isArray(apiServices) ? (apiServices as DentalService[]) : [];
    if (selectedCategory === "all") return source;
    return source.filter(
      (s) => (s.category || "").toLowerCase() === selectedCategory
    );
  }, [apiServices, selectedCategory]);

  const handleBookService = (srv: DentalService) => {
    setService({
      ...srv,
      id: srv.id,
      name: srv.name,
      pricePence: srv.pricePence,
      depositPence: srv.depositPence ?? Math.round((srv.pricePence || 0) * 0.25),
    });
    const channel = bookingChannelFor(srv);
    setChannel(channel);
    router.push(firstBookingStep(channel) as never);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xs }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top bar: points pill on the left, square icon buttons on the right */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rewards & Perks"
          onPress={() => {
            safeHaptics.impactAsync("light").catch(() => {});
            router.push("/(patient)/perks" as never);
          }}
          style={({ pressed }) => [styles.pointsPill, pressed && styles.pressed]}
        >
          <ThemedText variant="headline" style={styles.pointsText}>
            {typeof pointsBalance === "number" ? `${pointsBalance.toLocaleString("en-GB")} pts` : "Perks"}
          </ThemedText>
        </Pressable>

        <View style={styles.topRightActions}>
          <IconButton
            icon={showBalance ? "eyeOff" : "eye"}
            label={showBalance ? "Hide your name" : "Show your name"}
            variant="soft"
            onPress={() => setShowBalance((prev) => !prev)}
          />
          <View>
            <IconButton
              icon="bell"
              label="Notifications"
              variant="soft"
              onPress={() => router.push("/(patient)/(tabs)/messages" as never)}
            />
            <View style={styles.bellDot} pointerEvents="none" />
          </View>
          <IconButton
            icon="profile"
            label="Profile & settings"
            variant="soft"
            onPress={() => router.push("/(patient)/(tabs)/profile" as never)}
          />
        </View>
      </View>

      {/* Greeting with the hide-details toggle */}
      <View style={styles.titleSection}>
        <ThemedText variant="largeTitle" numberOfLines={2} style={styles.mainTitle}>
          {showBalance ? `${greeting}, ${userName}` : `${greeting}, ••••`}
        </ThemedText>
      </View>

      {/* Next visit — grouped white card with one row */}
      <View style={styles.section}>
        <SectionHeader title={nextAppointment ? "Your next visit" : "Your care"} />
        <Card padding="none">
          <ListRow
            title={
              nextAppointment
                ? nextAppointment.service?.name || "Dental Examination & Polish"
                : "No upcoming visits"
            }
            subtitle={
              nextAppointment
                ? `${new Date(nextAppointment.startTimeUtc).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${nextAppointment.clinic?.name || nextAppointment.van?.name || "Central Practice"}`
                : "Book a clinic visit, video consult, or mobile van in a few taps."
            }
            left={<IconTile icon="calendar" />}
            right={
              <Badge
                label={nextAppointment ? "Confirmed" : "Book"}
                variant={nextAppointment ? "success" : "default"}
              />
            }
            chevron
            onPress={() => {
              if (nextAppointment) {
                router.push({
                  pathname: "/(patient)/appointments/[id]" as never,
                  params: { id: nextAppointment.id },
                });
              } else {
                router.push("/(patient)/booking/service-catalog" as never);
              }
            }}
            accessibilityLabel={
              nextAppointment
                ? `Upcoming appointment for ${nextAppointment.service?.name || "Dental Care"}`
                : "No upcoming visits, tap to book an appointment"
            }
          />
        </Card>
      </View>

      {/* Full-width grey action, like the reference "Add products" button */}
      <Button
        title="Book an appointment"
        variant="secondary"
        icon={<AppIcon name="plus" size={18} color={colors.ink} />}
        onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
        style={styles.quickBookBtn}
      />


      {/* Services Section Header */}
      <View style={styles.section}>
        <SectionHeader title="Treatments" />
      </View>

      {/* Horizontal Category Filter Pills (Reference 1 & 2) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hScroll}
          contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              accessibilityRole="button"
              accessibilityLabel={cat.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => {
                safeHaptics.impactAsync("light").catch(() => {});
                setSelectedCategory(cat.key);
              }}
              style={({ pressed }) => [
                styles.categoryPill,
                isActive ? styles.categoryPillActive : styles.categoryPillInactive,
                pressed && { opacity: 0.8 },
              ]}
            >
              <ThemedText
                variant="subhead"
                style={[
                  styles.categoryText,
                  isActive ? styles.categoryTextActive : styles.categoryTextInactive,
                ]}
              >
                {cat.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Active Van Dispatch banner (if running) */}
      {activeVanRequest && (
        <Card style={styles.dispatchCard}>
          <View style={styles.dispatchHeader}>
            <View style={styles.dispatchTitleRow}>
              <View style={styles.liveDot} />
              <ThemedText variant="headline" style={styles.dispatchTitle}>
                Van Visit {activeVanRequest.phase?.replace("_", " ") || "En Route"}
              </ThemedText>
            </View>
            {activeVanRequest.etaLabel ? (
              <ThemedText variant="mono" style={styles.dispatchEta}>
                {activeVanRequest.etaLabel}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText variant="subhead" style={styles.dispatchSub}>
            {activeVanRequest.service?.name} · {activeVanRequest.accessDetails?.addressLine1}
          </ThemedText>
          <Button
            title="Track live on map"
            variant="secondary"
            size="sm"
            onPress={() =>
              router.push({
                pathname: "/(patient)/van/live-track" as never,
                params: { requestId: activeVanRequest.id },
              })
            }
            style={styles.dispatchCta}
          />
        </Card>
      )}

      {/* Hero Visual Service Cards (Filtered by Category) */}
      {servicesError ? (
        <ErrorState message="We couldn't load our services. Please try again." onRetry={() => refetchServices()} />
      ) : null}
      <View style={styles.serviceStack}>
        {displayedServices.map((srv) => (
          <ServiceHeroCard
            key={srv.id}
            title={srv.name}
            badge={`${toLabel(srv.category || "clinical")} · ${formatGbp(srv.pricePence || 0)}`}
            image={getHeroImage(srv.category, srv.name)}
            actionLabel="Book appointment"
            onPressAction={() => handleBookService(srv)}
            onPressChat={() => router.push("/(patient)/(tabs)/messages" as never)}
            onPressInfo={() => router.push("/(patient)/booking/service-catalog" as never)}
          />
        ))}
      </View>

      {/* Quick Action Tiles: Video Triage & 3D Chart */}
      <View style={styles.quickGrid}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Speak to a dentist via video"
          onPress={() => router.push("/(patient)/booking/service-catalog?channel=video" as never)}
          style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.quickIconWrap}>
            <AppIcon name="video" size={20} color={colors.ink} />
          </View>
          <ThemedText variant="headline" style={styles.quickTitle}>
            Video consult
          </ThemedText>
          <ThemedText variant="caption" style={styles.quickSub}>
            Speak to a dentist by video
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View 3D Clean Progress Chart"
          onPress={() => router.push("/(patient)/records/odontogram" as never)}
          style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.quickIconWrap}>
            <AppIcon name="activity" size={20} color={colors.ink} />
          </View>
          <ThemedText variant="headline" style={styles.quickTitle}>
            Clean progress
          </ThemedText>
          <ThemedText variant="caption" style={styles.quickSub}>
            3D Dental arch & gauges
          </ThemedText>
        </Pressable>

        {/* Van services also offer clinic visits, so the plain catalog books
            them at a clinic: ask for the van explicitly. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Book a dental van visit at your address"
          onPress={() => router.push("/(patient)/booking/service-catalog?channel=van" as never)}
          style={({ pressed }) => [styles.quickTile, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.quickIconWrap}>
            <AppIcon name="truck" size={20} color={colors.ink} />
          </View>
          <ThemedText variant="headline" style={styles.quickTitle}>
            Dental van
          </ThemedText>
          <ThemedText variant="caption" style={styles.quickSub}>
            Treatment at your address
          </ThemedText>
        </Pressable>
      </View>

      {/* Emergency triage card (Frame 6) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Emergency dental triage"
        onPress={() => {
          safeHaptics.impactAsync("medium").catch(() => {});
          setShowEmergencyModal(true);
        }}
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      >
        <Card style={styles.emergencyCard}>
          <View style={styles.emergencyIconWrap}>
            <AppIcon name="alert" size={18} color={colors.danger} />
          </View>
          <View style={styles.emergencyTextWrap}>
            <View style={styles.emergencyHeaderRow}>
              <ThemedText variant="headline" style={styles.emergencyTitle}>
                Severe pain or acute swelling?
              </ThemedText>
            </View>
            <ThemedText variant="caption" style={styles.emergencySub}>
              Answer a few questions to see where to get help and find urgent appointments.
            </ThemedText>
          </View>
        </Card>
      </Pressable>

      {/* Emergency triage modal */}
      <EmergencyTriageModal
        visible={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Horizontal chip rows must not stretch to fill the column (web)
  hScroll: {
    flexGrow: 0,
  },
  pressed: {
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: spacing.gutter,
  },
  topRightActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  pointsPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    flexDirection: "row",
    gap: spacing.xs,
    height: 40,
    paddingHorizontal: spacing.md,
  },
  pointsText: {
    color: colors.onAccent,
  },
  bellDot: {
    backgroundColor: colors.info,
    borderColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 12,
    position: "absolute",
    right: -2,
    top: -2,
    width: 12,
  },
  categoryPill: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryPillActive: {
    backgroundColor: colors.accent,
  },
  categoryPillInactive: {
    backgroundColor: colors.systemBackground,
  },
  categoryScroll: {
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: colors.onAccent,
  },
  categoryTextInactive: {
    color: colors.label,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dispatchCard: {
    backgroundColor: colors.ink,
    gap: spacing.xs,
    marginHorizontal: spacing.gutter,
    padding: spacing.md,
  },
  dispatchCta: {
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  dispatchEta: {
    color: colors.alwaysWhite,
  },
  dispatchHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dispatchSub: {
    color: colors.alwaysWhite,
    opacity: 0.75,
  },
  dispatchTitle: {
    color: colors.alwaysWhite,
  },
  dispatchTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  emergencyCard: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    padding: spacing.md,
  },
  emergencyHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emergencyIconWrap: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  emergencySub: {
    color: colors.danger,
    opacity: 0.85,
  },
  emergencyTextWrap: {
    flex: 1,
    gap: 2,
  },
  emergencyTitle: {
    color: colors.danger,
    fontSize: 14,
  },
  liveDot: {
    backgroundColor: colors.success,
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  mainTitle: {
    flexShrink: 1,
  },
  quickGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  quickIconWrap: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.full,
    height: 38,
    justifyContent: "center",
    width: 38,
    borderColor: colors.separator,
    borderWidth: 1,
  },
  quickSub: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  quickTile: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    flex: 1,
    gap: 4,
    padding: spacing.md,
  },
  quickTitle: {
    color: colors.label,
    fontSize: 15,
  },
  serviceStack: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  titleSection: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  quickBookBtn: {
    marginHorizontal: spacing.gutter,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
});
