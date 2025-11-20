/**
 * Firebase Trips Service
 * Handles trip operations with Firestore
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
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface FirebaseTrip {
  id: string;
  riderId: string;
  driverId?: string;
  pickup: {
    address: string;
    latitude: number;
    longitude: number;
  };
  dropoff: {
    address: string;
    latitude: number;
    longitude: number;
  };
  status: "requested" | "accepted" | "driver_arriving" | "in_progress" | "completed" | "cancelled";
  fare: number;
  distance: number;
  estimatedDuration: number;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  rating?: number;
  review?: string;
}

/**
 * Create a new trip request
 */
export const createTrip = async (tripData: Omit<FirebaseTrip, "id" | "createdAt" | "updatedAt">) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const tripRef = doc(collection(db, "trips"));
    await setDoc(tripRef, {
      ...tripData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return tripRef.id;
  } catch (error: any) {
    console.error("Error creating trip:", error);
    throw new Error(error.message || "Failed to create trip");
  }
};

/**
 * Get trip by ID
 */
export const getTrip = async (tripId: string) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const tripRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(tripRef);

    if (tripSnap.exists()) {
      return {
        id: tripSnap.id,
        ...tripSnap.data(),
      } as FirebaseTrip;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error getting trip:", error);
    throw new Error(error.message || "Failed to get trip");
  }
};

/**
 * Get trips for a rider
 */
export const getRiderTrips = async (riderId: string, limitCount = 50) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("riderId", "==", riderId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const trips: FirebaseTrip[] = [];

    querySnapshot.forEach((doc) => {
      trips.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseTrip);
    });

    return trips;
  } catch (error: any) {
    console.error("Error getting rider trips:", error);
    throw new Error(error.message || "Failed to get rider trips");
  }
};

/**
 * Get trips for a driver
 */
export const getDriverTrips = async (driverId: string, limitCount = 50) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const trips: FirebaseTrip[] = [];

    querySnapshot.forEach((doc) => {
      trips.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseTrip);
    });

    return trips;
  } catch (error: any) {
    console.error("Error getting driver trips:", error);
    throw new Error(error.message || "Failed to get driver trips");
  }
};

/**
 * Update trip status
 */
export const updateTripStatus = async (
  tripId: string,
  status: FirebaseTrip["status"],
  additionalData?: Partial<FirebaseTrip>
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const tripRef = doc(db, "trips", tripId);
    await updateDoc(tripRef, {
      status,
      ...additionalData,
      updatedAt: serverTimestamp(),
      ...(status === "completed" && { completedAt: serverTimestamp() }),
    });
  } catch (error: any) {
    console.error("Error updating trip status:", error);
    throw new Error(error.message || "Failed to update trip status");
  }
};

/**
 * Update driver location during trip
 */
export const updateDriverLocation = async (
  tripId: string,
  location: { latitude: number; longitude: number }
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const tripRef = doc(db, "trips", tripId);
    await updateDoc(tripRef, {
      driverLocation: location,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error updating driver location:", error);
    throw new Error(error.message || "Failed to update driver location");
  }
};

/**
 * Rate a trip
 */
export const rateTrip = async (tripId: string, rating: number, review?: string) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const tripRef = doc(db, "trips", tripId);
    await updateDoc(tripRef, {
      rating,
      ...(review && { review }),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error rating trip:", error);
    throw new Error(error.message || "Failed to rate trip");
  }
};

/**
 * Listen to trip changes in real-time
 */
export const listenToTrip = (tripId: string, callback: (trip: FirebaseTrip | null) => void) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const tripRef = doc(db, "trips", tripId);

  return onSnapshot(
    tripRef,
    (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data(),
        } as FirebaseTrip);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to trip:", error);
      callback(null);
    }
  );
};

/**
 * Listen to active trips for a user
 */
export const listenToActiveTrips = (
  userId: string,
  userType: "rider" | "driver",
  callback: (trips: FirebaseTrip[]) => void
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const tripsRef = collection(db, "trips");
  const q = query(
    tripsRef,
    where(userType === "rider" ? "riderId" : "driverId", "==", userId),
    where("status", "in", ["requested", "accepted", "driver_arriving", "in_progress"]),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const trips: FirebaseTrip[] = [];
      snapshot.forEach((doc) => {
        trips.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseTrip);
      });
      callback(trips);
    },
    (error) => {
      console.error("Error listening to active trips:", error);
      callback([]);
    }
  );
};
