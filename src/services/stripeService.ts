// Stripe Payment Service
import { supabase } from '../config/supabase';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY; // Never expose in client code!

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

/**
 * Create a payment intent for a trip
 * This should be called from a secure backend (Supabase Edge Function)
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  customerId?: string,
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string } | null> => {
  if (!supabase) {
    console.warn('Supabase not configured - payment in demo mode');
    return {
      clientSecret: 'demo_client_secret',
      paymentIntentId: 'demo_pi_' + Date.now(),
    };
  }

  try {
    // Call Supabase Edge Function to create payment intent
    // This keeps your Stripe secret key secure on the backend
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customerId,
        metadata,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
};

/**
 * Confirm a payment
 * Use this with Stripe's confirmPayment method
 */
export const confirmPayment = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: true }; // Demo mode
  }

  try {
    const { data, error } = await supabase.functions.invoke('confirm-payment', {
      body: {
        paymentIntentId,
        paymentMethodId,
      },
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a Stripe customer
 */
export const createStripeCustomer = async (
  userId: string,
  email?: string,
  name?: string
): Promise<string | null> => {
  if (!supabase) {
    return 'demo_customer_' + userId;
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-customer', {
      body: { userId, email, name },
    });

    if (error) throw error;
    return data.customerId;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return null;
  }
};

/**
 * Save payment method to customer
 */
export const attachPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<boolean> => {
  if (!supabase) {
    return true; // Demo mode
  }

  try {
    const { error } = await supabase.functions.invoke('attach-payment-method', {
      body: { customerId, paymentMethodId },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error attaching payment method:', error);
    return false;
  }
};

/**
 * Create a payout for a driver (Stripe Connect)
 */
export const createDriverPayout = async (
  driverId: string,
  amount: number,
  currency: string = 'usd'
): Promise<{ success: boolean; payoutId?: string; error?: string }> => {
  if (!supabase) {
    return { success: true, payoutId: 'demo_payout_' + Date.now() };
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-payout', {
      body: {
        driverId,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      },
    });

    if (error) throw error;
    return { success: true, payoutId: data.payoutId };
  } catch (error: any) {
    console.error('Error creating payout:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create Stripe Connect account for driver
 */
export const createConnectAccount = async (
  driverId: string,
  email: string
): Promise<{ accountId?: string; onboardingUrl?: string; error?: string }> => {
  if (!supabase) {
    return {
      accountId: 'demo_acct_' + driverId,
      onboardingUrl: 'https://connect.stripe.com/setup/demo',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-connect-account', {
      body: { driverId, email },
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error creating Connect account:', error);
    return { error: error.message };
  }
};

/**
 * Process refund for cancelled trip
 */
export const processRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> => {
  if (!supabase) {
    return { success: true, refundId: 'demo_refund_' + Date.now() };
  }

  try {
    const { data, error } = await supabase.functions.invoke('process-refund', {
      body: { paymentIntentId, amount, reason },
    });

    if (error) throw error;
    return { success: true, refundId: data.refundId };
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate platform fee and driver earnings
 */
export const calculateEarnings = (
  totalFare: number,
  platformFeePercentage: number = 0.15
): { driverEarnings: number; platformFee: number } => {
  const platformFee = totalFare * platformFeePercentage;
  const driverEarnings = totalFare - platformFee;

  return {
    driverEarnings: Math.round(driverEarnings * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
  };
};

/**
 * Calculate fare for a trip
 */
export const calculateFare = (
  distance: number, // miles
  duration: number, // minutes
  passengers: number = 1
): number => {
  const BASE_FARE = 2.0;
  const PER_MILE = 1.0;
  const PER_MINUTE = 0.15;
  const BOOKING_FEE = 1.5;

  const fare = BASE_FARE + (distance * PER_MILE) + (duration * PER_MINUTE) + BOOKING_FEE;
  return Math.round(fare * 100) / 100;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};
