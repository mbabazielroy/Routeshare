import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useMessagingStore } from "../state/messagingStore";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "InAppMessaging">;

export default function InAppMessagingScreen({ navigation, route }: Props) {
  const conversationId = route.params?.conversationId || "demo_conversation";
  const messages = useMessagingStore((s) => s.getMessages(conversationId));
  const conversation = useMessagingStore((s) => s.getConversation(conversationId));
  const addMessage = useMessagingStore((s) => s.addMessage);
  const markAsRead = useMessagingStore((s) => s.markAsRead);
  const setTyping = useMessagingStore((s) => s.setTyping);
  const showToast = useToast((s) => s.show);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize demo conversation if it doesn't exist
  useEffect(() => {
    if (messages.length === 0) {
      addMessage(conversationId, {
        text: "Hi! I'm on my way to pick you up.",
        sentBy: "other",
        read: false,
      });
      addMessage(conversationId, {
        text: "Great! I'll be waiting outside.",
        sentBy: "me",
        read: true,
      });
    }
  }, []);

  // Mark messages as read when screen opens
  useEffect(() => {
    markAsRead(conversationId);
  }, [conversationId]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  // Handle typing indicator
  const handleTextChange = (text: string) => {
    setInputText(text);

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      setTyping(conversationId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(conversationId, false);
    }, 2000);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      addMessage(conversationId, {
        text: inputText.trim(),
        sentBy: "me",
        read: true,
      });
      setInputText("");
      setIsTyping(false);
      setTyping(conversationId, false);

      // Simulate other person response after 2 seconds
      setTimeout(() => {
        const responses = [
          "Got it!",
          "Sounds good!",
          "On my way!",
          "Thanks for letting me know.",
          "See you soon!",
        ];
        addMessage(conversationId, {
          text: responses[Math.floor(Math.random() * responses.length)],
          sentBy: "other",
          read: false,
        });
      }, 2000);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      showToast("Permission needed to access photos", "error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addMessage(conversationId, {
        text: "📷 Photo",
        imageUri: result.assets[0].uri,
        sentBy: "me",
        read: true,
      });
      showToast("Photo sent", "success");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>
            <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {conversation?.otherUserName || "Driver"}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {conversation?.isTyping ? "typing..." : "Active now"}
              </Text>
            </View>
            <Pressable className="w-10 h-10 items-center justify-center active:bg-gray-100 dark:active:bg-gray-700 rounded-full">
              <Ionicons name="call" size={20} color="#16a34a" />
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
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
                    ? "bg-blue-600 dark:bg-blue-500 rounded-tr-sm"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-sm"
                }`}
              >
                {message.imageUri && (
                  <Image
                    source={{ uri: message.imageUri }}
                    className="w-48 h-48 rounded-xl mb-2"
                    resizeMode="cover"
                  />
                )}
                <Text
                  className={`text-base ${
                    message.sentBy === "me" ? "text-white" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {message.text}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                {formatTime(message.timestamp)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <View className="flex-row items-center">
            <Pressable
              onPress={handlePickImage}
              className="w-10 h-10 items-center justify-center mr-2"
            >
              <Ionicons name="image" size={24} color="#6b7280" />
            </Pressable>
            <TextInput
              value={inputText}
              onChangeText={handleTextChange}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-3 text-base text-gray-900 dark:text-white mr-2"
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
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
