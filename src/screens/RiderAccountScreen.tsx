import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RiderTabParamList } from "../navigation/types";
import { useAuthStore } from "../state/authStore";
import { useRiderStore } from "../state/riderStore";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<RiderTabParamList, "RiderAccount">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function RiderAccountScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const tripHistory = useRiderStore((s) => s.tripHistory);

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
          <Text className="text-base text-gray-600">Manage your profile and settings</Text>
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
                color={badge.color === "green" ? "#16a34a" : "#6b7280"}
              />
              <Text className="ml-2 font-medium text-gray-700">{badge.label}</Text>
              <View className="flex-1" />
              <Pressable>
                <Text className="text-blue-600 font-semibold text-sm">Upgrade</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="mx-6 mt-4">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">Your Stats</Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-gray-900">
                  {user?.totalTrips || 0}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">Total Trips</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center flex-1">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="#eab308" />
                  <Text className="text-3xl font-bold text-gray-900 ml-1">
                    {user?.rating.toFixed(1)}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 mt-1">Rating</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-gray-900">
                  {tripHistory.length}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">Completed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mx-6 mt-4">
          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Profile */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Edit Profile</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Update your personal information
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Payment Methods */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="card-outline" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Payment Methods</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Manage cards and payment options
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Saved Locations */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="location-outline" size={20} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Saved Places</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Manage your saved locations
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Trip History */}
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="time-outline" size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Trip History</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  View all your past rides
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            {/* Notifications */}
            <Pressable className="flex-row items-center p-4 active:bg-gray-50">
              <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={20} color="#eab308" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Notifications</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Manage notification preferences
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
              <Text className="ml-3 flex-1 font-medium text-gray-900">Help Center</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <Ionicons name="document-text-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900">
                Terms & Conditions
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <Ionicons name="shield-outline" size={24} color="#6b7280" />
              <Text className="ml-3 flex-1 font-medium text-gray-900">Privacy Policy</Text>
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
            Version 1.0.0 • Built with RouteShare
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
