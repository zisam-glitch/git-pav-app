import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Card, Badge, Button, AppIcon, Input, SegmentedControl } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";
import { useMyAppointments } from "@/features/hooks/use-dental-api";
import { triageSummary } from "@/features/video/triage-summary";
import { FOLLOW_UP_OPTIONS, canSaveConsult, consultPayload, type FollowUp } from "@/features/video/consult-form";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { toothLabel, fdiText, UPPER_CHART_ROW, LOWER_CHART_ROW } from "@/features/records/tooth-number";
import { NativeVideoCall } from "@/features/video/native-call";
import { patientPresenceLine } from "@/features/video/waiting-state";

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
  // The schedule has already loaded today's appointments with their triage
  // answers; read this one from there rather than from a single text param.
  const { data: todays } = useMyAppointments({ scope: "today" });
  const appointment = (todays as any[] | undefined)?.find((a) => a.id === appointmentId);
  const triage = triageSummary(appointment?.triageData, appointment?.intraoralPhotos);
  const chiefComplaint = triage.complaint || params.chiefComplaint?.trim() || null;
  // Links to the photos expire, so ask for fresh ones when the room opens.
  const { data: triagePhotos } = useQuery({
    queryKey: ["triage-photos", appointmentId],
    enabled: !!appointmentId,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const res = await authFetch(`/api/video/triage-photos/${appointmentId}`);
      if (!res.ok) return [] as { url: string }[];
      const body = await res.json().catch(() => ({ photos: [] }));
      return (body.photos ?? []) as { url: string }[];
    },
  });

  const [activeTab, setActiveTab] = useState<"video" | "triage" | "chart">("video");
  const [selectedTooth, setSelectedTooth] = useState<number>(1);
  // The private Daily room for this appointment and the clinician's owner
  // token. The call runs natively in the Video call tab and keeps going while
  // the clinician reads the triage or the chart; the token is what lets them in.
  const [room, setRoom] = useState<{ url: string; token: string } | null>(null);
  const [inCall, setInCall] = useState(false);
  // The timer counts from when the clinician joined, measured against the
  // clock, so it stays right after the screen was in the background.
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [roomError, setRoomError] = useState<string | null>(null);
  const [admitted, setAdmitted] = useState(false);
  const [admitting, setAdmitting] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  // A message to the patient, in this visit's conversation (V49).
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageNote, setMessageNote] = useState<{ text: string; failed: boolean } | null>(null);
  const [concludeNotes, setConcludeNotes] = useState("");
  const [concludeDiagnosis, setConcludeDiagnosis] = useState("");
  const [concludePlan, setConcludePlan] = useState("");
  const [concludeFollowUp, setConcludeFollowUp] = useState<FollowUp>("none");
  const [isEnding, setIsEnding] = useState(false);

  const handleEndConsultation = async () => {
    if (!appointmentId) return;
    setIsEnding(true);
    try {
      const res = await authFetch("/api/video/end-consult", {
        method: "POST",
        body: JSON.stringify(
          consultPayload(appointmentId, {
            diagnosis: concludeDiagnosis,
            notes: concludeNotes,
            plan: concludePlan,
            followUp: concludeFollowUp,
          })
        ),
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
          setRoom({ url: data.url, token: data.token });
        } else {
          setRoomError(data?.error || "Could not open the video room. Try again from your schedule.");
        }
      } catch {
        setRoomError("Could not open the video room. Check your connection and try again.");
      }
    }
    initRoom();
  }, [appointmentId]);

  const sendMessage = async () => {
    const body = messageText.trim();
    if (!body || !appointmentId || sendingMessage) return;
    setSendingMessage(true);
    setMessageNote(null);
    try {
      const res = await authFetch(`/api/appointment-messages/${appointmentId}`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setMessageText("");
        setMessageNote({ text: "Message sent to the patient.", failed: false });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessageNote({ text: data?.error || "Your message did not send. Please try again.", failed: true });
      }
    } catch {
      setMessageNote({ text: "Your message did not send. Check your connection and try again.", failed: true });
    } finally {
      setSendingMessage(false);
    }
  };

  // The server knows whether the patient is waiting and whether they were let in,
  // so this reads it, rather than remembering admission on the phone only (V10).
  const { data: presence } = useQuery({
    queryKey: ["video-presence", appointmentId],
    enabled: !!appointmentId,
    refetchInterval: 5000,
    queryFn: async () => {
      const res = await authFetch(`/api/video/status/${appointmentId}`);
      if (!res.ok) return null;
      return (await res.json()) as { admitted?: boolean; patientWaiting?: boolean };
    },
  });
  useEffect(() => {
    if (presence?.admitted) setAdmitted(true);
  }, [presence?.admitted]);

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

  // Live call timer
  useEffect(() => {
    if (!callStartedAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [callStartedAt]);
  const seconds = callStartedAt ? Math.max(0, Math.floor((now - callStartedAt) / 1000)) : 0;

  const joinCall = () => {
    if (!room) return;
    setCallStartedAt((prev) => prev ?? Date.now());
    setInCall(true);
    setActiveTab("video");
  };

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
              Exit room
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.segmentWrap}>
          <SegmentedControl
            segments={[
              { key: "video", label: "Video call" },
              { key: "triage", label: "Triage & photos" },
              { key: "chart", label: "Tooth chart" },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </View>

        {/* The call stays mounted (and audible) on the other tabs. */}
        {inCall && room && (
          <View style={[styles.videoArea, activeTab !== "video" && styles.hidden]}>
            <NativeVideoCall
              url={room.url}
              token={room.token}
              otherLabel="the patient"
              onLeft={() => setInCall(false)}
              style={styles.callStage}
            />
            {!admitted && (
              <View style={styles.callActions}>
                <Button title="Let patient in" variant="secondary" loading={admitting} onPress={admitPatient} />
              </View>
            )}
            {roomError && (
              <ThemedText variant="caption" style={styles.roomError} accessibilityRole="alert">
                {roomError}
              </ThemedText>
            )}
          </View>
        )}

        {/* Dynamic Center Area */}
        {activeTab === "video" ? (
          inCall ? null : (
          <View style={styles.videoArea}>
            <View style={styles.streamBox}>
              <AppIcon name="video" size={44} color={colors.tertiaryLabel} />
              <ThemedText variant="headline" style={styles.streamText}>
                {patientName}
              </ThemedText>
              <ThemedText variant="caption" style={styles.roomTag}>
                {patientPresenceLine({ admitted, waiting: !!presence?.patientWaiting })}
              </ThemedText>
              {roomError && (
                <ThemedText variant="caption" style={styles.roomError} accessibilityRole="alert">
                  {roomError}
                </ThemedText>
              )}
            </View>

            <View style={styles.callActions}>
              <Button
                title={callStartedAt ? "Rejoin video call" : "Join video call"}
                disabled={!room}
                loading={!room && !roomError}
                onPress={joinCall}
              />
              <Button
                title={admitted ? "Patient let in" : "Let patient in"}
                variant="secondary"
                disabled={admitted}
                loading={admitting}
                onPress={admitPatient}
              />
            </View>
          </View>
          )
        ) : activeTab === "triage" ? (
          <ScrollView contentContainerStyle={styles.triageScroll}>
            <Card style={styles.triageCard}>
              <ThemedText variant="headline">Patient reported symptoms</ThemedText>
              <ThemedText variant="body" style={styles.triageText}>
                {chiefComplaint ? `"${chiefComplaint}"` : "The patient has not submitted any symptoms for this appointment."}
              </ThemedText>
              {triage.redFlag ? (
                <ThemedText variant="body" style={styles.roomError} accessibilityRole="alert">
                  {`Urgent: ${triage.redFlag}`}
                </ThemedText>
              ) : null}
              {triage.painLevel !== null ? (
                <ThemedText variant="body" style={styles.triageFact}>{`Pain: ${triage.painLevel} out of 10`}</ThemedText>
              ) : null}
              {triage.duration ? (
                <ThemedText variant="body" style={styles.triageFact}>{`How long: ${triage.duration}`}</ThemedText>
              ) : null}
              {triage.submitted ? (
                <ThemedText variant="body" style={styles.triageFact}>
                  {triage.swelling ? "Facial swelling or gum boil: yes" : "Facial swelling or gum boil: no"}
                </ThemedText>
              ) : null}
              <ThemedText variant="body" style={styles.triageFact}>
                {triage.photoCount > 0
                  ? `${triage.photoCount} intraoral photo${triage.photoCount === 1 ? "" : "s"} sent`
                  : "No intraoral photos sent."}
              </ThemedText>
              {triagePhotos && triagePhotos.length > 0 ? (
                <View style={styles.photoGrid}>
                  {triagePhotos.map((p, i) => (
                    <Image
                      key={p.url}
                      source={{ uri: p.url }}
                      style={styles.photoThumb}
                      contentFit="cover"
                      accessibilityLabel={`Intraoral photo ${i + 1}`}
                    />
                  ))}
                </View>
              ) : null}
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
                Upper (18–11, 21–28)
              </ThemedText>
              <View style={styles.archRow}>
                {UPPER_CHART_ROW.map((num) => {
                  const isSelected = selectedTooth === num;
                  return (
                    <Pressable accessibilityRole="button" accessibilityLabel={toothLabel(num)} accessibilityState={{ selected: isSelected }}
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
                        {fdiText(num)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              {/* Lower Arch */}
              <ThemedText variant="caption" style={styles.archLabel}>
                Lower (48–41, 31–38)
              </ThemedText>
              <View style={styles.archRow}>
                {LOWER_CHART_ROW.map((num) => {
                  const isSelected = selectedTooth === num;
                  return (
                    <Pressable accessibilityRole="button" accessibilityLabel={toothLabel(num)} accessibilityState={{ selected: isSelected }}
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
                        {fdiText(num)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            {/* Selected Tooth Detail */}
            <Card style={styles.triageCard}>
              <View style={styles.odontogramHeader}>
                <ThemedText variant="headline">{toothLabel(selectedTooth)}</ThemedText>
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
            <ThemedText variant="headline">What to tell the patient</ThemedText>
            <ThemedText variant="caption">The patient reads exactly this when the visit ends.</ThemedText>
            <Input
              label="What you found"
              placeholder="e.g. Sensitivity in the lower left molar"
              value={concludeDiagnosis}
              onChangeText={setConcludeDiagnosis}
            />
            <Input
              label="Advice"
              placeholder="What the patient should do now"
              multiline
              numberOfLines={3}
              value={concludeNotes}
              onChangeText={setConcludeNotes}
            />
            <Input
              label="Plan"
              placeholder="Next steps, if any"
              multiline
              numberOfLines={3}
              value={concludePlan}
              onChangeText={setConcludePlan}
            />
            <ThemedText variant="footnote">Follow-up visit needed</ThemedText>
            <SegmentedControl segments={FOLLOW_UP_OPTIONS} value={concludeFollowUp} onChange={setConcludeFollowUp} />
            <Button
              title="Save and complete visit"
              loading={isEnding}
              disabled={!canSaveConsult({ diagnosis: concludeDiagnosis, notes: concludeNotes, plan: concludePlan, followUp: concludeFollowUp })}
              onPress={handleEndConsultation}
            />
          </Card>
        )}

        {showMessage && (
          <Card style={styles.summaryFormCard}>
            <ThemedText variant="headline">Message the patient</ThemedText>
            <Input
              label=""
              placeholder="Write to the patient…"
              multiline
              maxLength={4000}
              value={messageText}
              onChangeText={setMessageText}
              accessibilityLabel="Message to the patient"
            />
            {messageNote ? (
              <ThemedText variant="caption" accessibilityRole={messageNote.failed ? "alert" : undefined} style={messageNote.failed ? styles.roomError : undefined}>
                {messageNote.text}
              </ThemedText>
            ) : null}
            <Button title="Send message" loading={sendingMessage} disabled={!messageText.trim()} onPress={sendMessage} />
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
            title={showMessage ? "Hide message box" : "Message patient"}
            variant="ghost"
            size="md"
            onPress={() => setShowMessage(!showMessage)}
          />
          <Button
            title={showSummaryModal ? "Hide summary form" : "End call and record summary"}
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
  segmentWrap: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
  },
  callActions: {
    gap: spacing.xs,
    marginTop: spacing.md,
    width: "100%",
  },
  callStage: {
    borderRadius: radius.lg,
    width: "100%",
  },
  hidden: {
    display: "none",
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
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  photoThumb: {
    width: 140,
    height: 140,
    borderRadius: radius.md,
    backgroundColor: colors.inkSubtle,
  },
  triageFact: {
    color: colors.label,
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
