import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "HelpCenter">;

interface HelpTopic {
  id: string;
  title: string;
  icon: any;
  questions: { q: string; a: string }[];
}

export default function HelpCenterScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const helpTopics: HelpTopic[] = [
    {
      id: "1",
      title: "Getting Started",
      icon: "rocket",
      questions: [
        {
          q: "How do I request a ride?",
          a: "Tap 'Where to?' on the home screen, enter your pickup and destination, then select from available drivers.",
        },
        {
          q: "How do I become a driver?",
          a: "Select 'I am a driver' when first signing up. You will need to provide vehicle information and upload required documents.",
        },
        {
          q: "What areas does RouteShare serve?",
          a: "RouteShare focuses on rural and underserved areas where traditional ride-sharing services are not available.",
        },
      ],
    },
    {
      id: "2",
      title: "Payments & Earnings",
      icon: "cash",
      questions: [
        {
          q: "How do I add a payment method?",
          a: "Go to Account > Payment Methods and tap 'Add Card' to add a credit or debit card.",
        },
        {
          q: "When will I receive my earnings?",
          a: "Driver earnings are paid out automatically every Monday morning to your linked bank account.",
        },
        {
          q: "What fees does RouteShare charge?",
          a: "RouteShare takes a 15% commission on each completed trip. Drivers keep 85% of the fare.",
        },
      ],
    },
    {
      id: "3",
      title: "Safety & Security",
      icon: "shield-checkmark",
      questions: [
        {
          q: "How are drivers verified?",
          a: "All drivers undergo background checks, license verification, vehicle inspection, and insurance validation.",
        },
        {
          q: "What should I do in an emergency?",
          a: "Tap the Safety tab and use the Emergency SOS button to call 911. Your trip information will be shared with emergency services.",
        },
        {
          q: "Can I share my trip with friends?",
          a: "Yes! Use the Trip Sharing feature in the Safety tab to share your real-time location with trusted contacts.",
        },
      ],
    },
    {
      id: "4",
      title: "Account & Settings",
      icon: "settings",
      questions: [
        {
          q: "How do I update my profile?",
          a: "Go to Account > Edit Profile to update your name, phone number, email, and photo.",
        },
        {
          q: "How do I change notification settings?",
          a: "Navigate to Account > Notifications to customize which alerts you receive.",
        },
        {
          q: "How do I delete my account?",
          a: "Contact support at support@routeshare.com to request account deletion. This process takes 7-10 business days.",
        },
      ],
    },
  ];

  const filteredTopics = helpTopics.filter((topic) =>
    searchQuery
      ? topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.questions.some(
          (q) =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : true
  );

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@routeshare.com");
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:+18005551234");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1">Help Center</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for help..."
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Contact Support Card */}
          <View className="bg-blue-600 dark:bg-blue-500 rounded-2xl p-5 mb-6">
            <Text className="text-white text-xl font-bold mb-2">Need Help?</Text>
            <Text className="text-blue-100 dark:text-blue-100 text-base mb-4">
              Our support team is here 24/7 to assist you
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleCallSupport}
                className="flex-1 bg-white/20 py-3 rounded-xl active:bg-white/30"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="call" size={18} color="#fff" />
                  <Text className="text-white font-semibold ml-2">Call</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={handleContactSupport}
                className="flex-1 bg-white/20 py-3 rounded-xl active:bg-white/30"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="mail" size={18} color="#fff" />
                  <Text className="text-white font-semibold ml-2">Email</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Help Topics */}
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">
            FREQUENTLY ASKED QUESTIONS
          </Text>
          {filteredTopics.map((topic) => (
            <View key={topic.id} className="mb-3">
              <Pressable
                onPress={() =>
                  setExpandedTopic(expandedTopic === topic.id ? null : topic.id)
                }
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <View className="flex-row items-center p-4">
                  <View className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl items-center justify-center mr-3">
                    <Ionicons name={topic.icon} size={24} color="#2563eb" />
                  </View>
                  <Text className="flex-1 text-lg font-bold text-gray-900 dark:text-white">
                    {topic.title}
                  </Text>
                  <Ionicons
                    name={expandedTopic === topic.id ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6b7280"
                  />
                </View>

                {expandedTopic === topic.id && (
                  <View className="border-t border-gray-200 dark:border-gray-700">
                    {topic.questions.map((item, index) => (
                      <View key={index}>
                        <Pressable
                          onPress={() =>
                            setExpandedQuestion(
                              expandedQuestion === `${topic.id}-${index}`
                                ? null
                                : `${topic.id}-${index}`
                            )
                          }
                          className="p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                        >
                          <View className="flex-row items-start">
                            <Ionicons
                              name="help-circle-outline"
                              size={20}
                              color="#2563eb"
                              style={{ marginTop: 2 }}
                            />
                            <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white ml-2">
                              {item.q}
                            </Text>
                            <Ionicons
                              name={
                                expandedQuestion === `${topic.id}-${index}`
                                  ? "chevron-up"
                                  : "chevron-down"
                              }
                              size={18}
                              color="#9ca3af"
                            />
                          </View>
                          {expandedQuestion === `${topic.id}-${index}` && (
                            <Text className="text-sm text-gray-600 dark:text-gray-300 mt-3 ml-7">
                              {item.a}
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            </View>
          ))}

          {filteredTopics.length === 0 && (
            <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 items-center">
              <Ionicons name="search" size={48} color="#d1d5db" />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                No results found
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2">
                Try searching with different keywords or contact support for help
              </Text>
            </View>
          )}

          {/* Still Need Help */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mt-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Still need help?
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              If you could not find the answer you were looking for, please contact
              our support team.
            </Text>
            <Pressable
              onPress={handleContactSupport}
              className="bg-blue-600 dark:bg-blue-500 py-3 rounded-xl items-center active:bg-blue-700 dark:active:bg-blue-600"
            >
              <Text className="text-white font-semibold">Contact Support</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
