import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemedText,
  Card,
  ListRow,
  Avatar,
  AppIcon,
  Badge,
  IconButton,
  ConfirmSheet,
  type AppIconName,
} from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { LEGAL_URLS } from "@/config/legal";

// ─── Profile hub — the single settings surface (absorbed the old Account tab) ──
// Identity on top, grouped disclosure below (progressive-disclosure pattern).

interface MenuRow {
  title: string;
  subtitle?: string;
  icon: AppIconName;
  route?: string;
  url?: string;
}

const groups: { heading: string; rows: MenuRow[] }[] = [
  {
    heading: "Account",
    rows: [
      {
        title: "Personal information",
        icon: "profile",
        route: "/(patient)/(tabs)/profile/personal-info",
      },
      {
        title: "Medical history",
        icon: "clipboard",
        route: "/(patient)/(tabs)/profile/medical-history",
      },
      {
        title: "Emergency contact",
        icon: "heart",
        route: "/(patient)/(tabs)/profile/emergency-contact",
      },
      {
        title: "Dependants & family",
        icon: "users",
        route: "/(patient)/(tabs)/profile/dependants",
      },
    ],
  },
  {
    heading: "Preferences",
    rows: [
      {
        title: "Notification preferences",
        icon: "bell",
        route: "/(patient)/(tabs)/profile/notifications",
      },
      {
        title: "Payment methods",
        icon: "creditCard",
        route: "/(patient)/(tabs)/profile/payment-methods",
      },
    ],
  },
  {
    heading: "Rewards",
    rows: [
      {
        title: "Refer a friend",
        icon: "users",
        route: "/(patient)/(tabs)/profile/refer",
      },
    ],
  },
  {
    heading: "Security & privacy",
    rows: [
      {
        title: "Security & privacy",
        icon: "lock",
        route: "/(patient)/(tabs)/profile/security",
      },
      {
        title: "Active sessions",
        icon: "smartphone",
        route: "/(patient)/(tabs)/profile/sessions",
      },
      {
        title: "Consent & GDPR",
        icon: "shield",
        route: "/(patient)/(tabs)/profile/consent",
      },
    ],
  },
  {
    heading: "Legal & policies",
    rows: [
      {
        title: "Privacy notice",
        icon: "shieldCheck",
        url: LEGAL_URLS.privacy,
      },
      {
        title: "Terms of service",
        icon: "fileText",
        url: LEGAL_URLS.terms,
      },
      {
        title: "Complaints procedure",
        icon: "help",
        url: LEGAL_URLS.complaints,
      },
      {
        title: "Cookie policy",
        icon: "globe",
        url: LEGAL_URLS.cookies,
      },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Your account";

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
    } catch {
      // clearAuth is called inside signOut regardless — safe to ignore network errors
    }
  };

  const renderGroup = (heading: string, rows: MenuRow[]) => (
    <View key={heading} style={styles.group}>
      <ThemedText variant="overline" style={styles.groupHeading}>
        {heading}
      </ThemedText>
      <Card padding="none">
        {rows.map((row, i) => (
          <ListRow
            key={row.route || row.url || row.title}
            title={row.title}
            subtitle={row.subtitle}
            left={
              <View style={styles.rowIcon}>
                <AppIcon name={row.icon} size={18} color={colors.ink} />
              </View>
            }
            right={
              row.url ? (
                <AppIcon name="externalLink" size={16} color={colors.tertiaryLabel} />
              ) : (
                <AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />
              )
            }
            onPress={() => {
              if (row.url) {
                Linking.openURL(row.url).catch(() => {});
              } else if (row.route) {
                router.push(row.route as never);
              }
            }}
            separator={i < rows.length - 1}
          />
        ))}
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Neo Financial Top Header with Circular Close Button */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <ThemedText variant="largeTitle">Profile</ThemedText>
            <ThemedText variant="subhead" style={styles.headerSub}>
              Manage your details and preferences
            </ThemedText>
          </View>
          <IconButton
            icon="close"
            label="Close profile"
            variant="soft"
            size={18}
            onPress={() => router.back()}
          />
        </View>

        {/* Identity card — edit target is Personal Information */}
        <Card padding="none" style={styles.identityCard}>
          <ListRow
            title={displayName}
            subtitle={user?.email}
            left={<Avatar name={displayName} size="lg" />}
            right={<AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />}
            onPress={() => router.push("/(patient)/(tabs)/profile/personal-info" as never)}
            style={styles.identityRow}
          />
        </Card>

        {groups
          // Referral codes are for patients only.
          .filter((g) => g.heading !== "Rewards" || user?.role === "patient")
          .map((g) => renderGroup(g.heading, g.rows))}

        {/* Portal Role Switcher (development opt-in only) */}
        {__DEV__ && process.env.EXPO_PUBLIC_ENABLE_ROLE_SWITCHER === "true" ? (
          <View style={styles.group}>
            <ThemedText variant="overline" style={styles.groupHeading}>
              Switch App Role (Demo & Verification)
            </ThemedText>
            <Card padding="none">
              <ListRow
                title="Clinician portal (dentist)"
                subtitle="Schedule, tooth chart and prescriptions"
                left={
                  <View style={styles.rowIcon}>
                    <AppIcon name="userCheck" size={18} color={colors.ink} />
                  </View>
                }
                right={<Badge label="Clinician" variant="info" />}
                onPress={() => {
                  useAuthStore.getState().updateUser({
                    role: "clinician",
                    email: "clinician@example.test",
                    firstName: "Demo",
                    lastName: "Clinician",
                  });
                  router.replace("/(clinician)/schedule" as any);
                }}
                separator
              />
              <ListRow
                title="Mobile van operator portal"
                subtitle="Unit 01 Dispatch · real-time stops, en route and on-site triage"
                left={
                  <View style={styles.rowIcon}>
                    <AppIcon name="navigation" size={18} color={colors.ink} />
                  </View>
                }
                right={<Badge label="Operator" variant="warning" />}
                onPress={() => {
                  useAuthStore.getState().updateUser({
                    role: "operator",
                    email: "operator@example.test",
                    firstName: "Test",
                    lastName: "Operator",
                  });
                  router.replace("/(operator)/route" as any);
                }}
              />
            </Card>
          </View>
        ) : null}

        {/* Danger zone */}
        <View style={styles.group}>
          <ThemedText variant="overline" style={styles.groupHeading}>
            Danger zone
          </ThemedText>
          <Card padding="none">
            <ListRow
              title="Sign out"
              left={
                <View style={styles.rowIcon}>
                  <AppIcon name="logOut" size={18} color={colors.label} />
                </View>
              }
              onPress={() => setConfirmSignOut(true)}
              separator
            />
            <ListRow
              title="Delete account"
              subtitle="Permanently remove your account and data"
              left={
                <View style={[styles.rowIcon, styles.rowIconDanger]}>
                  <AppIcon name="trash" size={18} color={colors.danger} />
                </View>
              }
              onPress={() => router.push("/(patient)/(tabs)/profile/delete-account" as never)}
            />
          </Card>
        </View>
      </ScrollView>

      {confirmSignOut ? (
        <ConfirmSheet
          title="Sign out?"
          message="You will need to sign in again to access your appointments and records. This device will be remembered."
          confirmLabel="Sign out"
          cancelLabel="Stay signed in"
          variant="destructive"
          onConfirm={() => {
            setConfirmSignOut(false);
            handleSignOut();
          }}
          onCancel={() => setConfirmSignOut(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextWrap: {
    gap: spacing.xxs,
  },
  headerSub: {
    color: colors.secondaryLabel,
  },
  identityCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.systemBackground,
    borderColor: colors.separator,
  },
  identityRow: {
    paddingVertical: spacing.sm,
  },
  group: {
    gap: spacing.xxs,
  },
  groupHeading: {
    marginLeft: spacing.xxs,
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
    borderColor: colors.separator,
    borderWidth: 1,
  },
  rowIconDanger: {
    backgroundColor: colors.dangerSubtle,
  },
});
