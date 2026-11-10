import { bookingStep } from "@/features/booking/booking-steps";
import React, { useState, useMemo, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Button, FlowHeader, ChipPill, Toast, QueryState } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useBookingStore } from "@/features/booking/booking-store";
import { TimeSlot } from "@/features/booking/booking-types";
import { useSlots, useHoldSlotMutation } from "@/features/hooks/use-dental-api";
import { ukDayLabel, ukHour, upcomingUkDates } from "@/features/booking/uk-time";
import { fetchSlots, holdExpiryOnThisPhone } from "@/features/booking/booking-api";
import { MAX_WEEKS_AHEAD, hasBookableTime, nextAvailableDay, type SlotLike } from "@/features/booking/next-available";
import { PRACTICE_CONFIG } from "@/config/practice";
import { useQueries } from "@tanstack/react-query";

export default function SlotPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSlot, setHoldExpiry, clinician, clinic, service, channel } = useBookingStore();

  // Only while this is the screen being looked at: after payment the confirmed
  // screen clears the draft while this one is still in the stack beneath it, and
  // redirecting then sent the patient back to "Choose a treatment".
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(true);
  useEffect(() => {
    const offFocus = navigation.addListener("focus", () => setIsFocused(true));
    const offBlur = navigation.addListener("blur", () => setIsFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);
  useEffect(() => {
    if (!service && isFocused) {
      router.replace("/(patient)/booking/service-catalog" as any);
    }
  }, [service, isFocused]);

  // Days and times are the clinic's, in UK time.
  // A week at a time, up to four weeks, when nothing is free sooner.
  const [weeks, setWeeks] = useState(1);
  const upcomingDays = useMemo(
    () => upcomingUkDates(7 * weeks).map((iso) => ({ iso, label: ukDayLabel(iso) })),
    [weeks]
  );

  const [selectedDate, setSelectedDate] = useState<string>(upcomingDays[0].label);
  const [selectedSlot, setSelectedSlotState] = useState<TimeSlot | null>(null);
  const [partOfDay, setPartOfDay] = useState<"any" | "am" | "pm">("any");
  const [holdError, setHoldError] = useState<string | null>(null);

  const dates = upcomingDays.map((d) => d.label);
  const isoDate =
    upcomingDays.find((d) => d.label === selectedDate)?.iso ?? upcomingDays[0].iso;

  const { data: apiSlots, isLoading, isError, refetch } = useSlots({
    date: isoDate,
    channel: channel ?? "clinic",
    clinicId: clinic?.id,
    clinicianId: clinician?.id,
    serviceId: service?.id,
  });

  const slots: TimeSlot[] = (apiSlots ?? []) as TimeSlot[];

  // Which of the shown days have a free time, so an empty day is not a dead end.
  const dayQueries = useQueries({
    queries: upcomingDays.map((d) => {
      const params = {
        date: d.iso,
        channel: channel ?? "clinic",
        clinicId: clinic?.id,
        clinicianId: clinician?.id,
        serviceId: service?.id,
      };
      return { queryKey: ["slots", params], queryFn: () => fetchSlots(params), enabled: !!service };
    }),
  });
  const bookableByDay: Record<string, boolean | undefined> = {};
  upcomingDays.forEach((d, i) => {
    const q = dayQueries[i];
    bookableByDay[d.iso] = q?.data === undefined ? undefined : hasBookableTime(q.data as SlotLike[], { clinicId: clinic?.id, clinicianId: clinician?.id });
  });

  const filteredSlots = slots.filter((slot) => {
    if (slot.dateFormatted && slot.dateFormatted !== selectedDate) return false;
    if (clinician && slot.clinicianId && slot.clinicianId !== clinician.id) return false;
    if (clinic && slot.clinicId && slot.clinicId !== clinic.id) return false;
    if (!slot.isAvailable) return false;
    // MB-3: defense-in-depth hide slots that have already passed in device time
    const startIso = slot.startTimeUtc || (slot as any).start_time_utc;
    if (startIso && new Date(startIso).getTime() <= Date.now()) return false;
    return true;
  });

  const hourOf = (slot: TimeSlot) => {
    const iso = (slot as any).startTimeUtc || (slot as any).start_time_utc;
    if (iso) return ukHour(new Date(iso));
    const [h] = String(slot.displayTime || "").split(":");
    return Number(h) || 0;
  };

  const visibleSlots = filteredSlots.filter((slot) => {
    if (partOfDay === "am") return hourOf(slot) < 12;
    if (partOfDay === "pm") return hourOf(slot) >= 12;
    return true;
  });

  const soonestSlot = visibleSlots.length
    ? [...visibleSlots].sort((a, b) => hourOf(a) - hourOf(b))[0]
    : null;

  const holdMutation = useHoldSlotMutation();

  const nextDay = nextAvailableDay(upcomingDays, bookableByDay, isoDate);

  const handleContinue = async () => {
    if (!selectedSlot) return;
    setHoldError(null);
    setSlot(selectedSlot);

    // Call Redis slot hold API
    try {
      const res = await holdMutation.mutateAsync(selectedSlot.id);
      setHoldExpiry(holdExpiryOnThisPhone(res));
      router.push("/(patient)/booking/summary" as any);
    } catch (err: any) {
      setHoldError(err?.message || "Could not reserve this slot. Please try another time.");
    }
  };

  if (!service) {
    return null;
  }

  return (
    <View style={styles.container}>
      {holdError ? (
        <Toast
          message={holdError}
          tone="error"
          onDismiss={() => setHoldError(null)}
        />
      ) : null}

      {/* Top Navigation */}
      <View style={styles.topNav}>
        <FlowHeader step={bookingStep(channel, "time")} />
      </View>

      {/* Date Selector Row */}
      <View style={styles.dateBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hScroll}
          contentContainerStyle={styles.dateScroll}
        >
          {dates.map((d) => {
            const active = selectedDate === d;
            return (
              <Pressable
                accessibilityLabel={d}
                key={d}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setSelectedDate(d);
                  setSelectedSlotState(null);
                }}
                style={({ pressed }) => [
                  styles.datePill,
                  active && styles.datePillActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.dateText, active && styles.dateTextActive]}
                >
                  {d}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Available Slot Grid */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick-pick chips */}
        <View style={styles.quickRow}>
          <ChipPill
            label="Soonest available"
            tone="ink"
            selected={!!selectedSlot && selectedSlot.id === soonestSlot?.id}
            onPress={() => {
              setPartOfDay("any");
              if (soonestSlot) setSelectedSlotState(soonestSlot);
            }}
          />
          <ChipPill
            label="Morning"
            selected={partOfDay === "am"}
            onPress={() => {
              setPartOfDay(partOfDay === "am" ? "any" : "am");
              setSelectedSlotState(null);
            }}
          />
          <ChipPill
            label="Afternoon"
            selected={partOfDay === "pm"}
            onPress={() => {
              setPartOfDay(partOfDay === "pm" ? "any" : "pm");
              setSelectedSlotState(null);
            }}
          />
        </View>

        <ThemedText variant="headline" style={styles.sectionHeader}>
          Available Times for {selectedDate}
        </ThemedText>

        {!isLoading && !isError && apiSlots !== undefined && visibleSlots.length === 0 ? (
          nextDay ? (
            <Button
              title={`Next available: ${nextDay.label}`}
              variant="secondary"
              onPress={() => {
                setSelectedDate(nextDay.label);
                setSelectedSlotState(null);
              }}
            />
          ) : weeks < MAX_WEEKS_AHEAD ? (
            <Button title="Look at the following week" variant="secondary" onPress={() => setWeeks((w) => w + 1)} />
          ) : (
            <ThemedText variant="caption" style={styles.sectionHeader}>
              No times in the next {MAX_WEEKS_AHEAD} weeks. Please call us on {PRACTICE_CONFIG.phone}.
            </ThemedText>
          )
        ) : null}

        <QueryState
          isLoading={isLoading}
          isError={isError}
          data={apiSlots === undefined ? undefined : visibleSlots}
          onRetry={() => refetch()}
          errorMessage="We couldn't load times for this date. Check your connection and try again."
          emptyIllustration="schedule"
          emptyHeading="No available times"
          emptyBody={
            clinician?.id
              ? "No available slots for this date. Try another day, or choose 'Any practitioner'."
              : "No available slots for this date. Please try another day."
          }
          emptyIcon="calendar"
          skeletonType="box"
          skeletonCount={1}
          skeletonHeight={120}
        >
          {(list) => (
            <View style={styles.slotGrid}>
              {list.map((slot) => {
                const selected = selectedSlot?.id === slot.id;
                return (
                  <Pressable
                    key={slot.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Appointment at ${slot.displayTime}`}
                    onPress={() => setSelectedSlotState(slot)}
                    style={({ pressed }) => [
                      styles.slotItem,
                      selected && styles.slotItemSelected,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <ThemedText
                      variant="headline"
                      style={[styles.slotTime, selected && styles.slotTimeSelected]}
                    >
                      {slot.displayTime}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </QueryState>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button
          title={selectedSlot ? `Confirm ${selectedSlot.displayTime}` : "Choose a time slot"}
          size="lg"
          arrow
          disabled={!selectedSlot}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Horizontal chip rows must not stretch to fill the column (web)
  hScroll: {
    flexGrow: 0,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  dateBar: {
    backgroundColor: colors.systemBackground,
    borderBottomColor: colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  datePill: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.full,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 10,
  },
  datePillActive: {
    backgroundColor: colors.accent,
  },
  dateScroll: {
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  dateText: {
    color: colors.label,
    fontWeight: "600",
  },
  dateTextActive: {
    color: colors.onAccent,
  },
  footerBar: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  sectionHeader: {
    color: colors.label,
    fontWeight: "700",
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  slotItem: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    justifyContent: "center",
    paddingVertical: spacing.md,
    width: "31%",
  },
  slotItemSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  slotTime: {
    color: colors.label,
    fontWeight: "600",
  },
  slotTimeSelected: {
    color: colors.onAccent,
    fontWeight: "700",
  },
  topNav: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
