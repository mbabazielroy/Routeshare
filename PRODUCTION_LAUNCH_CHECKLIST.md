# 🚀 RouteShare Production Launch Checklist

A comprehensive guide to prepare your app for official launch and real users.

---

## 🎯 Phase 1: Critical Infrastructure (Week 1-2)

### ✅ 1. Set Up Supabase Backend
**Status:** Ready to configure
**Priority:** CRITICAL

**Actions:**
1. Create Supabase project at https://supabase.com/dashboard
2. Add credentials to Vibecode ENV tab:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Run database setup SQL from README.md
4. Enable real-time for trips, messages, and routes tables
5. Test authentication flow with real phone number

**Cost:** $0/month (Free tier: 500MB database, 2GB bandwidth)

---

### ✅ 2. Configure Phone Authentication (SMS)
**Status:** Requires setup
**Priority:** CRITICAL

**Provider:** Twilio (Recommended)
**Cost:** $15/month + $0.0075/SMS (Pay as you go)

**Actions:**
1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token
3. In Supabase Dashboard → Authentication → Providers → Phone
4. Add Twilio credentials
5. Test OTP delivery to multiple numbers
6. Set up phone number verification rate limits

**Alternative:** Vonage, AWS SNS (if you need international SMS)

---

### ✅ 3. Payment Processing Setup
**Status:** UI ready, needs integration
**Priority:** CRITICAL

**Provider:** Stripe (Recommended)
**Cost:** 2.9% + $0.30 per transaction

**Actions:**
1. Create Stripe account at https://stripe.com
2. Set up Stripe Connect for driver payouts
3. Install Stripe SDK: `bun add @stripe/stripe-react-native`
4. Create payment intent endpoint (can use Supabase Edge Functions)
5. Update `AddPaymentCardScreen.tsx` with real Stripe card collection
6. Implement PCI-compliant tokenization
7. Test payments in Stripe test mode
8. Enable live payments after testing

**Key Features Needed:**
- Card tokenization (not storing raw card data)
- Payment intents for ride payments
- Stripe Connect for driver payouts
- Refund functionality
- Payment receipts via email

---

### ✅ 4. Maps & Location Services
**Status:** react-native-maps installed
**Priority:** HIGH

**Provider:** Google Maps Platform
**Cost:** $0-$200/month (depends on usage, free tier available)

**Actions:**
1. Enable Google Maps APIs:
   - Maps SDK for iOS
   - Maps SDK for Android
   - Directions API
   - Distance Matrix API
   - Places API (for address autocomplete)
2. Get API key from Google Cloud Console
3. Add to app.json:
   ```json
   "ios": {
     "config": {
       "googleMapsApiKey": "YOUR_IOS_KEY"
     }
   },
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ANDROID_KEY"
       }
     }
   }
   ```
4. Update `TripRequestScreen.tsx` with Places Autocomplete
5. Update matching algorithm with real distance calculations
6. Test route matching accuracy

---

### ✅ 5. Push Notifications
**Status:** UI for settings exists, needs setup
**Priority:** HIGH

**Provider:** Expo Push Notifications (Free)
**Cost:** Free

**Actions:**
1. Already have `expo-notifications` installed
2. Request notification permissions on first launch
3. Store push tokens in Supabase users table
4. Create notification service in `src/services/notifications.ts`
5. Send notifications for:
   - Driver accepts ride
   - Driver arriving (5 min warning)
   - Trip started/completed
   - Messages received
   - Payment confirmations
6. Test on both iOS and Android devices
7. Set up notification categories for iOS (accept/decline actions)

---

## 🛡️ Phase 2: Safety & Legal (Week 2-3)

### ✅ 6. Background Checks (CRITICAL FOR DRIVERS)
**Status:** Not implemented
**Priority:** CRITICAL

**Provider:** Checkr (Recommended)
**Cost:** $35-$50 per check

**Actions:**
1. Sign up at https://checkr.com
2. Integrate Checkr API
3. Create driver verification flow:
   - Driver submits license info
   - Checkr runs background check (criminal, driving record)
   - Manual review of results
   - Approval/rejection notification
4. Require checks every 12 months
5. Store verification status in Supabase

**What to Check:**
- Criminal background (7 years)
- Driving record (3 years)
- Sex offender registry
- National database search

---

### ✅ 7. Insurance & Liability
**Status:** Required before launch
**Priority:** CRITICAL

