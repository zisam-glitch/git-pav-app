import { useRouter } from "expo-router";
import React, { useState } from "react";
import { PRACTICE_TIME_ZONE } from "@/features/booking/uk-time";
import { View, StyleSheet, ScrollView, Pressable, Modal, RefreshControl } from "react-native";
import { usePullToRefresh } from "@/lib/pull-to-refresh";
import { safeHaptics } from "@/lib/haptics";
import {
  ThemedText,
  Card,
  Badge,
  EmptyState,
  ErrorState,
  AppIcon,
  Skeleton,
  Input,
  Button,
  EmergencyTriageModal,
  Toast,
} from "@/components";
import { colors, spacing, radius } from "@/theme";
import {
  useMessageThreads,
  usePracticeHours,
  useCreateMessageThreadMutation,
} from "@/features/hooks/use-dental-api";

export interface ThreadListItem {
  id: string;
  subject: string;
  from: string;
  preview: string;
  sentAtIso: string;
  isRead: boolean;
  hasAttachment: boolean;
}

export default function MessagesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showTriage, setShowTriage] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  // New message compose state
  const [isComposing, setIsComposing] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newRecipientType, setNewRecipientType] = useState<"practice" | "care_team">("practice");

  const { hoursText } = usePracticeHours();
  const { data: rawThreads, isLoading, isError, refetch } = useMessageThreads();
  const createMutation = useCreateMessageThreadMutation();
  const refresh = usePullToRefresh();

  const threads: ThreadListItem[] = Array.isArray(rawThreads)
    ? rawThreads.map((t: any) => ({
        id: t.id,
        subject: t.subject || "Care team message",
        from: t.from || (t.clinicianName ? `${t.clinicianName}${t.clinicianRole ? ` (${t.clinicianRole})` : ""}` : "Pav Dental care team"),
        preview: t.preview || (t.messages?.[t.messages.length - 1]?.body ?? ""),
        sentAtIso: t.sentAtIso || t.updatedAt || new Date().toISOString(),
        isRead: Boolean(t.isRead),
        hasAttachment: Boolean(t.hasAttachment),
      }))
    : [];

  const filtered = threads.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      m.subject.toLowerCase().includes(q) ||
      m.from.toLowerCase().includes(q) ||
      m.preview.toLowerCase().includes(q)
    );
  });

  const unreadCount = threads.filter((m) => !m.isRead).length;

  // The conversation opens on its own screen, which marks it read.
  const openMessage = (msg: ThreadListItem) => {
    router.push({ pathname: "/(patient)/message-thread" as never, params: { id: msg.id } });
  };

  const handleCreateThread = async () => {
    if (!newSubject.trim() || !newBody.trim()) return;
    try {
      await createMutation.mutateAsync({
        subject: newSubject.trim(),
        body: newBody.trim(),
        recipientType: newRecipientType,
      });
      safeHaptics.notificationAsync("success").catch(() => {});
      setToast({
        message: newRecipientType === "care_team" ? "Message sent to your care team" : "Message sent to practice team",
        tone: "success",
      });
      setIsComposing(false);
      setNewSubject("");
      setNewBody("");
      refetch();
    } catch (err: any) {
      setToast({ message: err?.message || "Your message did not send. Please try again.", tone: "error" });
    }
  };

  return (
    <View style={styles.container}>
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refresh.refreshing} onRefresh={refresh.onRefresh} />}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <ThemedText variant="overline">Secure inbox</ThemedText>
            {unreadCount > 0 ? <Badge label={`${unreadCount} new`} variant="info" /> : null}
          </View>
          <Button
            title="New message"
            icon={<AppIcon name="plus" size={16} color={colors.ink} />}
            variant="secondary"
            size="sm"
            onPress={() => setIsComposing(true)}
          />
        </View>

        {/* Dental emergency symptom check */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check urgent dental symptoms"
          onPress={() => {
            safeHaptics.impactAsync("medium").catch(() => {});
            setShowTriage(true);
          }}
          style={({ pressed }) => [styles.triageBanner, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.triageIconBadge}>
            <AppIcon name="alert" size={16} color={colors.danger} />
          </View>
          <View style={styles.triageTextGroup}>
            <View style={styles.triageHeaderLine}>
              <ThemedText variant="subhead" style={styles.triageTitle}>
                Dental emergency?
              </ThemedText>
            </View>
            <ThemedText variant="caption" style={styles.triageSubtitle}>
              Pain, swelling, or trauma? Call 999 or attend A&E for acute emergencies. For urgent advice call 111.
            </ThemedText>
          </View>
          <AppIcon name="chevronRight" size={16} color={colors.secondaryLabel} />
        </Pressable>

        {/* SLA & Practice Hours Notice */}
        <View style={styles.slaNoticeCard}>
          <AppIcon name="clock" size={14} color={colors.secondaryLabel} />
          <ThemedText variant="caption" style={styles.slaNoticeText}>
            Practice hours: {hoursText}. Responses typically within 1 business day.
          </ThemedText>
        </View>

        <Input
          label=""
          placeholder="Search messages"
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search messages"
        />

        {isLoading ? (
          <View style={styles.stack}>
            <Skeleton height={84} />
            <Skeleton height={84} />
          </View>
        ) : isError && rawThreads === undefined ? (
          <ErrorState
            message="We couldn't load your messages. Check your connection and try again."
            onRetry={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            illustration="messages"
            heading={query ? "No messages found" : "Your inbox is clear"}
            body={query ? `Nothing matches “${query}”.` : "Messages and updates from your dental care team will appear here."}
            actionLabel={query ? undefined : "Send a message"}
            onAction={query ? undefined : () => setIsComposing(true)}
            icon="message"
          />
        ) : (
          <View style={styles.stack}>
            {filtered.map((msg) => {
              const unread = !msg.isRead;
              return (
                <Pressable
                  key={msg.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Message from ${msg.from}: ${msg.subject}`}
                  onPress={() => openMessage(msg)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <Card style={[styles.threadCard, unread && styles.threadCardUnread]}>
                    <View style={styles.avatarTile}>
                      <AppIcon name="message" size={18} color={unread ? colors.onInk : colors.ink} />
                    </View>
                    <View style={styles.threadInfo}>
                      <View style={styles.threadTop}>
                        <ThemedText variant="subhead" style={styles.threadFrom} numberOfLines={1}>
                          {msg.from}
                        </ThemedText>
                        <ThemedText variant="caption" style={styles.threadTime}>
                          {new Date(msg.sentAtIso).toLocaleDateString("en-GB", { timeZone: PRACTICE_TIME_ZONE,
                            day: "numeric",
                            month: "short",
                          })}
                        </ThemedText>
                      </View>
                      <ThemedText
                        variant="body"
                        style={unread ? styles.threadSubjectUnread : styles.threadSubject}
                        numberOfLines={1}
                      >
                        {msg.subject}
                      </ThemedText>
                      <ThemedText variant="caption" style={styles.threadPreview} numberOfLines={2}>
                        {msg.preview}
                      </ThemedText>
                      {msg.hasAttachment ? (
                        <View style={styles.attachRow}>
                          <AppIcon name="fileText" size={12} color={colors.secondaryLabel} />
                          <ThemedText variant="caption" style={styles.attachText}>
                            Attachment
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>
                    {unread ? <View style={styles.unreadDot} /> : null}
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Frame 6: emergency triage modal */}
      <EmergencyTriageModal visible={showTriage} onClose={() => setShowTriage(false)} />

      {/* Frame 7: new message compose modal */}
      <Modal visible={isComposing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText variant="headline">New message</ThemedText>
              <Button title="Cancel" variant="ghost" size="sm" onPress={() => setIsComposing(false)} />
            </View>

            <ThemedText variant="caption" style={styles.modalSubtext}>
              Who is this for?
            </ThemedText>

            <View style={styles.recipientSelector}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Route to practice team"
                onPress={() => setNewRecipientType("practice")}
                style={[
                  styles.recipientOption,
                  newRecipientType === "practice" && styles.recipientOptionActive,
                ]}
              >
                <ThemedText
                  variant="caption"
                  style={[
                    styles.recipientText,
                    newRecipientType === "practice" && styles.recipientTextActive,
                  ]}
                >
                  Practice team
                </ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Route to care team clinician"
                onPress={() => setNewRecipientType("care_team")}
                style={[
                  styles.recipientOption,
                  newRecipientType === "care_team" && styles.recipientOptionActive,
                ]}
              >
                <ThemedText
                  variant="caption"
                  style={[
                    styles.recipientText,
                    newRecipientType === "care_team" && styles.recipientTextActive,
                  ]}
                >
                  Your dentist
                </ThemedText>
              </Pressable>
            </View>

            <Input
              label="Subject"
              placeholder="e.g. Question about appointment or care"
              value={newSubject}
              onChangeText={setNewSubject}
            />

            <Input
              label="Message"
              placeholder="Type your message here…"
              value={newBody}
              onChangeText={setNewBody}
              multiline
              maxLength={4000}
            />

            <View style={styles.modalActions}>
              <Button
                title={createMutation.isPending ? "Sending…" : "Send message"}
                variant="primary"
                size="md"
                disabled={!newSubject.trim() || !newBody.trim() || createMutation.isPending}
                onPress={handleCreateThread}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalSubtext: {
    color: colors.secondaryLabel,
  },
  recipientSelector: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  recipientOption: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.full,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
  },
  recipientOptionActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  recipientText: {
    color: colors.secondaryLabel,
    fontWeight: "500",
  },
  recipientTextActive: {
    color: colors.onAccent,
    fontWeight: "600",
  },
  modalActions: {
    marginTop: spacing.sm,
  },
  slaNoticeCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  slaNoticeText: {
    color: colors.secondaryLabel,
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  headerTitleGroup: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
  },
  triageBanner: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  triageIconBadge: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  triageTextGroup: {
    flex: 1,
    gap: 2,
  },
  triageHeaderLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  triageTitle: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "700",
  },
  triageSubtitle: {
    color: colors.secondaryLabel,
    fontSize: 11,
    lineHeight: 15,
  },
  attachRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 2,
  },
  attachText: {
    color: colors.secondaryLabel,
  },
  avatarTile: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  stack: {
    gap: spacing.sm,
  },
  threadCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  threadCardUnread: {
    backgroundColor: colors.inkSubtle,
  },
  threadFrom: {
    color: colors.label,
    flex: 1,
    fontWeight: "700",
  },
  threadInfo: {
    flex: 1,
    gap: 2,
  },
  threadPreview: {
    color: colors.secondaryLabel,
    lineHeight: 16,
  },
  threadSubject: {
    color: colors.label,
  },
  threadSubjectUnread: {
    color: colors.ink,
    fontWeight: "700",
  },
  threadTime: {
    color: colors.tertiaryLabel,
  },
  threadTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  unreadDot: {
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
});
