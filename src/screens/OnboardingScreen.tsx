import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: "people",
    iconColor: "#2563eb",
    iconBg: "#dbeafe",
    title: "Connect with Local Drivers",
    description: "Find drivers already heading your way. No need to wait for someone to come pick you up.",
  },
  {
    icon: "map",
    iconColor: "#16a34a",
    iconBg: "#dcfce7",
    title: "Smart Route Matching",
    description: "Our algorithm finds the best matches based on your route, making rural travel convenient.",
  },
  {
    icon: "shield-checkmark",
    iconColor: "#dc2626",
    iconBg: "#fee2e2",
    title: "Safe & Verified",
    description: "All drivers are verified with background checks. Share your trip with loved ones anytime.",
  },
  {
    icon: "cash",
    iconColor: "#eab308",
    iconBg: "#fef9c3",
    title: "Fair Pricing",
    description: "Affordable rates that help drivers earn while riders save. Win-win for rural communities.",
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: width * nextIndex,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    // Mark onboarding as completed
    await AsyncStorage.setItem("onboarding_completed", "true");
    navigation.replace("Welcome");
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Skip Button */}
      <View className="px-6 py-4 flex-row justify-end">
        <Pressable onPress={handleSkip} className="px-4 py-2">
          <Text className="text-blue-600 dark:text-blue-400 font-semibold text-base">Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View
            key={index}
            style={{ width }}
            className="flex-1 items-center justify-center px-8"
          >
            {/* Icon */}
            <View
              className="w-32 h-32 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: slide.iconBg }}
            >
              <Ionicons name={slide.icon} size={64} color={slide.iconColor} />
            </View>

            {/* Title */}
            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
              {slide.title}
            </Text>

            {/* Description */}
            <Text className="text-base text-gray-600 dark:text-gray-300 text-center leading-6">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIndex
                  ? "w-8 bg-blue-600 dark:bg-blue-500"
                  : "w-2 bg-gray-300 dark:bg-gray-700"
              }`}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <Pressable
          onPress={handleNext}
          className="bg-blue-600 dark:bg-blue-500 rounded-2xl py-4 items-center active:bg-blue-700 dark:active:bg-blue-600"
        >
          <Text className="text-white font-bold text-lg">
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
