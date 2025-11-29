import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { signInWithGoogle, signInWithApple, isAppleSignInAvailable } from "../services/oauthService";
import { useAuthStore } from "../state/authStore";
import { useToast } from "../components/Toast";
import { getUserProfile } from "../services/supabaseAuth";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToast((s) => s.show);

  useEffect(() => {
    setIsAppleAvailable(isAppleSignInAvailable());
  }, []);

  const handleAppleSignIn = async () => {
    setIsLoadingApple(true);
    try {
      const result = await signInWithApple();

      // Get full user profile from Supabase
      const userProfile = await getUserProfile(result.uid);

      if (userProfile && userProfile.userType) {
        // User has complete profile, log them in
        const completeUser = {
          ...userProfile,
          firstName: userProfile.firstName!,
          lastName: userProfile.lastName!,
          phone: userProfile.phone || '',
          userType: userProfile.userType!,
          verificationLevel: userProfile.verificationLevel || 'basic',
          rating: userProfile.rating || 5.0,
          totalTrips: userProfile.totalTrips || 0,
        };
        console.log("Logging in with complete user profile, userType:", completeUser.userType);
        await setUser(completeUser as any, 'apple');
        showToast("Successfully signed in with Apple", "success");

        // Navigate to appropriate home screen
        console.log("🚀 Navigating user to home screen, userType:", completeUser.userType);
        if (completeUser.userType === 'rider') {
          console.log("➡️  Navigating to RiderTabs");
          navigation.replace("RiderTabs");
        } else {
          console.log("➡️  Navigating to DriverTabs");
          navigation.replace("DriverTabs");
        }
      } else {
        // User needs to complete profile setup
        showToast("Welcome! Please complete your profile", "success");
        navigation.navigate("UserTypeSelection", {
          phone: result.email,
          isNewUser: true,
          oauthData: {
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            photoURL: result.photoURL,
          }
        });
      }
    } catch (error: any) {
      // Only log real errors, not configuration messages
      if (!error.message?.includes('not configured')) {
        console.error("Apple sign-in error:", error);
      }
      showToast(error.message || "Failed to sign in with Apple", "error");
    } finally {
      setIsLoadingApple(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    try {
      const result = await signInWithGoogle();
      console.log("Google OAuth result:", { uid: result.uid, email: result.email, name: result.displayName });

      // Get full user profile from Supabase
      const userProfile = await getUserProfile(result.uid);
      console.log("User profile from database:", userProfile ? {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        userType: userProfile.userType
      } : null);

      if (userProfile && userProfile.userType) {
        // User has complete profile, log them in
        const completeUser = {
          ...userProfile,
          firstName: userProfile.firstName!,
          lastName: userProfile.lastName!,
          phone: userProfile.phone || '',
          userType: userProfile.userType!,
          verificationLevel: userProfile.verificationLevel || 'basic',
          rating: userProfile.rating || 5.0,
          totalTrips: userProfile.totalTrips || 0,
        };
        console.log("Logging in with complete user profile, userType:", completeUser.userType);
        await setUser(completeUser as any, 'google');
        showToast("Successfully signed in with Google", "success");

        // Navigate to appropriate home screen
        console.log("🚀 Navigating user to home screen, userType:", completeUser.userType);
        if (completeUser.userType === 'rider') {
          console.log("➡️  Navigating to RiderTabs");
          navigation.replace("RiderTabs");
        } else {
          console.log("➡️  Navigating to DriverTabs");
          navigation.replace("DriverTabs");
        }
      } else {
        // User needs to complete profile setup
        console.log("User profile incomplete, navigating to UserTypeSelection");
        showToast("Welcome! Please complete your profile", "success");
        navigation.navigate("UserTypeSelection", {
          phone: result.email,
          isNewUser: true,
          oauthData: {
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            photoURL: result.photoURL,
          }
        });
      }
    } catch (error: any) {
      // Only log real errors, not configuration messages or cancellations
      if (!error.message?.includes('not configured') && !error.message?.includes('cancelled')) {
        console.error("Google sign-in error:", error);
      }
      showToast(error.message || "Failed to sign in with Google", "error");
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 px-6 justify-between py-8">
        {/* Hero Section */}
        <View className="flex-1 justify-center items-center">
          <View className="w-24 h-24 bg-blue-600 dark:bg-blue-500 rounded-3xl items-center justify-center mb-6">
            <Ionicons name="car-sport" size={48} color="white" />
          </View>

          <Text className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
            RouteShare
          </Text>

          <Text className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8 px-4">
            Rural ride-sharing that connects neighbors heading the same way
          </Text>

          {/* Benefits */}
          <View className="w-full mt-8 space-y-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="people" size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  Community-Based
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Ride with verified local drivers
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-4">
              <View className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="cash" size={24} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  Fair Pricing
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Affordable rides that help drivers earn
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-4">
              <View className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="shield-checkmark" size={24} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  Safe & Verified
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Background checks and ratings
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View className="space-y-3">
          {/* Apple Sign-In Button (iOS only) */}
          {isAppleAvailable && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={isLoadingApple}
              className="bg-black dark:bg-white rounded-2xl py-4 px-6 flex-row items-center justify-center active:opacity-80"
            >
              {isLoadingApple ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={24} color="white" className="mr-3" />
                  <Text className="text-white dark:text-black text-center text-lg font-semibold ml-3">
                    Continue with Apple
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Google Sign-In Button */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isLoadingGoogle}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl py-4 px-6 flex-row items-center justify-center active:bg-gray-50 dark:active:bg-gray-700"
          >
            {isLoadingGoogle ? (
              <ActivityIndicator color="#2563eb" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#EA4335" className="mr-3" />
                <Text className="text-gray-700 dark:text-gray-200 text-center text-lg font-semibold ml-3">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <Text className="mx-4 text-gray-500 dark:text-gray-400 text-sm font-medium">
              OR
            </Text>
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Phone Auth Button */}
          <Pressable
            onPress={() => navigation.navigate("PhoneAuth")}
            className="bg-blue-600 dark:bg-blue-500 rounded-2xl py-4 px-6 active:bg-blue-700"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Continue with Phone
            </Text>
          </Pressable>

          {/* Security Notice */}
          <View className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 mt-4">
            <View className="flex-row items-start">
              <Ionicons name="lock-closed" size={20} color="#16a34a" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Your data is secure
                </Text>
                <Text className="text-xs text-gray-700 dark:text-gray-300">
                  We use industry-standard encryption and never share your personal
                  information without your consent. Apple and Google Sign-In provide
                  additional security through two-factor authentication.
                </Text>
              </View>
            </View>
          </View>

          {/* Terms */}
          <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
