import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "VehicleInformation">;

interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  seats: string;
  type: "sedan" | "suv" | "truck" | "van" | "other";
}

export default function VehicleInformationScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);
  const [isSaving, setIsSaving] = useState(false);

  // Empty vehicle data - user needs to fill it in
  const [vehicle, setVehicle] = useState<VehicleInfo>({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    seats: "4",
    type: "sedan",
  });

  const vehicleTypes: Array<{ id: VehicleInfo["type"]; label: string; icon: any }> = [
    { id: "sedan", label: "Sedan", icon: "car-sport" },
    { id: "suv", label: "SUV", icon: "car" },
    { id: "truck", label: "Truck", icon: "car" },
    { id: "van", label: "Van", icon: "bus" },
    { id: "other", label: "Other", icon: "car-outline" },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    showToast("Vehicle information updated successfully", "success");
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" className="dark:text-white" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
            Vehicle Information
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Vehicle Type Selection */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Vehicle Type
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {vehicleTypes.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => setVehicle({ ...vehicle, type: type.id })}
                  className={`flex-1 min-w-[30%] p-4 rounded-xl border-2 ${
                    vehicle.type === type.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <View className="items-center">
                    <Ionicons
                      name={type.icon}
                      size={28}
                      color={vehicle.type === type.id ? "#2563eb" : "#6b7280"}
                    />
                    <Text
                      className={`text-sm font-semibold mt-2 ${
                        vehicle.type === type.id ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Vehicle Details */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Make */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Make</Text>
              <TextInput
                value={vehicle.make}
                onChangeText={(text) => setVehicle({ ...vehicle, make: text })}
                placeholder="e.g., Toyota"
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* Model */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Model</Text>
              <TextInput
                value={vehicle.model}
                onChangeText={(text) => setVehicle({ ...vehicle, model: text })}
                placeholder="e.g., Camry"
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* Year */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Year</Text>
              <TextInput
                value={vehicle.year}
                onChangeText={(text) => setVehicle({ ...vehicle, year: text })}
                placeholder="e.g., 2020"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* Color */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</Text>
              <TextInput
                value={vehicle.color}
                onChangeText={(text) => setVehicle({ ...vehicle, color: text })}
                placeholder="e.g., Silver"
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* License Plate */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                License Plate
              </Text>
              <TextInput
                value={vehicle.licensePlate}
                onChangeText={(text) => setVehicle({ ...vehicle, licensePlate: text })}
                placeholder="e.g., ABC-1234"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* Available Seats */}
            <View className="p-4">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Available Seats
              </Text>
              <TextInput
                value={vehicle.seats}
                onChangeText={(text) => setVehicle({ ...vehicle, seats: text })}
                placeholder="e.g., 4"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="text-base text-gray-900 dark:text-white py-2"
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Number of passenger seats available for riders
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mt-6 flex-row">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300 ml-3">
              Your vehicle information helps riders identify your car and ensures
              accurate trip planning. This information is visible to riders when they
              book.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          className={`bg-blue-600 dark:bg-blue-500 py-4 rounded-xl items-center ${
            isSaving ? "opacity-50" : "active:bg-blue-700 dark:active:bg-blue-600"
          }`}
        >
          <Text className="text-white font-bold text-lg">
            {isSaving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
