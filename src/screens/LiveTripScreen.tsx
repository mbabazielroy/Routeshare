import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useRiderStore } from "../state/riderStore";

type Props = NativeStackScreenProps<RootStackParamList, "LiveTrip">;

export default function LiveTripScreen({ navigation, route }: Props) {
  const currentTrip = useRiderStore((s) => s.currentTrip);
  const updateDriverLocation = useRiderStore((s) => s.updateDriverLocation);
  const completeTrip = useRiderStore((s) => s.completeTrip);
  const cancelTrip = useRiderStore((s) => s.cancelTrip);

  const mapRef = useRef<MapView | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Simulate driver movement
  useEffect(() => {
    if (!currentTrip || !currentTrip.driverLocation) return;

    const interval = setInterval(() => {
      const { latitude, longitude } = currentTrip.driverLocation!;
      const pickupLat = currentTrip.pickup.latitude;
      const pickupLng = currentTrip.pickup.longitude;

      // Move driver slightly towards pickup
      const newLat = latitude + (pickupLat - latitude) * 0.1;
      const newLng = longitude + (pickupLng - longitude) * 0.1;

      updateDriverLocation(newLat, newLng);

      // Check if driver is close to pickup
      const distance = Math.sqrt(
        Math.pow(pickupLat - newLat, 2) + Math.pow(pickupLng - newLng, 2)
      );

      if (distance < 0.001 && currentTrip.status === "driver_arriving") {
        // Simulate trip start
        setTimeout(() => {
          // Auto complete after 5 seconds (demo)
          setTimeout(() => {
            completeTrip();
            navigation.replace("TripRating", {
              tripId: currentTrip.id,
              otherUserId: currentTrip.driverId,
            });
          }, 5000);
        }, 2000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentTrip]);

  // Center map on driver and pickup
  useEffect(() => {
    if (currentTrip?.driverLocation && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          currentTrip.driverLocation,
          { latitude: currentTrip.pickup.latitude, longitude: currentTrip.pickup.longitude },
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        }
      );
    }
  }, [currentTrip?.driverLocation]);

  if (!currentTrip) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">No active trip</Text>
      </SafeAreaView>
    );
  }

  const driver = currentTrip.driver;
  const profile = currentTrip.driverProfile;
  const driverLocation = currentTrip.driverLocation;

  const handleCall = () => {
    Linking.openURL(`tel:${driver?.phone}`);
  };

  const handleCancel = () => {
    cancelTrip();
    navigation.navigate("RiderTabs");
  };

  const getStatusText = () => {
    switch (currentTrip.status) {
      case "accepted":
        return "Driver is on the way";
      case "driver_arriving":
        return "Driver is arriving";
      case "in_progress":
        return "Trip in progress";
      default:
        return "Finding driver...";
    }
  };

  const getStatusColor = () => {
    switch (currentTrip.status) {
      case "in_progress":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <View className="flex-1">
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        className="flex-1"
        initialRegion={{
          latitude: currentTrip.pickup.latitude,
          longitude: currentTrip.pickup.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Driver Location */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver"
            description={`${driver?.firstName} ${driver?.lastName}`}
          >
            <View className="items-center">
              <View className="bg-blue-600 rounded-full p-2">
                <Ionicons name="car" size={20} color="white" />
              </View>
            </View>
          </Marker>
        )}

        {/* Pickup Location */}
        <Marker
          coordinate={{
            latitude: currentTrip.pickup.latitude,
            longitude: currentTrip.pickup.longitude,
          }}
          title="Pickup"
          description={currentTrip.pickup.address}
          pinColor="green"
        />

        {/* Dropoff Location */}
        <Marker
          coordinate={{
            latitude: currentTrip.dropoff.latitude,
            longitude: currentTrip.dropoff.longitude,
          }}
          title="Dropoff"
          description={currentTrip.dropoff.address}
          pinColor="red"
        />

        {/* Route Line */}
        {driverLocation && (
          <Polyline
            coordinates={[
              driverLocation,
              {
                latitude: currentTrip.pickup.latitude,
                longitude: currentTrip.pickup.longitude,
              },
            ]}
            strokeColor="#2563eb"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Status Bar */}
      <View className="absolute top-0 left-0 right-0 pt-12 px-6">
        <View className={`${getStatusColor()} rounded-2xl px-6 py-3 shadow-lg`}>
          <Text className="text-white text-center font-semibold text-base">
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Driver Info Card */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl">
        <SafeAreaView edges={["bottom"]}>
          <View className="px-6 py-4">
            {/* Driver Details */}
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mr-4">
                <Ionicons name="person" size={32} color="#6b7280" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    {driver?.firstName} {driver?.lastName?.[0]}.
                  </Text>
                  <View className="ml-2 flex-row items-center">
                    <Ionicons name="star" size={16} color="#eab308" />
                    <Text className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {driver?.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text className="text-base text-gray-600 dark:text-gray-300 mt-1">
                  {profile?.vehicleColor} {profile?.vehicleMake}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">{profile?.licensePlate}</Text>
              </View>
            </View>

            {/* Trip Info */}
            <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
              <View className="flex-row items-start mb-2">
                <Ionicons name="location" size={18} color="#10b981" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup</Text>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentTrip.pickup.address}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="location" size={18} color="#dc2626" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dropoff</Text>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentTrip.dropoff.address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              {/* Primary Actions */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleCall}
                  className="flex-1 bg-green-50 dark:bg-green-900/30 rounded-xl py-3 flex-row items-center justify-center active:bg-green-100 dark:active:bg-green-900/50 border border-green-200 dark:border-green-700"
                >
                  <Ionicons name="call" size={20} color="#16a34a" />
                  <Text className="ml-2 font-semibold text-green-700 dark:text-green-300">Call</Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("InAppMessaging", { conversationId: `trip_${currentTrip.id}` })}
                  className="flex-1 bg-blue-50 dark:bg-blue-900/30 rounded-xl py-3 flex-row items-center justify-center active:bg-blue-100 dark:active:bg-blue-900/50 border border-blue-200 dark:border-blue-700"
                >
                  <Ionicons name="chatbubble" size={20} color="#2563eb" />
                  <Text className="ml-2 font-semibold text-blue-600 dark:text-blue-400">Message</Text>
                </Pressable>
              </View>

              {/* Secondary Actions */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowCancelConfirm(true)}
                  className="flex-1 bg-red-50 dark:bg-red-900/30 rounded-xl py-3 flex-row items-center justify-center active:bg-red-100 dark:active:bg-red-900/50 border border-red-200 dark:border-red-700"
                >
                  <Ionicons name="close-circle" size={20} color="#dc2626" />
                  <Text className="ml-2 font-semibold text-red-600 dark:text-red-400">Cancel Trip</Text>
                </Pressable>

                <Pressable
                  className="bg-blue-600 dark:bg-blue-500 rounded-xl px-6 py-3 items-center justify-center active:bg-blue-700 dark:active:bg-blue-600"
                >
                  <Ionicons name="shield-checkmark" size={24} color="white" />
                </Pressable>
              </View>
            </View>

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center rounded-t-3xl">
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-6">
                  <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cancel Trip?</Text>
                  <Text className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to cancel this trip?
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setShowCancelConfirm(false)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl py-3 active:bg-gray-200 dark:active:bg-gray-600"
                    >
                      <Text className="text-center font-semibold text-gray-900 dark:text-white">No, keep it</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleCancel}
                      className="flex-1 bg-red-600 dark:bg-red-500 rounded-xl py-3 active:bg-red-700 dark:active:bg-red-600"
                    >
                      <Text className="text-center font-semibold text-white">Yes, cancel</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
