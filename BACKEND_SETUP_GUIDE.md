# Backend Integration Guide - RouteShare

This guide will walk you through connecting your RouteShare app to a real Firebase backend, replacing all mock data with live data persistence.

## 📋 Prerequisites

- Node.js and bun installed
- A Google account for Firebase
- Basic understanding of Firestore database structure

---

## 🔥 Part 1: Firebase Setup (20 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `routeshare` (or your preferred name)
4. Disable Google Analytics (optional for development)
5. Click "Create project"

### Step 2: Register Your App

1. In your Firebase project, click the **iOS** icon (⚛️ for React Native apps)
2. Register app with bundle ID: `com.yourcompany.routeshare`
3. Download `GoogleService-Info.plist` (keep it safe, we'll use it later)
4. Skip the SDK setup steps (we'll do this manually)

### Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable these providers:
   - ✅ **Email/Password** (Enable)
   - ✅ **Phone** (Enable - requires SMS verification setup)
4. For Phone authentication:
   - Add test phone numbers for development (Settings → Test phone numbers)
   - Example: `+1 650-555-1234` with code `123456`

### Step 4: Enable Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select your region (choose closest to your users)
4. Click **Enable**

### Step 5: Enable Storage

1. Go to **Storage** → **Get started**
2. Start in **test mode**
3. Click **Done**

### Step 6: Get Firebase Config

1. Go to **Project settings** (gear icon) → **General**
2. Scroll to "Your apps" section
3. Click on your app
4. Copy the **firebaseConfig** object - you'll need these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

---

## 📦 Part 2: Install Dependencies

### Step 1: Install Firebase SDK

```bash
cd /home/user/workspace
bun add firebase
```

### Step 2: Install Additional Dependencies (if needed)

```bash
# For image uploads
bun add expo-image-picker

# For file system access
bun add expo-file-system
```

---

## 🔐 Part 3: Configure Environment Variables

### Step 1: Create .env File

Create a `.env` file in the root directory:

```bash
touch .env
```

### Step 2: Add Your Firebase Credentials

Add the following to `.env` (replace with your actual values):

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=routeshare-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=routeshare-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=routeshare-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:ios:xxxxxxxxxxxxx
```

### Step 3: Add .env to .gitignore

Make sure `.env` is in your `.gitignore`:

```bash
echo ".env" >> .gitignore
```

---

## 🔧 Part 4: Enable Firebase in Your App

### Step 1: Update Firebase Config

Edit `src/config/firebase.ts` and uncomment the Firebase initialization:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

Remove or comment out the mock exports at the bottom.

---

## 🗄️ Part 5: Set Up Firestore Collections

### Step 1: Create Firestore Security Rules

In Firebase Console → Firestore Database → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Trips collection
    match /trips/{tripId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.riderId ||
         request.auth.uid == resource.data.driverId);
    }

    // Routes collection
    match /routes/{routeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.driverId;
    }

    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

Click **Publish** to apply the rules.

### Step 2: Create Initial Collections

You can do this manually in Firebase Console or programmatically. In Firestore:

1. Create collection: `users`
2. Create collection: `trips`
3. Create collection: `routes`
4. Create collection: `messages`

---

## 💾 Part 6: Update Authentication Store

### Step 1: Create Firebase Auth Service

Create `src/services/authService.ts`:

```typescript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserType } from '../types/routeshare';

export const authService = {
  // Register new user
  async register(
    email: string,
    password: string,
    userData: {
      firstName: string;
      lastName: string;
      phone: string;
      userType: UserType;
    }
  ): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user: User = {
      id: userCredential.user.uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: email,
      phone: userData.phone,
      userType: userData.userType,
      verificationLevel: 'basic',
      rating: 5.0,
      totalTrips: 0,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    await setDoc(doc(db, 'users', user.id), user);

    return user;
  },

  // Login
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  },

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    await setDoc(doc(db, 'users', userId), updates, { merge: true });
  },
};
```

### Step 2: Update Auth Store

Edit `src/state/authStore.ts`:

```typescript
import { create } from "zustand";
import { User, UserType } from "../types/routeshare";
import { authService } from "../services/authService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  register: (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    phone: string;
    userType: UserType;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false, error: null });
  },

  register: async (email, password, userData) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.register(email, password, userData);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;

    try {
      await authService.updateProfile(user.id, updates);
      set({ user: { ...user, ...updates } });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  initializeAuth: () => {
    authService.onAuthStateChange((user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      });
    });
  },
}));

// Initialize auth listener when app starts
useAuthStore.getState().initializeAuth();
```

---

## 🚗 Part 7: Update Trip & Route Services

### Step 1: Create Trip Service

Create `src/services/tripService.ts`:

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trip, TripRequest } from '../types/routeshare';

export const tripService = {
  // Create trip request
  async createTripRequest(request: Omit<TripRequest, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...request,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Update trip status
  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
    await updateDoc(doc(db, 'trips', tripId), updates);
  },

  // Get user trips
  async getUserTrips(userId: string, userType: 'rider' | 'driver'): Promise<Trip[]> {
    const field = userType === 'rider' ? 'riderId' : 'driverId';
    const q = query(collection(db, 'trips'), where(field, '==', userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Trip[];
  },

  // Listen to trip updates
  subscribeToTrip(tripId: string, callback: (trip: Trip) => void) {
    return onSnapshot(doc(db, 'trips', tripId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Trip);
      }
    });
  },
};
```

