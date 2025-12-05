# 🚀 ShiftGenius - Complete Setup Instructions

## The Problem You're Seeing

You're seeing the **dashboard directly** at `http://localhost:4173` instead of the **landing page**. 

This is happening because:
1. ✅ **Wrong Port**: You're on port `4173` (preview mode) instead of `5173` (dev mode)
2. ✅ **Cached Auth**: Old authentication token in localStorage
3. ❌ **Firebase Not Configured**: Missing credentials in `.env`

## Quick Fix (2 Steps)

### Step 1: Set Up Firebase

```bash
# Run the automated setup script
./firebase-setup.sh
```

This script will:
- Log you into Firebase
- Create/initialize your project 
- Generate your `.env` file with all Firebase credentials
- Deploy Firestore security rules

**Alternative Manual Setup**:
If script fails, follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### Step 2: Restart Dev Server on Correct Port

```bash
# Kill all node processes
killall node

# Start dev server (will run on port 5173)
npm run dev
```

Then open **http://localhost:5173** in **incognito mode** (to avoid cache issues)

You should now see:
- ✅ Landing page with "Prevent Overtime Violations Before They Happen"
- ✅ "Get Started Free" button
- ✅ Features & Pricing sections

## Complete Walkthrough

### 1. Firebase Configuration

```bash
# Navigate to project
cd /Users/preet/Desktop/vscode/ShifyGenius

# Run setup script
./firebase-setup.sh
```

**What it does**:
1. Opens browser for Firebase authentication
2. Prompts you to select/create project
3. Sets up Firestore, Authentication, Hosting
4. Asks for Firebase config values (API key, etc.)
5. Creates `.env` file automatically
6. Deploys security rules

**Your `.env` should look like**:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=shiftgenius.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=shiftgenius
VITE_FIREBASE_STORAGE_BUCKET=shiftgenius.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_API_URL=http://localhost:3000
```

### 2. Clear Browser Cache

**Option A: Incognito Mode** (Recommended)
```
Chrome: Cmd+Shift+N
Firefox: Cmd+Shift+P
Safari: Cmd+Shift+N
```

**Option B: Clear Storage**
```
1. Open DevTools (F12 or Cmd+Option+I)
2. Application tab → Storage → Clear site data
3. Reload page
```

### 3. Start Development Server

```bash
# Make sure you're in the project directory
cd /Users/preet/Desktop/vscode/ShifyGenius

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

**Expected Output**:
```
VITE v5.x.x ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h to show help
```

### 4. Test the App

#### A. Landing Page
Visit: `http://localhost:5173`

You should see:
- Navbar with "Sign In" and "Get Started Free"
- Hero: "Prevent Overtime Violations Before They Happen"
- Features: 8 cards with icons
- Pricing: Free, Pro ($29), Business ($79)
- Footer

#### B. Sign Up
1. Click "Get Started Free"
2. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Create account"
4. Should redirect to `/dashboard`

**Check Firebase**:
- Go to [Firebase Console](https://console.firebase.google.com)
- Click your project
- Authentication → Users
- Should see `test@example.com`

#### C. Dashboard
After signup, you should see:
- Sidebar: Dashboard, Schedule, Team, AI Compliance
- Header: User name, "FREE Tier", Sign Out button
- Dashboard: Stats cards, chart, compliance status
- Demo employees: Alice, Bob, Charlie, etc.

#### D. Payment/Upgrade (x402.org)
1. From dashboard, click user menu
2. Click "Upgrade" (or visit `/upgrade`)
3. See pricing: Pro ($29) and Business ($79)
4. Click "Upgrade to Pro"
5. Creates payment session

**Note**: x402.org requires Web Monetization:
- Install [Coil Extension](https://coil.com/)
- Or we'll add Stripe as fallback

### 5. Verify Everything Works

#### Checklist:
- [ ] Landing page loads at `http://localhost:5173`
- [ ] Can sign up with email/password
- [ ] Redirects to dashboard after signup
- [ ] User appears in Firebase Console → Authentication
- [ ] User profile created in Firebase Console → Firestore → `users`
- [ ] Can sign out (redirects to landing page)
- [ ] Can sign in again
- [ ] Session persists on page refresh

## Troubleshooting

### Issue: Still seeing dashboard on localhost:5173

**Cause**: Cached auth token from previous session

**Fix**:
```bash
# Clear localStorage
1. Open DevTools (F12)
2. Application → Local Storage → http://localhost:5173
3. Right-click → Clear
4. Reload page

# OR use incognito mode
```

### Issue: "Firebase not configured" error

**Cause**: Missing or incorrect `.env` file

**Fix**:
```bash
# Check if .env exists
ls -la .env

# View contents
cat .env

# Should have VITE_FIREBASE_* variables
# If missing, run ./firebase-setup.sh again
```

### Issue: "Cannot find module firebase/app"

**Cause**: Firebase not installed

**Fix**:
```bash
npm install firebase
```

### Issue: Port 5173 already in use

**Cause**: Another dev server running

**Fix**:
```bash
# Find process
lsof -i :5173

# Kill it
kill -9 <PID>

# Or kill all node processes
killall node

# Start fresh
npm run dev
```

### Issue: Routing not working (404 on refresh)

**Cause**: Vite dev server config

**Fix**: Already configured in `vite.config.ts`:
```typescript
server: {
  port: 5173,
  host: '0.0.0.0',
},
```

Should work automatically. If not, restart server.

## What's Next

### Immediate (Required for MVP):
1. ✅ Firebase setup (done via script)
2. ⏳ Create first account
3. ⏳ Organization onboarding (needs implementation)
4. ⏳ Add real employees
5. ⏳ Test AI compliance check
6. ⏳ Test upgrade flow

### Soon (Payment Implementation):
1. Complete x402.org integration
2. Add Stripe as fallback
3. Implement subscription verification
4. Add webhook handlers for payment events
5. Test full payment flow

### Later (Features):
1. Firestore data migration (from localStorage)
2. Organization multi-tenant setup
3. Subscription tier enforcement (free: 5 employees max)
4. Email notifications
5. Mobile responsiveness
6. OpenAI integration

## Additional Resources

- **Firebase Setup**: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Business Model**: [BUSINESS_MODEL.md](./BUSINESS_MODEL.md)
- **Implementation Summary**: [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md)
- **Quick Start**: [QUICK_SETUP.md](./QUICK_SETUP.md)

## Need Help?

Check the logs:
```bash
# Frontend dev server logs
# Should be running in terminal

# Firebase errors
# Check browser DevTools → Console

# Check which servers are running
lsof -i :3000 -i :5173 -i :4173
```

---

**TL;DR**:
1. Run `./firebase-setup.sh`
2. Kill all node: `killall node`
3. Start dev: `npm run dev`
4. Visit `http://localhost:5173` in **incognito mode**
5. Should see landing page, not dashboard

