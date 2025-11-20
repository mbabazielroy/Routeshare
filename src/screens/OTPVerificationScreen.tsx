import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "OTPVerification">;

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const showToast = useToast((s) => s.show);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = () => {
    return otp.every((digit) => digit !== "");
  };

  const handleVerify = async () => {
    if (!isOtpComplete()) {
      showToast("Please enter the complete verification code", "error");
      return;
    }

    setIsLoading(true);

    // Simulate API verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const otpCode = otp.join("");

    // In production, verify OTP with backend
    // For demo, accept any 6-digit code
    if (otpCode.length === 6) {
      showToast("Phone verified successfully!", "success");
      setIsLoading(false);

      // Navigate to user type selection
      navigation.navigate("UserTypeSelection", { phone, isNewUser: true });
    } else {
      setIsLoading(false);
      showToast("Invalid verification code", "error");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    // Simulate resending OTP
    showToast("Sending new code...", "info");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    showToast("Verification code sent!", "success");

    // Reset timer
    setResendTimer(60);

    // Clear OTP fields
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const maskPhone = (phoneNumber: string) => {
    // Format: +1 (XXX) XXX-XX67
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-XX${cleaned.slice(9)}`;
    }
    return phoneNumber;
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
              <Ionicons name="lock-closed" size={40} color="white" />
            </View>

            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Enter verification code
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-300">
              We sent a 6-digit code to{"\n"}
              <Text className="font-semibold text-gray-900 dark:text-white">{maskPhone(phone)}</Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Verification Code
            </Text>
            <View className="flex-row justify-between mb-4">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  className={`w-14 h-14 rounded-xl text-center text-2xl font-bold border-2 ${
                    digit
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white"
                      : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend Code */}
            <View className="flex-row items-center justify-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                Did not receive the code?
              </Text>
              <Pressable
                onPress={handleResendOTP}
                disabled={resendTimer > 0}
                className="py-1"
              >
                <Text
                  className={`text-sm font-semibold ${
                    resendTimer > 0 ? "text-gray-400 dark:text-gray-500" : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Info Box */}
          <View className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 mb-6 flex-row">
            <Ionicons name="warning" size={20} color="#eab308" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Code not received?
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                Check your phone for SMS messages. The code may take up to 60 seconds to arrive.
              </Text>
            </View>
          </View>

          {/* Verify Button */}
          <View className="flex-1 justify-end pb-4">
            <Pressable
              onPress={handleVerify}
              disabled={!isOtpComplete() || isLoading}
              className={`rounded-2xl py-4 px-6 ${
                isOtpComplete() && !isLoading
                  ? "bg-blue-600 dark:bg-blue-500 active:bg-blue-700 dark:active:bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
