import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Card, EmptyState, ErrorState, IconTile, ListRow, Skeleton } from "@/components";
import { colors, spacing } from "@/theme";
import { useNotificationHistoryPages } from "@/features/notifications/notification-hooks";
import { routeForNotification } from "@/features/notifications/notification-route";
import { PRACTICE_TIME_ZONE } from "@/features/booking/uk-time";

// What we have sent to this phone, newest first. Tapping one opens what it is about.
export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotificationHistoryPages();
  const items = Array.isArray(data) ? data.filter((n) => n.type === "push") : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={isLoading || isError ? [] : items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.content}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <Skeleton height={72} /> : null}
        renderItem={({ item: n }) => {
          const target = routeForNotification(n.data);
          return (
            <Card padding="none">
              <ListRow
                title={n.title}
                subtitle={`${n.body}\n${new Date(n.sentAt).toLocaleString("en-GB", {
                  timeZone: PRACTICE_TIME_ZONE,
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
                left={<IconTile icon="bell" />}
                chevron={!!target}
                onPress={target ? () => router.push(target as never) : undefined}
              />
            </Card>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <Skeleton height={72} />
          ) : isError ? (
            <ErrorState message="We couldn't load your notifications. Check your connection and try again." onRetry={() => refetch()} />
          ) : (
            <EmptyState
              illustration="messages"
              heading="No notifications yet"
              body="Reminders and updates about your visits will appear here."
              icon="bell"
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.md, padding: spacing.gutter },
});
