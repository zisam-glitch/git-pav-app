import React, { useState } from "react";
import { PRACTICE_TIME_ZONE } from "@/features/booking/uk-time";
import { View, StyleSheet, ScrollView, FlatList, Pressable, RefreshControl } from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import {
  ThemedText,
  SegmentedControl,
  Card,
  EmptyState,
  ErrorState,
  AppIcon,
  Skeleton,
  Input,
  Button,
  Toast,
} from "@/components";
import { colors, spacing, radius } from "@/theme";
import {
  useMessageThreads,
  usePracticeHours,
  useReplyMessageThreadMutation,
  useMarkMessageThreadReadMutation,
} from "@/features/hooks/use-dental-api";

export interface ThreadItem {
  id: string;
  from: string;
  subject: string;
  preview: string;
  sentAtIso: string;
  isRead: boolean;
  hasAttachment: boolean;
  recipientType?: string;
  patientName?: string;
  messages: Array<{
    id: string;
    senderRole: string;
    senderName: string;
    body: string;
    sentAtIso: string;
    /** Links to photos the patient sent. */
    photos: string[];
  }>;
}

export default function ClinicianInboxScreen() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [activeThread, setActiveThread] = useState<ThreadItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const { hoursText } = usePracticeHours();
  const { data: rawThreads, isLoading, isError, refetch, isRefetching } = useMessageThreads();
  const replyMutation = useReplyMessageThreadMutation();
  const markReadMutation = useMarkMessageThreadReadMutation();

  const threads: ThreadItem[] = Array.isArray(rawThreads)
    ? rawThreads.map((t: any) => ({
        id: t.id,
        from: t.from || t.patientName || "Patient",
        subject: t.subject || "No Subject",
        preview: t.preview || "",
        sentAtIso: t.sentAtIso || t.updatedAt || new Date().toISOString(),
        isRead: Boolean(t.isRead),
        hasAttachment: Boolean(t.hasAttachment),
        recipientType: t.recipientType || "practice",
        patientName: t.patientName || t.from || "Patient",
        messages: Array.isArray(t.messages)
          ? t.messages.map((m: any) => ({
              id: m.id,
              senderRole: m.senderRole,
              senderName: m.senderName,
              body: m.body || "",
              sentAtIso: m.sentAtIso || new Date().toISOString(),
              photos: Array.isArray(m.attachments)
                ? m.attachments.map((a: { url?: unknown }) => a?.url).filter((u: unknown): u is string => typeof u === "string")
                : [],
            }))
          : [],
      }))
    : [];

  const filteredThreads = threads.filter((t) => {
    if (filter === "unread" && t.isRead) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.subject.toLowerCase().includes(q) ||
      t.from.toLowerCase().includes(q) ||
      t.preview.toLowerCase().includes(q)
    );
  });

  const unreadCount = threads.filter((t) => !t.isRead).length;

  const openThread = (thread: ThreadItem) => {
    if (!thread.isRead) {
      markReadMutation.mutate(thread.id);
    }
    setActiveThread(thread);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!activeThread || !replyText.trim()) return;
    const body = replyText.trim();
    try {
      await replyMutation.mutateAsync({ threadId: activeThread.id, body });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setToast({ message: "Reply sent to patient", tone: "success" });
      setReplyText("");
      // Refresh thread list
      await refetch();
      // Update active thread locally
      setActiveThread((prev) =>
        prev
          ? {
              ...prev,
              isRead: true,
              messages: [
                ...prev.messages,
                {
                  id: `local-${Date.now()}`,
                  senderRole: "clinician",
                  senderName: "You (Clinician)",
                  body,
                  photos: [],
                  sentAtIso: new Date().toISOString(),
                },
              ],
            }
          : null
      );
    } catch (err: any) {
      setToast({ message: err?.message || "Your reply did not send. Please try again.", tone: "error" });
    }
  };

  return (
    <View style={styles.container}>
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}

      {/* Emergency Guidance & SLA Notice */}
      <View style={styles.slaBanner}>
        <View style={styles.slaBadge}>
          <AppIcon name="alert" size={14} color={colors.danger} />
        </View>
        <ThemedText variant="caption" style={styles.slaText}>
          Non-emergency inbox. Clinic hours: {hoursText}. Emergency cases call 999 or attend A&E. Out-of-hours advice call 111.
        </ThemedText>
      </View>

      <View style={styles.segmentWrap}>
        <SegmentedControl
          segments={[
            { key: "all", label: `All (${threads.length})` },
            { key: "unread", label: unreadCount > 0 ? `Unread (${unreadCount})` : "Unread" },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Input
          label=""
          placeholder="Search by patient name or subject…"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search clinician messages"
        />
      </View>

      <FlatList
        data={!isLoading && !(isError && rawThreads === undefined) ? filteredThreads : []}
        keyExtractor={(t) => t.id}
        extraData={activeThread?.id}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        renderItem={({ item: t }) => {
      const unread = !t.isRead;
      const isSelected = activeThread?.id === t.id;
      return (
        <Pressable
          key={t.id}
          accessibilityRole="button"
          accessibilityLabel={`Message from ${t.from}: ${t.subject}`}
          onPress={() => openThread(t)}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        >
          <Card
           
            style={[
              styles.threadCard,
              unread && styles.threadCardUnread,
              isSelected && styles.threadCardSelected,
            ]}
          >
            <View style={styles.avatarTile}>
              <AppIcon name="message" size={18} color={unread ? colors.onInk : colors.ink} />
            </View>
            <View style={styles.threadInfo}>
              <View style={styles.threadTop}>
                <ThemedText variant="subhead" style={styles.threadPatient} numberOfLines={1}>
                  {t.from}
                </ThemedText>
                <ThemedText variant="caption" style={styles.threadTime}>
                  {new Date(t.sentAtIso).toLocaleDateString("en-GB", { timeZone: PRACTICE_TIME_ZONE,
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </ThemedText>
              </View>
              <ThemedText
                variant="body"
                style={unread ? styles.threadSubjectUnread : styles.threadSubject}
                numberOfLines={1}
              >
                {t.subject}
              </ThemedText>
              <ThemedText variant="caption" style={styles.threadPreview} numberOfLines={2}>
                {t.preview}
              </ThemedText>
            </View>
            {unread ? <View style={styles.unreadDot} /> : null}
          </Card>
        </Pressable>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.stack}>
              <Skeleton height={80} />
              <Skeleton height={80} />
              <Skeleton height={80} />
            </View>
          ) : isError && rawThreads === undefined ? (
            <ErrorState
              message="We couldn't load messages. Check your connection and try again."
              onRetry={() => refetch()}
            />
          ) : (
            <EmptyState
              illustration="messages"
              heading={filter === "unread" ? "No unread messages" : "No messages found"}
              body={search ? `No messages match "${search}".` : "Patient communications in your care appear here."}
              icon="message"
            />
          )
        }
      />

      {/* Conversation / Reply Modal or Bottom Sheet */}
      {activeThread ? (
        <View style={styles.conversationDrawer}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerHeaderLeft}>
              <ThemedText variant="subhead" numberOfLines={1}>
                {activeThread.from}
              </ThemedText>
              <ThemedText variant="caption" style={styles.drawerSubject} numberOfLines={1}>
                {activeThread.subject}
              </ThemedText>
            </View>
            <Button title="Close" variant="ghost" size="sm" onPress={() => setActiveThread(null)} />
          </View>

          {/* Messages list */}
          <ScrollView style={styles.messagesList} contentContainerStyle={styles.messagesListContent}>
            {activeThread.messages.map((m) => {
              const isClinician = m.senderRole === "clinician" || m.senderRole === "admin";
              return (
                <View
                  key={m.id}
                  style={[styles.bubbleContainer, isClinician ? styles.bubbleClinician : styles.bubblePatient]}
                >
                  <ThemedText variant="caption" style={styles.bubbleSender}>
                    {m.senderName}
                  </ThemedText>
                  {m.body ? (
                    <ThemedText variant="body" style={isClinician ? styles.bubbleTextClinician : styles.bubbleTextPatient}>
                      {m.body}
                    </ThemedText>
                  ) : null}
                  {m.photos.map((url) => (
                    <Image key={url} source={{ uri: url }} style={{ borderRadius: radius.md, height: 200, width: 240 }} contentFit="cover" accessibilityLabel="Photo from the patient" />
                  ))}
                  <ThemedText variant="caption" style={styles.bubbleTime}>
                    {new Date(m.sentAtIso).toLocaleTimeString("en-GB", { timeZone: PRACTICE_TIME_ZONE,
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ThemedText>
                </View>
              );
            })}
          </ScrollView>

          {/* Reply Input */}
          <View style={styles.replyComposer}>
            <View style={styles.composerRow}>
              <Input
                label=""
                placeholder="Write a reply to the patient…"
                value={replyText}
                onChangeText={setReplyText}
                multiline
                maxLength={4000}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send reply"
                onPress={handleSendReply}
                disabled={!replyText.trim() || replyMutation.isPending}
                style={({ pressed }) => [
                  styles.sendBtn,
                  pressed && { opacity: 0.8 },
                  (!replyText.trim() || replyMutation.isPending) && styles.sendBtnDisabled,
                ]}
              >
                <AppIcon name="arrowRight" size={18} color={colors.onInk} />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentWrap: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  slaBanner: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    margin: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.sm,
  },
  slaBadge: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.full,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  slaText: {
    color: colors.secondaryLabel,
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  searchContainer: {
    marginHorizontal: spacing.gutter,
    marginTop: spacing.sm,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stack: {
    gap: spacing.sm,
  },
  threadCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  threadCardUnread: {
    borderColor: colors.ink,
    borderWidth: 1.5,
  },
  threadCardSelected: {
    backgroundColor: colors.inkSubtle,
  },
  avatarTile: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  threadInfo: {
    flex: 1,
  },
  threadTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  threadPatient: {
    color: colors.ink,
    flex: 1,
    fontWeight: "600",
  },
  threadTime: {
    color: colors.secondaryLabel,
    fontSize: 11,
  },
  threadSubject: {
    color: colors.secondaryLabel,
    marginVertical: 2,
  },
  threadSubjectUnread: {
    color: colors.ink,
    fontWeight: "700",
    marginVertical: 2,
  },
  threadPreview: {
    color: colors.tertiaryLabel,
  },
  unreadDot: {
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  conversationDrawer: {
    backgroundColor: colors.systemBackground,
    borderTopColor: colors.separator,
    borderTopWidth: 1,
    maxHeight: "55%",
    padding: spacing.md,
  },
  drawerHeader: {
    alignItems: "center",
    borderBottomColor: colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
  },
  drawerHeaderLeft: {
    flex: 1,
  },
  drawerSubject: {
    color: colors.secondaryLabel,
  },
  messagesList: {
    maxHeight: 200,
    marginVertical: spacing.sm,
  },
  messagesListContent: {
    gap: spacing.sm,
  },
  bubbleContainer: {
    borderRadius: radius.md,
    maxWidth: "85%",
    padding: spacing.sm,
  },
  bubblePatient: {
    alignSelf: "flex-start",
    backgroundColor: colors.systemBackground,
  },
  bubbleClinician: {
    alignSelf: "flex-end",
    backgroundColor: colors.ink,
  },
  bubbleSender: {
    color: colors.secondaryLabel,
    fontSize: 11,
    marginBottom: 2,
  },
  bubbleTextPatient: {
    color: colors.ink,
  },
  bubbleTextClinician: {
    color: colors.onInk,
  },
  bubbleTime: {
    alignSelf: "flex-end",
    color: colors.tertiaryLabel,
    fontSize: 11,
    marginTop: 2,
  },
  replyComposer: {
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xs,
  },
  composerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  sendBtn: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  sendBtnDisabled: {
    backgroundColor: colors.tertiaryLabel,
    opacity: 0.5,
  },
});
