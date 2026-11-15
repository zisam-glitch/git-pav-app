import { findInCachedLists } from "../booking/appointment-cache";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nextOffset, flattenPages, uniqueById } from "@/lib/paging";
import { queryKeys } from "@/lib/query-keys";
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
  fetchMessageThreadPage,
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
    queryKey: queryKeys.services(),
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClinics() {
  return useQuery({
    queryKey: queryKeys.clinics(),
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
    queryKey: queryKeys.clinicians(channel),
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
    queryKey: queryKeys.slots.list(params),
    queryFn: () => fetchSlots(params),
    enabled: !!params.date,
    refetchInterval: 30 * 1000, // refresh availability every 30s
  });
}

export function useMyAppointments(params?: { scope?: string; date?: string }) {
  return useQuery({
    queryKey: queryKeys.appointments.list(params),
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
      queryClient.getQueriesData({ queryKey: queryKeys.appointments.all() }) as Array<[unknown, unknown]>,
      (key) => queryClient.getQueryState(key as readonly unknown[])?.dataUpdatedAt,
      id
    );
  return useQuery({
    queryKey: queryKeys.appointments.detail(id),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all() });
    },
  });
}

export function useRescheduleAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, startTimeUtc }: { appointmentId: string; startTimeUtc: string }) =>
      rescheduleAppointment(appointmentId, startTimeUtc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all() });
    },
  });
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.slots.all() });
    },
  });
}

// ─── Patient Profile & Clinical Records Hooks ─────────────────────────────────
export function usePatientProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.patientProfile(userId),
    queryFn: () => fetchPatientProfile(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfileMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updatePatientProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patientProfile(userId) });
    },
  });
}

export function useOdontogram(userId: string) {
  return useQuery({
    queryKey: queryKeys.odontogram(userId),
    queryFn: () => fetchOdontogram(userId),
    enabled: !!userId,
  });
}

export function useUpdateOdontogramMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teeth: any[]) => updateOdontogram(userId, teeth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.odontogram(userId) });
    },
  });
}

export function useTreatmentPlans(userId: string) {
  return useQuery({
    queryKey: queryKeys.treatmentPlans(userId),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.treatmentPlans(userId) });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.treatmentPlans(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.documentVault(userId) });
    },
  });
}

export function useDeclineTreatmentPlanMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => declineTreatmentPlan(userId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatmentPlans(userId) });
    },
  });
}

export function usePatientPrescriptions(userId: string) {
  return useQuery({
    queryKey: queryKeys.prescriptions(userId),
    queryFn: () => fetchPatientPrescriptions(userId),
    enabled: !!userId,
  });
}

export function useDocumentVault(userId: string) {
  return useQuery({
    queryKey: queryKeys.documentVault(userId),
    queryFn: () => fetchDocuments(userId),
    enabled: !!userId,
  });
}

// ─── Messages, Financing, Rewards & Insights Hooks ────────────────────────────
/**
 * The conversations loaded so far, newest first, as one list. "summary" (the default) loads only
 * each last message; "full" loads every message. The first page comes at once; `fetchNextPage` adds
 * the next when the list is scrolled to its end. Polling refreshes only what has been loaded.
 */
export function useMessageThreads(view: "full" | "summary" = "summary") {
  const query = useInfiniteQuery({
    queryKey: queryKeys.messages.threads(view),
    queryFn: ({ pageParam }) => fetchMessageThreads(view, pageParam, MESSAGE_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      nextOffset(lastPage, pages.reduce((n, p) => n + (Array.isArray(p) ? p.length : 0), 0), MESSAGE_PAGE_SIZE),
    select: (d) => uniqueById(flattenPages<{ id: string }>(d.pages)),
    refetchInterval: 30 * 1000, // a reply from the practice shows without a restart
  });
  return query;
}

/** One open conversation, a page of messages at a time; fetchNextPage loads older ones. */
export function useMessageThread(threadId: string | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.messages.thread(threadId),
    queryFn: ({ pageParam }) => fetchMessageThreadPage(threadId as string, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextBefore ?? undefined,
    enabled: !!threadId,
    refetchInterval: 10 * 1000, // a reply shows while the conversation is open
  });
}

export function useCreateMessageThreadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMessageThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all() });
    },
  });
}

export function useReplyMessageThreadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body, attachmentKeys }: { threadId: string; body: string; attachmentKeys?: string[] }) =>
      replyToMessageThread(threadId, body, attachmentKeys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all() });
    },
  });
}

export function useMarkMessageThreadReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => markMessageThreadRead(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all() });
    },
  });
}

export function useFinancing() {
  return useQuery({
    queryKey: queryKeys.financing(),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards() });
    },
  });
}

export function useOralHealthInsights() {
  return useQuery({
    queryKey: queryKeys.oralHealthInsights(),
    queryFn: fetchOralHealthInsights,
  });
}

export function useLogBrushingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logBrushingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.oralHealthInsights() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards() });
    },
  });
}
