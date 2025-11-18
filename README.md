# RouteShare - Rural Ride-Sharing Platform

RouteShare is a mobile-first ride-sharing platform designed specifically for rural and underserved areas where traditional ride-hailing services like Uber and Lyft don't operate. Unlike traditional ride-share apps that dispatch drivers, RouteShare connects riders with drivers who are already traveling in the same direction.

## 🚗 App Concept

**Mission:** Connect rural communities by matching riders with local drivers heading the same way, creating sustainable, community-based transportation.

**Key Differentiators:**
- Direction-matching algorithm (not dispatch-based)
- Optimized for low-bandwidth/offline scenarios
- Community trust and verification system
- Fair pricing that supplements driver income without requiring dedicated driving

## 📱 Features Implemented

### For Riders
- **Trip Request Flow:** Enter pickup and destination, view matched drivers
- **Driver Selection:** See driver profiles, ratings, vehicle info, and estimated fares
- **Live Trip Tracking:** Real-time GPS tracking with driver location simulation
- **Saved Locations:** Quick access to frequently visited places (Home, Work)
- **Trip History:** View past rides and driver ratings
- **Safety Features:** In-app calling, SOS button, trip cancellation

### For Drivers
- **Route Publishing:** Share your planned route and available seats
- **Earnings Dashboard:** Track daily, weekly, monthly, and total earnings
- **Rider Requests:** Accept or decline riders along your route
- **Online/Offline Toggle:** Control when you're available for rides
- **Stats Tracking:** Total trips, rating, and lifetime earnings

### Core Technology
- **Smart Matching Algorithm:** Finds drivers traveling the same direction with minimal detour
- **GPS Simulation:** Realistic driver location updates during trips
- **State Management:** Zustand with AsyncStorage persistence
- **Beautiful UI:** Steve Jobs-inspired design with NativeWind/Tailwind styling

## 🏗️ Project Structure

```
/home/user/workspace/
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx    # Main app navigation
│   │   └── types.ts              # Navigation type definitions
│   ├── screens/
│   │   ├── WelcomeScreen.tsx              # Onboarding splash
│   │   ├── UserTypeSelectionScreen.tsx    # Choose rider or driver
│   │   ├── RiderHomeScreen.tsx            # Rider dashboard
│   │   ├── TripRequestScreen.tsx          # Request a ride
│   │   ├── DriverSelectionScreen.tsx      # Browse available drivers
│   │   ├── LiveTripScreen.tsx             # GPS tracking during trip
│   │   ├── DriverHomeScreen.tsx           # Driver dashboard
│   │   ├── PublishRouteScreen.tsx         # Share your route
│   │   └── TripRatingScreen.tsx           # Rate your ride
│   ├── state/
│   │   ├── authStore.ts          # User authentication state
│   │   ├── riderStore.ts         # Rider trip management
│   │   └── driverStore.ts        # Driver route and earnings
│   ├── types/
│   │   └── routeshare.ts         # TypeScript interfaces
│   └── utils/
│       └── mockData.ts           # Demo drivers and routes
├── App.tsx                       # App entry point
└── RURAL_RIDESHARE_CONCEPT.md   # Complete product specification
```

## 🎯 User Flows

### Rider Flow
1. **Welcome** → Select "I need a ride"
2. **Enter Details** → First name, last name, phone
3. **Rider Home** → Tap "Where to?"
4. **Request Trip** → Enter pickup/destination, select passengers
5. **Select Driver** → Browse matched drivers, view profiles and fares
6. **Live Tracking** → Watch driver approach on map, call/message
7. **Trip Complete** → Rate driver, return to home

### Driver Flow
1. **Welcome** → Select "I am a driver"
2. **Enter Details** → First name, last name, phone
3. **Driver Home** → Toggle online, view earnings
4. **Publish Route** → Set origin, destination, seats, departure time
5. **Accept Riders** → Review requests, accept or decline
6. **Complete Trip** → Finish ride, earnings automatically updated

## 🔧 Technical Stack

- **Framework:** Expo SDK 53 with React Native 0.76.7
- **Navigation:** React Navigation 7 (Native Stack, Bottom Tabs)
- **State Management:** Zustand with AsyncStorage
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Maps:** react-native-maps with Mapbox
- **Icons:** @expo/vector-icons (Ionicons)
- **TypeScript:** Fully typed for safety

## 🚀 How to Test

### As a Rider
1. Open the app → Tap "Get Started"
2. Select "I need a ride"
3. Enter your name and phone (e.g., "John Doe", "+1234567890")
4. On home screen, tap the search box "Where to?"
5. Enter any pickup and destination addresses
6. Tap "Find Rides" → Wait 1.5 seconds for matching
7. See 3 matched drivers with ratings, vehicles, and fares
8. Tap "Request Ride" on any driver
9. Watch the live map as the driver approaches (simulated GPS)
10. Driver automatically arrives and completes the trip
11. Rate your driver (1-5 stars)

