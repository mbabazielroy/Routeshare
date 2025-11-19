import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Route, Trip, TripRequest } from "../types/routeshare";

interface DriverState {
  currentRoute: Route | null;
  activeTrips: Trip[];
  pendingRequests: TripRequest[];
  earnings: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  tripHistory: Trip[];
  isOnline: boolean;

  // Actions
  publishRoute: (route: Omit<Route, "id" | "driverId" | "status" | "createdAt">) => void;
  acceptRider: (requestId: string) => void;
  declineRider: (requestId: string) => void;
  startTrip: (tripId: string) => void;
  completeTrip: (tripId: string) => void;
  cancelRoute: () => void;
  toggleOnline: () => void;
  updateEarnings: (amount: number) => void;
}

export const useDriverStore = create<DriverState>()(
  persist(
    (set, get) => ({
      currentRoute: null,
  activeTrips: [],
  pendingRequests: [],
  earnings: {
    today: 67.5,
    week: 285.0,
    month: 1240.75,
    total: 3240.5,
  },
  tripHistory: [],
  isOnline: false,

  publishRoute: (routeData) => {
    const route: Route = {
      id: `route_${Date.now()}`,
      driverId: "driver_1",
      ...routeData,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    set({ currentRoute: route });

    // Simulate receiving rider requests after a delay
    setTimeout(() => {
      const mockRequest: TripRequest = {
        id: `req_${Date.now()}`,
        riderId: "rider_1",
        pickup: {
          latitude: route.origin.latitude + 0.005,
          longitude: route.origin.longitude + 0.005,
          address: "Near your route",
        },
        dropoff: {
          latitude: route.destination.latitude - 0.01,
          longitude: route.destination.longitude - 0.01,
          address: "Along your way",
        },
        requestedTime: route.departureTime,
        passengers: 1,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        pendingRequests: [...state.pendingRequests, mockRequest],
      }));
    }, 3000);
  },

  acceptRider: (requestId) => {
    const { pendingRequests, currentRoute } = get();
    const request = pendingRequests.find((r) => r.id === requestId);

    if (!request || !currentRoute) return;

    const fare = 25.5 + Math.random() * 10;
    const trip: Trip = {
      id: `trip_${Date.now()}`,
      routeId: currentRoute.id,
      requestId: request.id,
      driverId: "driver_1",
      riderId: request.riderId,
      pickup: request.pickup,
      dropoff: request.dropoff,
      fare: Math.round(fare * 100) / 100,
      driverEarnings: Math.round(fare * 0.85 * 100) / 100,
      platformFee: Math.round(fare * 0.15 * 100) / 100,
      status: "accepted",
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      activeTrips: [...state.activeTrips, trip],
      pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
      currentRoute: state.currentRoute
        ? {
            ...state.currentRoute,
            availableSeats: state.currentRoute.availableSeats - request.passengers,
          }
        : null,
    }));
  },

  declineRider: (requestId) => {
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
    }));
  },

  startTrip: (tripId) => {
    set((state) => ({
      activeTrips: state.activeTrips.map((t) =>
        t.id === tripId
          ? { ...t, status: "in_progress", startedAt: new Date().toISOString() }
          : t
      ),
      currentRoute: state.currentRoute
        ? { ...state.currentRoute, status: "in_progress" }
        : null,
    }));
  },

  completeTrip: (tripId) => {
    const { activeTrips } = get();
    const trip = activeTrips.find((t) => t.id === tripId);

    if (!trip) return;

    const completedTrip: Trip = {
      ...trip,
      status: "completed",
      completedAt: new Date().toISOString(),
    };

    set((state) => ({
      activeTrips: state.activeTrips.filter((t) => t.id !== tripId),
      tripHistory: [...state.tripHistory, completedTrip],
      earnings: {
        ...state.earnings,
        today: state.earnings.today + trip.driverEarnings,
        week: state.earnings.week + trip.driverEarnings,
        month: state.earnings.month + trip.driverEarnings,
        total: state.earnings.total + trip.driverEarnings,
      },
    }));
  },

  cancelRoute: () => {
    set({ currentRoute: null, activeTrips: [], pendingRequests: [] });
  },

  toggleOnline: () => {
    set((state) => ({ isOnline: !state.isOnline }));
  },

  updateEarnings: (amount) => {
    set((state) => ({
      earnings: {
        ...state.earnings,
        today: state.earnings.today + amount,
        week: state.earnings.week + amount,
        month: state.earnings.month + amount,
        total: state.earnings.total + amount,
      },
    }));
  },
    }),
    {
      name: "driver-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Persist earnings and trip history, not current route/trips
      partialize: (state) => ({
        earnings: state.earnings,
        tripHistory: state.tripHistory,
      }),
    }
  )
);
