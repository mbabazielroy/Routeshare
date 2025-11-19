import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  imageUri?: string;
  sentBy: "me" | "other";
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isTyping: boolean;
}

interface MessagingState {
  conversations: Record<string, Conversation>;
  messages: Record<string, Message[]>;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "timestamp" | "conversationId">) => void;
  markAsRead: (conversationId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
  getMessages: (conversationId: string) => Message[];
}

export const useMessagingStore = create<MessagingState>()(
  persist(
    (set, get) => ({
      conversations: {},
      messages: {},

      addMessage: (conversationId, messageData) => {
        const newMessage: Message = {
          ...messageData,
          id: Date.now().toString() + Math.random(),
          timestamp: new Date().toISOString(),
          conversationId,
        };

        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];
          const conversation = state.conversations[conversationId];

          return {
            messages: {
              ...state.messages,
              [conversationId]: [...conversationMessages, newMessage],
            },
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                lastMessage: newMessage.text,
                lastMessageTime: newMessage.timestamp,
                unreadCount:
                  newMessage.sentBy === "other"
                    ? (conversation?.unreadCount || 0) + 1
                    : conversation?.unreadCount || 0,
              },
            },
          };
        });
      },

      markAsRead: (conversationId) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...state.conversations[conversationId],
              unreadCount: 0,
            },
          },
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId]?.map((msg) => ({
              ...msg,
              read: true,
            })),
          },
        }));
      },

      setTyping: (conversationId, isTyping) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...state.conversations[conversationId],
              isTyping,
            },
          },
        }));
      },

      getConversation: (conversationId) => {
        return get().conversations[conversationId];
      },

      getMessages: (conversationId) => {
        return get().messages[conversationId] || [];
      },
    }),
    {
      name: "messaging-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
