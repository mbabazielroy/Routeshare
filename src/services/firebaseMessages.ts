/**
 * Firebase Messages Service
 * Handles real-time messaging with Firestore
 */

import {
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface FirebaseMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUri?: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface FirebaseConversation {
  id: string;
  participants: string[]; // Array of user IDs
  participantNames: Record<string, string>; // Map of userId to name
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  lastMessageSenderId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Send a message
 */
export const sendMessage = async (messageData: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUri?: string;
}) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const messageRef = doc(collection(db, `conversations/${messageData.conversationId}/messages`));

    await setDoc(messageRef, {
      ...messageData,
      read: false,
      createdAt: serverTimestamp(),
    });

    // Update conversation metadata
    const conversationRef = doc(db, "conversations", messageData.conversationId);
    await updateDoc(conversationRef, {
      lastMessage: messageData.text,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: messageData.senderId,
      updatedAt: serverTimestamp(),
    });

    return messageRef.id;
  } catch (error: any) {
    console.error("Error sending message:", error);
    throw new Error(error.message || "Failed to send message");
  }
};

/**
 * Create or get conversation
 */
export const getOrCreateConversation = async (
  participant1Id: string,
  participant2Id: string,
  participant1Name: string,
  participant2Name: string
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Create consistent conversation ID
    const participants = [participant1Id, participant2Id].sort();
    const conversationId = participants.join("_");

    const conversationRef = doc(db, "conversations", conversationId);
    const conversationSnap = await getDocs(
      query(collection(db, "conversations"), where("participants", "array-contains", participant1Id))
    );

    let exists = false;
    conversationSnap.forEach((doc) => {
      const data = doc.data();
      if (
        data.participants.includes(participant1Id) &&
        data.participants.includes(participant2Id)
      ) {
        exists = true;
      }
    });

    if (!exists) {
      await setDoc(conversationRef, {
        participants,
        participantNames: {
          [participant1Id]: participant1Name,
          [participant2Id]: participant2Name,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return conversationId;
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    throw new Error(error.message || "Failed to create conversation");
  }
};

/**
 * Get user conversations
 */
export const getUserConversations = async (userId: string) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const conversations: FirebaseConversation[] = [];

    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      } as FirebaseConversation);
    });

    return conversations;
  } catch (error: any) {
    console.error("Error getting conversations:", error);
    throw new Error(error.message || "Failed to get conversations");
  }
};

/**
 * Listen to messages in a conversation
 */
export const listenToMessages = (
  conversationId: string,
  callback: (messages: FirebaseMessage[]) => void
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesRef, orderBy("createdAt", "asc"), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: FirebaseMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseMessage);
      });
      callback(messages);
    },
    (error) => {
      console.error("Error listening to messages:", error);
      callback([]);
    }
  );
};

/**
 * Listen to user conversations
 */
export const listenToConversations = (
  userId: string,
  callback: (conversations: FirebaseConversation[]) => void
) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const conversations: FirebaseConversation[] = [];
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        } as FirebaseConversation);
      });
      callback(conversations);
    },
    (error) => {
      console.error("Error listening to conversations:", error);
      callback([]);
    }
  );
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesRef, where("receiverId", "==", userId), where("read", "==", false));

    const querySnapshot = await getDocs(q);

    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    throw new Error(error.message || "Failed to mark messages as read");
  }
};

/**
 * Get unread message count for a conversation
 */
export const getUnreadCount = async (conversationId: string, userId: string): Promise<number> => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesRef, where("receiverId", "==", userId), where("read", "==", false));

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error: any) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};
