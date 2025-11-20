import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "NotificationSettings">;

interface NotificationPreferences {
  tripUpdates: boolean;
  newRequests: boolean;
  messages: boolean;
  promotions: boolean;
  safety: boolean;
  earnings: boolean;
  newsletter: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export default function NotificationSettingsScreen({ navigation }: Props) {
  const showToast = useToast((s) => s.show);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    tripUpdates: true,
    newRequests: true,
    messages: true,
    promotions: false,
    safety: true,
    earnings: true,
    newsletter: false,
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
  });

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });
    showToast("Notification preferences updated", "success");
  };

  const NotificationToggle = ({
    title,
    description,
    value,
    onToggle,
    icon,
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    icon: any;
  }) => (
    <View className="flex-row items-start p-4 border-b border-gray-200 dark:border-gray-700">
      <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#2563eb" />
      </View>
      <View className="flex-1 mr-3">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">{title}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
        thumbColor={value ? "#2563eb" : "#f3f4f6"}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1">Notifications</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Notification Channels */}
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
            NOTIFICATION CHANNELS
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <NotificationToggle
              title="Push Notifications"
              description="Receive notifications on your device"
              value={preferences.pushEnabled}
              onToggle={(value) => updatePreference("pushEnabled", value)}
              icon="notifications"
            />
            <NotificationToggle
              title="Email Notifications"
              description="Receive notifications via email"
              value={preferences.emailEnabled}
              onToggle={(value) => updatePreference("emailEnabled", value)}
              icon="mail"
            />
            <NotificationToggle
              title="SMS Notifications"
              description="Receive text messages for important updates"
              value={preferences.smsEnabled}
              onToggle={(value) => updatePreference("smsEnabled", value)}
              icon="chatbox"
            />
          </View>

          {/* Trip & Ride Notifications */}
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
            TRIPS & RIDES
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <NotificationToggle
              title="Trip Updates"
              description="Driver arrival, trip start, and completion"
              value={preferences.tripUpdates}
              onToggle={(value) => updatePreference("tripUpdates", value)}
              icon="car"
            />
            <NotificationToggle
              title="New Ride Requests"
              description="When a rider requests a ride on your route"
              value={preferences.newRequests}
              onToggle={(value) => updatePreference("newRequests", value)}
              icon="person-add"
            />
            <NotificationToggle
              title="Messages"
              description="New messages from riders or drivers"
              value={preferences.messages}
              onToggle={(value) => updatePreference("messages", value)}
              icon="chatbubbles"
            />
          </View>

          {/* Safety & Security */}
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
            SAFETY & SECURITY
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <NotificationToggle
              title="Safety Alerts"
              description="Important safety and security notifications"
              value={preferences.safety}
              onToggle={(value) => updatePreference("safety", value)}
              icon="shield-checkmark"
            />
          </View>

          {/* Financial */}
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
            FINANCIAL
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <NotificationToggle
              title="Earnings Updates"
              description="Payouts, earnings milestones, and summaries"
              value={preferences.earnings}
              onToggle={(value) => updatePreference("earnings", value)}
              icon="cash"
            />
          </View>

          {/* Marketing */}
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
            MARKETING & UPDATES
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <NotificationToggle
              title="Promotions & Offers"
              description="Special offers, discounts, and promotions"
              value={preferences.promotions}
              onToggle={(value) => updatePreference("promotions", value)}
              icon="pricetag"
            />
            <NotificationToggle
              title="Newsletter"
              description="Company updates and community news"
              value={preferences.newsletter}
              onToggle={(value) => updatePreference("newsletter", value)}
              icon="newspaper"
            />
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 flex-row border border-blue-200 dark:border-blue-700">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300 ml-3">
              You can change these settings at any time. Some notifications like safety
              alerts cannot be disabled.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
