import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList, RiderTabParamList, DriverTabParamList } from "./types";

// Auth Screens
import WelcomeScreen from "../screens/WelcomeScreen";
import UserTypeSelectionScreen from "../screens/UserTypeSelectionScreen";

// Rider Screens
import RiderHomeScreen from "../screens/RiderHomeScreen";
import TripRequestScreen from "../screens/TripRequestScreen";
import DriverSelectionScreen from "../screens/DriverSelectionScreen";
import LiveTripScreen from "../screens/LiveTripScreen";
import RiderAccountScreen from "../screens/RiderAccountScreen";
import MyRidesScreen from "../screens/MyRidesScreen";
import SafetyScreen from "../screens/SafetyScreen";

// Driver Screens
import DriverHomeScreen from "../screens/DriverHomeScreen";
import PublishRouteScreen from "../screens/PublishRouteScreen";
import DriverAccountScreen from "../screens/DriverAccountScreen";
import MyRoutesScreen from "../screens/MyRoutesScreen";
import EarningsScreen from "../screens/EarningsScreen";
import RiderRequestScreen from "../screens/RiderRequestScreen";

// Shared Screens
import TripRatingScreen from "../screens/TripRatingScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import PaymentMethodsScreen from "../screens/PaymentMethodsScreen";
import SavedPlacesScreen from "../screens/SavedPlacesScreen";
import InAppMessagingScreen from "../screens/InAppMessagingScreen";

// Placeholder screens
import { View, Text } from "react-native";

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text className="text-xl font-bold text-gray-900">{title}</Text>
    <Text className="text-gray-500 mt-2">Coming soon</Text>
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const RiderTab = createBottomTabNavigator<RiderTabParamList>();
const DriverTab = createBottomTabNavigator<DriverTabParamList>();

// Rider Tab Navigator
function RiderTabNavigator() {
  return (
    <RiderTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 8,
        },
      }}
    >
      <RiderTab.Screen
        name="RiderHome"
        component={RiderHomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <RiderTab.Screen
        name="MyRides"
        component={MyRidesScreen}
        options={{
          headerShown: false,
          tabBarLabel: "My Rides",
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <RiderTab.Screen
        name="Safety"
        component={SafetyScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Safety",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
        }}
      />
      <RiderTab.Screen
        name="RiderAccount"
        component={RiderAccountScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </RiderTab.Navigator>
  );
}

// Driver Tab Navigator
function DriverTabNavigator() {
  return (
    <DriverTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 8,
        },
      }}
    >
      <DriverTab.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <DriverTab.Screen
        name="MyRoutes"
        component={MyRoutesScreen}
        options={{
          headerShown: false,
          tabBarLabel: "My Routes",
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <DriverTab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Earnings",
          tabBarIcon: ({ color, size }) => <Ionicons name="cash" size={size} color={color} />,
        }}
      />
      <DriverTab.Screen
        name="DriverAccount"
        component={DriverAccountScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </DriverTab.Navigator>
  );
}

// Root Stack Navigator
export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />

      {/* Rider Flow */}
      <Stack.Screen name="RiderTabs" component={RiderTabNavigator} />
      <Stack.Screen name="TripRequest" component={TripRequestScreen} />
      <Stack.Screen name="DriverSelection" component={DriverSelectionScreen} />
      <Stack.Screen name="LiveTrip" component={LiveTripScreen} />

      {/* Driver Flow */}
      <Stack.Screen name="DriverTabs" component={DriverTabNavigator} />
      <Stack.Screen
        name="PublishRoute"
        component={PublishRouteScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="RiderRequest" component={RiderRequestScreen} />

      {/* Shared */}
      <Stack.Screen name="TripRating" component={TripRatingScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
      <Stack.Screen name="InAppMessaging" component={InAppMessagingScreen} />
    </Stack.Navigator>
  );
}
