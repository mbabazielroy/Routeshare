// Supabase Routes Service
import { supabase } from '../config/supabase';

export interface Route {
  id: string;
  driverId: string;
  origin: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  destination: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  departureTime: string;
  availableSeats: number;
  distance: number;
  duration: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface RiderRequest {
  id: string;
  routeId: string;
  riderId: string;
  pickup: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  dropoff: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  passengers: number;
  status: 'pending' | 'accepted' | 'declined';
  estimatedFare: number;
  createdAt: string;
}

// Create a new route
export const createRoute = async (routeData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route | null> => {
  if (!supabase) {
    // Return mock route for local mode
    return {
      id: `route-${Date.now()}`,
      ...routeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase
      .from('routes')
      .insert([{
        ...routeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating route:', error);
    return null;
  }
};

// Get route by ID
export const getRoute = async (routeId: string): Promise<Route | null> => {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
};

// Get routes for a driver
export const getDriverRoutes = async (driverId: string): Promise<Route[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('driverId', driverId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting driver routes:', error);
    return [];
  }
};

// Update route status
export const updateRouteStatus = async (
  routeId: string,
  status: Route['status']
): Promise<boolean> => {
  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('routes')
      .update({
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('id', routeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating route status:', error);
    return false;
  }
};

// Create a rider request for a route
export const createRiderRequest = async (
  requestData: Omit<RiderRequest, 'id' | 'createdAt'>
): Promise<RiderRequest | null> => {
  if (!supabase) {
    // Return mock request for local mode
    return {
      id: `request-${Date.now()}`,
      ...requestData,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase
      .from('rider_requests')
      .insert([{
        ...requestData,
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating rider request:', error);
    return null;
  }
};

// Get rider requests for a route
export const getRouteRequests = async (routeId: string): Promise<RiderRequest[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('rider_requests')
      .select('*')
      .eq('routeId', routeId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting route requests:', error);
    return [];
  }
};

// Update rider request status
export const updateRequestStatus = async (
  requestId: string,
  status: RiderRequest['status']
): Promise<boolean> => {
  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('rider_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating request status:', error);
    return false;
  }
};

// Find matching routes for a rider
export const findMatchingRoutes = async (
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
  departureTime?: string
): Promise<Route[]> => {
  if (!supabase) {
    return [];
  }

  try {
    // Get all active routes
    // In production, this would use PostGIS for geospatial queries
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('status', 'active')
      .gt('availableSeats', 0);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error finding matching routes:', error);
    return [];
  }
};

// Subscribe to route updates (real-time)
export const subscribeToRoute = (
  routeId: string,
  callback: (route: Route) => void
): (() => void) => {
  if (!supabase) {
    return () => {};
  }

  const subscription = supabase
    .channel(`route-${routeId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'routes',
        filter: `id=eq.${routeId}`,
      },
      (payload: any) => {
        callback(payload.new as Route);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Subscribe to new rider requests for a route (real-time)
export const subscribeToRouteRequests = (
  routeId: string,
  callback: (request: RiderRequest) => void
): (() => void) => {
  if (!supabase) {
    return () => {};
  }

  const subscription = supabase
    .channel(`route-requests-${routeId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'rider_requests',
        filter: `routeId=eq.${routeId}`,
      },
      (payload: any) => {
        callback(payload.new as RiderRequest);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
