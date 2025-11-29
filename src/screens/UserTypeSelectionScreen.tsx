import React, { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../state/authStore";
import { UserType, User } from "../types/routeshare";
import { updateUserProfile, getUserProfile } from "../services/supabaseAuth";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "UserTypeSelection">;

export default function UserTypeSelectionScreen({ navigation, route }: Props) {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(route.params?.phone || "");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const showToast = useToast((s) => s.show);

  const isNewUser = route.params?.isNewUser ?? true;
  const oauthData = route.params?.oauthData;

  // Pre-fill form with OAuth data if available
  useEffect(() => {
    if (oauthData) {
      setFirstName(oauthData.firstName || "");
      setLastName(oauthData.lastName || "");
      setPhone(oauthData.email || phone);
    }
  }, [oauthData]);

  // Get the current user's ID from Supabase session
  useEffect(() => {
    const getCurrentUserId = async () => {
      const { supabase } = await import("../config/supabase");
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
          console.log("Current user ID from session:", session.user.id);
        }
      }
    };
    getCurrentUserId();
  }, []);

  const handleContinue = async () => {
    if (!selectedType || !firstName || !lastName) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (!userId) {
      showToast("User session not found. Please sign in again.", "error");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Updating user profile with userType:", selectedType);

      // Update the user profile in Supabase
      const result = await updateUserProfile(userId, {
        firstName,
        lastName,
        phone,
        userType: selectedType,
        authProvider: oauthData ? 'google' : 'phone',
        email: oauthData?.email || undefined,
        profilePhoto: oauthData?.photoURL || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      console.log("Profile updated successfully:", result.user);

      // Get the complete updated profile
      const updatedProfile = await getUserProfile(userId);

      if (!updatedProfile) {
        throw new Error("Failed to fetch updated profile");
      }

      // Set the user in the app state
      const completeUser: User = {
        ...updatedProfile,
        firstName: updatedProfile.firstName!,
        lastName: updatedProfile.lastName!,
        phone: updatedProfile.phone || phone,
        userType: updatedProfile.userType!,
        verificationLevel: updatedProfile.verificationLevel || 'basic',
        rating: updatedProfile.rating || 5.0,
        totalTrips: updatedProfile.totalTrips || 0,
      };

      await setUser(completeUser, oauthData ? 'google' : 'phone');

      showToast("Profile completed successfully!", "success");

      // Navigate based on user type
      setTimeout(() => {
        if (selectedType === "rider") {
          navigation.replace("RiderTabs");
        } else {
          navigation.replace("DriverTabs");
        }
      }, 500);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 px-6 py-4">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to RouteShare
        </Text>
        <Text className="text-base text-gray-600 dark:text-gray-300 mb-8">
          Let us know how you plan to use the app
        </Text>

        {/* User Type Selection */}
        <View className="space-y-3 mb-8">
          <Pressable
            onPress={() => setSelectedType("rider")}
            className={`border-2 rounded-2xl p-5 flex-row items-center ${
              selectedType === "rider"
                ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          >
            <View
              className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${
                selectedType === "rider" ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Ionicons
                name="person"
                size={28}
                color={selectedType === "rider" ? "white" : "#6b7280"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                I need a ride
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Find drivers heading your way
              </Text>
            </View>
            {selectedType === "rider" && (
              <Ionicons name="checkmark-circle" size={28} color="#2563eb" />
            )}
          </Pressable>

          <Pressable
            onPress={() => setSelectedType("driver")}
            className={`border-2 rounded-2xl p-5 flex-row items-center ${
              selectedType === "driver"
                ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          >
            <View
              className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${
                selectedType === "driver" ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Ionicons
                name="car"
                size={28}
                color={selectedType === "driver" ? "white" : "#6b7280"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                I am a driver
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Earn money on trips you are already taking
              </Text>
            </View>
            {selectedType === "driver" && (
              <Ionicons name="checkmark-circle" size={28} color="#2563eb" />
            )}
          </Pressable>
        </View>

        {/* Basic Info Form */}
        {selectedType && (
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
                editable={!route.params?.phone}
              />
              {route.params?.phone && (
                <Text className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Phone number verified
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Continue Button */}
        <View className="flex-1 justify-end pb-4">
          <Pressable
            onPress={handleContinue}
            disabled={!selectedType || !firstName || !lastName || !phone || isLoading}
            className={`rounded-2xl py-4 px-6 ${
              selectedType && firstName && lastName && phone && !isLoading
                ? "bg-blue-600 dark:bg-blue-500 active:bg-blue-700 dark:active:bg-blue-600"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Continue
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
