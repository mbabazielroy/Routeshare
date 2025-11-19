import React, { useState } from "react";
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "PhoneAuth">;

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  maxLength: number;
  format?: (text: string) => string;
}

const COUNTRIES: Country[] = [
  {
    name: "United States",
    code: "US",
    dialCode: "+1",
    flag: "🇺🇸",
    maxLength: 14,
    format: (text: string) => {
      const cleaned = text.replace(/\D/g, "");
      const limited = cleaned.substring(0, 10);
      if (limited.length >= 6) {
        return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
      } else if (limited.length >= 3) {
        return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
      } else if (limited.length > 0) {
        return `(${limited}`;
      }
      return "";
    }
  },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", maxLength: 14 },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", maxLength: 15 },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", maxLength: 12 },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", maxLength: 10 },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽", maxLength: 10 },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", maxLength: 15 },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", maxLength: 12 },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", maxLength: 11 },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", maxLength: 11 },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", maxLength: 11 },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷", maxLength: 11 },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", maxLength: 9 },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", maxLength: 13 },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱", maxLength: 10 },
];

export default function PhoneAuthScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

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

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setPhone(""); // Clear phone when country changes
    setShowCountryPicker(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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

            <View className="w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center mb-6">
              <Ionicons name="phone-portrait" size={40} color="white" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 mb-3">
              Enter your phone number
            </Text>
            <Text className="text-base text-gray-600">
              We will send you a verification code to confirm your number
            </Text>
          </View>

          {/* Phone Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border-2 border-gray-200">
              {/* Country Selector */}
              <Pressable
                onPress={() => setShowCountryPicker(true)}
                className="flex-row items-center mr-3 active:opacity-70"
              >
                <Text className="text-lg font-semibold text-gray-900">{selectedCountry.flag}</Text>
                <Text className="text-base font-semibold text-gray-900 ml-2">
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
                className="flex-1 text-lg text-gray-900"
                maxLength={selectedCountry.maxLength}
                autoFocus
              />
              {isValidPhone() && (
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              )}
            </View>
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <View className="flex-row">
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-gray-900 mb-1">
                  Why we need this
                </Text>
                <Text className="text-sm text-gray-700">
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
                  ? "bg-blue-600 active:bg-blue-700"
                  : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Text>
            </Pressable>

            {/* Terms */}
            <Text className="text-xs text-gray-500 text-center mt-4 px-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <SafeAreaView className="bg-white rounded-t-3xl max-h-[80%]" edges={["bottom"]}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                Select Country
              </Text>
              <Pressable
                onPress={() => setShowCountryPicker(false)}
                className="w-10 h-10 items-center justify-center -mr-2"
              >
                <Ionicons name="close" size={28} color="#6b7280" />
              </Pressable>
            </View>

            {/* Country List */}
            <ScrollView className="flex-1">
              {COUNTRIES.map((country) => (
                <Pressable
                  key={country.code}
                  onPress={() => handleCountrySelect(country)}
                  className={`flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50 ${
                    selectedCountry.code === country.code ? "bg-blue-50" : ""
                  }`}
                >
                  <Text className="text-2xl mr-3">{country.flag}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {country.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-0.5">
                      {country.dialCode}
                    </Text>
                  </View>
                  {selectedCountry.code === country.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
