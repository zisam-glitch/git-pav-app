const path = require("path");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "@stripe/stripe-react-native") {
    return {
      filePath: path.resolve(__dirname, "src/lib/stripe-web-shim.js"),
      type: "sourceFile",
    };
  }
  // Phones never run the web renderer. expo-router's static-rendering code
  // reaches for it, which put about 450 KB of web code in every phone bundle;
  // an empty module there is never run (react-dom cannot start in React Native anyway).
  if (platform !== "web" && /^(react-native-web|react-dom)(\/|$)/.test(moduleName)) {
    return { type: "empty" };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
