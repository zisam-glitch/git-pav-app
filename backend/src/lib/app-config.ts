// backend/src/lib/app-config.ts
// What the phone app asks for when it starts: the oldest version still allowed.
// Raising MIN_APP_VERSION retires a broken build without waiting for patients to
// choose to update. Unset means every version is allowed.

export interface PublicAppConfig {
  minimumAppVersion: string;
  storeUrl: string | null;
}

const SEMVER = /^\d+\.\d+\.\d+$/;

export function readAppConfig(env: Record<string, string | undefined> = process.env): PublicAppConfig {
  const min = env.MIN_APP_VERSION?.trim();
  const store = env.APP_STORE_URL?.trim();
  return {
    // A malformed value must never lock everyone out.
    minimumAppVersion: min && SEMVER.test(min) ? min : "0.0.0",
    storeUrl: store && /^https:\/\//.test(store) ? store : null,
  };
}
