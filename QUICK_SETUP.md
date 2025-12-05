# Quick Setup Guide - ShiftGenius

## Step 1: Firebase Setup (5 minutes)

Run the automated setup script:

```bash
./firebase-setup.sh
```

This will:
- ✅ Log you into Firebase
- ✅ Create/select your project
- ✅ Set up Firestore & Authentication
- ✅ Generate your `.env` file
- ✅ Deploy security rules

## Step 2: Clear Browser Cache

The issue you're seeing (dashboard appears instead of landing page) is because:
- Old localStorage data from previous session
- Cached authentication state

**Fix**:
```bash
# Option 1: Open browser in incognito mode
# Visit: http://localhost:5173

# Option 2: Clear browser cache
# Chrome: Cmd+Shift+Delete → Clear all data

# Option 3: Clear specific storage
# Open DevTools (F12) → Application → Local Storage → Clear All
```

## Step 3: Start Development Server

```bash
# Kill any existing servers
killall node

# Start fresh dev server (port 5173, NOT 4173)
npm run dev
```

Then visit: **http://localhost:5173** (NOT 4173)

You should see the landing page with:
- Hero section: "Prevent Overtime Violations Before They Happen"
- "Get Started Free" button
- Features showcase
- Pricing tiers

## Step 4: Test Authentication

1. Click "Get Started Free"
2. Fill in: Name, Email, Password
3. Click "Create account"
4. Should redirect to dashboard
5. Check Firebase Console → Authentication → Users

## Step 5: Test Payment (x402.org)

1. In dashboard, click user menu → "Upgrade"
2. Select "Pro" or "Business" tier
3. Click "Upgrade to Pro"
4. Will redirect to payment page

**Note**: x402.org requires Web Monetization extension:
- Install Coil extension: https://coil.com/
- Or use Stripe as fallback (to be implemented)

## Troubleshooting

### Still seeing dashboard on http://localhost:5173?

```bash
# 1. Check which server is running
lsof -i :5173

# 2. Kill all node processes
killall node

# 3. Clear browser completely
# Incognito mode is best for testing

# 4. Start server
npm run dev

# 5. Visit http://localhost:5173 in incognito
```

### Firebase not configured?

Check `.env` file exists and has all variables:
```bash
cat .env
```

Should show:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:3000
```

### Port 4173 vs 5173?

- **5173** = `npm run dev` (development mode) ✅
- **4173** = `npm run preview` (production build preview) ❌

Always use port 5173 for development!

---

**Next Steps After Setup**:
1. Create your first account
2. Set up your organization (onboarding flow - to be implemented)
3. Add real employees
4. Create a schedule
5. Run AI compliance check
6. Upgrade to Pro tier

