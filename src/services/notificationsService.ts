// Push Notifications Service
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationType =
  | 'trip_accepted'
  | 'driver_arriving'
  | 'trip_started'
  | 'trip_completed'
  | 'message_received'
  | 'payment_processed'
  | 'rider_request'
  | 'request_accepted'
  | 'request_declined';

/**
 * Request notification permissions and get push token
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token - permissions denied');
      return null;
    }

    // Get push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || '019a9853-c308-753c-9521-9a5c7f63f1a2', // Your Vibecode project ID
    });

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563eb',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Save push token to user profile in database
 */
export const savePushToken = async (userId: string, token: string): Promise<boolean> => {
  if (!supabase) {
    console.log('Supabase not configured - push token not saved');
    return false;
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ pushToken: token })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving push token:', error);
    return false;
  }
};

/**
 * Send a push notification to a user
 * This should be called from backend (Supabase Edge Function)
 */
export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> => {
  try {
    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high' as const,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    return result.data?.status === 'ok';
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Notification templates for different events
 */
export const notificationTemplates: Record<
  NotificationType,
  (data: any) => { title: string; body: string; data?: Record<string, any> }
> = {
  trip_accepted: (data) => ({
    title: '🚗 Trip Accepted!',
    body: `${data.driverName} accepted your ride request. ETA: ${data.eta} minutes.`,
    data: { type: 'trip_accepted', tripId: data.tripId },
  }),
  driver_arriving: (data) => ({
    title: '📍 Driver Arriving',
    body: `${data.driverName} is ${data.distance} away and arriving soon!`,
    data: { type: 'driver_arriving', tripId: data.tripId },
  }),
  trip_started: (data) => ({
    title: '✅ Trip Started',
    body: `Your trip to ${data.destination} has started. Enjoy your ride!`,
    data: { type: 'trip_started', tripId: data.tripId },
  }),
  trip_completed: (data) => ({
    title: '🎉 Trip Completed',
    body: `You have arrived at ${data.destination}. Total fare: $${data.fare}`,
    data: { type: 'trip_completed', tripId: data.tripId },
  }),
  message_received: (data) => ({
    title: `💬 Message from ${data.senderName}`,
    body: data.message,
    data: { type: 'message_received', conversationId: data.conversationId },
  }),
  payment_processed: (data) => ({
    title: '💳 Payment Processed',
    body: `$${data.amount} charged to your card ending in ${data.last4}`,
    data: { type: 'payment_processed', paymentId: data.paymentId },
  }),
  rider_request: (data) => ({
    title: '👋 New Ride Request',
    body: `${data.riderName} wants a ride from ${data.pickup} to ${data.dropoff}. Earn $${data.earnings}!`,
    data: { type: 'rider_request', requestId: data.requestId },
  }),
  request_accepted: (data) => ({
    title: '✅ Request Accepted',
    body: `${data.driverName} accepted your ride request!`,
    data: { type: 'request_accepted', tripId: data.tripId },
  }),
  request_declined: (data) => ({
    title: '❌ Request Declined',
    body: `${data.driverName} declined your ride request. Finding other drivers...`,
    data: { type: 'request_declined', requestId: data.requestId },
  }),
};

/**
 * Send notification using template
 */
export const sendNotificationFromTemplate = async (
  userId: string,
  type: NotificationType,
  data: any
): Promise<boolean> => {
  if (!supabase) {
    console.log('Demo mode - notification would be sent:', type, data);
    return true;
  }

  try {
    // Get user's push token
    const { data: user, error } = await supabase
      .from('users')
      .select('pushToken')
      .eq('id', userId)
      .single();

    if (error || !user?.pushToken) {
      console.log('User push token not found');
      return false;
    }

    // Get notification template
    const template = notificationTemplates[type](data);

    // Send notification
    return await sendPushNotification(
      user.pushToken,
      template.title,
      template.body,
      template.data
    );
  } catch (error) {
    console.error('Error sending notification from template:', error);
    return false;
  }
};

/**
 * Set up notification listeners
 */
export const setupNotificationListeners = (
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
) => {
  // Listener for notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);

  // Listener for when user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    onNotificationTapped
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Schedule a local notification (for testing or reminders)
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  seconds: number = 5,
  data?: Record<string, any>
): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get badge count
 */
export const getBadgeCount = async (): Promise<number> => {
  return await Notifications.getBadgeCountAsync();
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};

/**
 * Clear badge
 */
export const clearBadge = async (): Promise<void> => {
  await Notifications.setBadgeCountAsync(0);
};
