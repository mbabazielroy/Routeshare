import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../state/authStore";
import { useRiderStore } from "../state/riderStore";

type Props = NativeStackScreenProps<RootStackParamList, "TripRequest">;

export default function TripRequestScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const savedLocations = useRiderStore((s) => s.savedLocations);
  const createTripRequest = useRiderStore((s) => s.createTripRequest);
  const isSearching = useRiderStore((s) => s.isSearching);

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [whenOption, setWhenOption] = useState<"now" | "later">("now");
  const [passengers, setPassengers] = useState(1);

  const handleFindRides = async () => {
    if (!pickupAddress || !dropoffAddress || !user?.id) return;

    // Generate realistic placeholder coordinates based on address
    // In production: integrate Google Places API or Mapbox Geocoding
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash;
    };

    // Generate somewhat realistic coordinates within continental US
    const pickupHash = hashCode(pickupAddress);
    const dropoffHash = hashCode(dropoffAddress);

    const pickup = {
      latitude: 37 + ((pickupHash % 100) / 100) * 10, // 37-47 (US latitude range)
      longitude: -97 + ((pickupHash % 200) / 200) * 30, // -97 to -67 (US longitude range)
      address: pickupAddress,
    };

    const dropoff = {
      latitude: 37 + ((dropoffHash % 100) / 100) * 10,
      longitude: -97 + ((dropoffHash % 200) / 200) * 30,
      address: dropoffAddress,
    };

    await createTripRequest(pickup, dropoff, new Date().toISOString(), passengers, user.id);
    navigation.navigate("DriverSelection");
  };

  const selectSavedLocation = (address: string, type: "pickup" | "dropoff") => {
    if (type === "pickup") {
      setPickupAddress(address);
    } else {
      setDropoffAddress(address);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} className="text-gray-900 dark:text-white" />
            </Pressable>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">Request a Ride</Text>
            <View className="w-7" />
          </View>

          {/* Pickup Location */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pickup Location</Text>
            <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3">
              <Ionicons name="locate" size={20} color="#2563eb" />
              <TextInput
                value={pickupAddress}
                onChangeText={setPickupAddress}
                placeholder="Enter pickup address"
                className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Dropoff Location */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drop-off Location</Text>
            <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3">
              <Ionicons name="location" size={20} color="#dc2626" />
              <TextInput
                value={dropoffAddress}
                onChangeText={setDropoffAddress}
                placeholder="Enter destination"
                className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Saved Locations */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Saved Locations</Text>
            <View className="flex-row flex-wrap gap-2">
              {savedLocations.map((location) => (
                <Pressable
                  key={location.id}
                  onPress={() => selectSavedLocation(location.location.address, "dropoff")}
                  className="bg-blue-50 dark:bg-blue-900/30 rounded-full px-4 py-2 flex-row items-center active:bg-blue-100 dark:active:bg-blue-900/50"
                >
                  <Ionicons
                    name={location.icon as any}
                    size={16}
                    color="#2563eb"
                  />
                  <Text className="text-blue-700 dark:text-blue-400 font-medium ml-2">
                    {location.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* When Section */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">When</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setWhenOption("now")}
                className={`flex-1 rounded-xl py-3 px-4 ${
                  whenOption === "now"
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-gray-100 dark:bg-gray-700/50"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    whenOption === "now" ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Now
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setWhenOption("later")}
                className={`flex-1 rounded-xl py-3 px-4 ${
                  whenOption === "later"
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-gray-100 dark:bg-gray-700/50"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    whenOption === "later" ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Later
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Passengers */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Passengers</Text>
            <View className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <Pressable
                onPress={() => setPassengers(Math.max(1, passengers - 1))}
                className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full items-center justify-center border border-gray-300 dark:border-gray-700"
              >
                <Ionicons name="remove" size={20} className="text-gray-900 dark:text-white" />
              </Pressable>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">{passengers}</Text>
              <Pressable
                onPress={() => setPassengers(Math.min(4, passengers + 1))}
                className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full items-center justify-center border border-gray-300 dark:border-gray-700"
              >
                <Ionicons name="add" size={20} className="text-gray-900 dark:text-white" />
              </Pressable>
            </View>
          </View>

          {/* Info Tip */}
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-6 flex-row">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text className="flex-1 ml-3 text-sm text-blue-900 dark:text-blue-300">
              Scheduling 1 hour ahead increases your chances of finding a match
            </Text>
          </View>

          {/* Find Rides Button */}
          <Pressable
            onPress={handleFindRides}
            disabled={!pickupAddress || !dropoffAddress || isSearching}
            className={`rounded-2xl py-4 px-6 ${
              pickupAddress && dropoffAddress && !isSearching
                ? "bg-blue-600 dark:bg-blue-500 active:bg-blue-700 dark:active:bg-blue-600"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isSearching ? "Searching..." : "Find Rides"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
