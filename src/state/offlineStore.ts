import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

// Queue item types
export type QueueAction =
  | "CREATE_TRIP"
  | "UPDATE_TRIP"
  | "CANCEL_TRIP"
  | "SEND_MESSAGE"
  | "UPDATE_PROFILE"
  | "ADD_PAYMENT_CARD"
  | "PUBLISH_ROUTE";

export interface QueueItem {
  id: string;
  action: QueueAction;
  data: any;
  timestamp: string;
  retryCount: number;
  status: "pending" | "processing" | "failed";
}

interface OfflineState {
  // Network status
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;

  // Offline queue
  syncQueue: QueueItem[];
  isSyncing: boolean;

  // Actions
  setNetworkStatus: (
    isConnected: boolean,
    isInternetReachable: boolean | null,
    connectionType: string | null
  ) => void;
  addToQueue: (action: QueueAction, data: any) => void;
  removeFromQueue: (id: string) => void;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
  clearQueue: () => void;
  processQueue: () => Promise<void>;
  startNetworkListener: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: true,
      isInternetReachable: null,
      connectionType: null,
      syncQueue: [],
      isSyncing: false,

      // Set network status
      setNetworkStatus: (isConnected, isInternetReachable, connectionType) => {
        const wasOffline = !get().isConnected;
        const isNowOnline = isConnected;

        set({
          isConnected,
          isInternetReachable,
          connectionType,
        });

        // If we just came back online, process the queue
        if (wasOffline && isNowOnline) {
          get().processQueue();
        }
      },

      // Add item to sync queue
      addToQueue: (action, data) => {
        const queueItem: QueueItem = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          action,
          data,
          timestamp: new Date().toISOString(),
          retryCount: 0,
          status: "pending",
        };

        set((state) => ({
          syncQueue: [...state.syncQueue, queueItem],
        }));
      },

      // Remove item from queue
      removeFromQueue: (id) => {
        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => item.id !== id),
        }));
      },

      // Update queue item
      updateQueueItem: (id, updates) => {
        set((state) => ({
          syncQueue: state.syncQueue.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      // Clear entire queue
      clearQueue: () => {
        set({ syncQueue: [] });
      },

      // Process sync queue
      processQueue: async () => {
        const { syncQueue, isConnected, isSyncing } = get();

        // Don't process if offline or already syncing
        if (!isConnected || isSyncing || syncQueue.length === 0) {
          return;
        }

        set({ isSyncing: true });

        const pendingItems = syncQueue.filter((item) => item.status === "pending");

        for (const item of pendingItems) {
          try {
            // Mark as processing
            get().updateQueueItem(item.id, { status: "processing" });

            // Simulate API call based on action type
            // In a real app, this would call actual API endpoints
            await processQueueItem(item);

            // Remove from queue on success
            get().removeFromQueue(item.id);
          } catch (error) {
            console.error(`Failed to process queue item ${item.id}:`, error);

            // Increment retry count and mark as failed
            const newRetryCount = item.retryCount + 1;

            if (newRetryCount >= 3) {
              // Max retries reached, mark as failed permanently
              get().updateQueueItem(item.id, {
                status: "failed",
                retryCount: newRetryCount,
              });
            } else {
              // Retry later
              get().updateQueueItem(item.id, {
                status: "pending",
                retryCount: newRetryCount,
              });
            }
          }
        }

        set({ isSyncing: false });
      },

      // Start listening to network changes
      startNetworkListener: () => {
        NetInfo.addEventListener((state) => {
          get().setNetworkStatus(
            state.isConnected ?? false,
            state.isInternetReachable,
            state.type
          );
        });
      },
    }),
    {
      name: "offline-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the sync queue, not network status
      partialize: (state) => ({ syncQueue: state.syncQueue }),
    }
  )
);

// Helper function to process individual queue items
async function processQueueItem(item: QueueItem): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real app, this would make actual API calls
  switch (item.action) {
    case "CREATE_TRIP":
      console.log("Syncing trip creation:", item.data);
      // await api.createTrip(item.data);
      break;
    case "UPDATE_TRIP":
      console.log("Syncing trip update:", item.data);
      // await api.updateTrip(item.data);
      break;
    case "CANCEL_TRIP":
      console.log("Syncing trip cancellation:", item.data);
      // await api.cancelTrip(item.data);
      break;
    case "SEND_MESSAGE":
      console.log("Syncing message:", item.data);
      // await api.sendMessage(item.data);
      break;
    case "UPDATE_PROFILE":
      console.log("Syncing profile update:", item.data);
      // await api.updateProfile(item.data);
      break;
    case "ADD_PAYMENT_CARD":
      console.log("Syncing payment card:", item.data);
      // await api.addPaymentCard(item.data);
      break;
    case "PUBLISH_ROUTE":
      console.log("Syncing route publication:", item.data);
      // await api.publishRoute(item.data);
      break;
    default:
      throw new Error(`Unknown action type: ${item.action}`);
  }
}
