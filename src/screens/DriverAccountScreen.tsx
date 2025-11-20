import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DriverTabParamList } from "../navigation/types";
import { useAuthStore } from "../state/authStore";
import { useDriverStore } from "../state/driverStore";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ConfirmationModal } from "../components/ConfirmationModal";

type Props = CompositeScreenProps<
  BottomTabScreenProps<DriverTabParamList, "DriverAccount">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function DriverAccountScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const earnings = useDriverStore((s) => s.earnings);
  const tripHistory = useDriverStore((s) => s.tripHistory);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  const verificationBadge = {
    basic: { label: "Basic", color: "gray", icon: "checkmark-circle-outline" },
    standard: { label: "Standard", color: "blue", icon: "checkmark-circle" },
    community: { label: "Community Verified", color: "green", icon: "shield-checkmark" },
    premium: { label: "Premium", color: "purple", icon: "star" },
  };

  const badge = verificationBadge[user?.verificationLevel || "basic"];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ConfirmationModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        destructive
      />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Account</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">Manage your driver profile and settings</Text>
        </View>

        {/* Profile Card */}
        <View className="mx-6 mt-4">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center mb-4">
              {user?.profilePhoto ? (
                <Image
                  source={{ uri: user.profilePhoto }}
                  className="w-20 h-20 rounded-full mr-4"
                />
              ) : (
                <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full items-center justify-center mr-4">
                  <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-300 mt-1">{user?.phone}</Text>
                {user?.email && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</Text>
                )}
              </View>
            </View>

            {/* Verification Badge */}
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <Ionicons
                name={badge.icon as any}
                size={20}
                color={badge.color === "green" ? "#16a34a" : badge.color === "purple" ? "#9333ea" : "#6b7280"}
              />
              <Text className="ml-2 font-medium text-gray-700 dark:text-gray-300">{badge.label}</Text>
              <View className="flex-1" />
              <Pressable>
                <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">Upgrade</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Driver Stats */}
        <View className="mx-6 mt-4">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Driver Stats</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="car" size={20} color="#2563eb" />
                  <Text className="ml-3 text-gray-700 dark:text-gray-300">Total Trips</Text>
                </View>
                <Text className="font-semibold text-gray-900 dark:text-white">{user?.totalTrips || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="#eab308" />
                  <Text className="ml-3 text-gray-700 dark:text-gray-300">Rating</Text>
                </View>
                <Text className="font-semibold text-gray-900 dark:text-white">{user?.rating.toFixed(1)}★</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="cash" size={20} color="#16a34a" />
                  <Text className="ml-3 text-gray-700 dark:text-gray-300">Total Earnings</Text>
                </View>
                <Text className="font-semibold text-green-600 dark:text-green-400">${earnings.total.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  <Text className="ml-3 text-gray-700 dark:text-gray-300">Completed</Text>
                </View>
                <Text className="font-semibold text-gray-900 dark:text-white">{tripHistory.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Driver Menu Items */}
        <View className="mx-6 mt-4">
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Edit Profile */}
            <Pressable
              onPress={() => navigation.navigate("EditProfile")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">Edit Profile</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Update your personal information
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Vehicle Information */}
            <Pressable
              onPress={() => navigation.navigate("VehicleInformation")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="car-outline" size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">Vehicle Information</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage your vehicle details
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Documents */}
            <Pressable
              onPress={() => navigation.navigate("Documents")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <View className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="document-text-outline" size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">Documents</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {"License, insurance, and registration"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Bank Account */}
            <Pressable
              onPress={() => navigation.navigate("BankAccount")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="wallet-outline" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">Bank Account</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage payout settings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Tax Information */}
            <Pressable
              onPress={() => navigation.navigate("TaxInformation")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <View className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="receipt-outline" size={20} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">Tax Information</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  1099 forms and tax documents
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Earnings History */}
            <Pressable
              onPress={() => navigation.navigate("Earnings")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <View className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="bar-chart-outline" size={20} color="#eab308" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">Earnings History</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  View detailed earnings breakdown
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Preferences */}
            <Pressable
              onPress={() => navigation.navigate("NotificationSettings")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <View className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="settings-outline" size={20} color="#6b7280" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">Driver Preferences</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Route settings and preferences
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Appearance */}
            <Pressable
              onPress={() => navigation.navigate("ThemeSettings")}
              className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="color-palette-outline" size={20} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">Appearance</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Choose light or dark theme
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Support & Legal */}
        <View className="mx-6 mt-4">
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
            SUPPORT & LEGAL
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Pressable
              onPress={() => navigation.navigate("HelpCenter")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900 dark:text-white">Driver Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL("https://routeshare.com/safety")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <Ionicons name="shield-checkmark-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900 dark:text-white">Safety Center</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL("https://routeshare.com/driver-agreement")}
              className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <Ionicons name="document-text-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900 dark:text-white">
                Driver Agreement
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL("https://routeshare.com/about")}
              className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-gray-700/50"
            >
              <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900 dark:text-white">About RouteShare</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mx-6 mt-4 pb-8">
          <Pressable
            onPress={handleLogout}
            className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-2xl py-4 px-6 active:bg-red-100 dark:active:bg-red-900/50"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text className="ml-2 text-red-600 dark:text-red-400 font-semibold text-base">Logout</Text>
            </View>
          </Pressable>

          <Text className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Version 1.0.0 • RouteShare Driver
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
