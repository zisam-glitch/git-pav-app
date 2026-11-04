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
module.exports = ({ config }) => {
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
    plugins: [...(config.plugins ?? []), mapsPlugin],
    extra: {
      ...config.extra,
      googleMaps: { android: Boolean(androidKey), ios: Boolean(iosKey) },
    },
  };
};
