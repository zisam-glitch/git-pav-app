import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText, Card, Badge, Button, ErrorState, Skeleton } from "@/components";
import { requestAreaLabel } from "@/features/van/request-area";
import { colors, spacing } from "@/theme";
import { fetchCurrentShift, acceptRequest, declineRequest } from "@/features/van/van-api";

export default function OperatorIncomingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["operator-shift"],
    queryFn: fetchCurrentShift,
    refetchInterval: 5000, // Poll every 5s for new requests
  });

  const incoming = data?.incoming ?? [];

  const acceptMutation = useMutation({
    mutationFn: (id: string) => acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-shift"] });
      Alert.alert("Request Accepted", "Added to your live dispatch queue.");
    },
    onError: (err: any) => {
      Alert.alert("Could Not Accept", err.message || "Failed to accept request");
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => declineRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-shift"] });
    },
    onError: (err: any) => {
      Alert.alert("Could Not Decline", err.message || "Failed to decline request");
    },
  });

  const handleDecline = (id: string, name: string) => {
    Alert.alert(
      "Decline Request",
      `Are you sure you want to decline the request from ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Decline", style: "destructive", onPress: () => declineMutation.mutate(id) },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={120} />
          <Skeleton height={76} />
        </View>
      </View>
    );
  }

  if (isError && data === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="We couldn't load incoming requests. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="largeTitle">Incoming requests</ThemedText>
          <ThemedText variant="caption" style={styles.subtitle}>
            Requests expire in 4 minutes if not accepted.
          </ThemedText>
        </View>

        {incoming.length === 0 ? (
          <Card style={styles.emptyCard}>
            <ThemedText variant="headline" style={styles.emptyTitle}>
              No incoming requests
            </ThemedText>
            <ThemedText variant="caption" style={styles.emptyBody}>
              New patient requests in your coverage area will appear here automatically.
            </ThemedText>
            <Button
              title="Return to shift console"
              variant="secondary"
              onPress={() => router.back()}
            />
          </Card>
        ) : (
          incoming.map((req) => {
            const patientName = `${req.patient?.firstName ?? "Patient"} ${req.patient?.lastName ?? ""}`.trim();
            const timeRemaining = Math.max(
              0,
              Math.round((new Date(req.expiresAt).getTime() - Date.now()) / 1000 / 60)
            );

            return (
              <Card key={req.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <Badge label={`Expires in ~${timeRemaining}m`} variant="warning" />
                  <ThemedText variant="caption" style={styles.procedure}>
                    {req.service?.name}
                  </ThemedText>
                </View>

                <View style={styles.details}>
                  <ThemedText variant="headline">{patientName}</ThemedText>
                  <ThemedText variant="caption" style={styles.detail}>
                    {requestAreaLabel(req.accessDetails)}
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.detail}>
                    Parking: {req.accessDetails?.parkingType?.replace("_", " ")}
                  </ThemedText>
                  {req.accessDetails?.gateCode && (
                    <ThemedText variant="caption" style={styles.detail}>
                      Gate: {req.accessDetails.gateCode}
                    </ThemedText>
                  )}
                  {req.accessDetails?.accessNotes && (
                    <ThemedText variant="caption" style={styles.notes}>
                      Note: {req.accessDetails.accessNotes}
                    </ThemedText>
                  )}
                  {req.etaSecondsSnapshot && (
                    <ThemedText variant="caption" style={styles.eta}>
                      Initial ETA: ~{Math.round(req.etaSecondsSnapshot / 60)} min
                    </ThemedText>
                  )}
                </View>

                <View style={styles.actionRow}>
                  <Button
                    title="Decline"
                    variant="secondary"
                    size="sm"
                    loading={declineMutation.isPending}
                    onPress={() => handleDecline(req.id, patientName)}
                  />
                  <Button
                    title="Accept stop"
              arrow
                    variant="primary"
                    size="sm"
                    loading={acceptMutation.isPending}
                    onPress={() => acceptMutation.mutate(req.id)}
                  />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "flex-end",
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  detail: {
    color: colors.secondaryLabel,
  },
  details: {
    gap: 3,
  },
  emptyBody: {
    color: colors.secondaryLabel,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.label,
  },
  eta: {
    color: colors.ink,
    fontWeight: "600",
  },
  header: {
    gap: spacing.xxs,
  },
  notes: {
    color: colors.secondaryLabel,
    fontStyle: "italic",
  },
  procedure: {
    color: colors.ink,
    fontWeight: "600",
  },
  requestCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
});
