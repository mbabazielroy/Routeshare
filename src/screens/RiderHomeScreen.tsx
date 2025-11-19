import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
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
  BottomTabScreenProps<RiderTabParamList, "RiderHome">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function RiderHomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const savedLocations = useRiderStore((s) => s.savedLocations);
  const currentTrip = useRiderStore((s) => s.currentTrip);
  const tripHistory = useRiderStore((s) => s.tripHistory);

  const handleRequestRide = () => {
    navigation.navigate("TripRequest");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white">
          <Text className="text-3xl font-bold text-gray-900">
            Hello, {user?.firstName}!
          </Text>
          <Text className="text-base text-gray-600 mt-1">Where would you like to go?</Text>
        </View>

        {/* Active Trip Card */}
        {currentTrip && (
          <View className="mx-6 mt-4">
            <Pressable
              onPress={() =>
                navigation.navigate("LiveTrip", { tripId: currentTrip.id })
              }
              className="bg-blue-600 rounded-2xl p-5 active:bg-blue-700"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-bold text-lg">Active Trip</Text>
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-semibold">
                    {currentTrip.status === "accepted" ? "Driver Coming" : "In Progress"}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="car" size={20} color="white" />
                <Text className="text-white ml-2 flex-1">
                  {currentTrip.driver?.firstName} is {currentTrip.status === "accepted" ? "on the way" : "taking you"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </Pressable>
          </View>
        )}

        {/* Search Box */}
        <View className="px-6 mt-6">
          <Pressable
            onPress={handleRequestRide}
            className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm border border-gray-200"
          >
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
              <Ionicons name="search" size={20} color="#2563eb" />
            </View>
            <Text className="flex-1 text-gray-500 text-base">Where to?</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Saved Locations */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Saved Places</Text>
          <View className="space-y-3">
            {savedLocations.map((location) => (
              <Pressable
                key={location.id}
                onPress={() => navigation.navigate("TripRequest")}
                className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-200"
              >
                <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons
                    name={location.icon as any}
                    size={24}
                    color="#2563eb"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 text-base">
                    {location.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {location.location.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Trips */}
        {tripHistory.length > 0 && (
          <View className="px-6 mt-6 pb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Recent Trips</Text>
            <View className="space-y-3">
              {tripHistory.slice(0, 3).map((trip) => (
                <View
                  key={trip.id}
                  className="bg-white rounded-xl p-4 border border-gray-200"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold text-gray-900">
                      {trip.driver?.firstName} {trip.driver?.lastName?.[0]}.
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      ${trip.fare.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {trip.dropoff.address}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="star" size={14} color="#eab308" />
                    <Text className="text-xs text-gray-500 ml-1">
                      {trip.driver?.rating.toFixed(1)} • {trip.driverProfile?.vehicleColor} {trip.driverProfile?.vehicleMake}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-6 mt-2 pb-8">
          <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => console.log("Schedule - Coming soon")}
              className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200 active:bg-gray-50"
            >
              <View className="w-12 h-12 bg-purple-50 rounded-full items-center justify-center mb-2">
                <Ionicons name="calendar" size={24} color="#9333ea" />
              </View>
              <Text className="text-sm font-medium text-gray-900">Schedule</Text>
            </Pressable>

            <Pressable
              onPress={() => console.log("Carpool - Coming soon")}
              className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200 active:bg-gray-50"
            >
              <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-2">
                <Ionicons name="people" size={24} color="#16a34a" />
              </View>
              <Text className="text-sm font-medium text-gray-900">Carpool</Text>
            </Pressable>

            <Pressable
              onPress={() => console.log("Help - Coming soon")}
              className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200 active:bg-gray-50"
            >
              <View className="w-12 h-12 bg-orange-50 rounded-full items-center justify-center mb-2">
                <Ionicons name="help-circle" size={24} color="#ea580c" />
              </View>
              <Text className="text-sm font-medium text-gray-900">Help</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
