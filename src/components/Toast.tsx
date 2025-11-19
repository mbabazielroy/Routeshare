import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { create } from "zustand";

interface ToastState {
  visible: boolean;
  message: string;
  type: "info" | "success" | "error";
  show: (message: string, type?: "info" | "success" | "error") => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  visible: false,
  message: "",
  type: "info",
  show: (message, type = "info") => {
    set({ visible: true, message, type });
    setTimeout(() => {
      set({ visible: false });
    }, 3000);
  },
  hide: () => set({ visible: false }),
}));

export const Toast: React.FC = () => {
  const { visible, message, type, hide } = useToast();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-600",
          icon: "checkmark-circle" as const,
          iconColor: "#fff",
        };
      case "error":
        return {
          bg: "bg-red-600",
          icon: "close-circle" as const,
          iconColor: "#fff",
        };
      default:
        return {
          bg: "bg-blue-600",
          icon: "information-circle" as const,
          iconColor: "#fff",
        };
    }
  };

  const style = getToastStyle();

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        transform: [{ translateY }],
      }}
    >
      <Pressable onPress={hide}>
        <View className={`${style.bg} rounded-2xl p-4 flex-row items-center shadow-lg`}>
          <Ionicons name={style.icon} size={24} color={style.iconColor} />
          <Text className="flex-1 text-white font-semibold text-base ml-3">
            {message}
          </Text>
          <Pressable onPress={hide} className="ml-2">
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
};
