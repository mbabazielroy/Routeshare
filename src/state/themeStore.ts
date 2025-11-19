import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { Appearance, ColorSchemeName } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colorScheme: ColorSchemeName;
  updateColorScheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      isDark: false,
      colorScheme: Appearance.getColorScheme(),

      setTheme: (theme) => {
        set({ theme });
        get().updateColorScheme();
      },

      updateColorScheme: () => {
        const { theme } = get();
        let colorScheme: ColorSchemeName;
        let isDark: boolean;

        if (theme === "system") {
          colorScheme = Appearance.getColorScheme();
          isDark = colorScheme === "dark";
        } else {
          colorScheme = theme as ColorSchemeName;
          isDark = theme === "dark";
        }

        set({ colorScheme, isDark });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Listen for system theme changes
Appearance.addChangeListener(() => {
  const store = useThemeStore.getState();
  if (store.theme === "system") {
    store.updateColorScheme();
  }
});
