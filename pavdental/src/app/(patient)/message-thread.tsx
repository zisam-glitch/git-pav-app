import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Button, Input, Toast, EmptyState, ErrorState, Skeleton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import {
  useMessageThreads,
  useReplyMessageThreadMutation,
  useMarkMessageThreadReadMutation,
} from "@/features/hooks/use-dental-api";
import { threadMessages } from "@/features/messages/thread";
import { PRACTICE_TIME_ZONE } from "@/features/booking/uk-time";

interface RawThread {
  id: string;
  subject?: string;
  isRead?: boolean;
  messages?: unknown;
}

// One conversation: every message, oldest first, with a reply box underneath.
export default function MessageThreadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: rawThreads, isLoading, isError, refetch } = useMessageThreads();
  const replyMutation = useReplyMessageThreadMutation();
  const markRead = useMarkMessageThreadReadMutation();
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const scroller = useRef<ScrollView>(null);

  const thread = Array.isArray(rawThreads) ? (rawThreads as RawThread[]).find((t) => t.id === id) : undefined;
  const messages = threadMessages(thread);

  const unread = thread ? !thread.isRead : false;
  useEffect(() => {
    if (unread && id) markRead.mutate(id);
    // Mark read once per thread opened.
  }, [unread, id]);

  useEffect(() => {
    scroller.current?.scrollToEnd({ animated: false });
  }, [messages.length]);

  const send = async () => {
    const body = reply.trim();
    if (!body || !id) return;
    try {
      await replyMutation.mutateAsync({ threadId: id, body });
      setReply("");
    } catch (err: unknown) {
      // Keep what they typed, and say plainly that it did not send.
      setToast({ message: (err instanceof Error && err.message) || "Your message did not send. Please try again.", tone: "error" });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={64} />
          <Skeleton height={64} />
        </View>
      </View>
    );
  }
  if (isError && rawThreads === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState message="We couldn't load this conversation. Check your connection and try again." onRetry={() => refetch()} />
      </View>
    );
  }
  if (!thread) {
    return (
      <View style={styles.container}>
        <EmptyState
          illustration="messages"
          heading="Conversation not found"
          body="It may have been removed."
          actionLabel="Back to messages"
          onAction={() => router.back()}
          icon="message"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}
      <ScrollView ref={scroller} contentContainerStyle={styles.content}>
        <ThemedText variant="headline" style={styles.subject}>
          {thread.subject}
        </ThemedText>
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.mine ? styles.mine : styles.theirs]}>
            <ThemedText variant="caption" style={m.mine ? styles.metaMine : styles.meta}>
              {m.sender} ·{" "}
              {new Date(m.sentAtIso).toLocaleString("en-GB", {
                timeZone: PRACTICE_TIME_ZONE,
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
            <ThemedText variant="body" style={m.mine ? styles.bodyMine : styles.body}>
              {m.body}
            </ThemedText>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: Math.max(spacing.sm, insets.bottom) }]}>
        <Input
          label=""
          placeholder="Write a reply…"
          value={reply}
          onChangeText={setReply}
          multiline
          accessibilityLabel="Your reply"
        />
        <Button
          title="Send"
          size="md"
          loading={replyMutation.isPending}
          disabled={!reply.trim()}
          onPress={send}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.label },
  bodyMine: { color: colors.onInk },
  bubble: { borderRadius: radius.lg, gap: 2, maxWidth: "88%", padding: spacing.sm },
  composer: {
    backgroundColor: colors.background,
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.sm, paddingHorizontal: spacing.gutter, paddingVertical: spacing.md },
  meta: { color: colors.secondaryLabel },
  metaMine: { color: colors.onInk, opacity: 0.8 },
  mine: { alignSelf: "flex-end", backgroundColor: colors.ink },
  subject: { color: colors.label, fontWeight: "700" },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.systemBackground },
});
