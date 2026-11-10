import { bookingStep } from "@/features/booking/booking-steps";
import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { safeHaptics } from "@/lib/haptics";
import {
  ThemedText,
  Input,
  AppIcon,
  type AppIconName,
  FlowHeader,
  IconTile,
  ListRow,
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

const CATEGORIES: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Checkup", value: "checkup" },
  { label: "Hygiene", value: "hygiene" },
  { label: "Surgery", value: "restorative" },
  { label: "Cosmetic", value: "cosmetic" },
  { label: "Emergency", value: "emergency" },
];


export default function ServiceCatalogScreen() {
  const router = useRouter();
  const { setService, setChannel } = useBookingStore();
  // ?channel=video lists only the services that can be booked as a video consult.
  const params = useLocalSearchParams<{ channel?: string }>();
  const onlyChannel = channelParam(params.channel);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
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
      <View style={styles.topNav}>
        <FlowHeader step={bookingStep(onlyChannel, "treatment")} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText variant="largeTitle" accessibilityRole="header">
          {onlyChannel === "video"
            ? "Book a video consult"
            : onlyChannel === "van"
              ? "Book a dental van visit"
              : "Choose a treatment"}
        </ThemedText>

        <Input
          placeholder="Search treatments"
          accessibilityLabel="Search treatments"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          rightSlot={<AppIcon name="search" size={18} color={colors.secondaryLabel} />}
        />

        {/* Filter pills (Wise: neutral pills, bright green when selected) */}
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
                hitSlop={{ top: 4, bottom: 4 }}
                onPress={() => {
                  safeHaptics.impactAsync("light").catch(() => {});
                  setSelectedCategory(cat.value);
                }}
                style={[styles.categoryPill, isActive ? styles.categoryPillActive : styles.categoryPillInactive]}
              >
                <ThemedText variant="footnote" style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          data={apiServices === undefined ? undefined : filteredServices}
          onRetry={() => refetch()}
          errorMessage="We couldn't load treatments. Check your connection and try again."
          emptyIllustration="notFound"
          emptyHeading="No matching services"
          emptyBody="Try clearing your search or choosing another treatment category."
          emptyIcon="search"
        >
          {(list) => (
            <View>
              {list.map((srv) => (
                <ListRow
                  key={srv.id}
                  title={srv.name}
                  subtitle={[
                    toLabel(srv.category || "clinical"),
                    formatGbp(srv.pricePence || 0),
                    srv.durationMinutes ? `${srv.durationMinutes} min` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  left={<IconTile icon={CATEGORY_ICON[srv.category ?? ""] ?? "tooth"} />}
                  chevron
                  style={styles.row}
                  accessibilityHint="Choose this treatment"
                  onPress={() => handleSelectService(srv)}
                />
              ))}
            </View>
          )}
        </QueryState>

        <ListRow
          title="Questions about a treatment?"
          subtitle="Message the practice team"
          left={<IconTile icon="message" />}
          chevron
          style={styles.row}
          onPress={() => router.push("/(patient)/(tabs)/messages" as never)}
        />
      </ScrollView>
    </View>
  );
}

const CATEGORY_ICON: Record<string, AppIconName> = {
  checkup: "clipboard",
  hygiene: "sparkle",
  restorative: "activity",
  cosmetic: "smile",
  emergency: "alert",
};

const styles = StyleSheet.create({
  // Horizontal chip rows must not stretch to fill the column (web)
  hScroll: {
    flexGrow: 0,
  },
  categoryPill: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  categoryPillActive: {
    backgroundColor: colors.accent,
  },
  categoryPillInactive: {
    backgroundColor: colors.inkSubtle,
  },
  categoryScroll: {
    alignItems: "center",
    gap: spacing.xs,
  },
  categoryText: {
    color: colors.label,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: colors.onAccent,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xxl,
  },
  row: {
    paddingHorizontal: 0,
  },
  topNav: {
    paddingHorizontal: spacing.gutter,
  },
});
