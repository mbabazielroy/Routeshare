import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "InAppMessaging">;

interface Message {
  id: string;
  text: string;
  sentBy: "me" | "other";
  timestamp: string;
}

export default function InAppMessagingScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm on my way to pick you up.",
      sentBy: "other",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      text: "Great! I'll be waiting outside.",
      sentBy: "me",
      timestamp: "10:31 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sentBy: "me",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInputText("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">John Driver</Text>
              <Text className="text-xs text-gray-600">Active now</Text>
            </View>
            <Pressable className="w-10 h-10 items-center justify-center active:bg-gray-100 rounded-full">
              <Ionicons name="call" size={20} color="#16a34a" />
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 px-6 pt-4">
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-3 ${
                message.sentBy === "me" ? "items-end" : "items-start"
              }`}
            >
              <View
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.sentBy === "me"
                    ? "bg-blue-600 rounded-tr-sm"
                    : "bg-white border border-gray-200 rounded-tl-sm"
                }`}
              >
                <Text
                  className={`text-base ${
                    message.sentBy === "me" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {message.text}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1 px-1">
                {message.timestamp}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base text-gray-900 mr-2"
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <Ionicons name="send" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
