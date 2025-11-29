import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Complete app reset utility
 * Clears all persisted data including auth, stores, and cached data
 * USE WITH CAUTION: This will log out the user and clear all local data
 */
export async function resetApp(): Promise<void> {
  try {
    console.log("Starting app reset...");

    // List of all AsyncStorage keys used by the app
    const keysToRemove = [
      // Auth Store
      "user-data",
      "auth-provider",

      // Rider Store
      "rider-store",

      // Driver Store
      "driver-store",

      // Payment Store
      "payment-store",

      // Messaging Store
      "messaging-store",

      // Theme Store
      "theme-preference",

      // Offline Store
      "offline-store",

      // Onboarding
      "hasCompletedOnboarding",

      // Any other app-specific keys
      "app-state",
    ];

    // Remove all keys
    await AsyncStorage.multiRemove(keysToRemove);

    console.log("App reset complete. All local data cleared.");
    console.log("User will need to sign in again on next app launch.");

  } catch (error) {
    console.error("Error resetting app:", error);
    throw error;
  }
}

/**
 * Clear only authentication data (for logout)
 */
export async function clearAuthData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      "user-data",
      "auth-provider",
    ]);
    console.log("Auth data cleared successfully");
  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw error;
  }
}

/**
 * Clear only trip/ride history
 */
export async function clearTripHistory(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      "rider-store",
      "driver-store",
    ]);
    console.log("Trip history cleared successfully");
  } catch (error) {
    console.error("Error clearing trip history:", error);
    throw error;
  }
}

/**
 * Development utility: List all AsyncStorage keys
 */
export async function listAllStorageKeys(): Promise<readonly string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("All AsyncStorage keys:", keys);
    return keys;
  } catch (error) {
    console.error("Error listing storage keys:", error);
    return [];
  }
}
