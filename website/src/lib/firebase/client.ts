// Google sign-in for the website (Firebase Auth, Vite project: VITE_ prefix).
//
// Firebase is only started when its settings are present. Without them the
// sign-in pages still work with email and password; the Google button explains
// that Google sign-in isn't set up. (Starting Firebase with no API key used to
// throw while the page loaded, so the whole sign-in page broke.)
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/** Whether this build has the Firebase settings Google sign-in needs. */
export const googleSignInConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

let authInstance: Auth | null = null;
function firebaseAuth(): Auth | null {
  if (!googleSignInConfigured) return null;
  if (!authInstance) {
    // Reuse the app across hot reloads.
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    authInstance = getAuth(app);
  }
  return authInstance;
}

/**
 * Starts Google sign-in by redirect (avoids popup issues). The page navigates
 * away; call handleGoogleRedirectResult on mount to pick up the result.
 */
export async function signInWithGoogle(): Promise<void> {
  const auth = firebaseAuth();
  if (!auth) throw new Error("Google sign-in isn't available. Please use your email and password.");
  await signInWithRedirect(auth, new GoogleAuthProvider());
}

/**
 * Call once when the sign-in page loads. Returns the ID token if we just came
 * back from a Google redirect, or null otherwise (always null when Google
 * sign-in isn't set up).
 */
export async function handleGoogleRedirectResult(): Promise<string | null> {
  const auth = firebaseAuth();
  if (!auth) return null;
  const result = await getRedirectResult(auth);
  if (!result) return null;
  return result.user.getIdToken();
}
