import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { safeHaptics } from "@/lib/haptics";
import {
  ThemedText,
  Input,
  AppIcon,
  ServiceHeroCard,
  ProgressPills,
  QueryState,
} from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useServices } from "@/features/hooks/use-dental-api";
import { useBookingStore } from "@/features/booking/booking-store";
import { DentalService } from "@/features/booking/booking-types";
import { formatGbp } from "@/features/booking/booking-api";
import { bookingChannelFor, channelParam, firstBookingStep } from "@/features/booking/start-booking";
import { toLabel } from "@/lib/text";

type CategoryFilter =
  | "all"
  | "checkup"
  | "hygiene"
  | "emergency"
  | "restorative"
  | "cosmetic";

const CATEGORIES: { label: string; value: CategoryFilter; icon: any }[] = [
  { label: "All", value: "all", icon: "grid" },
  { label: "Checkup", value: "checkup", icon: "profile" },
  { label: "Hygiene", value: "hygiene", icon: "sparkle" },
  { label: "Surgery", value: "restorative", icon: "activity" },
  { label: "Cosmetic", value: "cosmetic", icon: "smile" },
  { label: "Emergency", value: "emergency", icon: "alert" },
];

function getServiceImage(category?: string, name?: string) {
  const lower = `${category || ""} ${name || ""}`.toLowerCase();
  if (lower.includes("implant") || lower.includes("restor") || lower.includes("emerg")) {
    return require("../../../../assets/images/implant.jpg");
  }
  if (lower.includes("veneer") || lower.includes("whitening") || lower.includes("cosmetic")) {
    return require("../../../../assets/images/welcome-hero.jpg");
  }
  return require("../../../../assets/images/smile-restoration.jpg");
}

export default function ServiceCatalogScreen() {
  const router = useRouter();
  const { setService, setChannel } = useBookingStore();
  // ?channel=video lists only the services that can be booked as a video consult.
  const params = useLocalSearchParams<{ channel?: string }>();
  const onlyChannel = channelParam(params.channel);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const { data: apiServices, isLoading, isError, refetch } = useServices();
  const services = useMemo(
    () => ((apiServices as DentalService[] | undefined) ?? []),
    [apiServices]
  );

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((srv) => {
      if (onlyChannel && !(srv.supportedChannels ?? []).includes(onlyChannel)) return false;
      const matchesCat =
        selectedCategory === "all" ||
        (srv.category || "").toLowerCase() === selectedCategory;
      const matchesQuery =
        !q ||
        srv.name.toLowerCase().includes(q) ||
        (srv.description || "").toLowerCase().includes(q) ||
        (srv.category || "").toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [services, selectedCategory, search, onlyChannel]);

  const handleSelectService = (service: DentalService) => {
    setService({
      ...service,
      id: service.id,
      name: service.name,
      pricePence: service.pricePence,
      depositPence: service.depositPence ?? Math.round((service.pricePence || 0) * 0.25),
    });
    const channel = bookingChannelFor(service, onlyChannel);
    setChannel(channel);
    router.push(firstBookingStep(channel) as never);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Pills for Multi-Step Booking */}
        <ProgressPills total={5} current={1} />

        {/* Top Header: "Choose a Service" + Search Icon button */}
        <View style={styles.headerRow}>
          <ThemedText variant="largeTitle" style={styles.headerTitle}>
            {onlyChannel === "video"
              ? "Book a video consult"
              : onlyChannel === "van"
                ? "Book a dental van visit"
                : "Choose a treatment"}
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search treatments"
            onPress={() => {
              safeHaptics.impactAsync("light").catch(() => {});
              setShowSearch((prev) => !prev);
            }}
            style={styles.searchIconBtn}
          >
            <AppIcon name="search" size={18} color={colors.ink} />
          </Pressable>
        </View>

        {/* Optional Search bar dropdown */}
        {showSearch ? (
          <View style={styles.searchBarWrap}>
            <Input
              placeholder="Search treatments by name..."
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>
        ) : null}

        {/* Filter Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hScroll}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <Pressable accessibilityLabel={cat.label}
                key={cat.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => {
                  safeHaptics.impactAsync("light").catch(() => {});
                  setSelectedCategory(cat.value);
                }}
                style={[
                  styles.categoryPill,
                  isActive ? styles.categoryPillActive : styles.categoryPillInactive,
                ]}
              >
                <AppIcon
                  name={cat.icon}
                  size={14}
                  color={isActive ? colors.alwaysWhite : colors.ink}
                />
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

        {/* Live Service Catalog Cards */}
        <QueryState
          isLoading={isLoading}
          isError={isError}
          data={apiServices === undefined ? undefined : filteredServices}
          onRetry={() => refetch()}
          errorMessage="We couldn't load treatments. Check your connection and try again."
          emptyHeading="No matching services"
          emptyBody="Try clearing your search or choosing another treatment category."
          emptyIcon="search"
        >
          {(list) => (
            <View style={styles.cardList}>
              {list.map((srv) => (
                <ServiceHeroCard
                  key={srv.id}
                  title={srv.name}
                  badge={`${toLabel(srv.category || "clinical")} · ${formatGbp(srv.pricePence || 0)}`}
                  image={getServiceImage(srv.category, srv.name)}
                  actionLabel="Book Appointment"
                  onPressAction={() => handleSelectService(srv)}
                  onPressChat={() => router.push("/(patient)/(tabs)/messages" as never)}
                  onPressInfo={() => handleSelectService(srv)}
                />
              ))}
            </View>
          )}
        </QueryState>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Horizontal chip rows must not stretch to fill the column (web)
  hScroll: {
    flexGrow: 0,
  },
  cardList: {
    gap: spacing.md,
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
    backgroundColor: colors.ink,
  },
  categoryPillInactive: {
    backgroundColor: colors.systemBackground,
  },
  categoryScroll: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: colors.alwaysWhite,
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
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  headerTitle: {
    color: colors.label,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 38,
  },
  searchBarWrap: {
    marginTop: -spacing.xs,
  },
  searchIconBtn: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.lg,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
});