**Actions:**
1. **Commercial Auto Insurance:**
   - $1M+ liability coverage per trip
   - Talk to insurers: Geico, Progressive, or rideshare-specific (USAA, Farmers)
   - Cost: $150-300/month per driver (you may cover this)

2. **General Liability Insurance:**
   - $2M general liability for your company
   - Covers platform, not individual trips
   - Cost: $500-1,500/year

3. **Cyber Liability Insurance:**
   - Protects user data breaches
   - Cost: $1,000-3,000/year

4. **Legal Documents:**
   - Driver must have personal auto insurance
   - Platform provides excess coverage during trips
   - Clear policy on who's covered when

---

### ✅ 8. Terms of Service & Privacy Policy
**Status:** Referenced but not created
**Priority:** CRITICAL

**Actions:**
1. Hire lawyer specializing in tech/rideshare (or use templates)
2. Create documents covering:
   - **Terms of Service:**
     - User responsibilities
     - Prohibited activities
     - Liability limitations
     - Dispute resolution
     - Account termination
   - **Privacy Policy:**
     - What data you collect
     - How it's used
     - Third-party sharing
     - User rights (GDPR, CCPA compliance)
     - Data retention
3. Add links to Terms/Privacy in app:
   - WelcomeScreen (already shown)
   - Account settings
   - Driver onboarding
4. Implement "accept terms" checkbox during signup
5. Version tracking (notify users of changes)

**Cost:** $500-2,000 (lawyer) or $50-200 (templates from TermsFeed, Iubenda)

---

### ✅ 9. Real-Time Safety Features
**Status:** SOS button exists, needs implementation
**Priority:** HIGH

**Actions:**
1. **911 Integration:**
   - Add emergency call button that dials 911 directly
   - Send location data to emergency contacts via SMS

2. **Trip Sharing:**
   - Already have UI in SafetyScreen
   - Implement real-time trip sharing link
   - Share driver info, vehicle, route, ETA with contacts

3. **Check-In Feature:**
   - Auto-check-in prompts after trip
   - If no response in 10 min, alert emergency contacts

4. **In-App Reporting:**
   - Report driver/rider for safety issues
   - Automatic suspension pending investigation
   - 24/7 safety hotline (phone number for urgent issues)

---

## 📱 Phase 3: App Store Preparation (Week 3-4)

### ✅ 10. Apple App Store Submission
**Status:** Ready for submission
**Priority:** CRITICAL

**Requirements:**
1. **Apple Developer Account:**
   - Cost: $99/year
   - Sign up at https://developer.apple.com

2. **App Store Connect Setup:**
   - Create app listing
   - Add screenshots (6.7" iPhone, 12.9" iPad)
   - Write app description
   - Add keywords for SEO
   - Set age rating (17+ due to rideshare nature)
   - Privacy nutrition label

3. **App Review Preparation:**
   - Provide test account credentials
   - Demo video showing key features
   - Explain rideshare concept clearly
   - Show background check process
   - Prove insurance coverage

4. **Build & Submit:**
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

**Timeline:** 1-3 days review time (first submission may take longer)

---

### ✅ 11. Google Play Store Submission
**Status:** Ready for submission
**Priority:** CRITICAL

**Requirements:**
1. **Google Play Developer Account:**
   - Cost: $25 (one-time)
   - Sign up at https://play.google.com/console

2. **Play Console Setup:**
   - Create app listing
   - Add screenshots (phone, tablet)
   - Write description
   - Set content rating
   - Privacy policy URL

3. **Build & Submit:**
   ```bash
   eas build --platform android --profile production
   eas submit --platform android
   ```

**Timeline:** 1-2 days review time

---

### ✅ 12. App Metadata & Marketing Assets
**Status:** Needs creation
**Priority:** HIGH

**Actions:**
1. **App Icon:**
   - Already have placeholder
   - Create professional icon (1024x1024px)
   - Use Figma or hire designer on Fiverr ($20-50)

2. **Screenshots:**
   - 5-8 screenshots per device size
   - Show key features: trip request, live tracking, safety, earnings
   - Add captions/text overlays
   - Tools: Screenshot Studio, Previewed

3. **App Description:**
   - Short description (80 chars): "Rural rideshare connecting neighbors"
   - Full description (4,000 chars): Highlight benefits, safety, pricing
   - Keywords: rural rideshare, country ride, community transport

4. **Promo Video (Optional but recommended):**
   - 15-30 second demo
   - Show rider and driver flows
   - Upload to App Store/Play Store

---

## 🧪 Phase 4: Testing & Quality Assurance (Week 4)

