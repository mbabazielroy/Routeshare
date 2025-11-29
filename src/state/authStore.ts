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
    } catch (error) {
      console.error("Error storing user data:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Sign out from Supabase
      if (supabase) {
        await supabase.auth.signOut();
      }

      // Clear all stored data
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await AsyncStorage.removeItem(AUTH_PROVIDER_KEY);

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
      if (!supabase) {
        console.log("Supabase not initialized, loading from local storage");
        // Fall back to local storage if Supabase is not available
        const [storedUser, storedProvider] = await Promise.all([
          AsyncStorage.getItem(USER_DATA_KEY),
          AsyncStorage.getItem(AUTH_PROVIDER_KEY),
        ]);

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
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log("Active Supabase session found for user:", session.user.id);

        // Get the full user profile from database
        const userProfile = await getUserProfile(session.user.id);

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
          // Clear invalid session
          await supabase.auth.signOut();
          await AsyncStorage.removeItem(USER_DATA_KEY);
          await AsyncStorage.removeItem(AUTH_PROVIDER_KEY);
          set({ isLoading: false });
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
