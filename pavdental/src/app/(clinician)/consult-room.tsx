import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Card, Badge, Button, AppIcon, Input } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";
import { dailyJoinUrl, openVideoCall } from "@/features/video/open-call";

export default function ClinicianConsultRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientName?: string;
    appointmentId?: string;
    chiefComplaint?: string;
  }>();

  // No stand-in patient: the room only exists for a real appointment.
  const patientName = params.patientName || "Patient";
  const appointmentId = params.appointmentId;
  const chiefComplaint = params.chiefComplaint?.trim() || null;

  const [activeTab, setActiveTab] = useState<"video" | "triage" | "chart">("video");
  const [selectedTooth, setSelectedTooth] = useState<number>(1);
  // The private Daily room for this appointment and the clinician's owner
  // token. The call runs in an in-app browser window; the token is what lets them in.
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [admitted, setAdmitted] = useState(false);
  const [admitting, setAdmitting] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [concludeNotes, setConcludeNotes] = useState("");
  const [concludeDiagnosis, setConcludeDiagnosis] = useState("");
  const [concludePlan, setConcludePlan] = useState("");
  const [isEnding, setIsEnding] = useState(false);

  const handleEndConsultation = async () => {
    if (!appointmentId) return;
    setIsEnding(true);
    try {
      const res = await authFetch("/api/video/end-consult", {
        method: "POST",
        body: JSON.stringify({
          appointmentId,
          notes: concludeNotes.trim() || "Consultation concluded via video call.",
          diagnosis: concludeDiagnosis.trim() || undefined,
          treatmentPlan: concludePlan.trim() || undefined,
          followUpRecommended: "none",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not complete consultation");
      }
      router.replace("/(clinician)/schedule");
    } catch (err: any) {
      setRoomError(err?.message || "Failed to end consultation");
    } finally {
      setIsEnding(false);
    }
  };

  useEffect(() => {
    async function initRoom() {
      if (!appointmentId) return;
      try {
        const res = await authFetch("/api/video/rooms", {
          method: "POST",
          body: JSON.stringify({ appointmentId }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.url && data?.token) {
          setJoinUrl(dailyJoinUrl(data.url, data.token));
        } else {
          setRoomError(data?.error || "Could not open the video room. Try again from your schedule.");
        }
      } catch {
        setRoomError("Could not open the video room. Check your connection and try again.");
      }
    }
    initRoom();
  }, [appointmentId]);

  const admitPatient = async () => {
    if (!appointmentId) return;
    setAdmitting(true);
    try {
      const res = await authFetch("/api/video/admit-patient", {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      });
      if (res.ok) setAdmitted(true);
      else {
        const data = await res.json().catch(() => ({}));
        setRoomError(data?.error || "Could not let the patient in. Please try again.");
      }
    } catch {
      setRoomError("Could not let the patient in. Check your connection and try again.");
    } finally {
      setAdmitting(false);
    }
  };

  // Live Call Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleEndAndPrescribe = () => {
    router.push({
      pathname: "/(clinician)/rx-dispense" as any,
      params: {
        patientName,
        appointmentId,
      },
    });
  };

  if (!appointmentId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.triageScroll}>
          <ThemedText variant="body" style={styles.triageText}>
            Open the consultation room from an appointment on your schedule.
          </ThemedText>
          <Button title="Back to schedule" onPress={() => router.replace("/(clinician)/schedule")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.patientBadge}>
            <ThemedText variant="headline" style={styles.patientName}>
              {patientName}
            </ThemedText>
            <Badge label={`${formatTime(seconds)}`} variant="success" />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Exit consultation room"
            onPress={() => router.replace("/(clinician)/schedule")}
            style={styles.exitBtn}
          >
            <ThemedText variant="caption" style={styles.exitText}>
              ✕ Exit Room
            </ThemedText>
          </Pressable>
        </View>

        {/* Tab Switcher for Clinician Multi-Tasking */}
        <View style={styles.tabRow}>
          <Pressable accessibilityRole="tab" accessibilityLabel="Video call" accessibilityState={{ selected: activeTab === "video" }}
            onPress={() => setActiveTab("video")}
            style={[styles.tabItem, activeTab === "video" && styles.tabItemActive]}
          >
            <ThemedText
              variant="caption"
              style={[styles.tabText, activeTab === "video" && styles.tabTextActive]}
            >
              📹 Video Call
            </ThemedText>
          </Pressable>
          <Pressable accessibilityRole="tab" accessibilityLabel="Triage and photos" accessibilityState={{ selected: activeTab === "triage" }}
            onPress={() => setActiveTab("triage")}
            style={[styles.tabItem, activeTab === "triage" && styles.tabItemActive]}
          >
            <ThemedText
              variant="caption"
              style={[styles.tabText, activeTab === "triage" && styles.tabTextActive]}
            >
              📋 Triage & Photos
            </ThemedText>
          </Pressable>
          <Pressable accessibilityRole="tab" accessibilityLabel="Tooth chart" accessibilityState={{ selected: activeTab === "chart" }}
            onPress={() => setActiveTab("chart")}
            style={[styles.tabItem, activeTab === "chart" && styles.tabItemActive]}
          >
            <ThemedText
              variant="caption"
              style={[styles.tabText, activeTab === "chart" && styles.tabTextActive]}
            >
              🦷 Tooth Chart
            </ThemedText>
          </Pressable>
        </View>

        {/* Dynamic Center Area */}
        {activeTab === "video" ? (
          <View style={styles.videoArea}>
            <View style={styles.streamBox}>
              <AppIcon name="video" size={44} color={colors.tertiaryLabel} />
              <ThemedText variant="headline" style={styles.streamText}>
                {patientName}
              </ThemedText>
              <ThemedText variant="caption" style={styles.roomTag}>
                {admitted ? "Patient let in. They can join the call now." : "The patient is kept in the waiting room until you let them in."}
              </ThemedText>
              {roomError && (
                <ThemedText variant="caption" style={styles.roomError} accessibilityRole="alert">
                  {roomError}
                </ThemedText>
              )}
            </View>

            <View style={styles.callActions}>
              <Button
                title="Join video call"
                disabled={!joinUrl}
                loading={!joinUrl && !roomError}
                onPress={() => joinUrl && openVideoCall(joinUrl).catch(() => setRoomError("Couldn't open the video call."))}
              />
              <Button
                title={admitted ? "Patient let in" : "Let patient in"}
                variant="secondary"
                disabled={admitted || !joinUrl}
                loading={admitting}
                onPress={admitPatient}
              />
            </View>
          </View>
        ) : activeTab === "triage" ? (
          <ScrollView contentContainerStyle={styles.triageScroll}>
            <Card style={styles.triageCard}>
              <ThemedText variant="headline">Patient reported symptoms</ThemedText>
              <ThemedText variant="body" style={styles.triageText}>
                {chiefComplaint ? `"${chiefComplaint}"` : "The patient has not submitted any symptoms for this appointment."}
              </ThemedText>
            </Card>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.triageScroll}>
            <Card style={styles.triageCard}>
              <View style={styles.odontogramHeader}>
                <ThemedText variant="headline">Tooth chart</ThemedText>
              </View>
              <ThemedText variant="caption" style={styles.chartSub}>
                Tap a tooth to see what is recorded for it.
              </ThemedText>

              {/* Upper Arch */}
              <ThemedText variant="caption" style={styles.archLabel}>
                Upper Arch (Maxillary #1–#16)
              </ThemedText>
              <View style={styles.archRow}>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => {
                  const isSelected = selectedTooth === num;
                  return (
                    <Pressable accessibilityRole="button" accessibilityLabel={`Tooth ${num}`} accessibilityState={{ selected: isSelected }}
                      key={num}
                      onPress={() => setSelectedTooth(num)}
                      style={[
                        styles.toothCapsule,
                        isSelected && styles.toothCapsuleSelected,
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        style={[
                          styles.toothNumText,
                          isSelected && styles.toothNumTextSelected,
                        ]}
                      >
                        {num}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              {/* Lower Arch */}
              <ThemedText variant="caption" style={styles.archLabel}>
                Lower Arch (Mandibular #17–#32)
              </ThemedText>
              <View style={styles.archRow}>
                {Array.from({ length: 16 }, (_, i) => i + 17).map((num) => {
                  const isSelected = selectedTooth === num;
                  return (
                    <Pressable accessibilityRole="button" accessibilityLabel={`Tooth ${num}`} accessibilityState={{ selected: isSelected }}
                      key={num}
                      onPress={() => setSelectedTooth(num)}
                      style={[
                        styles.toothCapsule,
                        isSelected && styles.toothCapsuleSelected,
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        style={[
                          styles.toothNumText,
                          isSelected && styles.toothNumTextSelected,
                        ]}
                      >
                        {num}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            {/* Selected Tooth Detail */}
            <Card style={styles.triageCard}>
              <View style={styles.odontogramHeader}>
                <ThemedText variant="headline">Tooth #{selectedTooth}</ThemedText>
              </View>
              <ThemedText variant="body" style={styles.triageText}>
                No findings recorded for this tooth.
              </ThemedText>
              <View style={styles.actionPillRow}>
                <Button
                  title="Write prescription"
                  size="sm"
                  variant="secondary"
                  onPress={handleEndAndPrescribe}
                />
              </View>
            </Card>
          </ScrollView>
        )}

        {showSummaryModal && (
          <Card style={styles.summaryFormCard}>
            <ThemedText variant="headline">Record consultation summary</ThemedText>
            <Input
              label="Diagnosis"
              placeholder="e.g. Localized dentine hypersensitivity"
              value={concludeDiagnosis}
              onChangeText={setConcludeDiagnosis}
            />
            <Input
              label="Clinical notes"
              placeholder="Observations and discussion during video consult"
              multiline
              numberOfLines={3}
              value={concludeNotes}
              onChangeText={setConcludeNotes}
            />
            <Input
              label="Treatment plan / advice"
              placeholder="Recommended home care or next steps"
              multiline
              numberOfLines={3}
              value={concludePlan}
              onChangeText={setConcludePlan}
            />
            <Button
              title="Save summary & complete visit"
              loading={isEnding}
              onPress={handleEndConsultation}
            />
          </Card>
        )}

        {/* Clinician Action Control Bar */}
        <View style={styles.controls}>
          <Button
            title="End call and write prescription"
            size="lg"
            onPress={handleEndAndPrescribe}
          />
          <Button
            title={showSummaryModal ? "Hide summary form" : "End call & record summary"}
            variant="secondary"
            size="md"
            onPress={() => setShowSummaryModal(!showSummaryModal)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  callActions: {
    gap: spacing.xs,
    marginTop: spacing.md,
    width: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  controls: {
    backgroundColor: colors.systemBackground,
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  summaryFormCard: {
    backgroundColor: colors.systemBackground,
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  exitBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  exitText: {
    color: colors.danger,
    fontWeight: "600",
  },
  patientBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  patientName: {
    color: colors.label,
  },
  roomError: {
    color: colors.danger,
    paddingHorizontal: spacing.gutter,
    textAlign: "center",
  },
  roomTag: {
    color: colors.secondaryLabel,
    paddingHorizontal: spacing.gutter,
    textAlign: "center",
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  streamBox: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.lg,
    gap: spacing.xs,
    height: 320,
    justifyContent: "center",
    width: "100%",
  },
  streamText: {
    color: colors.label,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: spacing.sm,
  },
  tabItemActive: {
    backgroundColor: colors.systemBackground,
    borderBottomColor: colors.ink,
    borderBottomWidth: 2,
  },
  tabRow: {
    backgroundColor: colors.inkSubtle,
    borderBottomColor: colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
  tabText: {
    color: colors.secondaryLabel,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.ink,
  },
  topBar: {
    alignItems: "center",
    borderBottomColor: colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
  },
  triageCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.md,
  },
  triageScroll: {
    gap: spacing.md,
    padding: spacing.md,
  },
  triageText: {
    color: colors.secondaryLabel,
    fontStyle: "italic",
    lineHeight: 20,
  },
  videoArea: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  actionPillRow: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  archLabel: {
    color: colors.secondaryLabel,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  archRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "space-between",
    marginTop: 4,
  },
  chartSub: {
    color: colors.secondaryLabel,
  },
  odontogramHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toothCapsule: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    height: 28,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: 2,
  },
  toothCapsuleSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  toothNumText: {
    color: colors.label,
    fontSize: 11,
    fontWeight: "700",
  },
  toothNumTextSelected: {
    color: colors.alwaysWhite,
  },
});
