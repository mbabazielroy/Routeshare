// Supabase Authentication Service
import { supabase } from '../config/supabase';
import * as SecureStore from 'expo-secure-store';
import { User as AppUser } from '../types/routeshare';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  userType?: 'rider' | 'driver';
  profilePhoto?: string;
  createdAt: string;
  authProvider?: 'phone' | 'apple' | 'google';
  verificationLevel?: 'basic' | 'standard' | 'community' | 'premium';
  rating?: number;
  totalTrips?: number;
}

// Phone Authentication
export const sendPhoneOTP = async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured. Please check your environment variables.' };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return { success: false, error: error.message };
  }
};

export const verifyPhoneOTP = async (
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured. Please check your environment variables.' };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms',
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from verification');

    // Get or create user profile
    const user = await getOrCreateUserProfile(data.user.id, {
      phone: phoneNumber,
      authProvider: 'phone',
    });

    return { success: true, user };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: error.message };
  }
};

// Get or create user profile in the database
const getOrCreateUserProfile = async (
  userId: string,
  initialData: Partial<User>
): Promise<User> => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.');
  }

  try {
    // Check if user profile exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingUser) {
      // Add default values for fields not in database
      return {
        ...existingUser,
        verificationLevel: existingUser.verificationLevel || 'basic',
        rating: existingUser.rating || 5.0,
        totalTrips: existingUser.totalTrips || 0,
      };
    }

    // Create new user profile
    const newUser = {
      id: userId,
      ...initialData,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) throw error;

    // Add default values for fields not in database
    return {
      ...data,
      verificationLevel: 'basic',
      rating: 5.0,
      totalTrips: 0,
    };
  } catch (error) {
    console.error('Error getting/creating user profile:', error);
    throw error;
  }
};

// Update user profile (or create if doesn't exist)
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; user?: User; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured. Please check your environment variables.' };
  }

  try {
    // Use upsert to create user if they don't exist
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...updates,
        createdAt: new Date().toISOString(),
      }, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Add default values for fields not in database
    return {
      success: true,
      user: {
        ...data,
        verificationLevel: data.verificationLevel || 'basic',
        rating: data.rating || 5.0,
        totalTrips: data.totalTrips || 0,
      }
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Add default values for fields not in database
    return {
      ...data,
      verificationLevel: data.verificationLevel || 'basic',
      rating: data.rating || 5.0,
      totalTrips: data.totalTrips || 0,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Sign out
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    // Clear local storage
    await SecureStore.deleteItemAsync('auth_token');
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear secure storage
    await SecureStore.deleteItemAsync('auth_token');
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Get current session
export const getCurrentSession = async () => {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!supabase) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event: string, session: any) => {
      if (session?.user) {
        const user = await getUserProfile(session.user.id);
        callback(user);
      } else {
        callback(null);
      }
    }
  );

  return () => subscription.unsubscribe();
};
