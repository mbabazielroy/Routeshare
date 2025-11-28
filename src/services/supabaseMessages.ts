// Supabase Messaging Service
import { supabase } from '../config/supabase';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  imageUri?: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  createdAt: string;
}

// Create or get conversation between two users
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string
): Promise<Conversation | null> => {
  if (!supabase) {
    // Return mock conversation for local mode
    return {
      id: `conv-${Date.now()}`,
      participant1Id: userId1,
      participant2Id: userId2,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    // Check if conversation already exists
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant1Id.eq.${userId1},participant2Id.eq.${userId2}),and(participant1Id.eq.${userId2},participant2Id.eq.${userId1})`)
      .single();

    if (existing) {
      return existing;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        participant1Id: userId1,
        participant2Id: userId2,
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    return null;
  }
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  recipientId: string,
  text: string,
  imageUri?: string
): Promise<Message | null> => {
  if (!supabase) {
    // Return mock message for local mode
    return {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      recipientId,
      text,
      imageUri,
      timestamp: new Date().toISOString(),
      read: false,
    };
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversationId,
        senderId,
        recipientId,
        text,
        imageUri,
        timestamp: new Date().toISOString(),
        read: false,
      }])
      .select()
      .single();

    if (error) throw error;

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        lastMessage: text,
        lastMessageTimestamp: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversationId', conversationId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversationId', conversationId)
      .eq('recipientId', userId)
      .eq('read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Subscribe to new messages in a conversation (real-time)
export const subscribeToMessages = (
  conversationId: string,
  callback: (message: Message) => void
): (() => void) => {
  if (!supabase) {
    return () => {};
  }

  const subscription = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversationId=eq.${conversationId}`,
      },
      (payload: any) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

// Get all conversations for a user
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1Id.eq.${userId},participant2Id.eq.${userId}`)
      .order('lastMessageTimestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
};
