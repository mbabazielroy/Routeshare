/**
 * OAuth Authentication Service
 * Handles Apple Sign-In and Google Sign-In with Supabase OAuth
 * Uses expo-auth-session for OAuth flows
 */

import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "../config/supabase";
import { updateUserProfile } from "./supabaseAuth";
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
 * Sign in with Google using Supabase OAuth
 */
export const signInWithGoogle = async (): Promise<OAuthResult> => {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please check your configuration.");
  }

  try {
    console.log("Starting Google Sign-In...");

    // Clear any existing session before starting OAuth
    // This prevents signing in with an old cached session
    console.log("Clearing existing session...");
    await supabase.auth.signOut();

    // Get the redirect URL for OAuth
    // Use 'routeshare' scheme for app compatibility
    const redirectTo = makeRedirectUri({
      scheme: 'routeshare',
      path: 'auth/callback',
    });

    console.log("Google OAuth redirect URL:", redirectTo);

    // Start Google OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
        // Use query params for better compatibility
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error("Supabase OAuth error:", error);
      if (error.message?.includes('validation_failed') || error.message?.includes('OAuth secret')) {
        throw new Error(
          "Google Sign-In is not configured in Supabase yet. Please follow the setup instructions in the README to enable Google authentication."
        );
      }
      throw error;
    }

    if (!data?.url) {
      throw new Error("Failed to start Google sign-in - no OAuth URL received");
    }

    console.log("Opening OAuth URL in browser...");
    console.log("OAuth URL:", data.url);

    // Open the OAuth URL in browser with redirect handling
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    console.log("WebBrowser closed with type:", result.type);

    // Handle the result
    if (result.type === 'cancel') {
      console.log("User cancelled Google Sign-In");
      throw new Error("Sign-in was cancelled");
    }

    if (result.type === 'success' && result.url) {
      console.log("OAuth success! Processing redirect URL...");

      // Extract tokens from the redirect URL
      const url = new URL(result.url);
      const params = url.searchParams;
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      console.log("Access token found:", !!accessToken);

      if (accessToken) {
        // Set the session with the tokens
        console.log("Setting session with tokens...");
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        const user = sessionData.user;
        if (!user) throw new Error("No user data received from Google");

        console.log("User authenticated:", user.id);

        // Extract user info
        const email = user.email || '';
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        console.log("Creating/updating user profile...");

        // Update user profile in database
        await updateUserProfile(user.id, {
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          profilePhoto: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          authProvider: 'google',
        });

        return {
          uid: user.id,
          email,
          displayName: fullName,
          photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          firstName: firstName || '',
          lastName: lastName || '',
        };
      }
    }

    console.error("OAuth flow did not complete successfully");
    throw new Error("Google sign-in failed. Please try again.");
  } catch (error: any) {
    // Only log unexpected errors, not user cancellations
    if (!error.message?.includes('cancelled') && !error.message?.includes('not configured')) {
      console.error("Google sign-in error:", error);
    }
    throw error;
  }
};

/**
 * Sign in with Apple using Supabase OAuth
 */
export const signInWithApple = async (): Promise<OAuthResult> => {
  // Apple Sign-In is only available on iOS
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign-In is only available on iOS devices");
  }

  if (!supabase) {
    throw new Error("Supabase is not initialized. Please check your configuration.");
  }

  try {
    // Get the redirect URL for OAuth
    // Use 'vibecode' scheme for Vibecode environment compatibility
    const redirectTo = makeRedirectUri({
      scheme: 'vibecode',
      path: 'auth/callback',
    });

    console.log("Apple OAuth redirect URL:", redirectTo);

    // Start Apple OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      // Check if it's a configuration error
      if (error.message?.includes('validation_failed') || error.message?.includes('OAuth')) {
        throw new Error(
          "Apple Sign-In is not configured in Supabase yet. Please follow the setup instructions in the README to enable Apple authentication."
        );
      }
      throw error;
    }

    // Open the OAuth URL in browser
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type === 'success') {
        // Extract tokens from the URL
        const url = result.url;
        const params = new URL(url).searchParams;
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          // Set the session with the tokens
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) throw sessionError;

          const user = sessionData.user;
          if (!user) throw new Error("No user data received from Apple");

          // Extract user info
          const email = user.email || '';
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          const [firstName, ...lastNameParts] = fullName.split(' ');
          const lastName = lastNameParts.join(' ');

          // Update user profile in database
          await updateUserProfile(user.id, {
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            profilePhoto: user.user_metadata?.avatar_url,
            authProvider: 'apple',
          });

          return {
            uid: user.id,
            email,
            displayName: fullName,
            photoURL: user.user_metadata?.avatar_url,
            firstName: firstName || '',
            lastName: lastName || '',
          };
        }
      }

      throw new Error("Apple sign-in was cancelled or failed");
    }

    throw new Error("Failed to start Apple sign-in");
  } catch (error: any) {
    // Only log unexpected errors, not configuration messages
    if (!error.message?.includes('not configured') && !error.message?.includes('OAuth')) {
      console.error("Apple sign-in error:", error);
    }
    throw error;
  }
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
        "Go to Supabase Dashboard > Authentication > Providers",
        "Enable Apple as a sign-in provider",
        "Add your Apple Services ID and Team ID",
        "Configure OAuth redirect URLs in Apple Developer Console",
      ],
    };
  } else {
    return {
      title: "Configure Google Sign-In",
      steps: [
        "Go to Supabase Dashboard > Authentication > Providers",
        "Enable Google as a sign-in provider",
        "Add your OAuth Client ID from Google Cloud Console",
        "Configure authorized redirect URIs",
      ],
    };
  }
};
