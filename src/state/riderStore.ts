import { create } from "zustand";
import {
  Trip,
  TripRequest,
  Route,
  RouteMatch,
  SavedLocation,
  Location,
} from "../types/routeshare";
import { mockDrivers, mockRoutes } from "../utils/mockData";

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
    passengers: number
  ) => Promise<void>;
  selectDriver: (routeId: string) => Promise<void>;
  cancelTrip: () => void;
  completeTrip: () => void;
  addSavedLocation: (location: SavedLocation) => void;
  updateDriverLocation: (latitude: number, longitude: number) => void;
}

export const useRiderStore = create<RiderState>((set, get) => ({
  currentRequest: null,
  currentTrip: null,
  availableMatches: [],
  savedLocations: [
    {
      id: "1",
      name: "Home",
      location: {
        latitude: 38.8951,
        longitude: -77.0364,
        address: "123 Oak Street, Millville, VA",
      },
      icon: "home",
    },
    {
      id: "2",
      name: "Work",
      location: {
        latitude: 38.9072,
        longitude: -77.0369,
        address: "456 Main Street, Millville, VA",
      },
      icon: "briefcase",
    },
  ],
  tripHistory: [],
  isSearching: false,

  createTripRequest: async (pickup, dropoff, requestedTime, passengers) => {
    set({ isSearching: true });

    const request: TripRequest = {
      id: `req_${Date.now()}`,
      riderId: "rider_1",
      pickup,
      dropoff,
      requestedTime,
      passengers,
      status: "requesting",
      createdAt: new Date().toISOString(),
    };

    // Simulate matching algorithm
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Find matching routes
    const matches: RouteMatch[] = mockRoutes
      .filter((route: Route) => route.availableSeats >= passengers)
      .map((route: Route) => {
        const detourDistance = Math.random() * 3 + 0.5;
        const detourTime = Math.floor(detourDistance * 2);
        const baseFare = 2.0 + route.distance * 1.0 + (route.estimatedDuration / 60) * 0.15;
        const matchScore = Math.floor(85 + Math.random() * 15);

        return {
          route: {
            ...route,
            driver: mockDrivers.find((d: typeof mockDrivers[0]) => d.id === route.driverId),
            driverProfile: mockDrivers.find((d: typeof mockDrivers[0]) => d.id === route.driverId)?.driverProfile,
          },
          detourDistance,
          detourTime,
          matchScore,
          estimatedPickup: new Date(
            Date.now() + Math.floor(Math.random() * 20 + 5) * 60000
          ).toISOString(),
          fare: Math.round(baseFare * 100) / 100,
        };
      })
      .sort((a: RouteMatch, b: RouteMatch) => b.matchScore - a.matchScore)
      .slice(0, 3);

    set({
      currentRequest: { ...request, status: "pending" },
      availableMatches: matches,
      isSearching: false,
    });
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

  completeTrip: () => {
    const { currentTrip } = get();
    if (currentTrip) {
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
}));
