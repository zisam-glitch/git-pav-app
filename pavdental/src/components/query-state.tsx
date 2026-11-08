import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { CardSkeleton, RowSkeleton, Skeleton } from "./loading-skeleton";
import { ErrorState } from "./error-state";
import { EmptyState } from "./empty-state";
import { NetworkOffline } from "./network-offline";
import type { AppIconName } from "./app-icon";
import type { IllustrationName } from "./illustrations";
import { useIsOnline } from "@/lib/network";
import { resolveQueryState, QueryStateView } from "@/lib/query-state-resolver";
import { spacing } from "@/theme";

export { resolveQueryState, type QueryStateView };

export interface QueryStateProps<T> {
  /** Loading state from useQuery */
  isLoading: boolean;
  /** Error state from useQuery */
  isError?: boolean;
  /** Error object from useQuery */
  error?: Error | null;
  /** Query data */
  data: T | null | undefined;
  /** Custom check to determine if data is considered empty (default checks null/undefined/empty array) */
  isEmpty?: (data: T) => boolean;
  /** Empty state heading */
  emptyHeading?: string;
  /** Empty state body text */
  emptyBody?: string;
  /** Empty state icon */
  emptyIcon?: AppIconName;
  /** Empty state illustration, shown in place of the icon */
  emptyIllustration?: IllustrationName;
  /** Empty state action label */
  emptyActionLabel?: string;
  /** Empty state action callback */
  onEmptyAction?: () => void;
  /** Custom error message */
  errorMessage?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Skeletons to render while loading */
  skeletonCount?: number;
  skeletonType?: "card" | "row" | "box";
  skeletonHeight?: number;
  containerStyle?: ViewStyle;
  /** Render prop called when data is successfully loaded and non-empty */
  children: (data: T) => ReactNode;
}

/**
 * Shared QueryState wrapper ensuring consistent UX across loading, error, empty, and offline states (MA-4).
 */
export function QueryState<T>({
  isLoading,
  isError,
  error,
  data,
  isEmpty,
  emptyHeading = "No items yet",
  emptyBody = "Items will appear here once available.",
  emptyIcon = "calendar",
  emptyIllustration,
  emptyActionLabel,
  onEmptyAction,
  errorMessage,
  onRetry,
  skeletonCount = 2,
  skeletonType = "card",
  skeletonHeight = 80,
  containerStyle,
  children,
}: QueryStateProps<T>) {
  const isOnline = useIsOnline();

  const view = resolveQueryState({
    isOnline,
    isLoading,
    isError,
    error,
    data,
    isEmpty,
  });

  if (view === "offline") {
    return (
      <View style={[styles.container, containerStyle]}>
        <NetworkOffline onRetry={onRetry} />
      </View>
    );
  }

  if (view === "loading") {
    return (
      <View style={[styles.container, containerStyle]}>
        {Array.from({ length: skeletonCount }).map((_, idx) => {
          if (skeletonType === "card") {
            return (
              <View key={idx} style={styles.skeletonSpacing}>
                <CardSkeleton />
              </View>
            );
          }
          if (skeletonType === "row") {
            return (
              <View key={idx} style={styles.skeletonSpacing}>
                <RowSkeleton />
              </View>
            );
          }
          return <Skeleton key={idx} height={skeletonHeight} style={styles.skeletonSpacing} />;
        })}
      </View>
    );
  }

  if (view === "error") {
    const message = errorMessage || error?.message || "Could not load data. Please check your connection.";
    return (
      <View style={[styles.container, containerStyle]}>
        <ErrorState message={message} onRetry={onRetry} />
      </View>
    );
  }

  if (view === "empty") {
    return (
      <View style={[styles.container, containerStyle]}>
        <EmptyState
          heading={emptyHeading}
          body={emptyBody}
          icon={emptyIcon}
          illustration={emptyIllustration}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </View>
    );
  }

  return <>{children(data as T)}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  skeletonSpacing: {
    marginBottom: spacing.md,
  },
});
