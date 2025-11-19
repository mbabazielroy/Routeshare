import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CountrySelection">;

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  maxLength: number;
  format?: (text: string) => string;
}

export const COUNTRIES: Country[] = [
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

export default function CountrySelectionScreen({ navigation, route }: Props) {
  const currentCountryCode = route.params?.currentCountryCode || "US";
  const selectedCountry = COUNTRIES.find(c => c.code === currentCountryCode) || COUNTRIES[0];

  const handleCountrySelect = (country: Country) => {
    // Navigate back with the selected country
    if (route.params?.onSelect) {
      route.params.onSelect(country);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-200">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 mr-2"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 flex-1">
          Select Country
        </Text>
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
  );
}
