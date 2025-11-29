# Google Maps API Integration Guide

**Status:** ✅ Code Integrated | ⚠️ API Key Required

The RouteShare app now uses **real Google Maps Geocoding and Directions APIs** instead of mock coordinate generation. This provides accurate location data, distances, and route calculations.

---

## What Was Changed

### 1. PublishRouteScreen (Driver)
**Before:** Used hash-based coordinate generation
**After:** Real geocoding via Google Maps API

**Flow:**
1. Driver enters origin and destination addresses
2. App geocodes both addresses to get real lat/lng coordinates
3. App calculates actual driving route with distance and duration
4. Route published with accurate data to Supabase

**Code:** `/src/screens/PublishRouteScreen.tsx`

### 2. TripRequestScreen (Rider)
**Before:** Used hash-based coordinate generation
**After:** Real geocoding via Google Maps API

**Flow:**
1. Rider enters pickup and dropoff addresses
2. App geocodes both addresses to get real lat/lng coordinates
3. Searches for matching driver routes based on real locations

**Code:** `/src/screens/TripRequestScreen.tsx`

### 3. User Feedback
- ✅ Loading states during geocoding (spinner + "Publishing..." / "Searching...")
- ✅ Toast error messages if geocoding fails
- ✅ Success confirmation on route publish

---

## Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Go to **APIs & Services** → **Library**
4. Enable the following APIs:
   - **Geocoding API** (required)
   - **Directions API** (required)
   - **Places API** (optional, for future autocomplete)
5. Go to **APIs & Services** → **Credentials**
6. Click **Create Credentials** → **API Key**
7. Copy the API key

### Step 2: Restrict API Key (Security)

**Important:** Restrict your API key to prevent unauthorized use!

1. Click on your API key to edit it
2. Under **Application restrictions**:
   - Select "HTTP referrers (web sites)" for web
   - Select "Android apps" for Android (add package name)
   - Select "iOS apps" for iOS (add bundle ID)
3. Under **API restrictions**:
   - Select "Restrict key"
   - Check: Geocoding API, Directions API, Places API
4. Save

### Step 3: Add API Key to Environment

Add to your `.env` file:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important:** Make sure `.env` is in your `.gitignore`!

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
bun start
```

The app will now use real Google Maps geocoding!

---

## How It Works

### Geocoding Flow

```typescript
// User enters: "123 Main St, San Francisco, CA"
const coords = await geocodeAddress("123 Main St, San Francisco, CA");
// Returns: { lat: 37.7749, lng: -122.4194 }
```

### Route Calculation Flow

```typescript
const origin = { lat: 37.7749, lng: -122.4194 };
const destination = { lat: 37.3382, lng: -121.8863 };

const routeInfo = await getRoute(origin, destination);
// Returns: { distance: 42.5, duration: 48, polyline: "..." }
// distance in miles, duration in minutes
```

### Fallback Behavior

**If API key is NOT configured:**
- Geocoding returns mock coordinates (San Francisco: 37.7749, -122.4194)
- Route calculation uses Haversine formula for distance estimate
- **Warning logged:** "Google Maps API key not configured"

**If geocoding fails (invalid address):**
- Toast error shown to user: "Could not find location. Please check the address."
- User can correct the address and try again

---

## API Usage & Costs

### Geocoding API
- **Cost:** $5 per 1,000 requests
- **Free tier:** $200/month credit (~40,000 requests)
- **Usage:** 2 requests per route publish, 2 per trip request

### Directions API
- **Cost:** $5 per 1,000 requests
- **Free tier:** $200/month credit (~40,000 requests)
- **Usage:** 1 request per route publish

### Monthly Estimate
- 1,000 drivers publish routes: 3,000 API calls = $15
- 5,000 riders search: 10,000 API calls = $50
- **Total:** ~$65/month (well within free tier for MVP)

---

## Testing

### Test Without API Key (Fallback Mode)

1. Don't set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
2. App will use mock coordinates
3. Check logs for: "Google Maps API key not configured"

### Test With API Key (Production Mode)

1. Set API key in `.env`
2. Restart server
3. **Driver test:**
   - Go to "Publish a Route"
   - Enter real addresses (e.g., "San Francisco, CA" → "San Jose, CA")
   - Should see real distance (e.g., 48.2 miles) and duration (e.g., 52 minutes)
4. **Rider test:**
   - Go to "Request a Ride"
   - Enter real addresses
   - Should match with real driver routes based on actual locations

### Verify in Logs

```
LOG  Geocoding origin: San Francisco, CA
LOG  Geocoding destination: San Jose, CA
LOG  Calculating route...
LOG  Route calculated: { distance: 48.2, duration: 52 }
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "API key not configured" | Missing env variable | Add `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` |
| "Geocoding API error: REQUEST_DENIED" | API not enabled | Enable Geocoding API in Cloud Console |
| "Could not find location" | Invalid address | User enters valid address |
| "Directions API error: OVER_QUERY_LIMIT" | Quota exceeded | Upgrade plan or optimize usage |

### User-Facing Messages

All errors show clear Toast messages:
- ❌ "Could not find origin location. Please check the address."
- ❌ "Could not find destination. Please check the address."
- ❌ "Failed to publish route. Please try again."
- ❌ "Failed to search for rides. Please try again."

---

## Production Checklist

Before launching:

- [ ] API key configured in production environment
- [ ] API key restricted to your app (bundle ID/package name)
- [ ] API restrictions enabled (only Geocoding, Directions, Places)
- [ ] Billing account set up in Google Cloud Console
- [ ] Budget alerts configured ($50, $100, $200)
- [ ] Monitor usage in Google Cloud Console
- [ ] Test on real devices with various addresses
- [ ] Verify distance/duration calculations are accurate
- [ ] Check error handling with invalid addresses

---

## Future Enhancements

### Phase 2: Autocomplete (Recommended)

Add Google Places Autocomplete for better UX:

```typescript
// src/components/AddressAutocomplete.tsx
const suggestions = await searchPlaces(userInput);
// Shows dropdown of address suggestions as user types
```

**Benefits:**
- Fewer geocoding errors (users select valid addresses)
- Better UX (faster input)
- More accurate matching

### Phase 3: Real-time ETA

Calculate live ETAs based on current traffic:

```typescript
const eta = await calculateETA(driverLocation, riderPickup);
// Returns ETA in minutes considering traffic
```

---

## Support

**Issues with Google Maps API?**
- Check [Google Maps Platform Status](https://status.cloud.google.com/)
- Review [Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)
- Review [Directions API Docs](https://developers.google.com/maps/documentation/directions)

**Still having problems?**
- Check `expo.log` for detailed error messages
- Verify API key has proper restrictions
- Ensure billing is enabled (required even for free tier)

---

## Summary

✅ **Implemented:** Real Google Maps geocoding and route calculation
✅ **User Feedback:** Loading states and error messages
✅ **Fallback:** Works without API key (for development)
⚠️ **Required:** API key for production use
📊 **Cost:** ~$65/month for 1K drivers + 5K riders (within free tier)

**Next Step:** Add your API key to `.env` and test with real addresses!
