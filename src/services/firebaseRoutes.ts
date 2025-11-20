/**
 * Firebase Routes Service
 * Handles driver route publishing and matching with Firestore
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  Timestamp,
  GeoPoint,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface FirebaseRoute {
  id: string;
  driverId: string;
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  departureTime: Timestamp;
  availableSeats: number;
  pricePerSeat: number;
  distance: number;
  estimatedDuration: number;
  status: "active" | "in_progress" | "completed" | "cancelled";
  currentRiders: string[]; // Array of rider IDs
  vehicleInfo?: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
  preferences?: {
    allowSmoking: boolean;
    allowPets: boolean;
    allowLuggage: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Publish a new route
 */
export const publishRoute = async (
  routeData: Omit<FirebaseRoute, "id" | "createdAt" | "updatedAt" | "currentRiders">
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const routeRef = doc(collection(db, "routes"));
    await setDoc(routeRef, {
      ...routeData,
      currentRiders: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return routeRef.id;
  } catch (error: any) {
    console.error("Error publishing route:", error);
    throw new Error(error.message || "Failed to publish route");
  }
};

/**
 * Get route by ID
 */
export const getRoute = async (routeId: string) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const routeRef = doc(db, "routes", routeId);
    const routeSnap = await getDoc(routeRef);

    if (routeSnap.exists()) {
      return {
        id: routeSnap.id,
        ...routeSnap.data(),
      } as FirebaseRoute;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error getting route:", error);
    throw new Error(error.message || "Failed to get route");
  }
};

/**
 * Get routes for a driver
 */
export const getDriverRoutes = async (driverId: string, limitCount = 50) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const routesRef = collection(db, "routes");
    const q = query(
      routesRef,
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const routes: FirebaseRoute[] = [];

    querySnapshot.forEach((doc) => {
      routes.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseRoute);
    });

    return routes;
  } catch (error: any) {
    console.error("Error getting driver routes:", error);
    throw new Error(error.message || "Failed to get driver routes");
  }
};

/**
 * Search for available routes (matching algorithm)
 */
export const searchRoutes = async (searchParams: {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  departureTime?: Date;
  seats?: number;
}) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const routesRef = collection(db, "routes");

    // Basic query - in production, you'd use more sophisticated geospatial queries
    const q = query(
      routesRef,
      where("status", "==", "active"),
      where("availableSeats", ">=", searchParams.seats || 1),
      orderBy("departureTime", "asc"),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const routes: FirebaseRoute[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Calculate distance matching (simplified)
      const originDistance = calculateDistance(
        searchParams.originLat,
        searchParams.originLng,
        data.origin.latitude,
        data.origin.longitude
      );

      const destDistance = calculateDistance(
        searchParams.destLat,
        searchParams.destLng,
        data.destination.latitude,
        data.destination.longitude
      );

      // Only include routes within 5 miles of both origin and destination
      if (originDistance <= 5 && destDistance <= 5) {
        routes.push({
          id: doc.id,
          ...data,
        } as FirebaseRoute);
      }
    });

    return routes;
  } catch (error: any) {
    console.error("Error searching routes:", error);
    throw new Error(error.message || "Failed to search routes");
  }
};

/**
 * Update route status
 */
export const updateRouteStatus = async (
  routeId: string,
  status: FirebaseRoute["status"],
  additionalData?: Partial<FirebaseRoute>
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const routeRef = doc(db, "routes", routeId);
    await updateDoc(routeRef, {
      status,
      ...additionalData,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error updating route status:", error);
    throw new Error(error.message || "Failed to update route status");
  }
};

/**
 * Add rider to route
 */
export const addRiderToRoute = async (routeId: string, riderId: string) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const routeRef = doc(db, "routes", routeId);
    const routeSnap = await getDoc(routeRef);

    if (!routeSnap.exists()) {
      throw new Error("Route not found");
    }

    const routeData = routeSnap.data() as FirebaseRoute;

    if (routeData.currentRiders.length >= routeData.availableSeats) {
      throw new Error("No available seats");
    }

    if (routeData.currentRiders.includes(riderId)) {
      throw new Error("Rider already added");
    }

    await updateDoc(routeRef, {
      currentRiders: [...routeData.currentRiders, riderId],
      availableSeats: routeData.availableSeats - 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error adding rider to route:", error);
    throw new Error(error.message || "Failed to add rider to route");
  }
};

/**
 * Remove rider from route
 */
export const removeRiderFromRoute = async (routeId: string, riderId: string) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const routeRef = doc(db, "routes", routeId);
    const routeSnap = await getDoc(routeRef);

    if (!routeSnap.exists()) {
      throw new Error("Route not found");
    }

    const routeData = routeSnap.data() as FirebaseRoute;

    await updateDoc(routeRef, {
      currentRiders: routeData.currentRiders.filter((id) => id !== riderId),
      availableSeats: routeData.availableSeats + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error removing rider from route:", error);
    throw new Error(error.message || "Failed to remove rider from route");
  }
};

/**
 * Listen to route changes in real-time
 */
export const listenToRoute = (routeId: string, callback: (route: FirebaseRoute | null) => void) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const routeRef = doc(db, "routes", routeId);

  return onSnapshot(
    routeRef,
    (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data(),
        } as FirebaseRoute);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to route:", error);
      callback(null);
    }
  );
};

/**
 * Listen to active routes for a driver
 */
export const listenToDriverActiveRoutes = (
  driverId: string,
  callback: (routes: FirebaseRoute[]) => void
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const routesRef = collection(db, "routes");
  const q = query(
    routesRef,
    where("driverId", "==", driverId),
    where("status", "in", ["active", "in_progress"]),
    orderBy("departureTime", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const routes: FirebaseRoute[] = [];
      snapshot.forEach((doc) => {
        routes.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseRoute);
      });
      callback(routes);
    },
    (error) => {
      console.error("Error listening to driver routes:", error);
      callback([]);
    }
  );
};

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
