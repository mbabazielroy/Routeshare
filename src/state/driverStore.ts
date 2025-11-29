import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Route, Trip, TripRequest } from "../types/routeshare";
import { supabase } from "../config/supabase";
import { createRoute, getRouteRequests, updateRequestStatus } from "../services/supabaseRoutes";

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
  publishRoute: (route: Omit<Route, "id" | "driverId" | "status" | "createdAt">, driverId: string) => Promise<void>;
  acceptRider: (requestId: string) => void;
  declineRider: (requestId: string) => void;
  startTrip: (tripId: string) => void;
  completeTrip: (tripId: string) => void;
  cancelRoute: () => void;
  toggleOnline: () => void;
  updateEarnings: (amount: number) => void;
  loadPendingRequests: (routeId: string) => Promise<void>;
}

export const useDriverStore = create<DriverState>()(
  persist(
    (set, get) => ({
      currentRoute: null,
  activeTrips: [],
  pendingRequests: [],
  earnings: {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  },
  tripHistory: [],
  isOnline: false,

  publishRoute: async (routeData, driverId) => {
    try {
      if (!supabase) {
        console.log("Supabase not available, creating local route");
        const route: Route = {
          id: `route_${Date.now()}`,
          driverId,
          ...routeData,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        set({ currentRoute: route });
        return;
      }

      console.log("Publishing route to Supabase...");

      // Create route in Supabase
      const { data, error } = await supabase
        .from('routes')
        .insert([{
          driverId,
          origin: routeData.origin,
          destination: routeData.destination,
          departureTime: routeData.departureTime,
          availableSeats: routeData.availableSeats,
          distance: routeData.distance,
          duration: routeData.estimatedDuration,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error("Error publishing route:", error);
        throw error;
      }

      console.log("Route published successfully:", data.id);

      const route: Route = {
        id: data.id,
        driverId,
        ...routeData,
        status: "active",
        createdAt: data.createdAt,
      };

      set({ currentRoute: route });

      // Set up real-time listener for rider requests if Supabase is available
      if (supabase) {
        console.log("Setting up real-time listener for rider requests...");
        const channel = supabase
          .channel(`route-${data.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'rider_requests',
              filter: `routeId=eq.${data.id}`,
            },
            (payload: any) => {
              console.log("New rider request received:", payload.new);
              const newRequest = payload.new as any;

              const tripRequest: TripRequest = {
                id: newRequest.id,
                riderId: newRequest.riderId,
                pickup: newRequest.pickup,
                dropoff: newRequest.dropoff,
                requestedTime: route.departureTime,
                passengers: newRequest.passengers,
                status: newRequest.status,
                createdAt: newRequest.createdAt,
              };

              set((state) => ({
                pendingRequests: [...state.pendingRequests, tripRequest],
              }));
            }
          )
          .subscribe();
      }
    } catch (error) {
      console.error("Error in publishRoute:", error);
      // Create local route as fallback
      const route: Route = {
        id: `route_${Date.now()}`,
        driverId,
        ...routeData,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      set({ currentRoute: route });
    }
  },

  loadPendingRequests: async (routeId: string) => {
    try {
      if (!supabase) {
        console.log("Supabase not available, skipping request loading");
        return;
      }

      console.log("Loading pending requests for route:", routeId);
      const { data, error } = await supabase
        .from('rider_requests')
        .select('*')
        .eq('routeId', routeId)
        .eq('status', 'pending');

      if (error) {
        console.error("Error loading requests:", error);
        return;
      }

      const requests: TripRequest[] = (data || []).map((req: any) => ({
        id: req.id,
        riderId: req.riderId,
        pickup: req.pickup,
        dropoff: req.dropoff,
        requestedTime: req.createdAt,
        passengers: req.passengers,
        status: req.status,
        createdAt: req.createdAt,
      }));

      console.log(`Loaded ${requests.length} pending requests`);
      set({ pendingRequests: requests });
    } catch (error) {
      console.error("Error in loadPendingRequests:", error);
    }
  },

  acceptRider: async (requestId) => {
    const { pendingRequests, currentRoute } = get();
    const request = pendingRequests.find((r) => r.id === requestId);

    if (!request || !currentRoute) return;

    try {
      // Update request status in Supabase
      if (supabase) {
        console.log("Accepting rider request:", requestId);
        const { error } = await supabase
          .from('rider_requests')
          .update({ status: 'accepted' })
          .eq('id', requestId);

        if (error) {
          console.error("Error accepting request:", error);
        }
      }

      const fare = 25.5 + Math.random() * 10;
      const trip: Trip = {
        id: `trip_${Date.now()}`,
        routeId: currentRoute.id,
        requestId: request.id,
        driverId: currentRoute.driverId,
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
    } catch (error) {
      console.error("Error in acceptRider:", error);
    }
  },

  declineRider: async (requestId) => {
    try {
      // Update request status in Supabase
      if (supabase) {
        console.log("Declining rider request:", requestId);
        const { error } = await supabase
          .from('rider_requests')
          .update({ status: 'declined' })
          .eq('id', requestId);

        if (error) {
          console.error("Error declining request:", error);
        }
      }

      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
      }));
    } catch (error) {
      console.error("Error in declineRider:", error);
    }
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
