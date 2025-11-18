import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "TripRating">;

export default function TripRatingScreen({ navigation, route }: Props) {
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    // In a real app, submit rating to backend
    navigation.navigate("RiderTabs");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8 justify-between">
        <View>
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Trip Complete!</Text>
            <Text className="text-base text-gray-600 text-center">
              How was your ride?
            </Text>
          </View>

          {/* Star Rating */}
          <View className="items-center mb-8">
            <View className="flex-row gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={48}
                    color={star <= rating ? "#eab308" : "#d1d5db"}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quick Feedback */}
          {rating > 0 && (
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                What went well? (Optional)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {["Friendly", "On Time", "Safe Driving", "Clean Car", "Good Conversation"].map((tag) => (
                  <Pressable
                    key={tag}
                    className="bg-gray-100 rounded-full px-4 py-2 active:bg-blue-50"
                  >
                    <Text className="text-gray-700 text-sm">{tag}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={rating === 0}
          className={`rounded-2xl py-4 px-6 ${
            rating > 0 ? "bg-blue-600 active:bg-blue-700" : "bg-gray-300"
          }`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {rating > 0 ? "Submit Rating" : "Select a Rating"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
