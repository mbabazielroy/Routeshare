import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RiderTabParamList } from "../navigation/types";

type Props = BottomTabScreenProps<RiderTabParamList, "Safety">;

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function SafetyScreen({ navigation }: Props) {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      relationship: "Sister",
    },
  ]);
  const [tripSharingEnabled, setTripSharingEnabled] = useState(true);

  const handleSOS = () => {
    // In production, this would trigger emergency services
    Linking.openURL("tel:911");
  };

  const handleCallContact = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, "")}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-200">
          <Text className="text-3xl font-bold text-gray-900 mb-1">Safety Center</Text>
          <Text className="text-base text-gray-600">
            Your safety is our top priority
          </Text>
        </View>

        {/* SOS Button */}
        <View className="mx-6 mt-4">
          <Pressable
            onPress={handleSOS}
            className="bg-red-600 rounded-2xl p-6 active:bg-red-700"
          >
            <View className="items-center">
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
                <Ionicons name="alert-circle" size={48} color="#dc2626" />
              </View>
              <Text className="text-2xl font-bold text-white mb-2">
                Emergency SOS
              </Text>
              <Text className="text-base text-red-100 text-center">
                Tap to call emergency services immediately
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Trip Sharing */}
        <View className="mx-6 mt-4">
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-3">
                  <Ionicons name="share-social" size={24} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    Share Trip Status
                  </Text>
                  <Text className="text-sm text-gray-600 mt-0.5">
                    Auto-share with emergency contacts
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setTripSharingEnabled(!tripSharingEnabled)}
                className={`w-14 h-8 rounded-full p-1 ${
                  tripSharingEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <View
                  className={`w-6 h-6 bg-white rounded-full ${
                    tripSharingEnabled ? "ml-auto" : ""
                  }`}
                />
              </Pressable>
            </View>
            <Text className="text-sm text-gray-600">
              When enabled, your emergency contacts will automatically receive your
              trip details and live location when you start a ride.
            </Text>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View className="mx-6 mt-4">
          <View className="flex-row items-center justify-between mb-3 px-2">
            <Text className="text-lg font-bold text-gray-900">
              Emergency Contacts
            </Text>
            <Pressable className="px-3 py-1 bg-blue-600 rounded-lg active:bg-blue-700">
              <Text className="text-white font-semibold text-sm">+ Add</Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {emergencyContacts.map((contact, index) => (
              <View
                key={contact.id}
                className={`p-4 ${
                  index < emergencyContacts.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person" size={24} color="#9333ea" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {contact.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-0.5">
                      {contact.relationship}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-0.5">
                      {contact.phone}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleCallContact(contact.phone)}
                    className="w-10 h-10 bg-green-50 rounded-full items-center justify-center active:bg-green-100"
                  >
                    <Ionicons name="call" size={20} color="#16a34a" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Safety Features */}
        <View className="mx-6 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-3 px-2">
            Safety Features
          </Text>
          <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  Driver Verification
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  All drivers undergo background checks
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="location" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  Real-Time GPS Tracking
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Always know where you are
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center p-4 border-b border-gray-200 active:bg-gray-50">
              <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="chatbubbles" size={20} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  24/7 Support Line
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Get help anytime you need it
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center p-4 active:bg-gray-50">
              <View className="w-10 h-10 bg-yellow-50 rounded-full items-center justify-center mr-3">
                <Ionicons name="star" size={20} color="#eab308" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  Two-Way Ratings
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Build a trusted community
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Safety Tips */}
        <View className="mx-6 mt-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3 px-2">
            Safety Tips
          </Text>
          <View className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-xs">1</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Always verify the driver and vehicle match the app before entering
              </Text>
            </View>
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-xs">2</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Share your trip details with friends or family
              </Text>
            </View>
            <View className="flex-row mb-3">
              <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-xs">3</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Sit in the back seat and wear your seatbelt
              </Text>
            </View>
            <View className="flex-row">
              <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-xs">4</Text>
              </View>
              <Text className="flex-1 text-sm text-gray-700">
                Trust your instincts - if something feels off, cancel the trip
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
