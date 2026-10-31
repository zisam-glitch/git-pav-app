import * as WebBrowser from "expo-web-browser";
import { colors } from "@/theme";

/**
 * Join URL for a Daily room: the meeting token in `t` is what lets this person
 * in (CS-07).
 */
export function dailyJoinUrl(roomUrl: string, token: string): string {
  return `${roomUrl}?t=${encodeURIComponent(token)}`;
}

/**
 * Opens the video call in an in-app browser window (SFSafariViewController on
 * iOS, a Custom Tab on Android) over the app, so the person never leaves the
 * app. Resolves once they close the window. Throws if the window can't open.
 */
export async function openVideoCall(url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(url, {
    // iOS: full screen over the app, with a clear "Done" button to come back.
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    dismissButtonStyle: "done",
    controlsColor: colors.ink as string,
    // Android: keep the call inside the app's task rather than as a separate
    // entry in recents.
    createTask: false,
    showTitle: false,
    enableBarCollapsing: false,
  });
}
