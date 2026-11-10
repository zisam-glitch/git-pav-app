import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Props for a ScrollView's RefreshControl: pulling down refetches every query
 * the open screens are showing, so Home, Bookings, Messages and Records can
 * all be refreshed without waiting for a restart.
 */
export function usePullToRefresh() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ type: "active" });
    } catch {
      // Each screen shows its own error state; the spinner just stops.
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);
  return { refreshing, onRefresh };
}
