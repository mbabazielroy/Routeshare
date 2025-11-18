import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useDriverStore } from "../state/driverStore";

type Props = NativeStackScreenProps<RootStackParamList, "PublishRoute">;

export default function PublishRouteScreen({ navigation }: Props) {
  const publishRoute = useDriverStore((s) => s.publishRoute);
  const [origin] = useState("Millville Town Center");
  const [destination] = useState("County Medical Center");
  const [availableSeats, setAvailableSeats] = useState(3);
  const [whenOption, setWhenOption] = useState<"now" | "later">("now");

  const handlePublish = () => {
    publishRoute({
      origin: {
        latitude: 38.895,
        longitude: -77.037,
        address: origin,
      },
      destination: {
        latitude: 38.92,
        longitude: -77.05,
        address: destination,
      },
      departureTime: new Date(Date.now() + (whenOption === "now" ? 5 : 60) * 60000).toISOString(),
      availableSeats,
      isRecurring: false,
      estimatedDuration: 25,
      distance: 18.5,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color="#1f2937" />
            </Pressable>
            <Text className="text-xl font-bold text-gray-900">Publish Route</Text>
            <View className="w-7" />
          </View>

          {/* Info Card */}
          <View className="bg-blue-50 rounded-2xl p-5 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#2563eb" />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-blue-900 mb-1">
                  {"Earn on trips you're already taking"}
                </Text>
                <Text className="text-sm text-blue-800">
                  {"Share your route and connect with riders heading the same way. You'll earn 85% of the fare."}
                </Text>
              </View>
            </View>
          </View>

          {/* Route Details (Demo) */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-3">Your Route</Text>
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-start mb-3">
                <Ionicons name="location" size={20} color="#10b981" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500 mb-1">From</Text>
                  <Text className="text-base font-medium text-gray-900">{origin}</Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="location" size={20} color="#dc2626" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500 mb-1">To</Text>
                  <Text className="text-base font-medium text-gray-900">{destination}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* When */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-3">When are you leaving?</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setWhenOption("now")}
                className={`flex-1 rounded-xl py-3 px-4 ${
                  whenOption === "now" ? "bg-blue-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    whenOption === "now" ? "text-white" : "text-gray-700"
                  }`}
                >
                  Soon (5 min)
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setWhenOption("later")}
                className={`flex-1 rounded-xl py-3 px-4 ${
                  whenOption === "later" ? "bg-blue-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    whenOption === "later" ? "text-white" : "text-gray-700"
                  }`}
                >
                  Later (1 hr)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Available Seats */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Available Seats</Text>
            <View className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4">
              <Pressable
                onPress={() => setAvailableSeats(Math.max(1, availableSeats - 1))}
                className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-300"
              >
                <Ionicons name="remove" size={20} color="#1f2937" />
              </Pressable>
              <Text className="text-xl font-semibold text-gray-900">{availableSeats}</Text>
              <Pressable
                onPress={() => setAvailableSeats(Math.min(5, availableSeats + 1))}
                className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-300"
              >
                <Ionicons name="add" size={20} color="#1f2937" />
              </Pressable>
            </View>
          </View>

          {/* Earnings Estimate */}
          <View className="bg-green-50 rounded-2xl p-5 mb-6">
            <Text className="text-sm text-green-700 mb-1">Estimated Earnings</Text>
            <Text className="text-3xl font-bold text-green-900">
              ${(15 + Math.random() * 15).toFixed(2)} - ${(25 + Math.random() * 20).toFixed(2)}
            </Text>
            <Text className="text-xs text-green-700 mt-1">
              Based on {availableSeats} rider{availableSeats > 1 ? "s" : ""} on your route
            </Text>
          </View>

          {/* Publish Button */}
          <Pressable
            onPress={handlePublish}
            className="bg-blue-600 rounded-2xl py-4 px-6 active:bg-blue-700"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Publish Route
            </Text>
          </Pressable>

          <Text className="text-center text-xs text-gray-500 mt-4">
            You can cancel anytime before accepting riders
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
