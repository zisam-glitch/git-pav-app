import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { checkInVanStop } from "./van-api";

export function useCheckInVanStopMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => checkInVanStop(stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.van.operatorShift() });
    },
  });
}
