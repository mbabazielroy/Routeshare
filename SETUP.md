# RouteShare - Environment Setup Guide

Quick setup guide for running RouteShare in different environments.

## Required Environment Variables

Create a `.env` file in the project root with these variables:

```env
# Required - Supabase (Backend)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - Google Maps (for real geocoding)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional - Firebase (for push notifications)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your Project URL and anon key from Settings > API
3. Add them to your `.env` file
4. Run the database migrations (see README.md for SQL)

### 3. Run the App
```bash
bun start
```

## Environment-Specific Notes

### Development (Vibecode)
- Environment variables are set via the ENV tab
- Dev server runs automatically on port 8081
- Hot reload is enabled

### Local Development
- Create `.env` file manually
- Run `bun start` to start Expo dev server
- Use Expo Go app or simulator

### Production Build
- Set environment variables in your CI/CD pipeline
- Use `eas build` for production builds
- Ensure all required variables are set

## Feature Availability by Configuration

| Feature | Required Config |
|---------|----------------|
| Authentication | Supabase |
| Trip Management | Supabase |
| Real-time Updates | Supabase |
| Geocoding | Google Maps API (optional) |
| Push Notifications | Firebase (optional) |

## Offline Mode

The app works offline with these limitations:
- Cached user data is available
- New trips cannot be created
- Changes sync when online

## Troubleshooting

### "Network request failed" errors
- Check your internet connection
- Verify Supabase URL is correct
- Ensure Supabase project is active (not paused)

### Authentication issues
- Verify Supabase anon key is correct
- Check Supabase Auth settings
- For phone auth, configure Twilio in Supabase

### Maps not working
- Google Maps API key is optional
- App uses fallback coordinates without it
- For production, add the API key
