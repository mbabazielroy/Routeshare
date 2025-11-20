import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { usePaymentStore } from "../state/paymentStore";

type Props = NativeStackScreenProps<RootStackParamList, "AddPaymentCard">;

export default function AddPaymentCardScreen({ navigation }: Props) {
  const addCard = usePaymentStore((s) => s.addCard);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);

  const [errors, setErrors] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted;
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Detect card type from number
  const detectCardType = (number: string): "visa" | "mastercard" | "amex" | "discover" => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.match(/^5[1-5]/)) return "mastercard";
    if (cleaned.match(/^3[47]/)) return "amex";
    if (cleaned.match(/^6(?:011|5)/)) return "discover";
    return "visa"; // default
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 16) {
      setCardNumber(formatCardNumber(cleaned));
      if (errors.cardNumber) {
        setErrors({ ...errors, cardNumber: "" });
      }
    }
  };

  const handleExpiryDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 4) {
      setExpiryDate(formatExpiryDate(cleaned));
      if (errors.expiryDate) {
        setErrors({ ...errors, expiryDate: "" });
      }
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const maxLength = cardNumber.replace(/\s/g, "").startsWith("3") ? 4 : 3;
    if (cleaned.length <= maxLength) {
      setCvv(cleaned);
      if (errors.cvv) {
        setErrors({ ...errors, cvv: "" });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    };

    // Validate card number
    const cleanedNumber = cardNumber.replace(/\s/g, "");
    if (!cleanedNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (cleanedNumber.length < 13 || cleanedNumber.length > 16) {
      newErrors.cardNumber = "Invalid card number";
    }

    // Validate cardholder name
    if (!cardHolder.trim()) {
      newErrors.cardHolder = "Cardholder name is required";
    } else if (cardHolder.trim().length < 3) {
      newErrors.cardHolder = "Name must be at least 3 characters";
    }

    // Validate expiry date
    if (!expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const [month, year] = expiryDate.split("/");
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt("20" + year, 10);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiryDate = "Invalid month";
      } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        newErrors.expiryDate = "Card has expired";
      }
    }

    // Validate CVV
    const expectedCvvLength = cleanedNumber.startsWith("3") ? 4 : 3;
    if (!cvv) {
      newErrors.cvv = "CVV is required";
    } else if (cvv.length !== expectedCvvLength) {
      newErrors.cvv = `CVV must be ${expectedCvvLength} digits`;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleAddCard = () => {
    if (!validateForm()) {
      return;
    }

    const cleanedNumber = cardNumber.replace(/\s/g, "");
    const [month, year] = expiryDate.split("/");

    addCard({
      type: detectCardType(cleanedNumber),
      last4: cleanedNumber.slice(-4),
      expiryMonth: month,
      expiryYear: year,
      holderName: cardHolder.trim(),
      isDefault: setAsDefault,
    });

    navigation.goBack();
  };

  const cardType = detectCardType(cardNumber);
  const getCardColor = () => {
    switch (cardType) {
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <Pressable onPress={() => navigation.goBack()} className="mr-3">
                  <Ionicons name="arrow-back" size={24} color="#111827" />
                </Pressable>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Add Payment Card</Text>
              </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
              {/* Card Preview */}
              <View
                className="rounded-2xl p-6 mb-6"
                style={{ backgroundColor: getCardColor() }}
              >
                <View className="flex-row justify-between items-start mb-8">
                  <Ionicons name="card" size={40} color="white" />
                  <Text className="text-white font-bold text-base capitalize">
                    {cardType}
                  </Text>
                </View>

                <Text className="text-white text-2xl font-mono tracking-widest mb-6">
                  {cardNumber || "•••• •••• •••• ••••"}
                </Text>

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-white text-xs opacity-70 mb-1">CARDHOLDER</Text>
                    <Text className="text-white font-semibold">
                      {cardHolder || "YOUR NAME"}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white text-xs opacity-70 mb-1">EXPIRES</Text>
                    <Text className="text-white font-semibold">
                      {expiryDate || "MM/YY"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card Number */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </Text>
                <TextInput
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  maxLength={19}
                />
                {errors.cardNumber ? (
                  <Text className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.cardNumber}</Text>
                ) : null}
              </View>

              {/* Cardholder Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </Text>
                <TextInput
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                  placeholder="John Doe"
                  placeholderTextColor="#9ca3af"
                  value={cardHolder}
                  onChangeText={(text) => {
                    setCardHolder(text);
                    if (errors.cardHolder) {
                      setErrors({ ...errors, cardHolder: "" });
                    }
                  }}
                  autoCapitalize="words"
                />
                {errors.cardHolder ? (
                  <Text className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.cardHolder}</Text>
                ) : null}
              </View>

              {/* Expiry Date and CVV */}
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                    placeholder="MM/YY"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={expiryDate}
                    onChangeText={handleExpiryDateChange}
                    maxLength={5}
                  />
                  {errors.expiryDate ? (
                    <Text className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.expiryDate}</Text>
                  ) : null}
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">CVV</Text>
                  <TextInput
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                    placeholder="123"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={cvv}
                    onChangeText={handleCvvChange}
                    maxLength={4}
                    secureTextEntry
                  />
                  {errors.cvv ? (
                    <Text className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.cvv}</Text>
                  ) : null}
                </View>
              </View>

              {/* Set as Default */}
              <Pressable
                onPress={() => setSetAsDefault(!setAsDefault)}
                className="flex-row items-center mb-6"
              >
                <View
                  className={`w-6 h-6 rounded-md border-2 ${
                    setAsDefault
                      ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  } items-center justify-center mr-3`}
                >
                  {setAsDefault && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className="text-gray-900 dark:text-white font-medium">
                  Set as default payment method
                </Text>
              </Pressable>

              {/* Info Card */}
              <View className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-700 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#2563eb" />
                  <Text className="flex-1 ml-2 text-xs text-blue-900 dark:text-blue-200">
                    Your card information is securely encrypted. We use industry-standard
                    security measures to protect your payment details.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Add Card Button */}
            <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <Pressable
                onPress={handleAddCard}
                className="bg-blue-600 dark:bg-blue-500 rounded-2xl py-4 items-center active:bg-blue-700 dark:active:bg-blue-600"
              >
                <Text className="text-white font-bold text-lg">Add Card</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
