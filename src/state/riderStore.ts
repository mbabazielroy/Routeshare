import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Trip,
  TripRequest,
  Route,
  RouteMatch,
  SavedLocation,
  Location,
} from "../types/routeshare";
import { supabase } from "../config/supabase";
import { getUserProfile } from "../services/supabaseAuth";

interface RiderState {
  currentRequest: TripRequest | null;
  currentTrip: Trip | null;
  availableMatches: RouteMatch[];
  savedLocations: SavedLocation[];
  tripHistory: Trip[];
  isSearching: boolean;

  // Actions
  createTripRequest: (
    pickup: Location,
    dropoff: Location,
    requestedTime: string,
    passengers: number,
    riderId: string
  ) => Promise<void>;
  selectDriver: (routeId: string) => Promise<void>;
  cancelTrip: () => void;
  completeTrip: () => Promise<void>;
  addSavedLocation: (location: SavedLocation) => void;
  updateDriverLocation: (latitude: number, longitude: number) => void;
  clearAllData: () => void; // NEW: Force clear all data
}

export const useRiderStore = create<RiderState>()(
  persist(
    (set, get) => ({
      currentRequest: null,
  currentTrip: null,
  availableMatches: [],
  savedLocations: [],
  tripHistory: [],
  isSearching: false,

  createTripRequest: async (pickup, dropoff, requestedTime, passengers, riderId) => {
    set({ isSearching: true });

    const request: TripRequest = {
      id: `req_${Date.now()}`,
      riderId,
      pickup,
      dropoff,
      requestedTime,
      passengers,
      status: "requesting",
      createdAt: new Date().toISOString(),
    };

    try {
      if (!supabase) {
        console.log("Supabase not available, using empty matches");
        set({
          currentRequest: { ...request, status: "pending" },
          availableMatches: [],
          isSearching: false,
        });
        return;
      }

      // Query active routes from Supabase
      console.log("Searching for available routes...");
      const { data: routes, error } = await supabase
        .from('routes')
        .select('*')
        .eq('status', 'active')
        .gte('availableSeats', passengers);

      if (error) {
        console.error("Error fetching routes:", error);
        set({
          currentRequest: { ...request, status: "pending" },
          availableMatches: [],
          isSearching: false,
        });
        return;
      }

      console.log(`Found ${routes?.length || 0} available routes`);

      // Fetch driver profiles for each route
      const matches: RouteMatch[] = [];

      if (routes && routes.length > 0) {
        for (const route of routes) {
          // Get driver profile
          const driverProfile = await getUserProfile(route.driverId);

          if (driverProfile) {
            const detourDistance = Math.random() * 3 + 0.5;
            const detourTime = Math.floor(detourDistance * 2);
            const baseFare = 2.0 + route.distance * 1.0 + (route.duration / 60) * 0.15;
            const matchScore = Math.floor(85 + Math.random() * 15);

            matches.push({
              route: {
                ...route,
                driver: driverProfile,
                driverProfile: undefined, // Driver profile is now part of the user object
              },
              detourDistance,
              detourTime,
              matchScore,
              estimatedPickup: new Date(
                Date.now() + Math.floor(Math.random() * 20 + 5) * 60000
              ).toISOString(),
              fare: Math.round(baseFare * 100) / 100,
            });
          }
        }
      }

      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);

      console.log(`Created ${matches.length} route matches`);

      set({
        currentRequest: { ...request, status: "pending" },
        availableMatches: matches.slice(0, 3), // Top 3 matches
        isSearching: false,
      });
    } catch (error) {
      console.error("Error creating trip request:", error);
      set({
        currentRequest: { ...request, status: "pending" },
        availableMatches: [],
        isSearching: false,
      });
    }
  },

  selectDriver: async (routeId: string) => {
    const { currentRequest, availableMatches } = get();
    if (!currentRequest) return;

    const match = availableMatches.find((m) => m.route.id === routeId);
    if (!match) return;

    // Simulate driver accepting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const trip: Trip = {
      id: `trip_${Date.now()}`,
      routeId: match.route.id,
      requestId: currentRequest.id,
      driverId: match.route.driverId,
      riderId: currentRequest.riderId,
      driver: match.route.driver,
      rider: undefined,
      driverProfile: match.route.driverProfile,
      pickup: currentRequest.pickup,
      dropoff: currentRequest.dropoff,
      fare: match.fare,
      driverEarnings: Math.round(match.fare * 0.85 * 100) / 100,
      platformFee: Math.round(match.fare * 0.15 * 100) / 100,
      status: "accepted",
      estimatedPickupTime: match.estimatedPickup,
      driverLocation: {
        latitude: match.route.origin.latitude,
        longitude: match.route.origin.longitude,
      },
      createdAt: new Date().toISOString(),
    };

    set({ currentTrip: trip, currentRequest: null, availableMatches: [] });

    // Simulate driver arriving
    setTimeout(() => {
      set((state) => ({
        currentTrip: state.currentTrip
          ? { ...state.currentTrip, status: "driver_arriving" }
          : null,
      }));
    }, 2000);
  },

  cancelTrip: () => {
    const { currentTrip } = get();
    if (currentTrip) {
      set({
        tripHistory: [...get().tripHistory, { ...currentTrip, status: "cancelled" }],
        currentTrip: null,
      });
    }
    set({ currentRequest: null, availableMatches: [] });
  },

  completeTrip: async () => {
    const { currentTrip } = get();
    if (!currentTrip) return;

    try {
      const completedTrip = {
        ...currentTrip,
        status: "completed" as const,
        completedAt: new Date().toISOString(),
      };

      // Save trip to Supabase
      if (supabase) {
        console.log("Saving completed trip to Supabase...");
        // Don't pass the local ID - let Supabase generate a UUID
        const { error } = await supabase
          .from('trips')
          .insert({
            riderId: currentTrip.riderId,
            driverId: currentTrip.driverId,
            pickup: currentTrip.pickup,
            dropoff: currentTrip.dropoff,
            fare: currentTrip.fare,
            status: 'completed',
            driverLocation: currentTrip.driverLocation,
            passengers: 1, // Default to 1 if not specified
            distance: null, // Can be calculated if needed
            duration: null, // Can be calculated if needed
            createdAt: currentTrip.createdAt,
            updatedAt: new Date().toISOString(),
          });

        if (error) {
          console.error("Error saving completed trip:", error);
          // Continue anyway to update local state
        } else {
          console.log("Trip saved successfully to Supabase");
        }
      }

      set({
        tripHistory: [...get().tripHistory, completedTrip],
        currentTrip: null,
      });
    } catch (error) {
      console.error("Error in completeTrip:", error);
      // Still update local state even if Supabase fails
      set({
        tripHistory: [
          ...get().tripHistory,
          { ...currentTrip, status: "completed", completedAt: new Date().toISOString() },
        ],
        currentTrip: null,
      });
    }
  },

  addSavedLocation: (location) => {
    set((state) => ({
      savedLocations: [...state.savedLocations, location],
    }));
  },

  updateDriverLocation: (latitude, longitude) => {
    set((state) => ({
      currentTrip: state.currentTrip
        ? {
            ...state.currentTrip,
            driverLocation: { latitude, longitude },
          }
        : null,
    }));
  },

  clearAllData: () => {
    console.log("Clearing all rider data...");
    set({
      currentRequest: null,
      currentTrip: null,
      availableMatches: [],
      savedLocations: [],
      tripHistory: [],
      isSearching: false,
    });
  },
    }),
    {
      name: "rider-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist saved locations and trip history, not current trip/request
      partialize: (state) => ({
        savedLocations: state.savedLocations,
        tripHistory: state.tripHistory,
      }),
    }
  )
);
