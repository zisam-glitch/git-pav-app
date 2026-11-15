import { useEffect, useRef, useState } from "react";
import { ukDateLabel, ukDateTimeLabel } from "@/features/booking/uk-time";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  useMessageThread,
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
}

interface RawThreadMessage {
  id?: unknown;
  senderRole?: string;
  senderName?: string;
  body?: unknown;
  sentAtIso?: unknown;
  attachments?: unknown;
}

interface ThreadMessageItem {
  id: string;
  senderRole: string;
  senderName: string;
  body: string;
  sentAtIso: string;
  photos: string[];
}

function parseThreadMessages(pages: Array<{ messages?: unknown[] }> | undefined): ThreadMessageItem[] {
  if (!pages) return [];
  const raw = [...pages].reverse().flatMap((p) => (Array.isArray(p.messages) ? p.messages : []));
  return raw
    .map((item) => {
      const m = item as RawThreadMessage;
      return {
        id: String(m.id ?? ""),
        senderRole: String(m.senderRole ?? "patient"),
        senderName: m.senderName || (m.senderRole === "patient" ? "Patient" : "Pav Dental care team"),
        body: String(m.body ?? ""),
        sentAtIso: String(m.sentAtIso ?? ""),
        photos: Array.isArray(m.attachments)
          ? m.attachments.map((a) => (a as { url?: unknown })?.url).filter((u): u is string => typeof u === "string")
          : [],
      };
    })
    .sort((a, b) => a.sentAtIso.localeCompare(b.sentAtIso));
}

export default function ClinicianInboxScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [activeThread, setActiveThread] = useState<ThreadItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const scroller = useRef<ScrollView>(null);

  const { hoursText } = usePracticeHours();
  const {
    data: rawThreads,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessageThreads("summary");

  const threadQuery = useMessageThread(activeThread?.id);
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

  const activeMessages = parseThreadMessages(threadQuery.data?.pages);
  const newestId = activeMessages[activeMessages.length - 1]?.id;

  useEffect(() => {
    if (activeThread && newestId) {
      scroller.current?.scrollToEnd({ animated: false });
    }
  }, [activeThread?.id, newestId]);

  const handleSendReply = async () => {
    if (!activeThread || !replyText.trim()) return;
    const body = replyText.trim();
    try {
      await replyMutation.mutateAsync({ threadId: activeThread.id, body });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setToast({ message: "Reply sent to patient", tone: "success" });
      setReplyText("");
      await threadQuery.refetch();
    } catch (err: any) {
      setToast({ message: err?.message || "Your reply did not send. Please try again.", tone: "error" });
    }
  };

  if (activeThread) {
    const pageMeta = threadQuery.data?.pages[0];
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}

        <View style={styles.conversationHeader}>
          <Button title="Back" variant="ghost" size="sm" onPress={() => setActiveThread(null)} />
          <View style={styles.drawerHeaderLeft}>
            <ThemedText variant="subhead" numberOfLines={1}>
              {activeThread.from}
            </ThemedText>
            <ThemedText variant="caption" style={styles.drawerSubject} numberOfLines={1}>
              {pageMeta?.subject || activeThread.subject}
            </ThemedText>
          </View>
        </View>

        {threadQuery.isLoading ? (
          <View style={[styles.scrollContent, styles.stack]}>
            <Skeleton height={64} />
            <Skeleton height={64} />
          </View>
        ) : threadQuery.isError && threadQuery.data === undefined ? (
          <View style={styles.scrollContent}>
            <ErrorState
              message="We couldn't load this conversation. Check your connection and try again."
              onRetry={() => threadQuery.refetch()}
            />
          </View>
        ) : (
          <ScrollView ref={scroller} style={styles.messagesList} contentContainerStyle={styles.messagesListContent}>
            {threadQuery.hasNextPage ? (
              <Button
                title={threadQuery.isFetchingNextPage ? "Loading…" : "Show earlier messages"}
                variant="ghost"
                size="sm"
                loading={threadQuery.isFetchingNextPage}
                onPress={() => threadQuery.fetchNextPage()}
              />
            ) : null}
            {activeMessages.map((m) => {
              const isClinician = m.senderRole === "clinician" || m.senderRole === "admin";
              return (
                <View
                  key={m.id}
                  style={[styles.bubbleContainer, isClinician ? styles.bubbleClinician : styles.bubblePatient]}
                >
                  <ThemedText variant="caption" style={[styles.bubbleSender, isClinician && styles.bubbleMetaOnInk]}>
                    {m.senderName}
                  </ThemedText>
                  {m.body ? (
                    <ThemedText variant="body" style={isClinician ? styles.bubbleTextClinician : styles.bubbleTextPatient}>
                      {m.body}
                    </ThemedText>
                  ) : null}
                  {m.photos.map((url) => (
                    <Image
                      key={url}
                      source={{ uri: url }}
                      style={styles.photo}
                      contentFit="cover"
                      accessibilityLabel="Photo from the patient"
                    />
                  ))}
                  <ThemedText variant="caption" style={[styles.bubbleTime, isClinician && styles.bubbleMetaOnInk]}>
                    {ukDateTimeLabel(new Date(m.sentAtIso), {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ThemedText>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={[styles.replyComposer, { paddingBottom: Math.max(spacing.sm, insets.bottom) }]}>
          <View style={styles.composerRow}>
            <View style={styles.composerInput}>
              <Input
                label=""
                placeholder="Write a reply to the patient…"
                accessibilityLabel="Reply to the patient"
                value={replyText}
                onChangeText={setReplyText}
                multiline
                maxLength={4000}
              />
            </View>
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
      </KeyboardAvoidingView>
    );
  }

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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item: t }) => {
          const unread = !t.isRead;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={`Message from ${t.from}: ${t.subject}`}
              onPress={() => openThread(t)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <Card style={[styles.threadCard, unread && styles.threadCardUnread]}>
                <View style={styles.avatarTile}>
                  <AppIcon name="message" size={18} color={unread ? colors.onInk : colors.ink} />
                </View>
                <View style={styles.threadInfo}>
                  <View style={styles.threadTop}>
                    <ThemedText variant="subhead" style={styles.threadPatient} numberOfLines={1}>
                      {t.from}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.threadTime}>
                      {ukDateLabel(new Date(t.sentAtIso), {
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
  conversationHeader: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderBottomColor: colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  drawerHeaderLeft: {
    flex: 1,
  },
  drawerSubject: {
    color: colors.secondaryLabel,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
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
  photo: {
    borderRadius: radius.md,
    height: 200,
    marginTop: spacing.xxs,
    width: 240,
  },
  bubbleTime: {
    alignSelf: "flex-end",
    color: colors.tertiaryLabel,
    fontSize: 11,
    marginTop: 2,
  },
  replyComposer: {
    backgroundColor: colors.background,
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
  composerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  // Without flex the box shrinks to a sliver beside the send button.
  composerInput: {
    flex: 1,
  },
  // The sender and time on a dark bubble: the usual grey is unreadable there.
  bubbleMetaOnInk: {
    color: colors.onInk,
    opacity: 0.75,
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
