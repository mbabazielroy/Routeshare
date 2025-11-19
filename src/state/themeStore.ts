import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      isDark: false,

      setTheme: (theme) => {
        set({ theme });
        // In a real app, you'd check system theme if theme === "system"
        // For now, we'll set isDark based on theme
        const isDark = theme === "dark";
        set({ isDark });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
