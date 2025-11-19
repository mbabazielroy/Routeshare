import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentMethods">;

interface PaymentCard {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen({ navigation }: Props) {
  const [cards] = useState<PaymentCard[]>([
    {
      id: "1",
      type: "visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "25",
      isDefault: true,
    },
  ]);

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return "card";
      case "mastercard":
        return "card";
      case "amex":
        return "card";
      default:
        return "card";
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case "visa":
        return "#1434CB";
      case "mastercard":
        return "#EB001B";
      case "amex":
        return "#006FCF";
      default:
        return "#6b7280";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            Payment Methods
          </Text>
          <Pressable className="px-3 py-1 bg-blue-600 rounded-lg active:bg-blue-700">
            <Text className="text-white font-semibold text-sm">+ Add</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Cards List */}
        <View className="px-6 pt-4">
          {cards.map((card) => (
            <Pressable
              key={card.id}
              className="bg-white rounded-2xl p-5 mb-3 border border-gray-200 active:bg-gray-50"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${getCardColor(card.type)}20` }}
                  >
                    <Ionicons
                      name={getCardIcon(card.type) as any}
                      size={24}
                      color={getCardColor(card.type)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 capitalize">
                      {card.type} •••• {card.last4}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-0.5">
                      Expires {card.expiryMonth}/{card.expiryYear}
                    </Text>
                  </View>
                </View>
                {card.isDefault && (
                  <View className="bg-green-50 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-green-600">
                      Default
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row gap-2">
                {!card.isDefault && (
                  <Pressable className="flex-1 bg-blue-50 py-2 rounded-lg active:bg-blue-100">
                    <Text className="text-blue-600 font-semibold text-sm text-center">
                      Set as Default
                    </Text>
                  </Pressable>
                )}
                <Pressable className="flex-1 bg-red-50 py-2 rounded-lg active:bg-red-100">
                  <Text className="text-red-600 font-semibold text-sm text-center">
                    Remove
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Add Card Button */}
        <View className="px-6 mt-2">
          <Pressable className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 items-center active:bg-gray-50">
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-3">
              <Ionicons name="add" size={32} color="#2563eb" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-1">
              Add Payment Method
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Add a credit or debit card for easy payments
            </Text>
          </Pressable>
        </View>

        {/* Info Card */}
        <View className="mx-6 mt-4 mb-6">
          <View className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <View className="flex-row items-start">
              <Ionicons name="shield-checkmark" size={24} color="#2563eb" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-blue-900 mb-1">
                  Secure & Protected
                </Text>
                <Text className="text-xs text-blue-800">
                  Your payment information is encrypted and secure. We never store your
                  full card details.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
