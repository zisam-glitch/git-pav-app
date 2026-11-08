import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

// Intraoral photos for a video consult. iPhones store photos as HEIC, which
// the upload could not send (the request failed inside the app, so the patient
// was told "One photo didn't upload"). Asking for the compatible
// representation gives a JPEG, and re-encoding it at quality < 1 drops the
// photo's metadata, including where it was taken.

export interface PickedPhoto {
  uri: string;
  mimeType: string;
}

export const TRIAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  quality: 0.8,
  exif: false,
  preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
};

const UPLOADABLE = new Set(["image/jpeg", "image/png", "image/webp"]);

/** The MIME type to send, from what the picker reports or the file name. */
export function uploadMimeType(asset: { uri: string; mimeType?: string | null }): string | null {
  const reported = asset.mimeType?.toLowerCase() ?? null;
  if (reported && UPLOADABLE.has(reported)) return reported;
  const ext = asset.uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return null;
}

export function uploadFileName(slotId: string, mimeType: string): string {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return `triage-${slotId}.${ext}`;
}

async function launch(source: "camera" | "library"): Promise<PickedPhoto | null> {
  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera access is off", "Allow camera access in Settings to take a photo, or choose one from your library.");
      return null;
    }
  }
  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(TRIAGE_PICKER_OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(TRIAGE_PICKER_OPTIONS);
  const asset = result.canceled ? null : result.assets?.[0];
  if (!asset?.uri) return null;
  const mimeType = uploadMimeType(asset);
  if (!mimeType) {
    Alert.alert("That photo can't be sent", "Please take a new photo, or choose a JPEG or PNG.");
    return null;
  }
  return { uri: asset.uri, mimeType };
}

/** Lets the patient take a photo or choose one from their library. */
export function pickTriagePhoto(): Promise<PickedPhoto | null> {
  if (Platform.OS === "web") return launch("library").catch(() => null);
  return new Promise((resolve) => {
    Alert.alert("Add a photo", undefined, [
      { text: "Take photo", onPress: () => launch("camera").then(resolve, () => resolve(null)) },
      { text: "Choose from library", onPress: () => launch("library").then(resolve, () => resolve(null)) },
      { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
    ]);
  });
}
