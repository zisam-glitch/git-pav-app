// The bookkeeping behind screenshot blocking (D-14), kept free of React
// Native so it can be tested on its own. See screen-security.ts.
import { scrubText } from "../../lib/error-scrub";

export interface ScreenCaptureApi {
  preventScreenCaptureAsync(key: string): Promise<void>;
  allowScreenCaptureAsync(key: string): Promise<void>;
  enableAppSwitcherProtectionAsync(): Promise<void>;
  disableAppSwitcherProtectionAsync(): Promise<void>;
}

const report = (err: unknown) => {
  // Not being able to block a screenshot shouldn't stop the screen opening.
  console.warn("[screen-security]", err instanceof Error ? scrubText(err.message) : "unavailable");
};

/**
 * Returns protect(key): blocks capture while `key` is protected and hides the
 * app switcher preview while any key is. protect returns the function that
 * lifts it. With no native API (web), it does nothing.
 */
export function createScreenGuard(getApi: () => ScreenCaptureApi | null) {
  const protectedScreens = new Set<string>();
  return function protect(key: string): () => void {
    const native = getApi();
    if (!native || protectedScreens.has(key)) return () => {};
    protectedScreens.add(key);
    native.preventScreenCaptureAsync(key).catch(report);
    if (protectedScreens.size === 1) native.enableAppSwitcherProtectionAsync().catch(report);
    return () => {
      if (!protectedScreens.delete(key)) return;
      native.allowScreenCaptureAsync(key).catch(report);
      if (protectedScreens.size === 0) native.disableAppSwitcherProtectionAsync().catch(report);
    };
  };
}
