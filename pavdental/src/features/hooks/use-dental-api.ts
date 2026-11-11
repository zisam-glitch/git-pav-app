import { findInCachedLists } from "../booking/appointment-cache";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nextOffset, flattenPages, uniqueById } from "@/lib/paging";
import { rewardsQueryOptions } from "../records/rewards-query";
import { PRACTICE_CONFIG } from "@/config/practice";
import { resolvePracticeHours } from "../booking/uk-time";
import {
  fetchServices,
  fetchClinics,
  fetchClinicians,
  fetchSlots,
  fetchMyAppointments,
  fetchAppointment,
  holdSlot,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from "../booking/booking-api";
import {
  fetchPatientProfile,
  updatePatientProfile,
  fetchOdontogram,
  updateOdontogram,
  fetchTreatmentPlans,
  createTreatmentPlan,
  signTreatmentPlan,
  declineTreatmentPlan,
  fetchPatientPrescriptions,
  fetchDocuments,
  fetchMessageThreads,
  MESSAGE_PAGE_SIZE,
  createMessageThread,
  replyToMessageThread,
  markMessageThreadRead,
  fetchFinancing,
  fetchRewards,
  redeemReward,
  fetchOralHealthInsights,
  logBrushingSession,
} from "../records/records-api";

// ─── Dental Catalogue Hooks ──────────────────────────────────────────────────
export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClinics() {
  return useQuery({
    queryKey: ["clinics"],
    queryFn: fetchClinics,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Resolves live practice opening hours from the clinics endpoint (MF-10, AUD-18).
 * Ensures editing clinic hours in the dashboard updates the mobile app dynamically.
 */
export function usePracticeHours(): { hoursText: string; isLoading: boolean } {
  const { data: clinics, isLoading } = useClinics();
  const hoursText = resolvePracticeHours(clinics, PRACTICE_CONFIG.hoursText);
  return { hoursText, isLoading };
}

export function useClinicians(channel?: string) {
  return useQuery({
    queryKey: ["clinicians", channel],
    queryFn: () => fetchClinicians(channel),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Slot & Booking Hooks ─────────────────────────────────────────────────────
export function useSlots(params: {
  clinicianId?: string;
  clinicId?: string;
  serviceId?: string;
  date: string;
  channel?: string;
}) {
  return useQuery({
    queryKey: ["slots", params],
    queryFn: () => fetchSlots(params),
    enabled: !!params.date,
    refetchInterval: 30 * 1000, // refresh availability every 30s
  });
}

export function useMyAppointments(params?: { scope?: string; date?: string }) {
  return useQuery({
    queryKey: ["my-appointments", params],
    queryFn: () => fetchMyAppointments(params),
  });
}

export function useHoldSlotMutation() {
  return useMutation({
    mutationFn: (slotId: string) => holdSlot(slotId),
  });
}

/**
 * One appointment. Its key starts with "my-appointments", so every place that
 * refreshes the bookings (cancel, reschedule, check-in) refreshes this too. It
 * starts from the row the Bookings list already has, so the screen opens at once.
 */
export function useAppointment(id: string | undefined) {
  const queryClient = useQueryClient();
  const cached = () =>
    findInCachedLists(
      queryClient.getQueriesData({ queryKey: ["my-appointments"] }) as Array<[unknown, unknown]>,
      (key) => queryClient.getQueryState(key as readonly unknown[])?.dataUpdatedAt,
      id
    );
  return useQuery({
    queryKey: ["my-appointments", "detail", id],
    queryFn: () => fetchAppointment(id as string),
    enabled: !!id,
    initialData: () => cached()?.row ?? undefined,
    initialDataUpdatedAt: () => cached()?.updatedAt,
  });
}

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createAppointment>[0]) => createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useRescheduleAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, startTimeUtc }: { appointmentId: string; startTimeUtc: string }) =>
      rescheduleAppointment(appointmentId, startTimeUtc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

// ─── Patient Profile & Clinical Records Hooks ─────────────────────────────────
export function usePatientProfile(userId: string) {
  return useQuery({
    queryKey: ["patient-profile", userId],
    queryFn: () => fetchPatientProfile(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfileMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updatePatientProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profile", userId] });
    },
  });
}

export function useOdontogram(userId: string) {
  return useQuery({
    queryKey: ["odontogram", userId],
    queryFn: () => fetchOdontogram(userId),
    enabled: !!userId,
  });
}

export function useUpdateOdontogramMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teeth: any[]) => updateOdontogram(userId, teeth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["odontogram", userId] });
    },
  });
}

export function useTreatmentPlans(userId: string) {
  return useQuery({
    queryKey: ["treatment-plans", userId],
    queryFn: () => fetchTreatmentPlans(userId),
    enabled: !!userId,
  });
}

export function useCreateTreatmentPlanMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: { title: string; items: any[] }) =>
      createTreatmentPlan(userId, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", userId] });
    },
  });
}

export function useSignTreatmentPlanMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      signerName,
      signatureData,
    }: {
      planId: string;
      signerName: string;
      signatureData?: string;
    }) => signTreatmentPlan(userId, planId, { signerName, consentConfirmed: true, signatureData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", userId] });
      queryClient.invalidateQueries({ queryKey: ["document-vault", userId] });
    },
  });
}

export function useDeclineTreatmentPlanMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => declineTreatmentPlan(userId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", userId] });
    },
  });
}

export function usePatientPrescriptions(userId: string) {
  return useQuery({
    queryKey: ["patient-prescriptions", userId],
    queryFn: () => fetchPatientPrescriptions(userId),
    enabled: !!userId,
  });
}

export function useDocumentVault(userId: string) {
  return useQuery({
    queryKey: ["document-vault", userId],
    queryFn: () => fetchDocuments(userId),
    enabled: !!userId,
  });
}

// ─── Messages, Financing, Rewards & Insights Hooks ────────────────────────────
/**
 * The conversations loaded so far, newest first, as one list. The first page
 * comes at once; `fetchNextPage` adds the next when the list is scrolled to
 * its end. Polling refreshes only what has been loaded.
 */
export function useMessageThreads() {
  const query = useInfiniteQuery({
    queryKey: ["message-threads"],
    queryFn: ({ pageParam }) => fetchMessageThreads(pageParam, MESSAGE_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      nextOffset(lastPage, pages.reduce((n, p) => n + (Array.isArray(p) ? p.length : 0), 0), MESSAGE_PAGE_SIZE),
    select: (d) => uniqueById(flattenPages<{ id: string }>(d.pages)),
    refetchInterval: 30 * 1000, // a reply from the practice shows without a restart
  });
  return query;
}

export function useCreateMessageThreadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMessageThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
}

export function useReplyMessageThreadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body, attachmentKeys }: { threadId: string; body: string; attachmentKeys?: string[] }) =>
      replyToMessageThread(threadId, body, attachmentKeys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
}

export function useMarkMessageThreadReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => markMessageThreadRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
}

export function useFinancing() {
  return useQuery({
    queryKey: ["financing"],
    queryFn: fetchFinancing,
  });
}

export function useRewards() {
  return useQuery(rewardsQueryOptions(fetchRewards));
}

export function useRedeemRewardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: redeemReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });
}

export function useOralHealthInsights() {
  return useQuery({
    queryKey: ["oral-health-insights"],
    queryFn: fetchOralHealthInsights,
  });
}

export function useLogBrushingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logBrushingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oral-health-insights"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });
}
