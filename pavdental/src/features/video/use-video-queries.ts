import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authFetch } from "../auth/auth-api";
import { requestVideoRoom } from "./video-room";
import {
  admitVideoPatient,
  endVideoConsult,
  fetchAppointmentMessageThread,
  fetchTriagePhotos,
  fetchVideoPresence,
  fetchVideoSummary,
  fetchVideoTriageDraft,
  leaveVideoWaitingRoom,
  pollVideoWaitingRoom,
  requestClinicianVideoRoom,
  saveVideoTriageDraft,
  sendAppointmentMessage,
  submitVideoTriage,
  uploadTriagePhoto,
} from "./video-api";

export function useVideoSummary(appointmentId?: string) {
  return useQuery({
    queryKey: queryKeys.video.summary(appointmentId),
    queryFn: () => fetchVideoSummary(appointmentId!),
    enabled: !!appointmentId,
  });
}

export function useVideoTriageDraft(appointmentId?: string) {
  return useQuery({
    queryKey: queryKeys.video.triageDraft(appointmentId),
    queryFn: () => fetchVideoTriageDraft(appointmentId!),
    enabled: !!appointmentId,
    retry: false,
  });
}

export function useSaveVideoTriageDraftMutation() {
  return useMutation({
    mutationFn: ({ appointmentId, body }: { appointmentId: string; body: Record<string, unknown> }) =>
      saveVideoTriageDraft(appointmentId, body),
  });
}

export function useAppointmentMessageThread(appointmentId?: string) {
  return useQuery({
    queryKey: queryKeys.video.appointmentMessage(appointmentId),
    queryFn: () => fetchAppointmentMessageThread(appointmentId!),
    enabled: !!appointmentId,
    retry: false,
  });
}

export function useSendAppointmentMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, body }: { appointmentId: string; body: string }) =>
      sendAppointmentMessage(appointmentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all() });
    },
  });
}

export function useRequestVideoRoomMutation() {
  return useMutation({
    mutationFn: (appointmentId?: string) =>
      requestVideoRoom(appointmentId, (body) =>
        authFetch("/api/video/rooms", { method: "POST", body: JSON.stringify(body) }),
      ),
  });
}

export function usePollWaitingRoomMutation() {
  return useMutation({
    mutationFn: (appointmentId: string) => pollVideoWaitingRoom(appointmentId),
  });
}

export function useLeaveWaitingRoomMutation() {
  return useMutation({
    mutationFn: (appointmentId: string) => leaveVideoWaitingRoom(appointmentId),
  });
}

export function useUploadTriagePhotoMutation() {
  return useMutation({
    mutationFn: uploadTriagePhoto,
  });
}

export function useSubmitVideoTriageMutation() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => submitVideoTriage(payload),
  });
}

export function useTriagePhotos(appointmentId?: string) {
  return useQuery({
    queryKey: queryKeys.video.triagePhotos(appointmentId),
    queryFn: () => fetchTriagePhotos(appointmentId!),
    enabled: !!appointmentId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useVideoPresence(appointmentId?: string) {
  return useQuery({
    queryKey: queryKeys.video.presence(appointmentId),
    queryFn: () => fetchVideoPresence(appointmentId!),
    enabled: !!appointmentId,
    refetchInterval: 5000,
  });
}

export function useClinicianVideoRoomMutation() {
  return useMutation({
    mutationFn: (appointmentId: string) => requestClinicianVideoRoom(appointmentId),
  });
}

export function useAdmitVideoPatientMutation() {
  return useMutation({
    mutationFn: (appointmentId: string) => admitVideoPatient(appointmentId),
  });
}

export function useEndVideoConsultMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => endVideoConsult(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all() });
    },
  });
}
