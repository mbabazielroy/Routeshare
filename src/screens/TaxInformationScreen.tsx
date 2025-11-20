import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "TaxInformation">;

interface TaxInfo {
  filingStatus: "w9" | "1099" | "other";
  taxId: string;
  businessName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function TaxInformationScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);
  const [isSaving, setIsSaving] = useState(false);

  const [taxInfo, setTaxInfo] = useState<TaxInfo>({
    filingStatus: "w9",
    taxId: "•••-••-4321",
    businessName: "",
    addressLine1: "123 Oak Street",
    addressLine2: "",
    city: "Millville",
    state: "VA",
    zipCode: "22150",
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    showToast("Tax information updated successfully", "success");
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
            Tax Information
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Tax Status Selection */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Tax Filing Status
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Pressable
                onPress={() => setTaxInfo({ ...taxInfo, filingStatus: "w9" })}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                  taxInfo.filingStatus === "w9" ? "bg-blue-50 dark:bg-blue-900/30" : ""
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                      taxInfo.filingStatus === "w9"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {taxInfo.filingStatus === "w9" && (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      W-9 Form (Individual)
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      For U.S. citizens and residents
                    </Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setTaxInfo({ ...taxInfo, filingStatus: "1099" })}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                  taxInfo.filingStatus === "1099" ? "bg-blue-50 dark:bg-blue-900/30" : ""
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                      taxInfo.filingStatus === "1099"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {taxInfo.filingStatus === "1099" && (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      1099 Form (Business)
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      For businesses and contractors
                    </Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setTaxInfo({ ...taxInfo, filingStatus: "other" })}
                className={`p-4 ${taxInfo.filingStatus === "other" ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                      taxInfo.filingStatus === "other"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {taxInfo.filingStatus === "other" && (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">Other</Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Non-U.S. residents or other tax status
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Tax Details */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            {/* Tax ID */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {taxInfo.filingStatus === "w9" ? "Social Security Number" : "Tax ID / EIN"}
              </Text>
              <TextInput
                value={taxInfo.taxId}
                onChangeText={(text) => setTaxInfo({ ...taxInfo, taxId: text })}
                placeholder={taxInfo.filingStatus === "w9" ? "XXX-XX-XXXX" : "XX-XXXXXXX"}
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                secureTextEntry
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* Business Name (if 1099) */}
            {taxInfo.filingStatus === "1099" && (
              <View className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Name
                </Text>
                <TextInput
                  value={taxInfo.businessName}
                  onChangeText={(text) => setTaxInfo({ ...taxInfo, businessName: text })}
                  placeholder="Enter business name"
                  placeholderTextColor="#9ca3af"
                  className="text-base text-gray-900 dark:text-white py-2"
                />
              </View>
            )}

            {/* Address Line 1 */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Address Line 1
              </Text>
              <TextInput
                value={taxInfo.addressLine1}
                onChangeText={(text) => setTaxInfo({ ...taxInfo, addressLine1: text })}
                placeholder="Street address"
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* Address Line 2 */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Address Line 2 (Optional)
              </Text>
              <TextInput
                value={taxInfo.addressLine2}
                onChangeText={(text) => setTaxInfo({ ...taxInfo, addressLine2: text })}
                placeholder="Apt, suite, etc."
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* City */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City</Text>
              <TextInput
                value={taxInfo.city}
                onChangeText={(text) => setTaxInfo({ ...taxInfo, city: text })}
                placeholder="City"
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 dark:text-white py-2"
              />
            </View>

            {/* State & Zip Code */}
            <View className="p-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">State</Text>
                <TextInput
                  value={taxInfo.state}
                  onChangeText={(text) => setTaxInfo({ ...taxInfo, state: text })}
                  placeholder="State"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="characters"
                  maxLength={2}
                  className="text-base text-gray-900 dark:text-white py-2"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Zip Code</Text>
                <TextInput
                  value={taxInfo.zipCode}
                  onChangeText={(text) => setTaxInfo({ ...taxInfo, zipCode: text })}
                  placeholder="12345"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={5}
                  className="text-base text-gray-900 dark:text-white py-2"
                />
              </View>
            </View>
          </View>

          {/* Important Info */}
          <View className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 mb-6 flex-row">
            <Ionicons name="warning" size={20} color="#eab308" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Why We Need This
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                Tax information is required by law for all drivers earning over $600 per
                year. We use this to generate your annual 1099 tax form.
              </Text>
            </View>
          </View>

          {/* Security Info */}
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 flex-row">
            <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
            <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300 ml-3">
              Your tax information is encrypted and stored securely. We never share this
              information with third parties except as required by law.
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
