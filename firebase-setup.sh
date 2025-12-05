#!/bin/bash

# ShiftGenius Firebase Setup Script
# Run this script to automatically set up Firebase for your project

set -e

echo "🚀 ShiftGenius Firebase Setup"
echo "================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI installed: $(firebase --version)"
echo ""

# Login to Firebase
echo "📝 Logging in to Firebase..."
echo "   A browser window will open for authentication."
firebase login

# Initialize Firebase project
echo ""
echo "🔧 Initializing Firebase project..."
echo "   Please select the following when prompted:"
echo "   - Features: Firestore, Authentication, Hosting"
echo "   - Use existing project or create new one: shiftgenius"
echo "   - Firestore rules: firestore.rules"
echo "   - Firestore indexes: firestore.indexes.json"
echo "   - Public directory: dist"
echo "   - Single-page app: Yes"
echo ""

firebase init

# Get project configuration
echo ""
echo "📋 Fetching Firebase configuration..."
PROJECT_ID=$(firebase use | grep -o 'Now using.*' | awk '{print $4}')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Could not detect project ID. Please run 'firebase use' and try again."
    exit 1
fi

echo "✅ Using Firebase project: $PROJECT_ID"

# Create .env file
echo ""
echo "📝 Creating .env file..."
echo "   Please go to Firebase Console and get your web app config:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
echo ""
echo "   Click 'Add app' → Web → Copy the firebaseConfig object"
echo ""
read -p "Press ENTER when you have the config ready..."

echo ""
echo "Enter your Firebase configuration values:"
echo ""

read -p "API Key (apiKey): " API_KEY
read -p "Auth Domain (authDomain): " AUTH_DOMAIN
read -p "Project ID (projectId): " PROJECT_ID_INPUT
read -p "Storage Bucket (storageBucket): " STORAGE_BUCKET
read -p "Messaging Sender ID (messagingSenderId): " MESSAGING_SENDER_ID
read -p "App ID (appId): " APP_ID

cat > .env << EOF
# Firebase Configuration
VITE_FIREBASE_API_KEY=$API_KEY
VITE_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=${PROJECT_ID_INPUT:-$PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=$MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=$APP_ID

# API Configuration
VITE_API_URL=http://localhost:3000
EOF

echo ""
echo "✅ .env file created successfully!"

# Deploy Firestore rules
echo ""
echo "🔒 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo ""
echo "📇 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

echo ""
echo "======================================"
echo "✅ Firebase setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Visit http://localhost:5173"
echo "3. Click 'Get Started Free' to create an account"
echo ""
echo "Your Firebase project: https://console.firebase.google.com/project/$PROJECT_ID"
echo "======================================"
