import React, { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ThemedText, Button, Input, Toast, Skeleton } from "@/components";
import { colors, spacing } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";

// Write to your dentist about one video visit. There is one conversation per
// visit: if it already exists this opens it, otherwise the first message makes it.
export default function VideoMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [checking, setChecking] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openThread = (threadId: string) =>
    router.replace({ pathname: "/(patient)/message-thread" as never, params: { id: threadId } });

  useEffect(() => {
    let active = true;
    async function find() {
      if (!appointmentId) return setChecking(false);
      try {
        const res = await authFetch(`/api/appointment-messages/${appointmentId}`);
        const data = res.ok ? await res.json().catch(() => null) : null;
        if (!active) return;
        if (data?.threadId) return openThread(data.threadId);
      } catch {
        // No conversation found; the box below still works.
      }
      if (active) setChecking(false);
    }
    find();
    return () => {
      active = false;
    };
  }, [appointmentId]);

  const send = async () => {
    const body = text.trim();
    if (!body || !appointmentId || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await authFetch(`/api/appointment-messages/${appointmentId}`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.threadId) {
        setError(data?.error || "Your message did not send. Please try again.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      openThread(data.threadId);
    } catch {
      setError("Your message did not send. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={60} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {error ? <Toast message={error} tone="error" onDismiss={() => setError(null)} /> : null}
      <View style={[styles.content, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <ThemedText variant="title">Message your dentist</ThemedText>
        <ThemedText variant="subhead" style={styles.muted}>
          Write about this video visit. Your dentist will see it in the app. If this is an emergency, call 999.
        </ThemedText>
        <Input
          label=""
          placeholder="Write your message…"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={4000}
          accessibilityLabel="Your message to your dentist"
        />
        <Button title="Send" size="lg" loading={sending} disabled={!text.trim()} onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.sm, paddingHorizontal: spacing.gutter, paddingTop: spacing.md },
  muted: { color: colors.secondaryLabel },
});
