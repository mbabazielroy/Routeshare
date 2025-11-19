# Quick Backend Setup Reference

## 🚀 Fast Track Setup (15 minutes)

### 1. Firebase Setup (5 min)
```bash
# 1. Create Firebase project at console.firebase.google.com
# 2. Enable: Authentication (Email + Phone), Firestore, Storage
# 3. Copy your Firebase config credentials
```

### 2. Install & Configure (5 min)
```bash
# Install Firebase
bun add firebase

# Create .env file
cat > .env << EOF
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EOF

# Add to .gitignore
echo ".env" >> .gitignore
```

### 3. Enable Firebase (2 min)
Edit `src/config/firebase.ts` - uncomment the entire Firebase initialization code (lines 3-30).

### 4. Firestore Security Rules (3 min)
In Firebase Console → Firestore → Rules, paste:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /trips/{tripId} {
      allow read, write: if request.auth != null;
    }
    match /routes/{routeId} {
      allow read, write: if request.auth != null;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Test (2 min)
```bash
# Restart dev server
npx expo start -c

# Test in app - create account and verify it appears in Firebase Console
```

---

## 📝 Key Files to Update

### Required Updates (with Firebase):
1. ✅ `src/config/firebase.ts` - Uncomment initialization
2. 🔄 `src/state/authStore.ts` - Replace with service calls (see full guide)
3. 🔄 `src/state/riderStore.ts` - Replace with Firestore calls (see full guide)
4. 🔄 `src/state/driverStore.ts` - Replace with Firestore calls (see full guide)

### New Files to Create:
- `src/services/authService.ts` - Authentication logic
- `src/services/tripService.ts` - Trip CRUD operations
- `src/services/routeService.ts` - Route CRUD operations
- `src/services/messageService.ts` - Real-time messaging

---

## 🔥 Firebase Collections Structure

```
Firestore Database:
├── users/
│   └── {userId}/
│       ├── firstName: string
│       ├── lastName: string
│       ├── email: string
│       ├── phone: string
│       ├── userType: "rider" | "driver"
│       ├── verificationLevel: string
│       ├── rating: number
│       ├── totalTrips: number
│       └── createdAt: timestamp
│
├── trips/
│   └── {tripId}/
│       ├── riderId: string
│       ├── driverId: string
│       ├── pickup: object
│       ├── dropoff: object
│       ├── fare: number
│       ├── status: string
│       └── createdAt: timestamp
│
├── routes/
│   └── {routeId}/
│       ├── driverId: string
│       ├── origin: object
│       ├── destination: object
│       ├── availableSeats: number
│       ├── status: string
│       └── createdAt: timestamp
│
└── messages/
    └── {messageId}/
        ├── conversationId: string
        ├── senderId: string
        ├── text: string
        └── timestamp: timestamp
```

---

## 🎯 Testing Checklist

After setup, verify these work:

- [ ] Create new user account → Check Firebase Console → Authentication
- [ ] User data saved → Check Firestore → users collection
- [ ] Login works → User loads from Firestore
- [ ] Profile update saves → Check Firestore users document
- [ ] Trip request creates → Check Firestore trips collection
- [ ] Messages send → Check Firestore messages collection

---

## 🐛 Quick Fixes

### Firebase not connecting?
```bash
# 1. Clear Metro cache
npx expo start -c

# 2. Verify .env variables
cat .env

# 3. Check firebase.ts is uncommented
grep -A 5 "const app = initializeApp" src/config/firebase.ts
```

### Firestore permission denied?
```bash
# Update Firestore rules in Firebase Console
# Make sure user is authenticated before accessing data
```

### Real-time updates not working?
```typescript
// Make sure you're using onSnapshot, not getDocs
import { onSnapshot } from 'firebase/firestore';

// Subscribe to updates
const unsubscribe = onSnapshot(doc(db, 'trips', tripId), (doc) => {
  console.log("Current data: ", doc.data());
});

// Don't forget to unsubscribe
return () => unsubscribe();
```

---

## 📚 Next Steps After Basic Setup

1. **Replace Mock Data in Stores**
   - Update authStore to use authService
   - Update riderStore to use tripService
   - Update driverStore to use routeService

2. **Add Real-Time Features**
   - Implement live trip tracking with Firestore listeners
   - Set up message notifications
   - Add driver location updates

3. **Enhance Security**
   - Improve Firestore rules with field-level validation
   - Add rate limiting
   - Implement data validation

4. **Add Payment Integration**
   - Set up Stripe account
   - Install Stripe SDK: `bun add @stripe/stripe-react-native`
   - Create payment backend functions

5. **Production Prep**
   - Enable Firebase App Check
   - Set up error monitoring (Sentry)
   - Configure production Firestore rules
   - Enable Firebase Analytics

---

## 💡 Pro Tips

1. **Use Firestore Emulator for Development**
   ```bash
   firebase emulators:start
   # Point your app to localhost:8080
   ```

2. **Batch Writes for Better Performance**
   ```typescript
   import { writeBatch } from 'firebase/firestore';
   const batch = writeBatch(db);
   // Add multiple operations
   await batch.commit();
   ```

3. **Use Queries Efficiently**
   ```typescript
   // Create indexes in Firebase Console for complex queries
   const q = query(
     collection(db, 'trips'),
     where('riderId', '==', userId),
     where('status', '==', 'completed'),
     orderBy('createdAt', 'desc'),
     limit(20)
   );
   ```

4. **Offline Persistence**
   ```typescript
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   enableIndexedDbPersistence(db).catch((err) => {
     console.error("Persistence error:", err);
   });
   ```

---

## 📞 Need Help?

- **Full Guide:** See `BACKEND_SETUP_GUIDE.md`
- **Firebase Docs:** https://firebase.google.com/docs
- **Firestore Queries:** https://firebase.google.com/docs/firestore/query-data/queries
- **Security Rules:** https://firebase.google.com/docs/firestore/security/get-started

---

## ✨ You're Ready!

Once you complete these steps, your RouteShare app will have:
- ✅ Real user authentication
- ✅ Persistent data storage
- ✅ Real-time messaging
- ✅ Live trip updates
- ✅ Scalable backend infrastructure

**Estimated time to full integration:** 2-3 hours (including testing)
