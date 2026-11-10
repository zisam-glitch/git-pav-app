import React from "react";
import { View } from "react-native";

// The web build has no native camera module; the browser asks for them in the call page.
export function CameraCheck() {
  return <View />;
}
