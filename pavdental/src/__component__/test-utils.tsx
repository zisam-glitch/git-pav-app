import React from "react";
import { render } from "@testing-library/react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

/** Renders a screen inside the providers the real app wraps it in. */
export function renderScreen(ui: React.ReactElement) {
  return render(
    <BottomSheetModalProvider>{ui}</BottomSheetModalProvider>
  );
}
