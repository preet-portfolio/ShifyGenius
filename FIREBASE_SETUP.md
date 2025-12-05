# Firebase Setup Guide

This guide will help you set up Firebase for authentication and Firestore database in ShiftGenius.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `shiftgenius` (or your preferred name)
4. Disable Google Analytics (optional, you can enable it later)
5. Click "Create project"

## 2. Enable Authentication

1. In the Firebase Console, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Click "Email/Password" → Enable → Save
   - **Google**: Click "Google" → Enable → Save

## 3. Create Firestore Database

1. In the Firebase Console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose your Cloud Firestore location (e.g., `us-central`)
5. Click "Enable"

## 4. Set Up Security Rules

Once Firestore is created, replace the default rules with these:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Organizations collection
    match /organizations/{orgId} {
      // Allow read if user is a member of the organization
      allow read: if request.auth != null &&
                     request.auth.uid in resource.data.memberIds;

      // Allow write if user is the owner
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.ownerId;

      // Employees subcollection
      match /employees/{employeeId} {
        allow read: if request.auth != null &&
                       request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.memberIds;
        allow write: if request.auth != null &&
                        request.auth.uid == get(/databases/$(database)/documents/organizations/$(orgId)).data.ownerId;
      }

      // Shifts subcollection
      match /shifts/{shiftId} {
        allow read: if request.auth != null &&
                       request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.memberIds;
        allow write: if request.auth != null &&
                        request.auth.uid == get(/databases/$(database)/documents/organizations/$(orgId)).data.ownerId;
      }

      // Compliance reports subcollection
      match /complianceReports/{reportId} {
        allow read: if request.auth != null &&
                       request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.memberIds;
        allow create: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.memberIds;
      }
    }
  }
}
```

## 5. Get Firebase Configuration

1. In the Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Register app name: "ShiftGenius Web"
6. Don't check "Also set up Firebase Hosting"
7. Click "Register app"
8. Copy the `firebaseConfig` object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "shiftgenius-xxxxx.firebaseapp.com",
  projectId: "shiftgenius-xxxxx",
  storageBucket: "shiftgenius-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

## 6. Configure Environment Variables

### Local Development

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Fill in your Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=shiftgenius-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=shiftgenius-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=shiftgenius-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx

VITE_API_URL=http://localhost:3000
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_API_URL` (set to your production URL, e.g., `https://shiftgenius.vercel.app`)

4. **Important**: Also add `GEMINI_API_KEY` for the backend API
   - This should only be set in Vercel environment variables, NOT in `.env`

## 7. Test Authentication

1. Start the development server:

```bash
npm run dev
```

2. Navigate to `http://localhost:5173`
3. Click "Get Started Free" or "Sign In"
4. Create a new account with email/password
5. Check Firebase Console → Authentication → Users to see your new user

## 8. Verify Firestore

1. After signing up, check Firebase Console → Firestore Database
2. You should see a new `users` collection with your user document
3. The document should have fields: `uid`, `email`, `displayName`, `role`, `subscriptionTier`, `createdAt`

## 9. Set Up Firestore Indexes (Optional, for future optimization)

As you add more complex queries, you may need composite indexes. Firebase will prompt you with error messages that include direct links to create required indexes.

For now, these basic queries don't require additional indexes.

## 10. Production Checklist

Before going to production:

- [ ] Change Firestore security rules from "test mode" to production rules (shown in Step 4)
- [ ] Enable App Check to protect against abuse
- [ ] Set up monitoring and alerts in Firebase Console
- [ ] Review Firebase pricing and set billing alerts
- [ ] Enable Firebase Analytics (optional)
- [ ] Configure email templates for password reset in Authentication → Templates

## Free Tier Limits

Firebase Free (Spark) Plan includes:
- **Authentication**: Unlimited users
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day, 20K deletes/day
- **Hosting**: 10 GB storage, 360 MB/day bandwidth

This is sufficient for MVP and early customers (up to ~500 active users).

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that `VITE_FIREBASE_API_KEY` is correctly set in `.env`
- Ensure the API key is from the web app configuration (not Android/iOS)

### "Missing or insufficient permissions"
- Check Firestore security rules are properly set
- Ensure user is authenticated before accessing Firestore
- Verify `request.auth.uid` matches the document owner

### "FirebaseError: Firebase: Error (auth/popup-blocked)"
- Browser is blocking the Google sign-in popup
- Allow popups for localhost or your domain
- Alternatively, use redirect instead of popup (modify code in `src/lib/firebase/auth.ts`)

### Environment variables not working
- Ensure `.env` file is in project root (not in `src/`)
- Restart dev server after changing `.env`
- For Vite, all environment variables must be prefixed with `VITE_`

---

**Need Help?**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
