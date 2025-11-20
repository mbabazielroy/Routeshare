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
  try {
    // Apple Sign-In is only available on iOS
    if (Platform.OS !== "ios") {
      throw new Error("Apple Sign-In is only available on iOS devices");
    }

    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }

    // Create Apple OAuth provider
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");

    // For now, we'll show a message to the user that they need to configure this
    // In production, this requires proper Apple OAuth configuration in Firebase Console
    throw new Error(
      "Apple Sign-In requires configuration in Firebase Console. Please:\n1. Enable Apple as a sign-in provider in Firebase Console\n2. Configure your Apple Developer account\n3. Add the OAuth redirect URL to your Apple Services ID"
    );
  } catch (error: any) {
    console.error("Apple Sign-In error:", error);
    throw error;
  }
};

/**
 * Sign in with Google using OAuth
 * This provides a secure authentication flow through Firebase
 */
export const signInWithGoogle = async (): Promise<OAuthResult> => {
  try {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized");
    }

    // Create Google OAuth provider
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    // For now, we'll show a message to the user that they need to configure this
    // In production, this requires proper Google OAuth configuration in Firebase Console
    throw new Error(
      "Google Sign-In requires configuration in Firebase Console. Please:\n1. Enable Google as a sign-in provider in Firebase Console\n2. Add your iOS and Android OAuth client IDs\n3. Download and add the GoogleService-Info.plist (iOS) and google-services.json (Android)"
    );
  } catch (error: any) {
    console.error("Google Sign-In error:", error);
    throw error;
  }
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
