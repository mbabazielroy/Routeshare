import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DriverTabParamList } from "../navigation/types";
import { useDriverStore } from "../state/driverStore";

type Props = BottomTabScreenProps<DriverTabParamList, "Earnings">;

type TimePeriod = "today" | "week" | "month" | "all";

export default function EarningsScreen({ navigation }: Props) {
  const earnings = useDriverStore((s) => s.earnings);
  const tripHistory = useDriverStore((s) => s.tripHistory);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");

  const getEarningsForPeriod = () => {
    switch (selectedPeriod) {
      case "today":
        return earnings.today;
      case "week":
        return earnings.week;
      case "month":
        return earnings.month;
      case "all":
        return earnings.total;
    }
  };

  const getTripsForPeriod = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filteredTrips = tripHistory.filter((trip) => {
      if (trip.status !== "completed") return false;
      const tripDate = new Date(trip.completedAt || trip.createdAt);

      switch (selectedPeriod) {
        case "today":
          return tripDate >= startOfToday;
        case "week":
          return tripDate >= startOfWeek;
        case "month":
          return tripDate >= startOfMonth;
        case "all":
          return true;
        default:
          return false;
      }
    });

    return filteredTrips.length;
  };

  const currentEarnings = getEarningsForPeriod();
  const currentTrips = getTripsForPeriod();
  const avgPerTrip = currentTrips > 0 ? currentEarnings / currentTrips : 0;

  // Calculate real weekly breakdown from trip history
  const getWeeklyData = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = days.map((day, index) => {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + index);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTrips = tripHistory.filter((trip) => {
        if (trip.status !== "completed") return false;
        const tripDate = new Date(trip.completedAt || trip.createdAt);
        return tripDate >= dayStart && tripDate <= dayEnd;
      });

      const dayEarnings = dayTrips.reduce((sum, trip) => sum + (trip.driverEarnings || 0), 0);

      return {
        day,
        amount: Math.round(dayEarnings * 100) / 100,
        trips: dayTrips.length,
      };
    });

    return weeklyData;
  };

  const weeklyData = getWeeklyData();
  const maxAmount = Math.max(...weeklyData.map((d) => d.amount), 1); // Min 1 to avoid division by zero

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Earnings</Text>
          <Text className="text-base text-gray-600 dark:text-gray-300">
            Track your income and performance
          </Text>
        </View>

        {/* Time Period Selector */}
        <View className="px-6 pt-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setSelectedPeriod("today")}
                className={`px-4 py-2 rounded-xl ${
                  selectedPeriod === "today"
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedPeriod === "today" ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Today
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedPeriod("week")}
                className={`px-4 py-2 rounded-xl ${
                  selectedPeriod === "week"
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedPeriod === "week" ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  This Week
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedPeriod("month")}
                className={`px-4 py-2 rounded-xl ${
                  selectedPeriod === "month"
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedPeriod === "month" ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  This Month
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedPeriod("all")}
                className={`px-4 py-2 rounded-xl ${
                  selectedPeriod === "all"
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedPeriod === "all" ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  All Time
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {/* Earnings Summary */}
        <View className="mx-6 mt-4">
          <View className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6">
            <Text className="text-blue-100 text-sm font-medium mb-2">
              Total Earnings
            </Text>
            <Text className="text-white text-5xl font-bold mb-4">
              ${currentEarnings.toFixed(2)}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="trending-up" size={16} color="#93c5fd" />
              <Text className="text-blue-100 text-sm ml-1">
                {currentTrips} trips completed
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="mx-6 mt-4">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full items-center justify-center mb-3">
                <Ionicons name="cash" size={20} color="#16a34a" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                ${avgPerTrip.toFixed(2)}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">Avg per Trip</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <View className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-full items-center justify-center mb-3">
                <Ionicons name="car" size={20} color="#9333ea" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentTrips}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Trips</Text>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        {selectedPeriod === "week" && (
          <View className="mx-6 mt-4">
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                This Week
              </Text>
              <View className="flex-row items-end justify-between h-48">
                {weeklyData.map((day, index) => {
                  const height = (day.amount / maxAmount) * 100;
                  return (
                    <View key={index} className="flex-1 items-center">
                      <View className="w-full items-center mb-2">
                        <Text className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                          ${day.amount.toFixed(0)}
                        </Text>
                        <View
                          className="w-8 bg-blue-600 dark:bg-blue-500 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                      </View>
                      <Text className="text-xs text-gray-600 dark:text-gray-400 mt-2">{day.day}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Earnings Breakdown */}
        <View className="mx-6 mt-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">
            Earnings Breakdown
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm text-gray-600 dark:text-gray-300">Your Earnings (85%)</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                ${(currentEarnings * 0.85).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm text-gray-600 dark:text-gray-300">Platform Fee (15%)</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                ${(currentEarnings * 0.15).toFixed(2)}
              </Text>
            </View>
            <View className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                Total Fares
              </Text>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                ${currentEarnings.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Cash Out */}
        <View className="mx-6 mt-4 mb-6">
          <Pressable className="bg-green-600 dark:bg-green-500 rounded-2xl py-4 px-6 active:bg-green-700 dark:active:bg-green-600">
            <View className="flex-row items-center justify-center">
              <Ionicons name="wallet" size={20} color="white" />
              <Text className="ml-2 text-white font-bold text-base">
                Cash Out ${(currentEarnings * 0.85).toFixed(2)}
              </Text>
            </View>
          </Pressable>
          <Text className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
            Available balance • Instant transfer to your bank
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
