import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const requiredKeys: Record<string, string> = {
  EXPO_PUBLIC_FIREBASE_API_KEY: extra.firebaseApiKey,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: extra.firebaseAuthDomain,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: extra.firebaseProjectId,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: extra.firebaseStorageBucket,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: extra.firebaseMessagingSenderId,
  EXPO_PUBLIC_FIREBASE_APP_ID: extra.firebaseAppId,
};

const missingKeys = Object.entries(requiredKeys)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase environment variables:\n${missingKeys.join('\n')}\n\nCopy .env.example to .env.local and fill in the values.`
  );
}

const firebaseConfig = {
  apiKey: extra.firebaseApiKey as string,
  authDomain: extra.firebaseAuthDomain as string,
  projectId: extra.firebaseProjectId as string,
  storageBucket: extra.firebaseStorageBucket as string,
  messagingSenderId: extra.firebaseMessagingSenderId as string,
  appId: extra.firebaseAppId as string,
};

// Capture BEFORE initializeApp so the flag is correct on hot-reload
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// On web use browser localStorage; on native use AsyncStorage.
// initializeAuth() must only be called once — on hot-reload getAuth() retrieves
// the already-registered instance.
const persistence = Platform.OS === 'web'
  ? browserLocalPersistence
  : getReactNativePersistence(AsyncStorage);

export const auth = isFirstInit
  ? initializeAuth(app, { persistence })
  : getAuth(app);

export const db = getFirestore(app);

// Maps Firebase Auth error codes to user-facing messages.
// Keeps internal Firebase details out of the UI.
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
