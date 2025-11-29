// Supabase Trips Service
import { supabase } from '../config/supabase';

export interface Trip {
  id: string;
  riderId: string;
  driverId: string;
  pickup: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  dropoff: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  fare: number;
  status: 'pending' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';
  driverLocation?: { lat: number; lng: number };
  passengers: number;
  distance: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

// Create a new trip
export const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip | null> => {
  if (!supabase) {
    console.error('Supabase not configured - cannot create trip');
    throw new Error('Database connection not available');
  }

  try {
    const { data, error } = await supabase
      .from('trips')
      .insert([{
        ...tripData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

// Get trip by ID
export const getTrip = async (tripId: string): Promise<Trip | null> => {
  if (!supabase) {
    console.error('Supabase not configured');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting trip:', error);
    return null;
  }
};

// Update trip status
export const updateTripStatus = async (
  tripId: string,
  status: Trip['status']
): Promise<boolean> => {
  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('trips')
      .update({
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('id', tripId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating trip status:', error);
    return false;
  }
};

// Update driver location
export const updateDriverLocation = async (
  tripId: string,
  location: { lat: number; lng: number }
): Promise<boolean> => {
  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('trips')
      .update({
        driverLocation: location,
        updatedAt: new Date().toISOString()
      })
      .eq('id', tripId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating driver location:', error);
    return false;
  }
};

// Get trips for a user (rider or driver)
export const getUserTrips = async (
  userId: string,
  userType: 'rider' | 'driver'
): Promise<Trip[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const column = userType === 'rider' ? 'riderId' : 'driverId';
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq(column, userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user trips:', error);
    return [];
  }
};

// Subscribe to trip updates (real-time)
export const subscribeToTrip = (
  tripId: string,
  callback: (trip: Trip) => void
): (() => void) => {
  if (!supabase) {
    return () => {};
  }

  const subscription = supabase
    .channel(`trip-${tripId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'trips',
        filter: `id=eq.${tripId}`,
      },
      (payload: any) => {
        callback(payload.new as Trip);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Cancel trip
export const cancelTrip = async (tripId: string): Promise<boolean> => {
  return updateTripStatus(tripId, 'cancelled');
};
