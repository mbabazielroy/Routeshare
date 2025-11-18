import React from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useRiderStore } from "../state/riderStore";
import { format } from "date-fns";

type Props = NativeStackScreenProps<RootStackParamList, "DriverSelection">;

export default function DriverSelectionScreen({ navigation }: Props) {
  const availableMatches = useRiderStore((s) => s.availableMatches);
  const selectDriver = useRiderStore((s) => s.selectDriver);

  const handleSelectDriver = async (routeId: string, tripId: string) => {
    await selectDriver(routeId);
    navigation.navigate("LiveTrip", { tripId });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#1f2937" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">
            {availableMatches.length} Drivers Available
          </Text>
          <View className="w-7" />
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {availableMatches.map((match) => {
            const driver = match.route.driver;
            const profile = match.route.driverProfile;
            const estimatedTime = format(new Date(match.estimatedPickup), "h:mm a");

            return (
              <View
                key={match.route.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm"
              >
                {/* Driver Info */}
                <View className="flex-row items-center mb-4">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mr-4">
                    {driver?.profilePhoto ? (
                      <Image
                        source={{ uri: driver.profilePhoto }}
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <Ionicons name="person" size={32} color="#6b7280" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-gray-900">
                        {driver?.firstName} {driver?.lastName?.[0]}.
                      </Text>
                      <View className="ml-2 flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
                        <Ionicons name="star" size={14} color="#eab308" />
                        <Text className="ml-1 text-sm font-semibold text-yellow-700">
                          {driver?.rating.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600 mt-1">
                      {profile?.vehicleColor} {profile?.vehicleMake} {profile?.vehicleModel}
                    </Text>
                    {driver?.verificationLevel === "community" && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
                        <Text className="text-xs text-green-700 ml-1">Community Verified</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Trip Details */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={18} color="#6b7280" />
                      <Text className="ml-2 text-sm font-medium text-gray-700">
                        Pickup in {Math.floor((new Date(match.estimatedPickup).getTime() - Date.now()) / 60000)} min
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600">{estimatedTime}</Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="navigate-outline" size={18} color="#6b7280" />
                    <Text className="ml-2 text-sm text-gray-600">
                      +{match.detourDistance.toFixed(1)} mi detour • {match.detourTime} min
                    </Text>
                  </View>
                </View>

                {/* Match Score */}
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <View
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${match.matchScore}%` }}
                    />
                  </View>
                  <Text className="text-sm font-semibold text-green-600">
                    {match.matchScore}% Match
                  </Text>
                </View>

                {/* Price and CTA */}
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">
                      ${match.fare.toFixed(2)}
                    </Text>
                    <Text className="text-xs text-gray-500">Total fare</Text>
                  </View>
                  <Pressable
                    onPress={() => handleSelectDriver(match.route.id, `trip_${Date.now()}`)}
                    className="bg-blue-600 rounded-xl px-8 py-3 active:bg-blue-700"
                  >
                    <Text className="text-white font-semibold text-base">Request Ride</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {availableMatches.length === 0 && (
            <View className="items-center justify-center py-12">
              <Ionicons name="car-outline" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                No drivers available right now
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-sm">
                Try scheduling for later or adjust your route
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
