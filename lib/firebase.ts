import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/**
 * Firebase client — optional enhancement, never a single point of failure.
 * If env vars are missing or init fails, all helpers report
 * `configured: false` and the app runs in clearly-labelled local/demo mode.
 */

interface FirebaseHandles {
  configured: boolean;
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
}

let cached: FirebaseHandles | null = null;

export function firebaseRequiredEnv(): string[] {
  const names = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];
  return names.filter((n) => !process.env[n]);
}

export function getFirebase(): FirebaseHandles {
  if (cached) return cached;
  const missing = firebaseRequiredEnv();
  if (missing.length > 0 || getApps().length === 0 && missing.length > 0) {
    cached = { configured: false, app: null, auth: null, db: null, storage: null };
    return cached;
  }
  try {
    const app =
      getApps().length > 0
        ? getApps()[0]!
        : initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
          });
    cached = {
      configured: true,
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    };
  } catch {
    cached = { configured: false, app: null, auth: null, db: null, storage: null };
  }
  return cached;
}

export function isFirebaseConfigured(): boolean {
  return getFirebase().configured;
}

export async function ensureAnonymousAuth(): Promise<string | null> {
  const { auth, configured } = getFirebase();
  if (!configured || !auth) return null;
  try {
    if (auth.currentUser) return auth.currentUser.uid;
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch {
    return null;
  }
}
