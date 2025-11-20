import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useRiderStore } from "../state/riderStore";

type Props = NativeStackScreenProps<RootStackParamList, "SavedPlaces">;

export default function SavedPlacesScreen({ navigation }: Props) {
  const savedLocations = useRiderStore((s) => s.savedLocations);

  const getIconColor = (icon: string) => {
    switch (icon) {
      case "home":
        return { bg: "bg-blue-50", color: "#2563eb" };
      case "briefcase":
        return { bg: "bg-purple-50", color: "#9333ea" };
      case "heart":
        return { bg: "bg-red-50", color: "#dc2626" };
      case "restaurant":
        return { bg: "bg-orange-50", color: "#ea580c" };
      case "fitness":
        return { bg: "bg-green-50", color: "#16a34a" };
      default:
        return { bg: "bg-gray-50", color: "#6b7280" };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
            Saved Places
          </Text>
          <Pressable className="px-3 py-1 bg-blue-600 dark:bg-blue-500 rounded-lg active:bg-blue-700 dark:active:bg-blue-600">
            <Text className="text-white font-semibold text-sm">+ Add</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Saved Locations List */}
        <View className="px-6 pt-4">
          {savedLocations.map((location) => {
            const iconStyle = getIconColor(location.icon || "location");
            return (
              <Pressable
                key={location.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-12 h-12 ${iconStyle.bg} rounded-xl items-center justify-center mr-3`}
                  >
                    <Ionicons
                      name={location.icon as any}
                      size={24}
                      color={iconStyle.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                      {location.name}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1" numberOfLines={1}>
                      {location.location.address}
                    </Text>
                  </View>
                  <Pressable className="ml-2 w-10 h-10 items-center justify-center active:bg-gray-100 dark:active:bg-gray-700 rounded-full">
                    <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Add Place Button */}
        <View className="px-6 mt-2">
          <Pressable className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 items-center active:bg-gray-50 dark:active:bg-gray-700">
            <View className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-full items-center justify-center mb-3">
              <Ionicons name="add" size={32} color="#9333ea" />
            </View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Add New Place
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Save your frequently visited locations for quick access
            </Text>
          </Pressable>
        </View>

        {/* Quick Add Suggestions */}
        <View className="px-6 mt-6 mb-6">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Quick Add
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { icon: "heart", label: "Favorite", color: "#dc2626" },
              { icon: "restaurant", label: "Restaurant", color: "#ea580c" },
              { icon: "fitness", label: "Gym", color: "#16a34a" },
              { icon: "medical", label: "Hospital", color: "#2563eb" },
              { icon: "school", label: "School", color: "#9333ea" },
              { icon: "cart", label: "Store", color: "#eab308" },
            ].map((item) => (
              <Pressable
                key={item.label}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex-row items-center active:bg-gray-50 dark:active:bg-gray-700"
              >
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
