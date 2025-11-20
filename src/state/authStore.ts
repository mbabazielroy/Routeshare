import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { User, UserType } from "../types/routeshare";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authProvider: "phone" | "apple" | "google" | null;
  setUser: (user: User, provider?: "phone" | "apple" | "google") => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
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

      // If there's a Firebase auth token, store it securely
      // This would be passed from Firebase Auth after successful authentication

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
}));

// Load user from storage on app start
const initializeAuth = async () => {
  try {
    const [storedUser, storedProvider] = await Promise.all([
      AsyncStorage.getItem(USER_DATA_KEY),
      AsyncStorage.getItem(AUTH_PROVIDER_KEY),
    ]);

    if (storedUser) {
      const user = JSON.parse(storedUser);
      const provider = (storedProvider as "phone" | "apple" | "google") || "phone";

      useAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        authProvider: provider
      });
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  } catch (error) {
    console.error("Error loading user from storage:", error);
    useAuthStore.setState({ isLoading: false });
  }
};

// Initialize auth state
initializeAuth();
