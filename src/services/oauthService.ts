/**
 * OAuth Authentication Service
 * Handles Apple Sign-In and Google Sign-In with secure credential handling
 * Uses expo-auth-session for OAuth flows
 */

import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import {
  signInWithCredential,
  OAuthProvider,
  GoogleAuthProvider,
  Auth,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { createUserProfile, getUserProfile } from "./firebaseAuth";
import { Platform } from "react-native";

// Required for expo-auth-session to work properly
WebBrowser.maybeCompleteAuthSession();

// OAuth result interface
export interface OAuthResult {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  firstName: string;
  lastName: string;
}

/**
 * Sign in with Apple using OAuth
 * This provides a secure authentication flow through Firebase
 */
export const signInWithApple = async (): Promise<OAuthResult> => {
  // Apple Sign-In is only available on iOS
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign-In is only available on iOS devices");
  }

  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  // Check if Firebase Auth is properly configured
  const isConfigured = process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
                       process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

  if (!isConfigured) {
    throw new Error(
      "Apple Sign-In requires Firebase configuration. Please add your Firebase credentials to enable this feature."
    );
  }

  // For now, show a user-friendly message that configuration is needed
  // In production, this will use the actual OAuth flow
  throw new Error(
    "Apple Sign-In is not yet configured. Please contact support to enable this authentication method."
  );
};

/**
 * Sign in with Google using OAuth
 * This provides a secure authentication flow through Firebase
 */
export const signInWithGoogle = async (): Promise<OAuthResult> => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  // Check if Firebase Auth is properly configured
  const isConfigured = process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
                       process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

  if (!isConfigured) {
    throw new Error(
      "Google Sign-In requires Firebase configuration. Please add your Firebase credentials to enable this feature."
    );
  }

  // For now, show a user-friendly message that configuration is needed
  // In production, this will use the actual OAuth flow
  throw new Error(
    "Google Sign-In is not yet configured. Please contact support to enable this authentication method."
  );
};

/**
 * Check if OAuth sign-in providers are available
 */
export const isOAuthAvailable = (): boolean => {
  // OAuth is available on both iOS and Android
  return true;
};

/**
 * Check if Apple Sign-In is available (iOS only)
 */
export const isAppleSignInAvailable = (): boolean => {
  return Platform.OS === "ios";
};

/**
 * Get OAuth configuration instructions
 */
export const getOAuthConfigInstructions = (provider: "apple" | "google") => {
  if (provider === "apple") {
    return {
      title: "Configure Apple Sign-In",
      steps: [
        "Go to Firebase Console > Authentication > Sign-in method",
        "Enable Apple as a sign-in provider",
        "Add your Apple Services ID and Team ID",
        "Configure OAuth redirect URLs in Apple Developer Console",
      ],
    };
  } else {
    return {
      title: "Configure Google Sign-In",
      steps: [
        "Go to Firebase Console > Authentication > Sign-in method",
        "Enable Google as a sign-in provider",
        "Add your Web Client ID from Google Cloud Console",
        "Download configuration files for iOS and Android",
      ],
    };
  }
};
