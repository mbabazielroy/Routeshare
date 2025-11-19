import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useOfflineStore } from "../state/offlineStore";

export function OfflineIndicator() {
  const isConnected = useOfflineStore((s) => s.isConnected);
  const syncQueue = useOfflineStore((s) => s.syncQueue);
  const isSyncing = useOfflineStore((s) => s.isSyncing);
  const processQueue = useOfflineStore((s) => s.processQueue);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isConnected || syncQueue.length > 0) {
      // Show banner
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // Hide banner
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isConnected, syncQueue.length]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Don't render if online and no pending items
  if (isConnected && syncQueue.length === 0) {
    return null;
  }

  const pendingCount = syncQueue.filter((item) => item.status === "pending").length;
  const failedCount = syncQueue.filter((item) => item.status === "failed").length;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        },
      ]}
    >
      <View
        className={`px-4 py-3 ${
          !isConnected
            ? "bg-red-500"
            : isSyncing
            ? "bg-blue-500"
            : failedCount > 0
            ? "bg-orange-500"
            : "bg-green-500"
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Ionicons
              name={
                !isConnected
                  ? "cloud-offline"
                  : isSyncing
                  ? "sync"
                  : failedCount > 0
                  ? "warning"
                  : "cloud-done"
              }
              size={20}
              color="white"
            />
            <View className="ml-2 flex-1">
              <Text className="text-white font-semibold text-sm">
                {!isConnected
                  ? "No internet connection"
                  : isSyncing
                  ? "Syncing changes..."
                  : failedCount > 0
                  ? `${failedCount} items failed to sync`
                  : `${pendingCount} items pending sync`}
              </Text>
              {!isConnected && (
                <Text className="text-white text-xs mt-0.5 opacity-90">
                  Changes will sync when you reconnect
                </Text>
              )}
            </View>
          </View>

          {isConnected && pendingCount > 0 && !isSyncing && (
            <Pressable
              onPress={() => processQueue()}
              className="ml-2 bg-white/20 px-3 py-1.5 rounded-lg active:bg-white/30"
            >
              <Text className="text-white font-semibold text-xs">Retry</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
