import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  organizationId: string | null;
  role: 'owner' | 'manager' | 'employee';
  createdAt: Date;
  subscriptionTier: 'free' | 'pro' | 'business' | 'enterprise';
}

/**
 * Create new user account with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update profile with display name
  await updateProfile(user, { displayName });

  // Create user profile in Firestore
  await createUserProfile(user, displayName);

  return user;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  // Check if user profile exists, create if not
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    await createUserProfile(user, user.displayName || 'User');
  }

  return user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Create user profile in Firestore
 */
async function createUserProfile(user: User, displayName: string): Promise<void> {
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName,
    organizationId: null, // Will be set when user creates/joins organization
    role: 'owner', // Default role, will be owner when they create an org
    createdAt: new Date(),
    subscriptionTier: 'free', // All users start on free tier
  };

  await setDoc(doc(db, 'users', user.uid), {
    ...userProfile,
    createdAt: serverTimestamp(),
  });
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as UserProfile;
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
