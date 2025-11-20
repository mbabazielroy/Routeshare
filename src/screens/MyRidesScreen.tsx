import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RiderTabParamList } from "../navigation/types";
import { useRiderStore } from "../state/riderStore";
import { Trip } from "../types/routeshare";

type Props = BottomTabScreenProps<RiderTabParamList, "MyRides">;

type FilterType = "all" | "completed" | "cancelled";

export default function MyRidesScreen({ navigation }: Props) {
  const tripHistory = useRiderStore((s) => s.tripHistory);
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTrips = tripHistory.filter((trip) => {
    if (filter === "all") return true;
    return trip.status === filter;
  });

  const renderTripCard = (trip: Trip) => {
    const isCompleted = trip.status === "completed";
    const isCancelled = trip.status === "cancelled";
    const statusColor = isCompleted
      ? "text-green-600"
      : isCancelled
      ? "text-red-600"
      : "text-gray-600";
    const statusBg = isCompleted
      ? "bg-green-50"
      : isCancelled
      ? "bg-red-50"
      : "bg-gray-50";

    const tripDate = new Date(trip.createdAt);
    const dateStr = tripDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = tripDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <Pressable
        key={trip.id}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
      >
        {/* Date and Status */}
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-sm font-semibold text-gray-900 dark:text-white">{dateStr}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{timeStr}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusBg}`}>
            <Text className={`text-xs font-semibold ${statusColor} capitalize`}>
              {trip.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        {/* Route */}
        <View className="mb-3">
          <View className="flex-row items-start mb-2">
            <Ionicons name="radio-button-on" size={16} color="#2563eb" />
            <Text className="flex-1 ml-2 text-sm text-gray-700 dark:text-gray-300" numberOfLines={1}>
              {trip.pickup.address}
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="location" size={16} color="#dc2626" />
            <Text className="flex-1 ml-2 text-sm text-gray-700 dark:text-gray-300" numberOfLines={1}>
              {trip.dropoff.address}
            </Text>
          </View>
        </View>

        {/* Driver Info */}
        {trip.driver && (
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-3">
                <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {trip.driver.firstName[0]}
                  {trip.driver.lastName[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                  {trip.driver.firstName} {trip.driver.lastName}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Ionicons name="star" size={12} color="#eab308" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                    {trip.driver.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              ${trip.fare.toFixed(2)}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">My Rides</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {tripHistory.length} total trips
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1">
          <Pressable
            onPress={() => setFilter("all")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "all" ? "bg-white dark:bg-gray-800" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                filter === "all" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter("completed")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "completed" ? "bg-white dark:bg-gray-800" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                filter === "completed" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Completed
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter("cancelled")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "cancelled" ? "bg-white dark:bg-gray-800" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                filter === "cancelled" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Cancelled
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Trip List */}
      <ScrollView className="flex-1 px-6 pt-4">
        {filteredTrips.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
              <Ionicons name="car-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No rides yet
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 text-center px-8">
              {filter === "all"
                ? "Your completed and cancelled rides will appear here"
                : `You have no ${filter} rides`}
            </Text>
          </View>
        ) : (
          <>
            {filteredTrips.map(renderTripCard)}
            <View className="h-6" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