### ✅ 13. Beta Testing
**Status:** Ready for TestFlight/Internal Testing
**Priority:** HIGH

**Actions:**
1. **iOS TestFlight:**
   - Upload build to TestFlight
   - Invite 10-20 beta testers
   - Collect feedback for 1-2 weeks
   - Fix critical bugs

2. **Android Internal Testing:**
   - Upload to Play Console internal testing track
   - Invite testers
   - Iterate based on feedback

3. **Test Scenarios:**
   - Complete rider flow (10+ test rides)
   - Complete driver flow (10+ test routes)
   - Payment processing (real small amounts)
   - Offline mode behavior
   - Edge cases: cancellations, no-shows, GPS issues

---

### ✅ 14. Performance & Monitoring
**Status:** Needs setup
**Priority:** MEDIUM

**Actions:**
1. **Error Tracking:**
   - Install Sentry: `bun add @sentry/react-native`
   - Track crashes and errors
   - Cost: Free tier (5,000 events/month)

2. **Analytics:**
   - Install Mixpanel or Amplitude
   - Track key events:
     - Sign ups
     - Trip requests
     - Successful matches
     - Payments completed
     - Cancellations
   - Cost: Free tier available

3. **Performance Monitoring:**
   - Already have Expo Insights installed
   - Monitor app load time, screen transitions
   - Check bundle size (keep under 50MB)

---

## 💰 Phase 5: Business Setup (Week 4-5)

### ✅ 15. Legal Business Entity
**Status:** Required before launch
**Priority:** CRITICAL

**Actions:**
1. Form LLC or Corporation
2. Get EIN from IRS
3. Open business bank account
4. Set up accounting (QuickBooks, Wave)
5. Register in states where you operate
6. Get business licenses (check local requirements)

**Cost:** $50-500 (varies by state)

---

### ✅ 16. Driver Onboarding Process
**Status:** Partial UI exists
**Priority:** HIGH

**Actions:**
1. **Create Driver Application:**
   - Personal info
   - Vehicle details
   - Insurance documents
   - Driver license upload
   - Background check consent

2. **Approval Workflow:**
   - Manual review dashboard (can be in Supabase)
   - Automated checks (license expiration, insurance validity)
   - Approval/rejection emails
   - Driver training materials

3. **Onboarding Checklist:**
   - Watch safety video
   - Complete test drive
   - Accept driver terms
   - Set up payout method

---

### ✅ 17. Customer Support
**Status:** Not implemented
**Priority:** HIGH

**Actions:**
1. **Support Channels:**
   - In-app help center (already have HelpCenterScreen)
   - Email: support@routeshare.com
   - Phone: 1-800-XXX-XXXX (Google Voice free, or Twilio $1/month)
   - Hours: Start with business hours, scale to 24/7

2. **Support Tools:**
   - Zendesk, Intercom, or Freshdesk
   - FAQ database
   - Ticket management
   - Cost: $0-49/month

3. **Emergency Hotline:**
   - 24/7 safety line (can outsource)
   - Direct line to 911 dispatcher in severe cases

---

## 🎯 Phase 6: Launch Strategy (Week 5-6)

### ✅ 18. Soft Launch (Beta)
**Status:** Recommended
**Priority:** HIGH

**Strategy:**
1. Launch in ONE small rural town first (population 5,000-20,000)
2. Recruit 10-15 drivers manually (personal outreach)
3. Offer rider incentives:
   - First 3 rides free
   - Refer a friend bonus
4. Collect feedback
5. Fix issues before scaling

**Why Soft Launch:**
- Test real-world matching algorithm
- Understand supply/demand dynamics
- Refine pricing
- Build case studies for marketing

---

### ✅ 19. Marketing & User Acquisition
**Status:** Ready after soft launch
**Priority:** HIGH

**Tactics:**
1. **Local Partnerships:**
   - Churches, community centers
   - Rural hospitals (medical appointments)
   - Schools (student commutes)
   - Employers (shift workers)

2. **Social Media:**
   - Facebook groups for local communities
   - Instagram with user stories
   - TikTok demos

3. **Press & PR:**
   - Local newspapers
   - Rural lifestyle blogs
   - Tech press (TechCrunch, The Verge)

4. **Referral Program:**
   - Rider refers rider: $5 credit each
   - Driver refers driver: $50 bonus after 10 trips

**Budget:** $500-2,000/month to start

---

### ✅ 20. Pricing Strategy
**Status:** Defined in README, needs validation
**Priority:** MEDIUM

