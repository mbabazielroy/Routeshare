import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = NativeStackScreenProps<RootStackParamList, "ScheduleRide">;

export default function ScheduleRideScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSchedule = () => {
    if (!pickup || !destination) {
      showToast("Please enter pickup and destination", "error");
      return;
    }

    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.getHours());
    scheduledDateTime.setMinutes(selectedTime.getMinutes());

    showToast("Ride scheduled successfully!", "success");
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1">Schedule Ride</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Info Banner */}
          <View className="bg-purple-50 rounded-xl p-4 mb-6 flex-row">
            <Ionicons name="calendar" size={20} color="#9333ea" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                Schedule in Advance
              </Text>
              <Text className="text-sm text-gray-700">
                Book rides up to 7 days in advance. Perfect for appointments, errands, or
                recurring trips.
              </Text>
            </View>
          </View>

          {/* Trip Details */}
          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            {/* Pickup */}
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center mb-2">
                <View className="w-3 h-3 bg-blue-600 rounded-full mr-3" />
                <Text className="text-sm font-semibold text-gray-700">Pickup</Text>
              </View>
              <TextInput
                value={pickup}
                onChangeText={setPickup}
                placeholder="Enter pickup location"
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 ml-6"
              />
            </View>

            {/* Destination */}
            <View className="p-4">
              <View className="flex-row items-center mb-2">
                <View className="w-3 h-3 bg-red-600 rounded-full mr-3" />
                <Text className="text-sm font-semibold text-gray-700">Destination</Text>
              </View>
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="Where are you going?"
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 ml-6"
              />
            </View>
          </View>

          {/* Date & Time Selection */}
          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            {/* Date */}
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="p-4 border-b border-gray-200 active:bg-gray-50"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="calendar-outline" size={24} color="#2563eb" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Date</Text>
                    <Text className="text-base text-gray-900">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>

            {/* Time */}
            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="p-4 active:bg-gray-50"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="time-outline" size={24} color="#9333ea" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Time</Text>
                    <Text className="text-base text-gray-900">
                      {selectedTime.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>
          </View>

          {/* Passengers */}
          <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="people-outline" size={24} color="#16a34a" />
                </View>
                <Text className="text-base font-semibold text-gray-900">Passengers</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => setPassengers(Math.max(1, passengers - 1))}
                  className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center active:bg-gray-200"
                >
                  <Ionicons name="remove" size={20} color="#374151" />
                </Pressable>
                <Text className="text-xl font-bold text-gray-900 w-8 text-center">
                  {passengers}
                </Text>
                <Pressable
                  onPress={() => setPassengers(Math.min(4, passengers + 1))}
                  className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center active:bg-gray-200"
                >
                  <Ionicons name="add" size={20} color="#374151" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Important Notes */}
          <View className="bg-yellow-50 rounded-xl p-4 mb-6 flex-row">
            <Ionicons name="information-circle" size={20} color="#eab308" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-900 mb-2">
                Important Notes
              </Text>
              <Text className="text-sm text-gray-700 mb-1">
                • Schedule rides at least 2 hours in advance
              </Text>
              <Text className="text-sm text-gray-700 mb-1">
                • You will be matched with available drivers closer to your ride time
              </Text>
              <Text className="text-sm text-gray-700">
                • You can cancel up to 1 hour before pickup without penalty
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Schedule Button */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Pressable
          onPress={handleSchedule}
          className="bg-blue-600 py-4 rounded-xl items-center active:bg-blue-700"
        >
          <Text className="text-white font-bold text-lg">Schedule Ride</Text>
        </Pressable>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          minimumDate={new Date()}
          maximumDate={
            new Date(new Date().setDate(new Date().getDate() + 7))
          }
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="spinner"
          onChange={(event, time) => {
            setShowTimePicker(false);
            if (time) setSelectedTime(time);
          }}
        />
      )}
    </SafeAreaView>
  );
}
