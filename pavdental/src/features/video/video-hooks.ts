import React from "react";
import { reportCaughtError } from "@/lib/caught-errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "../auth/auth-api";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

interface VideoRoomResponse {
  roomName: string;
  url: string;
  token: string;
  isOwner: boolean;
  expiresAt: string;
  isMock: boolean;
}

interface TriageData {
  chiefComplaint: string;
  painLevel: number;
  duration: string;
  symptoms: string[];
  photos: string[];
}

// Media permissions hooks
export function useMediaPermissions() {
  const [permissions, setPermissions] = React.useState<{
    camera: boolean | null;
    microphone: boolean | null;
    photoLibrary: boolean | null;
  }>({
    camera: null,
    microphone: null,
    photoLibrary: null,
  });

  const requestPermissions = async () => {
    try {
      // Request camera and microphone permissions
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const microphoneStatus = Platform.OS === 'ios' 
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : { granted: true }; // Android doesn't require explicit mic permission

      // Request photo library permissions
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      setPermissions({
        camera: cameraStatus.granted,
        microphone: microphoneStatus.granted,
        photoLibrary: libraryStatus.granted,
      });

      return {
        camera: cameraStatus.granted,
        microphone: microphoneStatus.granted,
        photoLibrary: libraryStatus.granted,
      };
    } catch (error) {
      reportCaughtError(error, "error requesting media permissions");
      setPermissions({
        camera: false,
        microphone: false,
        photoLibrary: false,
      });
      return {
        camera: false,
        microphone: false,
        photoLibrary: false,
      };
    }
  };

  const checkPermissions = async () => {
    try {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      const libraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

      setPermissions({
        camera: cameraStatus.granted,
        microphone: cameraStatus.granted, // Assume same as camera for simplicity
        photoLibrary: libraryStatus.granted,
      });

      return {
        camera: cameraStatus.granted,
        microphone: cameraStatus.granted,
        photoLibrary: libraryStatus.granted,
      };
    } catch (error) {
      reportCaughtError(error, "error checking media permissions");
      return {
        camera: false,
        microphone: false,
        photoLibrary: false,
      };
    }
  };

  return {
    permissions,
    requestPermissions,
    checkPermissions,
    hasAllPermissions: permissions.camera && permissions.microphone && permissions.photoLibrary,
  };
}

// Photo upload hook for triage
export function usePhotoUpload() {
  const [uploadStatus, setUploadStatus] = React.useState<"idle" | "uploading" | "success" | "error">("idle");

  const pickAndUploadPhoto = async (appointmentId: string) => {
    try {
      setUploadStatus("uploading");

      // Pick image from gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        setUploadStatus("idle");
        return null;
      }

      // Upload to server
      const formData = new FormData();
      formData.append("photo", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: `triage-${Date.now()}.jpg`,
      } as any);
      formData.append("appointmentId", appointmentId);

      const response = await authFetch("/api/video/upload-triage-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await response.json();
      setUploadStatus("success");
      return data.url;
    } catch (error) {
      reportCaughtError(error, "error uploading photo");
      setUploadStatus("error");
      throw error;
    }
  };

  const takeAndUploadPhoto = async (appointmentId: string) => {
    try {
      setUploadStatus("uploading");

      // Take photo with camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        setUploadStatus("idle");
        return null;
      }

      // Upload to server
      const formData = new FormData();
      formData.append("photo", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: `triage-${Date.now()}.jpg`,
      } as any);
      formData.append("appointmentId", appointmentId);

      const response = await authFetch("/api/video/upload-triage-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await response.json();
      setUploadStatus("success");
      return data.url;
    } catch (error) {
      reportCaughtError(error, "error taking and uploading photo");
      setUploadStatus("error");
      throw error;
    }
  };

  return {
    pickAndUploadPhoto,
    takeAndUploadPhoto,
    uploadStatus,
    isUploading: uploadStatus === "uploading",
    reset: () => setUploadStatus("idle"),
  };
}

// Create video room
export function useCreateVideoRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await authFetch("/api/video/rooms", {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create video room");
      }

      return response.json() as Promise<VideoRoomResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
  });
}

// Submit triage data
export function useSubmitTriage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, triageData }: {
      appointmentId: string;
      triageData: TriageData;
    }) => {
      const response = await authFetch("/api/video/submit-triage", {
        method: "POST",
        body: JSON.stringify({
          appointmentId,
          ...triageData,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to submit triage");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
  });
}

// Clinician queue management
export function useClinicianQueue() {
  return useQuery({
    queryKey: ["clinician-queue"],
    queryFn: async () => {
      const response = await authFetch("/api/video/clinician-queue");

      if (!response.ok) {
        throw new Error("Failed to fetch clinician queue");
      }

      return response.json();
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

// Admit patient to consultation
export function useAdmitPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await authFetch("/api/video/admit-patient", {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to admit patient");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinician-queue"] });
    },
  });
}

// Fallback handling for video consultation
export function useVideoFallback() {
  const [hasFallback, setHasFallback] = React.useState(false);
  const [fallbackReason, setFallbackReason] = React.useState<string | null>(null);

  const initiateFallback = (reason: string) => {
    setFallbackReason(reason);
    setHasFallback(true);
  };

  const resetFallback = () => {
    setHasFallback(false);
    setFallbackReason(null);
  };

  return {
    hasFallback,
    fallbackReason,
    initiateFallback,
    resetFallback,
  };
}

// Combined video consultation hook
export function useVideoConsultation(appointmentId: string) {
  const mediaPermissions = useMediaPermissions();
  const photoUpload = usePhotoUpload();
  const createRoom = useCreateVideoRoom();
  const submitTriage = useSubmitTriage();
  const videoFallback = useVideoFallback();
  const clinicianQueue = useClinicianQueue();

  const initiateConsultation = async () => {
    try {
      // Check permissions first
      const perms = await mediaPermissions.requestPermissions();
      if (!perms.camera || !perms.microphone) {
        videoFallback.initiateFallback("Missing camera or microphone permissions");
        return null;
      }

      // Create video room
      const room = await createRoom.mutateAsync(appointmentId);
      return room;
    } catch (error) {
      reportCaughtError(error, "error initiating consultation");
      videoFallback.initiateFallback("Failed to create video room");
      throw error;
    }
  };

  return {
    mediaPermissions,
    photoUpload,
    createRoom,
    submitTriage,
    videoFallback,
    clinicianQueue,
    initiateConsultation,
  };
}
