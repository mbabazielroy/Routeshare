import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useThemeStore } from "../state/themeStore";

type Props = NativeStackScreenProps<RootStackParamList, "ThemeSettings">;

export default function ThemeSettingsScreen({ navigation }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const themes = [
    {
      id: "light" as const,
      name: "Light",
      description: "Always use light theme",
      icon: "sunny",
    },
    {
      id: "dark" as const,
      name: "Dark",
      description: "Always use dark theme",
      icon: "moon",
    },
    {
      id: "system" as const,
      name: "System",
      description: "Match device theme",
      icon: "phone-portrait",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            Appearance
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 pt-4">
          <Text className="text-sm text-gray-600 mb-4">
            Choose how RouteShare looks on your device
          </Text>

          {themes.map((themeOption) => (
            <Pressable
              key={themeOption.id}
              onPress={() => setTheme(themeOption.id)}
              className={`bg-white rounded-2xl p-5 mb-3 border-2 active:bg-gray-50 ${
                theme === themeOption.id ? "border-blue-600" : "border-gray-200"
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                    theme === themeOption.id ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name={themeOption.icon as any}
                    size={24}
                    color={theme === themeOption.id ? "#2563eb" : "#6b7280"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {themeOption.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {themeOption.description}
                  </Text>
                </View>
                {theme === themeOption.id && (
                  <Ionicons name="checkmark-circle" size={28} color="#2563eb" />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Preview Section */}
        <View className="mx-6 mt-6 mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            Preview
          </Text>
          <View className="bg-white rounded-2xl p-6 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-3">
                <Ionicons name="car-sport" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">RouteShare</Text>
                <Text className="text-sm text-gray-600">Rural ride-sharing</Text>
              </View>
            </View>
            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-sm text-gray-700">
                This is how the app will look with your selected theme. Dark mode
                makes it easier on the eyes in low-light conditions.
              </Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View className="mx-6 mb-6">
          <View className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#2563eb" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-blue-900 mb-1">
                  About Dark Mode
                </Text>
                <Text className="text-xs text-blue-800">
                  Dark mode reduces eye strain in low-light environments and can help
                  save battery on OLED screens. System mode automatically switches
                  based on your device settings.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
