import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../themed-text";
import { Badge } from "../badge";
import { AppIcon } from "../app-icon";
import { colors, spacing, radius, sizes } from "@/theme";

export interface SessionData {
  id: string;
  deviceInfo?: string | null;
  ipAddressHash?: string | null;
  createdAt: string | Date;
  expiresAt?: string | Date;
  isCurrent?: boolean;
}

export interface SessionItemProps {
  session: SessionData;
  onRevoke?: (sessionId: string) => void;
  isRevoking?: boolean;
}

export function SessionItem({ session, onRevoke, isRevoking = false }: SessionItemProps) {
  const formattedDate = new Date(session.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extract a readable device name from user-agent or deviceInfo
  const deviceTitle = session.deviceInfo
    ? session.deviceInfo.length > 35
      ? `${session.deviceInfo.slice(0, 32)}...`
      : session.deviceInfo
    : "Mobile App Device";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.deviceInfo}>
          <View style={styles.deviceIconWrap}>
            <AppIcon
              name={
                session.deviceInfo?.toLowerCase().includes("iphone") ||
                session.deviceInfo?.toLowerCase().includes("android")
                  ? "smartphone"
                  : "globe"
              }
              size={20}
              color={colors.ink}
            />
          </View>
          <View style={styles.titleGroup}>
            <View style={styles.titleRow}>
              <ThemedText variant="headline" style={styles.deviceTitle}>
                {deviceTitle}
              </ThemedText>
              {session.isCurrent && (
                <Badge variant="success" label="This device" />
              )}
            </View>
            <ThemedText variant="caption" style={styles.timeText}>
              Started: {formattedDate}
            </ThemedText>
          </View>
        </View>

        {!session.isCurrent && onRevoke ? (
          <TouchableOpacity
            style={[styles.revokeButton, isRevoking && styles.disabledButton]}
            disabled={isRevoking}
            onPress={() => onRevoke(session.id)}
            accessibilityRole="button"
            accessibilityLabel={`Sign out session on ${deviceTitle}`}
          >
            <ThemedText variant="caption" style={styles.revokeText}>
              {isRevoking ? "Revoking..." : "Revoke"}
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>

      {session.ipAddressHash ? (
        <View style={styles.metaRow}>
          <ThemedText variant="caption" style={styles.metaLabel}>
            IP fingerprint (hashed):
          </ThemedText>
          <ThemedText variant="caption" style={styles.metaHash}>
            {session.ipAddressHash.slice(0, 16)}...
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // A flat row on the page (Wise device and settings lists), not a card.
  card: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  deviceIconWrap: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.separator,
    borderRadius: radius.full,
    borderWidth: 1,
    height: sizes.iconTile,
    justifyContent: "center",
    width: sizes.iconTile,
  },
  deviceInfo: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: spacing.sm,
  },
  deviceTitle: {
    color: colors.label,
  },
  disabledButton: {
    opacity: 0.5,
  },
  metaHash: {
    color: colors.label,
    fontVariant: ["tabular-nums"],
  },
  metaLabel: {
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingTop: spacing.xxs,
  },
  revokeButton: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  revokeText: {
    color: colors.danger,
    fontWeight: "600",
  },
  timeText: {
    color: colors.secondaryLabel,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

