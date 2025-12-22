import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./src/navigation/RootNavigator";
import { Toast } from "./src/components/Toast";
import { OfflineIndicator } from "./src/components/OfflineIndicator";
import { useEffect } from "react";
import { useOfflineStore } from "./src/state/offlineStore";
import { useThemeStore } from "./src/state/themeStore";
import { useColorScheme } from "nativewind";
import { LogBox } from "react-native";

// Suppress network request failed errors in the UI (they're handled gracefully)
LogBox.ignoreLogs([
  "Network request failed",
  "TypeError: Network request failed",
  "AuthRetryableFetchError",
]);

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project.
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const startNetworkListener = useOfflineStore((s) => s.startNetworkListener);
  const theme = useThemeStore((s) => s.theme);
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    // Initialize network status monitoring
    startNetworkListener();
  }, []);

  // Apply theme when it changes - force immediate update
  useEffect(() => {
    const newScheme = theme === "system" ? "system" : theme;
    if (colorScheme !== newScheme) {
      setColorScheme(newScheme);
    }
  }, [theme, colorScheme, setColorScheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
          <OfflineIndicator />
          <Toast />
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
