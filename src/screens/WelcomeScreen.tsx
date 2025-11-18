import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-between py-8">
        {/* Hero Section */}
        <View className="flex-1 justify-center items-center">
          <View className="w-24 h-24 bg-blue-600 rounded-3xl items-center justify-center mb-6">
            <Ionicons name="car-sport" size={48} color="white" />
          </View>

          <Text className="text-4xl font-bold text-gray-900 text-center mb-3">
            RouteShare
          </Text>

          <Text className="text-lg text-gray-600 text-center mb-8 px-4">
            Rural ride-sharing that connects neighbors heading the same way
          </Text>

          {/* Benefits */}
          <View className="w-full mt-8 space-y-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
                <Ionicons name="people" size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Community-Based
                </Text>
                <Text className="text-sm text-gray-600">
                  Ride with verified local drivers
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-4">
              <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mr-4">
                <Ionicons name="cash" size={24} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Fair Pricing
                </Text>
                <Text className="text-sm text-gray-600">
                  Affordable rides that help drivers earn
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-4">
              <View className="w-12 h-12 bg-purple-50 rounded-full items-center justify-center mr-4">
                <Ionicons name="shield-checkmark" size={24} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Safe & Verified
                </Text>
                <Text className="text-sm text-gray-600">
                  Background checks and ratings
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View className="space-y-3">
          <Pressable
            onPress={() => navigation.navigate("UserTypeSelection")}
            className="bg-blue-600 rounded-2xl py-4 px-6 active:bg-blue-700"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Get Started
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("UserTypeSelection")}
            className="border-2 border-gray-300 rounded-2xl py-4 px-6 active:bg-gray-50"
          >
            <Text className="text-gray-700 text-center text-lg font-semibold">
              Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
