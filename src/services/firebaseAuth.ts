/**
 * Firebase Authentication Service
 * Handles user authentication with Firebase Auth
 */

import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
  ApplicationVerifier,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Send OTP to phone number
 */
export const sendOTP = async (phoneNumber: string, appVerifier: ApplicationVerifier) => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth as Auth,
      phoneNumber,
      appVerifier
    );
    return confirmationResult;
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    throw new Error(error.message || "Failed to send OTP");
  }
};

/**
 * Verify OTP and sign in user
 */
export const verifyOTP = async (verificationId: string, code: string) => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCredential = await signInWithCredential(auth as Auth, credential);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    throw new Error(error.message || "Invalid OTP");
  }
};

/**
 * Create or update user profile in Firestore
 */
export const createUserProfile = async (
  userId: string,
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: "rider" | "driver";
    photoURL?: string;
  }
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);

    // Check if user already exists
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing user
      await setDoc(
        userRef,
        {
          ...userData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      // Create new user
      await setDoc(userRef, {
        ...userData,
        rating: 5.0,
        totalTrips: 0,
        verificationLevel: "unverified",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return userRef.id;
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    throw new Error(error.message || "Failed to create user profile");
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    throw new Error(error.message || "Failed to get user profile");
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  try {
    await firebaseSignOut(auth as Auth);
  } catch (error: any) {
    console.error("Error signing out:", error);
    throw new Error(error.message || "Failed to sign out");
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  return onAuthStateChanged(auth as Auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  if (!auth) {
    return null;
  }
  return (auth as Auth).currentUser;
};