**Current Model:**
- Base: $2
- Per mile: $0.80-1.20
- Per minute: $0.15
- Booking fee: $1.50
- Platform fee: 15% (driver keeps 85%)

**Actions:**
1. Test pricing in soft launch
2. Compare to alternatives (gas + time for drivers)
3. A/B test different pricing tiers
4. Consider surge pricing for high demand
5. Offer subscription for frequent riders

---

## 📊 Phase 7: Ongoing Operations

### ✅ 21. Metrics to Track
**Status:** Define now, measure post-launch
**Priority:** HIGH

**Key Metrics:**
1. **User Acquisition:**
   - New riders/week
   - New drivers/week
   - Rider-to-driver ratio (target: 5:1)

2. **Engagement:**
   - Trips per active rider/month
   - Active drivers/week
   - Match rate (% of requests fulfilled)
   - Average time to match (target: <10 min)

3. **Financial:**
   - GMV (Gross Marketplace Volume)
   - Platform revenue (15% commission)
   - Average trip fare
   - CAC (Customer Acquisition Cost)
   - LTV (Lifetime Value)

4. **Quality:**
   - Average rider rating
   - Average driver rating
   - Completion rate (% not cancelled)
   - Safety incidents per 1,000 trips

---

### ✅ 22. Compliance & Ongoing Legal
**Status:** Consult lawyer
**Priority:** HIGH

**Requirements:**
1. **State Regulations:**
   - Some states regulate rideshare specifically
   - May need TCP (Transportation Charter Party) permit
   - Register as TNC (Transportation Network Company)

2. **Taxes:**
   - 1099 for drivers (if they earn >$600/year)
   - Sales tax on service fees (varies by state)
   - Payroll tax if you have employees

3. **Accessibility (ADA Compliance):**
   - Wheelchair-accessible vehicles
   - Service animal policy
   - May be required by law

---

## 💵 Estimated Launch Costs

### One-Time Costs:
| Item | Cost |
|------|------|
| Apple Developer Account | $99 |
| Google Play Account | $25 |
| Legal (Terms, Privacy) | $500-2,000 |
| LLC Formation | $50-500 |
| App Icon/Branding | $50-500 |
| Initial Insurance | $500-1,500 |
| **Total One-Time** | **$1,224 - 4,624** |

### Monthly Costs (First 3 Months):
| Item | Cost/Month |
|------|------------|
| Supabase | $0-25 |
| Twilio (SMS) | $15-50 |
| Stripe Fees | 2.9% of revenue |
| Google Maps API | $0-200 |
| Error Tracking (Sentry) | $0-26 |
| Customer Support | $0-49 |
| Marketing | $500-2,000 |
| Insurance (ongoing) | $100-300 |
| **Total Monthly** | **$615 - 2,650** |

### First Year Total: $8,604 - $36,424

---

## ✅ Priority Action Plan (Next 2 Weeks)

### Week 1:
1. ✅ Set up Supabase (1-2 hours)
2. ✅ Configure Twilio SMS (1 hour)
3. ✅ Form LLC/business entity (1 day)
4. ✅ Draft Terms & Privacy Policy (2-3 days)
5. ✅ Sign up for Stripe (1 hour)

### Week 2:
6. ✅ Integrate Stripe payments (2-3 days)
7. ✅ Set up Google Maps API (1 day)
8. ✅ Configure push notifications (1 day)
9. ✅ Create app store listings (1 day)
10. ✅ Begin beta testing (ongoing)

---

## 🎯 Launch Decision Checklist

Before going live, ensure:
- ✅ Supabase backend fully operational
- ✅ Phone authentication working
- ✅ Stripe payments processing
- ✅ Background checks implemented for drivers
- ✅ Insurance coverage in place
- ✅ Terms of Service & Privacy Policy published
- ✅ SOS and safety features functional
- ✅ Beta testing completed (20+ trips)
- ✅ App Store & Play Store approved
- ✅ Customer support channels ready
- ✅ 10+ drivers recruited in launch town

---

## 📞 Need Help?

This checklist is comprehensive but not exhaustive. Consider consulting:
- **Startup Lawyer:** For legal compliance
- **Insurance Broker:** For rideshare coverage
- **CPA/Accountant:** For tax planning
- **Growth Marketer:** For user acquisition strategy

---

**Next Steps:**
1. Start with Supabase setup (2 hours, free)
2. Test with real backend before committing to paid services
3. Focus on soft launch in one town before scaling
4. Budget $2,000-5,000 for MVP launch (conservative estimate)

Let me know which area you want to tackle first! 🚀
