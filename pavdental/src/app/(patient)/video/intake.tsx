import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Input, Button, Card } from "@/components";
import { colors, spacing, radius } from "@/theme";

export default function VideoIntakeScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [symptomText, setSymptomText] = useState("");
  // Not pre-filled: a made-up 5/10 would reach the dentist as if the patient had said it.
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [hasSwelling, setHasSwelling] = useState(false);
  const [duration, setDuration] = useState<string | null>(null);
  const [dualRecordingConsent, setDualRecordingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const painLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const durations = ["Less than 24 hours", "Past 24-48 hours", "Over a week"];

  const handleContinue = () => {
    if (!symptomText.trim()) {
      setError("Please describe the main issue or symptom you are experiencing.");
      return;
    }
    if (painLevel === null) {
      setError("Please choose how bad the pain is, from 1 to 10.");
      return;
    }
    if (duration === null) {
      setError("Please say how long you have had the problem.");
      return;
    }
    if (!dualRecordingConsent) {
      setError("Please consent to the clinical consultation terms to continue.");
      return;
    }
    router.push({
      pathname: "/(patient)/video/photos" as any,
      params: {
        appointmentId: appointmentId || "",
        symptomText: symptomText.trim(),
        painLevel: String(painLevel),
        hasSwelling: String(hasSwelling),
        duration,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="largeTitle" style={styles.title}>
            What's bothering you?
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            Your triage answers are sent directly to the examining dentist before they connect.
          </ThemedText>
        </View>

        {error ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <ThemedText variant="caption" style={styles.errorText}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        {/* Symptoms Description */}
        <Input
          label="Describe your symptoms / dental issue"
          placeholder="e.g. Constant throbbing pain on lower right molar when drinking cold fluids"
          multiline
          numberOfLines={4}
          containerStyle={styles.textAreaContainer}
          value={symptomText}
          onChangeText={(val) => {
            setSymptomText(val);
            if (error) setError(null);
          }}
        />

        {/* Pain Severity Scale */}
        <View style={styles.section}>
          <ThemedText variant="headline">
            {painLevel === null ? "Pain severity (1 to 10)" : `Pain severity: ${painLevel} / 10`}
          </ThemedText>
          <ThemedText variant="caption" style={styles.sub}>
            1 = Mild discomfort, 10 = Severe, unmanageable pain
          </ThemedText>
          <View style={styles.painRow}>
            {painLevels.map((lvl) => {
              const selected = painLevel === lvl;
              return (
                <Pressable accessibilityRole="radio" accessibilityLabel={`Pain level ${lvl}`} accessibilityState={{ selected }}
                  key={lvl}
                  onPress={() => {
                    setPainLevel(lvl);
                    if (error) setError(null);
                  }}
                  style={[styles.painPill, selected && styles.painPillSelected]}
                >
                  <ThemedText
                    variant="caption"
                    style={[styles.painText, selected && styles.painTextSelected]}
                  >
                    {lvl}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Swelling Switch */}
        <View style={styles.switchCard}>
          <View style={styles.switchInfo}>
            <ThemedText variant="headline">Facial swelling or gum boil</ThemedText>
            <ThemedText variant="caption" style={styles.sub}>
              Is there any visible swelling on your cheek, jaw or gums?
            </ThemedText>
          </View>
          <Switch
            value={hasSwelling}
            onValueChange={setHasSwelling}
            trackColor={{ true: colors.successFill, false: colors.inkSubtle }}
            accessibilityRole="switch"
            accessibilityLabel="Facial Swelling or Gum Boil"
          />
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <ThemedText variant="headline">Duration of problem</ThemedText>
          <View style={styles.durationList}>
            {durations.map((d) => {
              const active = duration === d;
              return (
                <Pressable
                  key={d}
                  accessibilityRole="button"
                  accessibilityLabel={`Duration: ${d}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setDuration(d);
                    if (error) setError(null);
                  }}
                  style={[styles.durationItem, active && styles.durationItemActive]}
                >
                  <ThemedText
                    variant="body"
                    style={[styles.durationText, active && styles.durationTextActive]}
                  >
                    {d}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Dual Consent */}
        <Card style={styles.consentCard}>
          <View style={styles.consentRow}>
            <View style={styles.consentInfo}>
              <ThemedText variant="headline">Clinical video record consent</ThemedText>
              <ThemedText variant="caption" style={styles.sub}>
                I consent to this remote video examination under UK General Dental Council guidelines.
              </ThemedText>
            </View>
            <Switch
              value={dualRecordingConsent}
              onValueChange={(val) => {
                setDualRecordingConsent(val);
                if (error) setError(null);
              }}
              trackColor={{ true: colors.successFill, false: colors.inkSubtle }}
              accessibilityRole="switch"
              accessibilityLabel="Clinical Video Record Consent"
            />
          </View>
        </Card>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Add photos of your teeth"
              arrow
          size="lg"
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  consentCard: {
    backgroundColor: colors.systemBackground,
    padding: spacing.md,
  },
  consentInfo: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.sm,
  },
  consentRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  durationItem: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  durationItemActive: {
    backgroundColor: colors.accent,
  },
  durationList: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  durationText: {
    color: colors.secondaryLabel,
    textAlign: "center",
  },
  durationTextActive: {
    color: colors.onAccent,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.danger,
  },
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  header: {
    gap: spacing.xxs,
  },
  painPill: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: "center",
    width: 30,
  },
  painPillSelected: {
    backgroundColor: colors.accent,
  },
  painRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  painText: {
    color: colors.label,
    fontWeight: "600",
  },
  painTextSelected: {
    color: colors.onAccent,
    fontWeight: "700",
  },
  section: {
    gap: spacing.xs,
  },
  sub: {
    color: colors.secondaryLabel,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  switchCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  switchInfo: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.sm,
  },
  textAreaContainer: {
    minHeight: 100,
  },
  title: {
    color: colors.label,
  },
});

