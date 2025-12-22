// Supabase configuration
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Track connection state
let isSupabaseConnected = false;

// Initialize Supabase client with AsyncStorage for session persistence
let supabase: SupabaseClient | null = null;

// Create a minimal wrapper that prevents network errors from being thrown
const createSafeSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase config values are missing. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file."
    );
    return null;
  }

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    console.log("Supabase initialized successfully");
    return client;
  } catch (error) {
    console.log("Supabase initialization error - app will work offline");
    return null;
  }
};

supabase = createSafeSupabaseClient();

// Helper to check if Supabase is available
export const isSupabaseAvailable = () => isSupabaseConnected;

// Set connection status
export const setSupabaseConnected = (connected: boolean) => {
  isSupabaseConnected = connected;
};

export { supabase };
export default supabase;
