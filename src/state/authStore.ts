import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { User, UserType } from "../types/routeshare";
import { supabase } from "../config/supabase";
import { getUserProfile } from "../services/supabaseAuth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authProvider: "phone" | "apple" | "google" | null;
  setUser: (user: User, provider?: "phone" | "apple" | "google") => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  checkSession: () => Promise<void>;
}

// Secure storage keys
const SECURE_AUTH_TOKEN_KEY = "secure_auth_token";
const USER_DATA_KEY = "user_data";
const AUTH_PROVIDER_KEY = "auth_provider";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authProvider: null,

  setUser: async (user, provider = "phone") => {
    try {
      // Check if this is a different user than the current one
      const currentUser = get().user;
      const isDifferentUser = currentUser && currentUser.id !== user.id;

      if (isDifferentUser) {
        console.log("🚨 Different user detected! Clearing ALL persisted data...");

        // Clear AsyncStorage keys
        await AsyncStorage.multiRemove([
          'rider-storage',
          'driver-storage',
          'payment-store',
          'messaging-store',
          'offline-store',
        ]);

        // Also call store clear methods to force reset in-memory state
        const { useRiderStore } = await import('./riderStore');
        const { useDriverStore } = await import('./driverStore');

        useRiderStore.getState().clearAllData();
        useDriverStore.getState().clearAllData();

        console.log("✅ Previous user data cleared completely");
      }

      // Store user data in AsyncStorage (non-sensitive)
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

      // Store auth provider
      await AsyncStorage.setItem(AUTH_PROVIDER_KEY, provider);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        authProvider: provider
      });

      console.log("✅ New user set:", user.id);
    } catch (error) {
      console.error("Error storing user data:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log("🚨 Logging out - clearing ALL user data...");

      // Sign out from Supabase
      if (supabase) {
        await supabase.auth.signOut();
      }

      // Clear all stored data including persisted stores
      await AsyncStorage.multiRemove([
        USER_DATA_KEY,
        AUTH_PROVIDER_KEY,
        'rider-storage',
        'driver-storage',
        'payment-store',
        'messaging-store',
        'offline-store',
      ]);

      // Force clear in-memory store state
      const { useRiderStore } = await import('./riderStore');
      const { useDriverStore } = await import('./driverStore');

      useRiderStore.getState().clearAllData();
      useDriverStore.getState().clearAllData();

      // Clear secure storage
      try {
        await SecureStore.deleteItemAsync(SECURE_AUTH_TOKEN_KEY);
      } catch (error) {
        // Secure store might not have the item, which is fine
      }

      set({
        user: null,
        isAuthenticated: false,
        authProvider: null
      });

      console.log("✅ Logout complete - all data cleared");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  },

  updateUser: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      const updatedUser = { ...currentUser, ...updates };
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  checkSession: async () => {
    try {
      // Always try to load from local storage first for faster startup
      const [storedUser, storedProvider] = await Promise.all([
        AsyncStorage.getItem(USER_DATA_KEY),
        AsyncStorage.getItem(AUTH_PROVIDER_KEY),
      ]);

      if (!supabase) {
        console.log("Supabase not initialized, loading from local storage");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const provider = (storedProvider as "phone" | "apple" | "google") || "phone";
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            authProvider: provider
          });
        } else {
          set({ isLoading: false });
        }
        return;
      }

      console.log("Checking Supabase session...");

      let session = null;
      try {
        const result = await supabase.auth.getSession();
        session = result.data?.session;
      } catch (networkError) {
        console.log("Network error checking session, falling back to local storage");
        // Network failed - use cached data if available
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const provider = (storedProvider as "phone" | "apple" | "google") || "phone";
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            authProvider: provider
          });
        } else {
          set({ isLoading: false });
        }
        return;
      }

      if (session?.user) {
        console.log("Active Supabase session found for user:", session.user.id);

        // Get the full user profile from database
        let userProfile = null;
        try {
          userProfile = await getUserProfile(session.user.id);
        } catch (profileError) {
          console.log("Network error fetching profile, using cached data");
          // Fall back to cached user data
          if (storedUser) {
            const user = JSON.parse(storedUser);
            const provider = (storedProvider as "phone" | "apple" | "google") || "phone";
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              authProvider: provider
            });
          } else {
            set({ isLoading: false });
          }
          return;
        }

        if (userProfile && userProfile.userType) {
          console.log("User profile loaded from Supabase:", {
            id: userProfile.id,
            email: userProfile.email,
            userType: userProfile.userType
          });

          // Construct complete user object
          const completeUser: User = {
            ...userProfile,
            firstName: userProfile.firstName!,
            lastName: userProfile.lastName!,
            phone: userProfile.phone || '',
            userType: userProfile.userType!,
            verificationLevel: userProfile.verificationLevel || 'basic',
            rating: userProfile.rating || 5.0,
            totalTrips: userProfile.totalTrips || 0,
          };

          // Determine auth provider from user metadata
          const provider = (session.user.app_metadata?.provider as "phone" | "apple" | "google") || "phone";

          // Store in local storage
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(completeUser));
          await AsyncStorage.setItem(AUTH_PROVIDER_KEY, provider);

          set({
            user: completeUser,
            isAuthenticated: true,
            isLoading: false,
            authProvider: provider
          });
        } else {
          console.log("User profile incomplete or not found in database");
          // Use cached data if available, otherwise clear
          if (storedUser) {
            const user = JSON.parse(storedUser);
            const provider = (storedProvider as "phone" | "apple" | "google") || "phone";
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              authProvider: provider
            });
          } else {
            try {
              await supabase.auth.signOut();
            } catch (e) {
              // Ignore signOut errors
            }
            await AsyncStorage.removeItem(USER_DATA_KEY);
            await AsyncStorage.removeItem(AUTH_PROVIDER_KEY);
            set({ isLoading: false });
          }
        }
      } else {
        console.log("No active Supabase session");
        // Clear local storage if no session
        await AsyncStorage.removeItem(USER_DATA_KEY);
        await AsyncStorage.removeItem(AUTH_PROVIDER_KEY);
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error checking session:", error);
      set({ isLoading: false });
    }
  },
}));

// Load user from Supabase session on app start
const initializeAuth = async () => {
  console.log("Initializing auth...");
  await useAuthStore.getState().checkSession();
};

// Initialize auth state
initializeAuth();
