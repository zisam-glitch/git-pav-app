import { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Button, Input, Toast, Skeleton } from "@/components";
import { colors, spacing } from "@/theme";
import { useAppointmentMessageThread, useSendAppointmentMessageMutation } from "@/features/video/use-video-queries";

// Write to your dentist about one video visit. There is one conversation per
// visit: if it already exists this opens it, otherwise the first message makes it.
export default function VideoMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const threadQuery = useAppointmentMessageThread(appointmentId);
  const sendMutation = useSendAppointmentMessageMutation();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const openThread = (threadId: string) =>
    router.replace({ pathname: "/(patient)/message-thread" as never, params: { id: threadId } });

  useEffect(() => {
    if (threadQuery.data?.threadId) {
      openThread(threadQuery.data.threadId);
    }
  }, [threadQuery.data?.threadId]);

  const checking = Boolean(appointmentId) && threadQuery.isLoading;
  const sending = sendMutation.isPending;

  const send = async () => {
    const body = text.trim();
    if (!body || !appointmentId || sending) return;
    setError(null);
    try {
      const data = await sendMutation.mutateAsync({ appointmentId, body });
      if (!data?.threadId) {
        setError("Your message did not send. Please try again.");
        return;
      }
      openThread(data.threadId);
    } catch (err: any) {
      setError(err?.message || "Your message did not send. Check your connection and try again.");
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
