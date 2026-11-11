import { normalisePostcode } from "@/features/onboarding/validation";
import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText, Input, Button, FlowHeader } from "@/components";
import { colors, spacing } from "@/theme";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { PRACTICE_CONFIG } from "@/config/practice";

export default function OnboardingAddressScreen() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setAddress = useOnboardingStore((s) => s.setAddress);

  const handleNext = () => {
    const errs: Record<string, string> = {};
    const cleanPostcode = normalisePostcode(postcode);
    if (!postcode.trim()) errs.postcode = "Postcode is required.";
    else if (!cleanPostcode) errs.postcode = "Enter a UK postcode, like SW1A 1AA.";
    if (!addressLine1.trim()) errs.addressLine1 = "Address line 1 is required.";
    if (!city.trim()) errs.city = "City is required.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setAddress({
      postcode: cleanPostcode ?? postcode.trim().toUpperCase(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      city: city.trim(),
    });
    router.push("/onboarding/medical-history");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.topNav}>
          <FlowHeader step={{ current: 2, total: 4 }} insetHandled />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText variant="largeTitle" style={styles.title}>
              Home address
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              Used to check mobile dental van coverage and for clinic records.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Input
              label="UK postcode"
              placeholder={`e.g. ${PRACTICE_CONFIG.examplePostcode}`}
              autoCapitalize="characters"
              value={postcode}
              error={errors.postcode}
              onChangeText={(val) => {
                setPostcode(val);
                if (errors.postcode) setErrors((prev) => ({ ...prev, postcode: "" }));
              }}
            />

            <Input
              label="Address line 1"
              placeholder="House number & street name"
              value={addressLine1}
              error={errors.addressLine1}
              onChangeText={(val) => {
                setAddressLine1(val);
                if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: "" }));
              }}
            />

            <Input
              label="Address line 2 (optional)"
              placeholder="Flat, suite or apartment number"
              value={addressLine2}
              onChangeText={setAddressLine2}
            />

            <Input
              label="Town / city"
              placeholder={`e.g. ${PRACTICE_CONFIG.exampleCity}`}
              value={city}
              error={errors.city}
              onChangeText={(val) => {
                setCity(val);
                if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
              }}
            />
          </View>

          <View style={styles.actions}>
            <Button
              title="Continue"
              size="lg"
              arrow={true}
              onPress={handleNext}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: "auto",
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
  subtitle: {
    color: colors.secondaryLabel,
    fontSize: 15,
    lineHeight: 21,
  },
  title: {
    color: colors.label,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  topNav: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
