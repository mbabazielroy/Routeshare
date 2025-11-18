import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserType } from "../types/routeshare";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
    AsyncStorage.setItem("user", JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    AsyncStorage.removeItem("user");
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates };
      AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));

// Load user from storage on app start
AsyncStorage.getItem("user").then((stored) => {
  if (stored) {
    const user = JSON.parse(stored);
    useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
  } else {
    useAuthStore.setState({ isLoading: false });
  }
});
