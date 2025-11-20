import React, { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";
import { Country, COUNTRIES } from "./CountrySelectionScreen";

type Props = NativeStackScreenProps<RootStackParamList, "PhoneAuth">;

export default function PhoneAuthScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);

  const formatPhoneNumber = (text: string) => {
    if (selectedCountry.format) {
      return selectedCountry.format(text);
    }

    // Default formatting - just clean and limit
    const cleaned = text.replace(/\D/g, "");
    return cleaned.substring(0, selectedCountry.maxLength);
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  const getCleanPhone = () => {
    return phone.replace(/\D/g, "");
  };

  const isValidPhone = () => {
    const cleaned = getCleanPhone();
    // For US/Canada, require 10 digits. For others, require at least 6 digits
    if (selectedCountry.code === "US" || selectedCountry.code === "CA") {
      return cleaned.length === 10;
    }
    return cleaned.length >= 6 && cleaned.length <= selectedCountry.maxLength;
  };

  const handleSendOTP = async () => {
    if (!isValidPhone()) {
      showToast("Please enter a valid phone number", "error");
      return;
    }

    setIsLoading(true);

    // Simulate API call to send OTP
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);

    // In production, this would call Firebase Auth or your backend
    showToast("Verification code sent!", "success");

    navigation.navigate("OTPVerification", {
      phone: `${selectedCountry.dialCode}${getCleanPhone()}`
    });
  };

  const handleCountryPress = () => {
    navigation.navigate("CountrySelection", {
      currentCountryCode: selectedCountry.code,
      onSelect: (country: Country) => {
        setSelectedCountry(country);
        setPhone(""); // Clear phone when country changes
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-6 py-4">
          {/* Header */}
          <View className="mb-8">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center -ml-2 mb-6"
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>

            <View className="w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-3xl items-center justify-center mb-6">
              <Ionicons name="phone-portrait" size={40} color="white" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Enter your phone number
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-300">
              We will send you a verification code to confirm your number
            </Text>
          </View>

          {/* Phone Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-4 border-2 border-gray-200 dark:border-gray-700">
              {/* Country Selector */}
              <Pressable
                onPress={handleCountryPress}
                className="flex-row items-center mr-3 active:opacity-70"
              >
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCountry.flag}</Text>
                <Text className="text-base font-semibold text-gray-900 dark:text-white ml-2">
                  {selectedCountry.dialCode}
                </Text>
                <View className="ml-1">
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </View>
              </Pressable>

              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder={selectedCountry.code === "US" || selectedCountry.code === "CA" ? "(555) 123-4567" : "Phone number"}
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                className="flex-1 text-lg text-gray-900 dark:text-white"
                maxLength={selectedCountry.maxLength}
                autoFocus
              />
              {isValidPhone() && (
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              )}
            </View>
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-6">
            <View className="flex-row">
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Why we need this
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  Your phone number is used to verify your identity and connect you with drivers
                  and riders in your community.
                </Text>
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <View className="flex-1 justify-end pb-4">
            <Pressable
              onPress={handleSendOTP}
              disabled={!isValidPhone() || isLoading}
              className={`rounded-2xl py-4 px-6 ${
                isValidPhone() && !isLoading
                  ? "bg-blue-600 dark:bg-blue-500 active:bg-blue-700 dark:active:bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Text>
            </Pressable>

            {/* Terms */}
            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 px-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
