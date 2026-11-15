// Adds build-time settings to app.json. The Google Maps keys come from the
// build's environment (EAS: `eas env:create`), never from the repo:
//
//   GOOGLE_MAPS_ANDROID_API_KEY  key restricted to Android apps (com.pavdental.app)
//   GOOGLE_MAPS_IOS_API_KEY      key restricted to iOS apps (com.pavdental.app)
//   GOOGLE_MAP_API               used for either platform when its own key isn't set
//
// Without a key, iPhone builds show Apple Maps and Android builds show the
// status panel instead of a map. The app only learns whether a key was set,
// never the key itself (extra.googleMaps).
//
// Over-the-air updates (ADR-0005): the update address needs the EAS project id,
// which does not exist until `npx eas init` is run. Until then updates are
// switched off, so no build can point at an invented address. Once the id is in
// app.json (extra.eas.projectId), updates turn on by themselves: the app checks
// when it opens, never delays the first screen waiting for one (a fix is used
// from the next launch), and takes updates only for its own runtime version.
module.exports = ({ config }) => {
  const projectId = config.extra?.eas?.projectId;
  const updates = projectId
    ? {
        url: `https://u.expo.dev/${projectId}`,
        enabled: true,
        checkAutomatically: "ON_LOAD",
        fallbackToCacheTimeout: 0,
      }
    : { enabled: false };

  const shared = process.env.GOOGLE_MAP_API?.trim() || "";
  const androidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim() || shared;
  const iosKey = process.env.GOOGLE_MAPS_IOS_API_KEY?.trim() || shared;

  const mapsPlugin = [
    "react-native-maps",
    {
      ...(androidKey ? { androidGoogleMapsApiKey: androidKey } : {}),
      ...(iosKey ? { iosGoogleMapsApiKey: iosKey } : {}),
    },
  ];

  return {
    ...config,
    updates: { ...config.updates, ...updates },
    plugins: [...(config.plugins ?? []), mapsPlugin],
    extra: {
      ...config.extra,
      googleMaps: { android: Boolean(androidKey), ios: Boolean(iosKey) },
    },
  };
};
