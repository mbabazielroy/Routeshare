import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DriverTabParamList } from "../navigation/types";
import { useAuthStore } from "../state/authStore";
import { useDriverStore } from "../state/driverStore";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<DriverTabParamList, "DriverAccount">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function DriverAccountScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const earnings = useDriverStore((s) => s.earnings);
  const tripHistory = useDriverStore((s) => s.tripHistory);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const verificationBadge = {
    basic: { label: "Basic", color: "gray", icon: "checkmark-circle-outline" },
    standard: { label: "Standard", color: "blue", icon: "checkmark-circle" },
    community: { label: "Community Verified", color: "green", icon: "shield-checkmark" },
    premium: { label: "Premium", color: "purple", icon: "star" },
  };

  const badge = verificationBadge[user?.verificationLevel || "basic"];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-200">
          <Text className="text-3xl font-bold text-gray-900 mb-1">Account</Text>
          <Text className="text-base text-gray-600">Manage your driver profile and settings</Text>
        </View>

        {/* Profile Card */}
        <View className="mx-6 mt-4">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Text className="text-3xl font-bold text-blue-600">
                  {user?.firstName[0]}{user?.lastName[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-base text-gray-600 mt-1">{user?.phone}</Text>
                {user?.email && (
                  <Text className="text-sm text-gray-500 mt-1">{user.email}</Text>
                )}
              </View>
            </View>

            {/* Verification Badge */}
            <View className="flex-row items-center bg-gray-50 rounded-xl p-3">
              <Ionicons
                name={badge.icon as any}
                size={20}
                color={badge.color === "green" ? "#16a34a" : badge.color === "purple" ? "#9333ea" : "#6b7280"}
              />
              <Text className="ml-2 font-medium text-gray-700">{badge.label}</Text>
              <View className="flex-1" />
              <Pressable>
                <Text className="text-blue-600 font-semibold text-sm">Upgrade</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Driver Stats */}
        <View className="mx-6 mt-4">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">Driver Stats</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="car" size={20} color="#2563eb" />
                  <Text className="ml-3 text-gray-700">Total Trips</Text>
                </View>
                <Text className="font-semibold text-gray-900">{user?.totalTrips || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="#eab308" />
                  <Text className="ml-3 text-gray-700">Rating</Text>
                </View>
                <Text className="font-semibold text-gray-900">{user?.rating.toFixed(1)}★</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="cash" size={20} color="#16a34a" />
                  <Text className="ml-3 text-gray-700">Total Earnings</Text>
                </View>
                <Text className="font-semibold text-green-600">${earnings.total.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  <Text className="ml-3 text-gray-700">Completed</Text>
                </View>
                <Text className="font-semibold text-gray-900">{tripHistory.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Driver Menu Items */}
        <View className="mx-6 mt-4">
          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Vehicle Information */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="car-outline" size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Vehicle Information</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Manage your vehicle details
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Documents */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="document-text-outline" size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Documents</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {"License, insurance, and registration"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Bank Account */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="wallet-outline" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Bank Account</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Manage payout settings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Tax Information */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="receipt-outline" size={20} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Tax Information</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  1099 forms and tax documents
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Earnings History */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="bar-chart-outline" size={20} color="#eab308" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Earnings History</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  View detailed earnings breakdown
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Preferences */}
            <Pressable className="flex-row items-center p-4 active:bg-gray-50">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="settings-outline" size={20} color="#6b7280" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Driver Preferences</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Route settings and preferences
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Support & Legal */}
        <View className="mx-6 mt-4">
          <Text className="text-sm font-semibold text-gray-500 mb-2 px-2">
            SUPPORT & LEGAL
          </Text>
          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900">Driver Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <Ionicons name="shield-checkmark-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900">Safety Center</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <Ionicons name="document-text-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900">
                Driver Agreement
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center p-4 active:bg-gray-50">
              <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900">About RouteShare</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mx-6 mt-4 pb-8">
          <Pressable
            onPress={handleLogout}
            className="bg-red-50 border-2 border-red-200 rounded-2xl py-4 px-6 active:bg-red-100"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text className="ml-2 text-red-600 font-semibold text-base">Logout</Text>
            </View>
          </Pressable>

          <Text className="text-center text-xs text-gray-500 mt-4">
            Version 1.0.0 • RouteShare Driver
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
