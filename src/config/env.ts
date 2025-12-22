// Environment configuration and validation
// This file centralizes all environment variable access and provides fallbacks

interface EnvConfig {
  // Supabase
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  isSupabaseConfigured: boolean;

  // Firebase (optional)
  firebaseApiKey: string | null;
  firebaseAuthDomain: string | null;
  firebaseProjectId: string | null;
  firebaseStorageBucket: string | null;
  firebaseMessagingSenderId: string | null;
  firebaseAppId: string | null;
  isFirebaseConfigured: boolean;

  // Google Maps (optional)
  googleMapsApiKey: string | null;
  isGoogleMapsConfigured: boolean;

  // App info
  isDevelopment: boolean;
}

// Helper to check if a value is valid
const isValidEnvVar = (value: string | undefined): value is string => {
  return Boolean(value && value.trim() !== "");
};

// Create the configuration object with direct access to env vars
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export const env: EnvConfig = {
  // Supabase configuration
  supabaseUrl: isValidEnvVar(supabaseUrl) ? supabaseUrl : null,
  supabaseAnonKey: isValidEnvVar(supabaseAnonKey) ? supabaseAnonKey : null,
  get isSupabaseConfigured() {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey);
  },

  // Firebase configuration
  firebaseApiKey: isValidEnvVar(firebaseApiKey) ? firebaseApiKey : null,
  firebaseAuthDomain: isValidEnvVar(firebaseAuthDomain) ? firebaseAuthDomain : null,
  firebaseProjectId: isValidEnvVar(firebaseProjectId) ? firebaseProjectId : null,
  firebaseStorageBucket: isValidEnvVar(firebaseStorageBucket) ? firebaseStorageBucket : null,
  firebaseMessagingSenderId: isValidEnvVar(firebaseMessagingSenderId) ? firebaseMessagingSenderId : null,
  firebaseAppId: isValidEnvVar(firebaseAppId) ? firebaseAppId : null,
  get isFirebaseConfigured() {
    return Boolean(
      this.firebaseApiKey &&
      this.firebaseAuthDomain &&
      this.firebaseProjectId
    );
  },

  // Google Maps configuration
  googleMapsApiKey: isValidEnvVar(googleMapsApiKey) ? googleMapsApiKey : null,
  get isGoogleMapsConfigured() {
    return Boolean(this.googleMapsApiKey);
  },

  // Development mode detection
  isDevelopment: __DEV__ ?? false,
};

// Validation function to check required environment variables
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Supabase is required for the app to function
  if (!env.isSupabaseConfigured) {
    errors.push(
      "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Log environment status (only in development)
export const logEnvironmentStatus = (): void => {
  if (!env.isDevelopment) return;

  console.log("=== Environment Configuration ===");
  console.log(`Supabase: ${env.isSupabaseConfigured ? "Configured" : "Not configured"}`);
  console.log(`Firebase: ${env.isFirebaseConfigured ? "Configured" : "Not configured"}`);
  console.log(`Google Maps: ${env.isGoogleMapsConfigured ? "Configured" : "Not configured"}`);
  console.log("=================================");
};

export default env;