### Step 2: Create Route Service

Create `src/services/routeService.ts`:

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Route } from '../types/routeshare';

export const routeService = {
  // Publish route
  async publishRoute(route: Omit<Route, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'routes'), {
      ...route,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Find matching routes
  async findMatchingRoutes(
    pickup: { latitude: number; longitude: number },
    dropoff: { latitude: number; longitude: number },
    passengers: number
  ): Promise<Route[]> {
    // For now, get all active routes with enough seats
    const q = query(
      collection(db, 'routes'),
      where('status', '==', 'active'),
      where('availableSeats', '>=', passengers)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Route[];
  },

  // Get driver routes
  async getDriverRoutes(driverId: string): Promise<Route[]> {
    const q = query(collection(db, 'routes'), where('driverId', '==', driverId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Route[];
  },

  // Update route
  async updateRoute(routeId: string, updates: Partial<Route>): Promise<void> {
    await updateDoc(doc(db, 'routes', routeId), updates);
  },
};
```

---

## 💬 Part 8: Set Up Real-Time Messaging

### Step 1: Create Message Service

Create `src/services/messageService.ts`:

```typescript
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: any;
}

export const messageService = {
  // Send message
  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    await addDoc(collection(db, 'messages'), {
      conversationId,
      senderId,
      text,
      timestamp: Timestamp.now(),
    });
  },

  // Subscribe to messages
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ) {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages);
    });
  },
};
```

### Step 2: Update InAppMessagingScreen

Edit `src/screens/InAppMessagingScreen.tsx` to use the message service:

```typescript
import { messageService } from "../services/messageService";
import { useAuthStore } from "../state/authStore";

// In your component:
const user = useAuthStore((s) => s.user);
const { conversationId } = route.params;

useEffect(() => {
  if (!conversationId) return;

  const unsubscribe = messageService.subscribeToMessages(
    conversationId,
    (newMessages) => {
      const formattedMessages = newMessages.map(msg => ({
        id: msg.id,
        text: msg.text,
        sentBy: msg.senderId === user?.id ? 'me' : 'other',
        timestamp: new Date(msg.timestamp.toDate()).toLocaleTimeString(),
      }));
      setMessages(formattedMessages);
    }
  );

  return () => unsubscribe();
}, [conversationId]);

const handleSend = async () => {
  if (inputText.trim() && user) {
    await messageService.sendMessage(conversationId, user.id, inputText.trim());
    setInputText("");
  }
};
```

---

## 🧪 Part 9: Testing Your Backend Connection

### Step 1: Test Authentication

1. Restart your app development server
2. Try to create a new account
3. Check Firebase Console → Authentication to see the new user
4. Check Firestore → users collection for user data

### Step 2: Test Trip Creation

1. Create a trip request in the app
2. Check Firestore → trips collection
3. Verify all data is saved correctly

### Step 3: Test Real-Time Updates

1. Open the app on two devices/simulators
2. Send a message from one device
3. Verify it appears on the other device instantly

---

## 🔒 Part 10: Security Checklist

Before launching to production:

- [ ] Update Firestore rules from test mode to production
- [ ] Set up proper authentication flows
- [ ] Add rate limiting for API calls
- [ ] Implement data validation
- [ ] Set up Firebase App Check
- [ ] Enable Firebase Analytics
- [ ] Set up crash reporting
- [ ] Configure backup schedules
- [ ] Add proper error handling throughout app
- [ ] Test all features thoroughly

---

## 🐛 Troubleshooting

### Issue: "Firebase not initialized"
**Solution:** Make sure you uncommented the Firebase config and restarted the dev server.

### Issue: "Permission denied" in Firestore
**Solution:** Check your Firestore security rules and make sure the user is authenticated.

### Issue: Environment variables not loading
**Solution:**
1. Make sure `.env` is in the root directory
2. Restart the Metro bundler completely
3. Clear cache: `npx expo start -c`

### Issue: Messages not updating in real-time
**Solution:** Verify you're subscribed to the collection and the conversationId is correct.

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Native Firebase Guide](https://rnfirebase.io/)
- [Expo with Firebase](https://docs.expo.dev/guides/using-firebase/)

---

## ✅ Success Checklist

After following this guide, you should have:

- [x] Firebase project created and configured
- [x] Authentication working
- [x] Firestore collections set up
- [x] Real-time messaging functional
- [x] Trip and route data persisting
- [x] All mock data replaced with live data

---

## 🎉 You're Done!

Your RouteShare app is now connected to a real backend! All user data, trips, routes, and messages will persist across sessions and sync in real-time across devices.

For questions or issues, refer to the Firebase documentation or check the Firestore console for data verification.
