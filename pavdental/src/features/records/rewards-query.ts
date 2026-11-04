/**
 * Rewards query options. The points balance changes on the server (completed
 * visits, redemptions), so any cached value is only a placeholder: always
 * revalidate on mount and when the app returns to the foreground.
 */
export const REWARDS_QUERY_KEY = ["rewards"] as const;

export function rewardsQueryOptions<T>(queryFn: () => Promise<T>) {
  return {
    queryKey: REWARDS_QUERY_KEY,
    queryFn,
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: true,
  };
}
