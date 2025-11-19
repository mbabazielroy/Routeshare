import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PaymentCard {
  id: string;
  type: "visa" | "mastercard" | "amex" | "discover";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: "charge" | "refund" | "payout";
  amount: number;
  status: "pending" | "completed" | "failed";
  description: string;
  timestamp: string;
  cardLast4?: string;
}

interface PaymentState {
  cards: PaymentCard[];
  transactions: Transaction[];
  addCard: (card: Omit<PaymentCard, "id">) => void;
  removeCard: (cardId: string) => void;
  setDefaultCard: (cardId: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void;
  getDefaultCard: () => PaymentCard | undefined;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      cards: [],
      transactions: [],

      addCard: (cardData) => {
        const newCard: PaymentCard = {
          ...cardData,
          id: Date.now().toString() + Math.random(),
        };

        set((state) => {
          // If this is the first card, make it default
          const isFirstCard = state.cards.length === 0;

          return {
            cards: [...state.cards, { ...newCard, isDefault: isFirstCard }],
          };
        });
      },

      removeCard: (cardId) => {
        set((state) => {
          const removedCard = state.cards.find(c => c.id === cardId);
          const remainingCards = state.cards.filter(c => c.id !== cardId);

          // If we removed the default card, make the first remaining card default
          if (removedCard?.isDefault && remainingCards.length > 0) {
            remainingCards[0].isDefault = true;
          }

          return { cards: remainingCards };
        });
      },

      setDefaultCard: (cardId) => {
        set((state) => ({
          cards: state.cards.map(card => ({
            ...card,
            isDefault: card.id === cardId,
          })),
        }));
      },

      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: Date.now().toString() + Math.random(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      getDefaultCard: () => {
        return get().cards.find(card => card.isDefault);
      },
    }),
    {
      name: "payment-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
