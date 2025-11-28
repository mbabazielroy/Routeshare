// Google Maps & Places API Service
import { supabase } from '../config/supabase';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface PlaceAutocomplete {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface RouteInfo {
  distance: number; // miles
  duration: number; // minutes
  polyline: string;
}

/**
 * Search for places using Google Places Autocomplete
 */
export const searchPlaces = async (
  input: string,
  types?: string // 'address', 'establishment', 'geocode'
): Promise<PlaceAutocomplete[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    // Return mock data for demo
    return [
      {
        placeId: 'mock1',
        description: `${input} Street, City, State`,
        mainText: `${input} Street`,
        secondaryText: 'City, State',
      },
      {
        placeId: 'mock2',
        description: `${input} Avenue, Town, State`,
        mainText: `${input} Avenue`,
        secondaryText: 'Town, State',
      },
    ];
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_MAPS_API_KEY}&types=${types || 'address'}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Places API error:', data.status);
      return [];
    }

    return data.predictions.map((prediction: any) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

/**
 * Get place details from place ID
 */
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    // Return mock data
    return {
      placeId,
      name: 'Mock Location',
      address: '123 Main St, City, State 12345',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Place Details API error:', data.status);
      return null;
    }

    const result = data.result;
    return {
      placeId,
      name: result.name || '',
      address: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

/**
 * Get route information between two points
 */
export const getRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteInfo | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    // Return mock data
    const distance = calculateDistance(origin, destination);
    return {
      distance,
      duration: Math.round(distance * 2), // Rough estimate: 2 min per mile
      polyline: '',
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      console.error('Directions API error:', data.status);
      return null;
    }

    const route = data.routes[0].legs[0];
    return {
      distance: route.distance.value / 1609.34, // Convert meters to miles
      duration: route.duration.value / 60, // Convert seconds to minutes
      polyline: data.routes[0].overview_polyline.points,
    };
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Geocode an address to coordinates
 */
export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return { lat: 37.7749, lng: -122.4194 }; // Mock SF coordinates
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding API error:', data.status);
      return null;
    }

    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return 'Mock Address, City, State';
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Reverse Geocoding API error:', data.status);
      return null;
    }

    return data.results[0].formatted_address;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Calculate ETA based on distance and current traffic
 */
export const calculateETA = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number | null> => {
  const route = await getRoute(origin, destination);
  return route ? Math.round(route.duration) : null;
};

/**
 * Check if a point is along a route (within threshold)
 */
export const isPointAlongRoute = (
  point: { lat: number; lng: number },
  routeStart: { lat: number; lng: number },
  routeEnd: { lat: number; lng: number },
  thresholdMiles: number = 5
): boolean => {
  // Calculate distance from point to route start and end
  const distanceToStart = calculateDistance(point, routeStart);
  const distanceToEnd = calculateDistance(point, routeEnd);

  // Calculate direct distance from start to end
  const routeDistance = calculateDistance(routeStart, routeEnd);

  // If sum of distances to start and end is close to route distance,
  // the point is roughly along the route
  const totalDistance = distanceToStart + distanceToEnd;
  const detour = totalDistance - routeDistance;

  return detour <= thresholdMiles;
};

/**
 * Format distance for display
 */
export const formatDistance = (miles: number): string => {
  if (miles < 1) {
    return `${Math.round(miles * 5280)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
};

/**
 * Format duration for display
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};
