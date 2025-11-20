import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePaymentStore } from "../state/paymentStore";
import { ConfirmationModal } from "../components/ConfirmationModal";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentMethods">;

export default function PaymentMethodsScreen({ navigation }: Props) {
  const cards = usePaymentStore((s) => s.cards);
  const setDefaultCard = usePaymentStore((s) => s.setDefaultCard);
  const removeCard = usePaymentStore((s) => s.removeCard);
  const [cardToDelete, setCardToDelete] = React.useState<string | null>(null);

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return "card";
      case "mastercard":
        return "card";
      case "amex":
        return "card";
      case "discover":
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
      case "discover":
        return "#FF6000";
      default:
        return "#6b7280";
    }
  };

  const handleSetDefault = (cardId: string) => {
    setDefaultCard(cardId);
  };

  const handleRemoveCard = (cardId: string) => {
    setCardToDelete(cardId);
  };

  const confirmRemoveCard = () => {
    if (cardToDelete) {
      removeCard(cardToDelete);
      setCardToDelete(null);
    }
  };

  const handleAddCard = () => {
    navigation.navigate("AddPaymentCard");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      <ConfirmationModal
        visible={cardToDelete !== null}
        title="Remove Card"
        message="Are you sure you want to remove this payment card? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemoveCard}
        onCancel={() => setCardToDelete(null)}
        destructive
      />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
            Payment Methods
          </Text>
          <Pressable
            onPress={handleAddCard}
            className="px-3 py-1 bg-blue-600 dark:bg-blue-500 rounded-lg active:bg-blue-700 dark:active:bg-blue-600"
          >
            <Text className="text-white font-semibold text-sm">+ Add</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Cards List */}
        {cards.length > 0 ? (
          <View className="px-6 pt-4">
            {cards.map((card) => (
              <Pressable
                key={card.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-3 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
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
                      <Text className="text-base font-bold text-gray-900 dark:text-white capitalize">
                        {card.type} •••• {card.last4}
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                        {card.holderName}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Expires {card.expiryMonth}/{card.expiryYear}
                      </Text>
                    </View>
                  </View>
                  {card.isDefault && (
                    <View className="bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      <Text className="text-xs font-semibold text-green-600 dark:text-green-400">
                        Default
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row gap-2">
                  {!card.isDefault && (
                    <Pressable
                      onPress={() => handleSetDefault(card.id)}
                      className="flex-1 bg-blue-50 dark:bg-blue-900/30 py-2 rounded-lg active:bg-blue-100 dark:active:bg-blue-900/50"
                    >
                      <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm text-center">
                        Set as Default
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => handleRemoveCard(card.id)}
                    className="flex-1 bg-red-50 dark:bg-red-900/30 py-2 rounded-lg active:bg-red-100 dark:active:bg-red-900/50"
                  >
                    <Text className="text-red-600 dark:text-red-400 font-semibold text-sm text-center">
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="px-6 pt-20">
            <View className="items-center">
              <View className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
                <Ionicons name="card-outline" size={48} color="#9ca3af" />
              </View>
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Payment Methods
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                Add a payment method to start booking rides
              </Text>
              <Pressable
                onPress={handleAddCard}
                className="bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-xl active:bg-blue-700 dark:active:bg-blue-600"
              >
                <Text className="text-white font-semibold">Add Payment Method</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Add Card Button */}
        {cards.length > 0 && (
          <View className="px-6 mt-2">
            <Pressable
              onPress={handleAddCard}
              className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 items-center active:bg-gray-50 dark:active:bg-gray-700"
            >
              <View className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full items-center justify-center mb-3">
                <Ionicons name="add" size={32} color="#2563eb" />
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Add Payment Method
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Add a credit or debit card for easy payments
              </Text>
            </Pressable>
          </View>
        )}

        {/* Info Card */}
        <View className="mx-6 mt-4 mb-6">
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-5 border border-blue-200 dark:border-blue-700">
            <View className="flex-row items-start">
              <Ionicons name="shield-checkmark" size={24} color="#2563eb" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  Secure & Protected
                </Text>
                <Text className="text-xs text-blue-800 dark:text-blue-300">
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
