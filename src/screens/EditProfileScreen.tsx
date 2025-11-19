import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../state/authStore";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export default function EditProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    updateUser({
      firstName,
      lastName,
      email,
      phone,
    });

    setIsSaving(false);
    navigation.goBack();
  };

  const hasChanges =
    firstName !== user?.firstName ||
    lastName !== user?.lastName ||
    email !== (user?.email || "") ||
    phone !== user?.phone;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Pressable onPress={() => navigation.goBack()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </Pressable>
              <Text className="text-2xl font-bold text-gray-900">Edit Profile</Text>
            </View>
            {hasChanges && (
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                className="ml-3"
              >
                <Text className={`text-base font-semibold ${isSaving ? "text-gray-400" : "text-blue-600"}`}>
                  {isSaving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Profile Photo */}
          <View className="items-center py-8 bg-white border-b border-gray-200">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl font-bold text-blue-600">
                {firstName[0]}{lastName[0]}
              </Text>
            </View>
            <Pressable className="px-4 py-2 bg-blue-50 rounded-lg active:bg-blue-100">
              <Text className="text-blue-600 font-semibold">Change Photo</Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View className="px-6 pt-6">
            {/* First Name */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                First Name
              </Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Last Name */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Phone */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Save Button */}
            {hasChanges && (
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                className={`mt-4 mb-8 rounded-2xl py-4 ${
                  isSaving ? "bg-gray-400" : "bg-blue-600"
                } active:opacity-80`}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
