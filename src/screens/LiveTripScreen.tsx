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

  const mapRef = useRef<MapView>(null);
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">No active trip</Text>
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
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl">
        <SafeAreaView edges={["bottom"]}>
          <View className="px-6 py-4">
            {/* Driver Details */}
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mr-4">
                <Ionicons name="person" size={32} color="#6b7280" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-xl font-bold text-gray-900">
                    {driver?.firstName} {driver?.lastName?.[0]}.
                  </Text>
                  <View className="ml-2 flex-row items-center">
                    <Ionicons name="star" size={16} color="#eab308" />
                    <Text className="ml-1 text-sm font-semibold text-gray-700">
                      {driver?.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text className="text-base text-gray-600 mt-1">
                  {profile?.vehicleColor} {profile?.vehicleMake}
                </Text>
                <Text className="text-sm text-gray-500">{profile?.licensePlate}</Text>
              </View>
            </View>

            {/* Trip Info */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-start mb-2">
                <Ionicons name="location" size={18} color="#10b981" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500 mb-1">Pickup</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {currentTrip.pickup.address}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="location" size={18} color="#dc2626" />
                <View className="flex-1 ml-3">
                  <Text className="text-xs text-gray-500 mb-1">Dropoff</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {currentTrip.dropoff.address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleCall}
                className="flex-1 bg-gray-100 rounded-xl py-3 flex-row items-center justify-center active:bg-gray-200"
              >
                <Ionicons name="call" size={20} color="#1f2937" />
                <Text className="ml-2 font-semibold text-gray-900">Call</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowCancelConfirm(true)}
                className="flex-1 bg-red-50 rounded-xl py-3 flex-row items-center justify-center active:bg-red-100"
              >
                <Ionicons name="close-circle" size={20} color="#dc2626" />
                <Text className="ml-2 font-semibold text-red-600">Cancel</Text>
              </Pressable>

              <Pressable className="bg-blue-600 rounded-xl px-4 py-3 active:bg-blue-700">
                <Ionicons name="shield-checkmark" size={24} color="white" />
              </Pressable>
            </View>

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center rounded-t-3xl">
                <View className="bg-white rounded-2xl p-6 mx-6">
                  <Text className="text-xl font-bold text-gray-900 mb-2">Cancel Trip?</Text>
                  <Text className="text-gray-600 mb-6">
                    Are you sure you want to cancel this trip?
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setShowCancelConfirm(false)}
                      className="flex-1 bg-gray-100 rounded-xl py-3"
                    >
                      <Text className="text-center font-semibold text-gray-900">No, keep it</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleCancel}
                      className="flex-1 bg-red-600 rounded-xl py-3"
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
