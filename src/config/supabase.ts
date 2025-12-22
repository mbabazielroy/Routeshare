// Supabase configuration
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Track connection state
let isSupabaseConnected = false;
let connectionCheckInProgress = false;

// Initialize Supabase client with AsyncStorage for session persistence
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false, // Disable auto-refresh to prevent retry spam when offline
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        fetch: async (url, options) => {
          try {
            const response = await fetch(url, {
              ...options,
              // Add timeout to prevent long waits
            });
            isSupabaseConnected = true;
            return response;
          } catch (error) {
            isSupabaseConnected = false;
            throw error;
          }
        },
      },
    });
    console.log("Supabase initialized successfully");

    // Check connection once on startup (silently)
    const checkConnection = async () => {
      if (connectionCheckInProgress) return;
      connectionCheckInProgress = true;
      try {
        // Simple health check - just try to reach Supabase
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            apikey: supabaseAnonKey,
          },
        });
        clearTimeout(timeoutId);
        isSupabaseConnected = true;
        console.log("Supabase connection verified");
      } catch {
        isSupabaseConnected = false;
        console.log("Supabase not reachable - app will work offline");
      } finally {
        connectionCheckInProgress = false;
      }
    };

    // Check connection after a short delay
    setTimeout(checkConnection, 1000);
  } catch (error) {
    console.error("Supabase initialization error:", error);
  }
} else {
  console.warn(
    "Supabase config values are missing. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file."
  );
}

// Helper to check if Supabase is available
export const isSupabaseAvailable = () => isSupabaseConnected;

export { supabase };
export default supabase;
