import React from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useDriverStore } from "../state/driverStore";

type Props = NativeStackScreenProps<RootStackParamList, "RiderRequest">;

export default function RiderRequestScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const pendingRequests = useDriverStore((s) => s.pendingRequests);
  const acceptRider = useDriverStore((s) => s.acceptRider);
  const declineRider = useDriverStore((s) => s.declineRider);

  const request = pendingRequests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Text className="text-lg text-gray-600 dark:text-gray-300">Request not found</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-4 px-6 py-3 bg-blue-600 dark:bg-blue-500 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleAccept = () => {
    acceptRider(requestId);
    navigation.goBack();
  };

  const handleDecline = () => {
    declineRider(requestId);
    navigation.goBack();
  };

  const handleCall = () => {
    // In production, this would call the rider's actual phone number
    Linking.openURL("tel:+15551234567");
  };

  const handleMessage = () => {
    // In production, this would open in-app messaging
    console.log("Open messaging");
  };

  // Calculate estimated detour and earnings
  const estimatedFare = 25.5 + Math.random() * 15;
  const driverEarnings = estimatedFare * 0.85;
  const estimatedDetour = 2.5 + Math.random() * 2;
  const estimatedTime = Math.ceil(estimatedDetour * 2);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#111827" className="dark:text-white" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Rider Request
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                Review and respond
              </Text>
            </View>
          </View>
        </View>

        {/* Rider Profile */}
        <View className="mx-6 mt-4">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="person" size={32} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Sarah Johnson
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={16} color="#eab308" />
                  <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">4.9 • 47 trips</Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="shield-checkmark" size={16} color="#16a34a" />
                  <Text className="text-xs text-green-600 dark:text-green-400 ml-1 font-medium">
                    Community Verified
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleCall}
                className="flex-1 flex-row items-center justify-center bg-green-50 dark:bg-green-900/30 py-3 rounded-xl border border-green-200 dark:border-green-700 active:bg-green-100 dark:active:bg-green-900/50"
              >
                <Ionicons name="call" size={18} color="#16a34a" />
                <Text className="ml-2 text-green-700 dark:text-green-300 font-semibold">Call</Text>
              </Pressable>
              <Pressable
                onPress={handleMessage}
                className="flex-1 flex-row items-center justify-center bg-blue-50 dark:bg-blue-900/30 py-3 rounded-xl border border-blue-200 dark:border-blue-700 active:bg-blue-100 dark:active:bg-blue-900/50"
              >
                <Ionicons name="chatbubble" size={18} color="#2563eb" />
                <Text className="ml-2 text-blue-700 dark:text-blue-300 font-semibold">Message</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View className="mx-6 mt-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">
            Trip Details
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <View className="mb-4">
              <View className="flex-row items-start mb-3">
                <Ionicons name="radio-button-on" size={20} color="#2563eb" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup</Text>
                  <Text className="text-base text-gray-900 dark:text-white font-medium">
                    {request.pickup.address}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="location" size={20} color="#dc2626" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dropoff</Text>
                  <Text className="text-base text-gray-900 dark:text-white font-medium">
                    {request.dropoff.address}
                  </Text>
                </View>
              </View>
            </View>

            <View className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600 dark:text-gray-300">Passengers</Text>
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {request.passengers} {request.passengers === 1 ? "person" : "people"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600 dark:text-gray-300">Requested Time</Text>
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {new Date(request.requestedTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Route Impact */}
        <View className="mx-6 mt-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 px-2">
            Route Impact
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-full items-center justify-center mr-3">
                <Ionicons name="swap-horizontal" size={24} color="#eab308" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 dark:text-gray-300">Estimated Detour</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  +{estimatedDetour.toFixed(1)} mi • +{estimatedTime} min
                </Text>
              </View>
            </View>
            <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <Text className="text-xs text-gray-600 dark:text-gray-300 text-center">
                This pickup is along your route with minimal detour
              </Text>
            </View>
          </View>
        </View>

        {/* Earnings */}
        <View className="mx-6 mt-4">
          <View className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-5 border-2 border-green-200 dark:border-green-700">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="cash" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-green-700 dark:text-green-300">You will earn</Text>
                <Text className="text-3xl font-bold text-green-700 dark:text-green-100 mt-0.5">
                  ${driverEarnings.toFixed(2)}
                </Text>
              </View>
            </View>
            <View className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-green-800 dark:text-green-200">Total Fare</Text>
                <Text className="text-xs font-semibold text-green-800 dark:text-green-200">
                  ${estimatedFare.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-green-800 dark:text-green-200">Platform Fee (15%)</Text>
                <Text className="text-xs font-semibold text-green-800 dark:text-green-200">
                  -${(estimatedFare * 0.15).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-6 mt-6 mb-6">
          <Pressable
            onPress={handleAccept}
            className="bg-blue-600 dark:bg-blue-500 rounded-2xl py-4 px-6 mb-3 active:bg-blue-700 dark:active:bg-blue-600"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="ml-2 text-white font-bold text-lg">
                Accept Request
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleDecline}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-2xl py-4 px-6 active:bg-gray-50 dark:active:bg-gray-700"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="close-circle" size={24} color="#6b7280" />
              <Text className="ml-2 text-gray-700 dark:text-gray-300 font-bold text-lg">
                Decline
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
