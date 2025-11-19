import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
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
  BottomTabScreenProps<DriverTabParamList, "DriverHome">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function DriverHomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const isOnline = useDriverStore((s) => s.isOnline);
  const toggleOnline = useDriverStore((s) => s.toggleOnline);
  const earnings = useDriverStore((s) => s.earnings);
  const currentRoute = useDriverStore((s) => s.currentRoute);
  const pendingRequests = useDriverStore((s) => s.pendingRequests);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-3xl font-bold text-gray-900">
                Welcome, {user?.firstName}
              </Text>
              <Text className="text-base text-gray-600 mt-1">
                Ready to earn on your commute?
              </Text>
            </View>
          </View>

          {/* Online Toggle */}
          <Pressable
            onPress={toggleOnline}
            className={`rounded-2xl p-4 flex-row items-center justify-between ${
              isOnline ? "bg-green-50 border-2 border-green-500" : "bg-gray-100"
            }`}
          >
            <View className="flex-row items-center">
              <View
                className={`w-4 h-4 rounded-full mr-3 ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <Text
                className={`text-lg font-semibold ${
                  isOnline ? "text-green-700" : "text-gray-600"
                }`}
              >
                {isOnline ? "You're Online" : "You're Offline"}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">Tap to toggle</Text>
          </Pressable>
        </View>

        {/* Earnings Summary */}
        <View className="mx-6 mt-4">
          <View className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5">
            <Text className="text-white/80 text-sm mb-1">{"Today's Earnings"}</Text>
            <Text className="text-white text-4xl font-bold mb-4">
              ${earnings.today.toFixed(2)}
            </Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-white/80 text-xs">This Week</Text>
                <Text className="text-white text-lg font-semibold">
                  ${earnings.week.toFixed(2)}
                </Text>
              </View>
              <View>
                <Text className="text-white/80 text-xs">This Month</Text>
                <Text className="text-white text-lg font-semibold">
                  ${earnings.month.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View className="mx-6 mt-4">
            <View className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="notifications" size={20} color="#eab308" />
                  <Text className="ml-2 font-bold text-yellow-900">
                    {pendingRequests.length} New Request{pendingRequests.length > 1 ? "s" : ""}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    navigation.navigate("RiderRequest", {
                      requestId: pendingRequests[0].id,
                    })
                  }
                >
                  <Text className="text-yellow-700 font-semibold">View</Text>
                </Pressable>
              </View>
              <Text className="text-sm text-yellow-800">
                Someone wants to ride with you!
              </Text>
            </View>
          </View>
        )}

        {/* Current Route */}
        {currentRoute ? (
          <View className="px-6 mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Active Route</Text>
            <View className="bg-white rounded-2xl p-5 border border-gray-200">
              <View className="flex-row items-center justify-between mb-4">
                <View className="bg-green-50 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-semibold text-xs">Active</Text>
                </View>
                <Text className="text-gray-600 text-sm">
                  {currentRoute.availableSeats} seat{currentRoute.availableSeats > 1 ? "s" : ""} available
                </Text>
              </View>

              <View className="mb-3">
                <View className="flex-row items-start mb-2">
                  <Ionicons name="location" size={18} color="#10b981" />
                  <View className="flex-1 ml-3">
                    <Text className="text-xs text-gray-500">From</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {currentRoute.origin.address}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-start">
                  <Ionicons name="location" size={18} color="#dc2626" />
                  <View className="flex-1 ml-3">
                    <Text className="text-xs text-gray-500">To</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {currentRoute.destination.address}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
                <Text className="text-gray-600 text-sm">
                  {currentRoute.distance.toFixed(1)} mi • {currentRoute.estimatedDuration} min
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("MyRoutes")}
                  className="bg-blue-600 rounded-lg px-4 py-2 active:bg-blue-700"
                >
                  <Text className="text-white font-semibold">View Route</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View className="px-6 mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Publish Your Route</Text>
            <Pressable
              onPress={() => navigation.navigate("PublishRoute")}
              className="bg-blue-600 rounded-2xl p-6 items-center active:bg-blue-700"
            >
              <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-3">
                <Ionicons name="add-circle" size={40} color="white" />
              </View>
              <Text className="text-white font-bold text-lg mb-1">
                Publish a Route
              </Text>
              <Text className="text-white/80 text-sm text-center">
                Share where you are going and earn money from riders
              </Text>
            </Pressable>
          </View>
        )}

        {/* Quick Stats */}
        <View className="px-6 mt-6 pb-8">
          <Text className="text-lg font-bold text-gray-900 mb-3">Your Stats</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Ionicons name="car" size={24} color="#2563eb" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {user?.totalTrips || 0}
              </Text>
              <Text className="text-sm text-gray-600">Total Trips</Text>
            </View>

            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Ionicons name="star" size={24} color="#eab308" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {user?.rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-gray-600">Rating</Text>
            </View>

            <View className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
              <Ionicons name="cash" size={24} color="#16a34a" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                ${earnings.total.toFixed(0)}
              </Text>
              <Text className="text-sm text-gray-600">Total Earned</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
