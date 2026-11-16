// backend/src/lib/app-config.ts
// What the phone app asks for when it starts: the oldest version still allowed.
// Raising MIN_APP_VERSION retires a broken build without waiting for patients to
// choose to update. Unset means every version is allowed.

import { env as appEnv } from "../config/env";

export interface PublicAppConfig {
  minimumAppVersion: string;
  storeUrl: string | null;
}

const SEMVER = /^\d+\.\d+\.\d+$/;

export function readAppConfig(env?: Record<string, string | undefined>): PublicAppConfig {
  const min = env ? env.MIN_APP_VERSION?.trim() : appEnv.minAppVersion;
  const store = env ? env.APP_STORE_URL?.trim() : appEnv.appStoreUrl;
  return {
    // A malformed value must never lock everyone out.
    minimumAppVersion: min && SEMVER.test(min) ? min : "0.0.0",
    storeUrl: store && /^https:\/\//.test(store) ? store : null,
  };
}
