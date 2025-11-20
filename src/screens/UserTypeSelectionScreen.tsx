import React, { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../state/authStore";
import { UserType, User } from "../types/routeshare";

type Props = NativeStackScreenProps<RootStackParamList, "UserTypeSelection">;

export default function UserTypeSelectionScreen({ navigation, route }: Props) {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(route.params?.phone || "");
  const setUser = useAuthStore((s) => s.setUser);

  const isNewUser = route.params?.isNewUser ?? true;

  const handleContinue = async () => {
    if (!selectedType || !firstName || !lastName || !phone) return;

    const user: User = {
      id: selectedType === "rider" ? "rider_1" : "driver_1",
      firstName,
      lastName,
      phone,
      userType: selectedType,
      verificationLevel: "basic",
      rating: selectedType === "driver" ? 4.9 : 5.0,
      totalTrips: selectedType === "driver" ? 127 : 0,
      createdAt: new Date().toISOString(),
    };

    await setUser(user, "phone");

    // Navigate based on user type
    if (selectedType === "rider") {
      navigation.replace("RiderTabs");
    } else {
      navigation.replace("DriverTabs");
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
            disabled={!selectedType || !firstName || !lastName || !phone}
            className={`rounded-2xl py-4 px-6 ${
              selectedType && firstName && lastName && phone
                ? "bg-blue-600 dark:bg-blue-500 active:bg-blue-700 dark:active:bg-blue-600"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
