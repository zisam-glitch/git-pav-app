// Shared setup for component tests (React Native Testing Library).
// Native modules the screens import are replaced with light fakes here so a
// test renders the real screen without a device.

jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: ({ children }: { children: unknown }) => children,
  };
});

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(async () => undefined),
  notificationAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}));

// Reanimated and its worklets runtime need a device; use their official mocks.
jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));
// The mock lacks useReducedMotion, which the app reads to skip animations.
jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  useReducedMotion: () => false,
  // The mock runs animation-finished callbacks at once, which would dismiss a
  // toast the moment it appears. Animations simply do not run in tests.
  withTiming: (value: unknown) => value,
  withDelay: (_ms: number, value: unknown) => value,
}));

// The bottom sheet draws through a native portal; its official mock renders in place.
// Its dismiss() also calls onDismiss, as the real sheet does once it has closed,
// because the app acts on that callback (ConfirmSheet confirms from it).
jest.mock("@gorhom/bottom-sheet", () => {
  const mock = jest.requireActual("@gorhom/bottom-sheet/mock");
  class BottomSheetModal extends mock.BottomSheetModal {
    dismiss() {
      super.dismiss();
      this.props.onDismiss?.();
    }
  }
  return { ...mock, BottomSheetModal };
});
