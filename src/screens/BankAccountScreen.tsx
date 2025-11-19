import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "BankAccount">;

interface BankAccountInfo {
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
  bankName: string;
}

export default function BankAccountScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAccount, setHasAccount] = useState(true);

  const [bankInfo, setBankInfo] = useState<BankAccountInfo>({
    accountHolderName: "John Davis",
    routingNumber: "•••••••21",
    accountNumber: "••••••4567",
    accountType: "checking",
    bankName: "Chase Bank",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<BankAccountInfo>(bankInfo);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setBankInfo(editedInfo);
    setIsEditing(false);
    setIsSaving(false);
    showToast("Bank account updated successfully", "success");
  };

  const handleRemove = () => {
    showToast("Bank account removal requires verification", "info");
  };

  if (!hasAccount && !isEditing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>
            <Text className="text-2xl font-bold text-gray-900 flex-1">Bank Account</Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="card" size={40} color="#2563eb" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
            No Bank Account Added
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6">
            Add your bank account to receive payouts from completed trips
          </Text>
          <Pressable
            onPress={() => setIsEditing(true)}
            className="bg-blue-600 px-8 py-4 rounded-xl active:bg-blue-700"
          >
            <Text className="text-white font-bold text-base">Add Bank Account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1">Bank Account</Text>
          {!isEditing && (
            <Pressable onPress={() => setIsEditing(true)}>
              <Text className="text-blue-600 font-semibold">Edit</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {!isEditing ? (
            <>
              {/* Current Account Card */}
              <View className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 mb-6">
                <View className="flex-row items-center justify-between mb-6">
                  <Ionicons name="card" size={32} color="#fff" />
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">PRIMARY</Text>
                  </View>
                </View>
                <Text className="text-white/80 text-sm mb-1">Account Holder</Text>
                <Text className="text-white text-xl font-bold mb-4">
                  {bankInfo.accountHolderName}
                </Text>
                <Text className="text-white/80 text-sm mb-1">Account Number</Text>
                <Text className="text-white text-lg font-semibold mb-3">
                  {bankInfo.accountNumber}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white/80 text-xs mb-1">Bank</Text>
                    <Text className="text-white text-sm font-semibold">
                      {bankInfo.bankName}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white/80 text-xs mb-1">Type</Text>
                    <Text className="text-white text-sm font-semibold capitalize">
                      {bankInfo.accountType}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Payout Schedule */}
              <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Payout Schedule
                </Text>
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      Automatic Payouts
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Every Monday at 9:00 AM
                    </Text>
                  </View>
                </View>
                <View className="bg-gray-50 rounded-xl p-3 mt-3">
                  <Text className="text-sm text-gray-700">
                    <Text className="font-semibold">Next payout: </Text>
                    Monday, Nov 25, 2024 • $285.00
                  </Text>
                </View>
              </View>

              {/* Remove Account */}
              <Pressable
                onPress={handleRemove}
                className="bg-white border border-red-200 rounded-xl p-4 active:bg-red-50"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  <Text className="text-red-600 font-semibold ml-2">
                    Remove Bank Account
                  </Text>
                </View>
              </Pressable>
            </>
          ) : (
            <>
              {/* Edit Form */}
              <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
                <View className="p-4 border-b border-gray-200">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Account Holder Name
                  </Text>
                  <TextInput
                    value={editedInfo.accountHolderName}
                    onChangeText={(text) =>
                      setEditedInfo({ ...editedInfo, accountHolderName: text })
                    }
                    placeholder="Full name on account"
                    placeholderTextColor="#9ca3af"
                    className="text-base text-gray-900 py-2"
                  />
                </View>

                <View className="p-4 border-b border-gray-200">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Bank Name
                  </Text>
                  <TextInput
                    value={editedInfo.bankName}
                    onChangeText={(text) =>
                      setEditedInfo({ ...editedInfo, bankName: text })
                    }
                    placeholder="e.g., Chase Bank"
                    placeholderTextColor="#9ca3af"
                    className="text-base text-gray-900 py-2"
                  />
                </View>

                <View className="p-4 border-b border-gray-200">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Routing Number
                  </Text>
                  <TextInput
                    value={editedInfo.routingNumber}
                    onChangeText={(text) =>
                      setEditedInfo({ ...editedInfo, routingNumber: text })
                    }
                    placeholder="9 digit routing number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    maxLength={9}
                    className="text-base text-gray-900 py-2"
                  />
                </View>

                <View className="p-4 border-b border-gray-200">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Account Number
                  </Text>
                  <TextInput
                    value={editedInfo.accountNumber}
                    onChangeText={(text) =>
                      setEditedInfo({ ...editedInfo, accountNumber: text })
                    }
                    placeholder="Account number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    secureTextEntry
                    className="text-base text-gray-900 py-2"
                  />
                </View>

                <View className="p-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    Account Type
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() =>
                        setEditedInfo({ ...editedInfo, accountType: "checking" })
                      }
                      className={`flex-1 p-3 rounded-xl border-2 ${
                        editedInfo.accountType === "checking"
                          ? "bg-blue-50 border-blue-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          editedInfo.accountType === "checking"
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        Checking
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        setEditedInfo({ ...editedInfo, accountType: "savings" })
                      }
                      className={`flex-1 p-3 rounded-xl border-2 ${
                        editedInfo.accountType === "savings"
                          ? "bg-blue-50 border-blue-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-center font-semibold ${
                          editedInfo.accountType === "savings"
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        Savings
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Security Info */}
              <View className="bg-blue-50 rounded-xl p-4 mb-6 flex-row">
                <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
                <Text className="flex-1 text-sm text-gray-700 ml-3">
                  Your bank information is encrypted and secure. We use bank-level
                  security to protect your data.
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setEditedInfo(bankInfo);
                    setIsEditing(false);
                  }}
                  className="flex-1 bg-gray-100 py-4 rounded-xl items-center active:bg-gray-200"
                >
                  <Text className="text-gray-700 font-bold text-base">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={isSaving}
                  className={`flex-1 bg-blue-600 py-4 rounded-xl items-center ${
                    isSaving ? "opacity-50" : "active:bg-blue-700"
                  }`}
                >
                  <Text className="text-white font-bold text-base">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
