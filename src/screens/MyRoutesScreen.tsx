import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DriverTabParamList } from "../navigation/types";
import { useDriverStore } from "../state/driverStore";
import { Route } from "../types/routeshare";

type Props = BottomTabScreenProps<DriverTabParamList, "MyRoutes">;

type FilterType = "active" | "completed" | "cancelled";

export default function MyRoutesScreen({ navigation }: Props) {
  const currentRoute = useDriverStore((s) => s.currentRoute);
  const tripHistory = useDriverStore((s) => s.tripHistory);
  const [filter, setFilter] = useState<FilterType>("active");

  // Mock routes from trip history
  const allRoutes = tripHistory.map((trip) => ({
    id: trip.routeId,
    driverId: trip.driverId,
    origin: trip.pickup,
    destination: trip.dropoff,
    departureTime: trip.createdAt,
    availableSeats: 3,
    isRecurring: false,
    status: trip.status === "completed" ? "completed" : "cancelled",
    estimatedDuration: 30,
    distance: 20,
    createdAt: trip.createdAt,
  })) as Route[];

  if (currentRoute) {
    allRoutes.unshift(currentRoute);
  }

  const filteredRoutes = allRoutes.filter((route) => {
    if (filter === "active") return route.status === "active" || route.status === "in_progress";
    return route.status === filter;
  });

  const renderRouteCard = (route: Route) => {
    const isActive = route.status === "active" || route.status === "in_progress";
    const isCompleted = route.status === "completed";
    const statusColor = isActive
      ? "text-blue-600"
      : isCompleted
      ? "text-green-600"
      : "text-red-600";
    const statusBg = isActive
      ? "bg-blue-50"
      : isCompleted
      ? "bg-green-50"
      : "bg-red-50";

    const routeDate = new Date(route.departureTime);
    const dateStr = routeDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = routeDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <Pressable
        key={route.id}
        className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 active:bg-gray-50"
      >
        {/* Date and Status */}
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-sm font-semibold text-gray-900">{dateStr}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">{timeStr}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusBg}`}>
            <Text className={`text-xs font-semibold ${statusColor} capitalize`}>
              {route.status.replace("_", " ")}
            </Text>
          </View>
        </View>

        {/* Route Details */}
        <View className="mb-3">
          <View className="flex-row items-start mb-2">
            <Ionicons name="radio-button-on" size={16} color="#2563eb" />
            <Text className="flex-1 ml-2 text-sm text-gray-700" numberOfLines={1}>
              {route.origin.address}
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="location" size={16} color="#dc2626" />
            <Text className="flex-1 ml-2 text-sm text-gray-700" numberOfLines={1}>
              {route.destination.address}
            </Text>
          </View>
        </View>

        {/* Route Info */}
        <View className="flex-row items-center pt-3 border-t border-gray-100">
          <View className="flex-row items-center flex-1">
            <Ionicons name="people" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {route.availableSeats} seats
            </Text>
          </View>
          <View className="flex-row items-center flex-1">
            <Ionicons name="speedometer" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {route.distance} mi
            </Text>
          </View>
          <View className="flex-row items-center flex-1">
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {route.estimatedDuration} min
            </Text>
          </View>
          {route.isRecurring && (
            <View className="flex-row items-center">
              <Ionicons name="repeat" size={16} color="#9333ea" />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">My Routes</Text>
            <Text className="text-sm text-gray-600 mt-0.5">
              {allRoutes.length} total routes
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("DriverHome")}
            className="px-4 py-2 bg-blue-600 rounded-xl active:bg-blue-700"
          >
            <Text className="text-white font-semibold text-sm">+ New Route</Text>
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1">
          <Pressable
            onPress={() => setFilter("active")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "active" ? "bg-white" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                filter === "active" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Active
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter("completed")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "completed" ? "bg-white" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                filter === "completed" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Completed
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter("cancelled")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "cancelled" ? "bg-white" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                filter === "cancelled" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Cancelled
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Route List */}
      <ScrollView className="flex-1 px-6 pt-4">
        {filteredRoutes.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="map-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              No routes yet
            </Text>
            <Text className="text-sm text-gray-600 text-center px-8">
              {filter === "active"
                ? "Publish your first route to start earning"
                : `You have no ${filter} routes`}
            </Text>
            {filter === "active" && (
              <Pressable
                onPress={() => navigation.navigate("DriverHome")}
                className="mt-4 px-6 py-3 bg-blue-600 rounded-xl active:bg-blue-700"
              >
                <Text className="text-white font-semibold">Publish a Route</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <>
            {filteredRoutes.map(renderRouteCard)}
            <View className="h-6" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