### As a Driver
1. Open the app → Tap "Get Started"
2. Select "I am a driver"
3. Enter your name and phone
4. Toggle online (green badge appears)
5. Tap "Publish a Route"
6. Select departure time (now or later) and available seats
7. Tap "Publish Route"
8. Wait 3 seconds → You'll receive a rider request
9. View pending request notification on home screen
10. See earnings update as you complete trips

## 💡 Key Features & Design Decisions

### Smart Matching Algorithm
```typescript
// Factors considered:
- Route similarity (detour < 10% of driver's total distance)
- Time window overlap
- Driver and rider ratings
- Vehicle capacity
- Community connections
- Match score: 85-100% (higher = better match)
```

### GPS Tracking Simulation
- Driver location updates every 2 seconds
- Moves incrementally toward pickup location
- Automatic trip progression (accepted → arriving → in progress → complete)
- Realistic map rendering with markers and polylines

### Earnings Model
- Platform takes 15% commission
- Drivers earn 85% of fare
- Fare calculation: Base ($2) + Per Mile ($0.80-1.20) + Per Minute ($0.15) + Booking Fee ($1.50)
- Example: 25-mile, 30-min trip = $33.00 (Rider pays) / $28.05 (Driver earns) / $4.95 (Platform)

### UI/UX Philosophy
- **Large touch targets** (minimum 44pt) for rural users
- **High contrast** for sunlight readability
- **Minimal text entry** (saved locations, dropdowns)
- **Offline indicators** for connectivity status
- **Clean, intuitive** Apple Human Interface Guidelines

## 📊 Mock Data

The app includes realistic demo data:
- **3 Drivers:** John Davis (4.9★), Sarah Mitchell (5.0★), Robert Thompson (4.8★)
- **3 Routes:** Various distances (15-22 miles) and durations (20-30 min)
- **Saved Locations:** Home and Work addresses
- **Earnings:** $67.50 today, $285.00 this week, $3,240.50 lifetime

## 🎨 Design System

### Colors
- **Primary:** Blue 600 (#2563eb)
- **Success:** Green 600 (#16a34a)
- **Warning:** Yellow 500 (#eab308)
- **Danger:** Red 600 (#dc2626)
- **Neutral:** Gray 50-900

### Typography
- **Headings:** Bold, 24-32pt
- **Body:** Regular/Medium, 14-16pt
- **Captions:** Regular, 12pt

### Components
- **Rounded corners:** 12-24px for cards and buttons
- **Shadows:** Subtle elevation for depth
- **Icons:** Ionicons from @expo/vector-icons

## 🔮 Future Enhancements (Not Yet Implemented)

### Phase 2 Features
- [ ] Recurring routes (daily commutes)
- [ ] Scheduled trips (book 24+ hours ahead)
- [ ] SMS fallback notifications
- [ ] Background checks integration (Checkr)
- [ ] ID verification (Persona/Onfido)
- [ ] Payment processing (Stripe Connect)
- [ ] In-app messaging
- [ ] Community verification badges

### Phase 3 Features
- [ ] Carpool groups (coworkers, church members)
- [ ] Offline mode with queue sync
- [ ] Advanced analytics for drivers
- [ ] B2B partnerships (healthcare, employers)
- [ ] Multi-language support
- [ ] Wheelchair-accessible vehicle tags

## 📈 Success Metrics

### MVP Goals
- ✅ Complete rider flow (request → select → track → rate)
- ✅ Complete driver flow (publish → accept → earn)
- ✅ Beautiful, intuitive UI
- ✅ GPS tracking simulation
- ✅ Matching algorithm demo

### Real-World KPIs (When Live)
- **User Acquisition:** New users per month (riders, drivers)
- **Engagement:** Trips per active user per month
- **Marketplace Health:** Supply-demand ratio, match rate
- **Revenue:** GMV (Gross Marketplace Volume), platform fees
- **Quality:** Average rating, completion rate, safety incidents

## 🛡️ Safety Considerations

### Current Demo
- Community verified badges
- Driver ratings (4.8-5.0★)
- In-app calling capability
- SOS button placeholder
- Trip cancellation

### Production Requirements
- Comprehensive background checks (criminal, driving records)
- $1M+ commercial insurance per trip
- Real-time GPS tracking with anomaly detection
- 24/7 safety hotline
- Two-way ratings and blocking

## 📄 Full Product Documentation

For the complete product specification including:
- Business model and monetization
- System architecture
- Legal and regulatory considerations
- Marketing strategy
- Development roadmap (MVP → Scale)
- Competitive analysis

**See:** [RURAL_RIDESHARE_CONCEPT.md](./RURAL_RIDESHARE_CONCEPT.md)

## 🐛 Known Issues

- **react-native-maps TypeScript Error:** Compatibility issue with React 19. Does not affect functionality.

## 🙏 Acknowledgments

Built with Vibecode - AI-powered mobile app development platform.

---

**Ready to test?** Open the app on your phone through the Vibecode app and experience rural ride-sharing!
