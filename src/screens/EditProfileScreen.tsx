import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../state/authStore";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export default function EditProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const showToast = useToast((s) => s.show);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "");
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      showToast("Permission needed to access photos", "error");
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
      showToast("Photo selected", "success");
    }
  };

  const handleTakePhoto = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      showToast("Permission needed to access camera", "error");
      return;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
      showToast("Photo captured", "success");
    }
  };

  const handleChangePhoto = () => {
    // Show options for camera or gallery
    Alert.alert(
      "Change Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: handleTakePhoto,
        },
        {
          text: "Choose from Gallery",
          onPress: handlePickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    updateUser({
      firstName,
      lastName,
      email,
      phone,
      profilePhoto,
    });

    setIsSaving(false);
    showToast("Profile updated successfully", "success");
    navigation.goBack();
  };

  const hasChanges =
    firstName !== user?.firstName ||
    lastName !== user?.lastName ||
    email !== (user?.email || "") ||
    phone !== user?.phone ||
    profilePhoto !== (user?.profilePhoto || "");

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Pressable onPress={() => navigation.goBack()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </Pressable>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</Text>
            </View>
            {hasChanges && (
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                className="ml-3"
              >
                <Text className={`text-base font-semibold ${isSaving ? "text-gray-400" : "text-blue-600 dark:text-blue-400"}`}>
                  {isSaving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView className="flex-1">
          {/* Profile Photo */}
          <View className="items-center py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                className="w-24 h-24 rounded-full mb-4"
              />
            ) : (
              <View className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
                <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {firstName[0]}{lastName[0]}
                </Text>
              </View>
            )}
            <Pressable
              onPress={handleChangePhoto}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg active:bg-blue-100 dark:active:bg-blue-900/50"
            >
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">Change Photo</Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View className="px-6 pt-6">
            {/* First Name */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Last Name */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Phone */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Save Button */}
            {hasChanges && (
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                className={`mt-4 mb-8 rounded-2xl py-4 ${
                  isSaving ? "bg-gray-400 dark:bg-gray-600" : "bg-blue-600 dark:bg-blue-500"
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
