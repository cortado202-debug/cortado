import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

// Firebase project configuration for Cortado Cafe
const defaultFirebaseConfig = {
  apiKey: "AIzaSyAz1fSIcUHI729nj8ibVVjVpHew8klKOac",
  authDomain: "cortado-1cedc.firebaseapp.com",
  projectId: "cortado-1cedc",
  storageBucket: "cortado-1cedc.firebasestorage.app",
  messagingSenderId: "42027772389",
  appId: "1:42027772389:web:6a295aece891c62be0670c",
  measurementId: "G-8JBVRC8RSG"
};

const getFirebaseConfig = () => {
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cortado-1cedc.firebaseapp.com",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cortado-1cedc",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cortado-1cedc.firebasestorage.app",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "42027772389",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:42027772389:web:6a295aece891c62be0670c",
      measurementId: "G-8JBVRC8RSG"
    };
  }
  return defaultFirebaseConfig;
};

const activeConfig = getFirebaseConfig();

let app;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
export const googleProvider = new GoogleAuthProvider();
// Force Google to present account selection popup
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

try {
  if (!getApps().length) {
    app = initializeApp(activeConfig);
  } else {
    app = getApp();
  }
  dbInstance = getFirestore(app);
  authInstance = getAuth(app);
} catch (e) {
  console.warn('Firebase initialization running in fallback mode:', e);
}

export const db = dbInstance!;
export const auth = authInstance!;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test connectivity function
export async function testConnection() {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return true;
  } catch (error) {
    console.info("Firestore online mode check result:", error instanceof Error ? error.message : error);
    return false;
  }
}

export async function loginWithGoogle() {
  if (!auth) {
    return {
      uid: 'demo-admin-cortado',
      displayName: 'مدير كورتادو',
      email: 'cortado202@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    } as unknown as User;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    const errCode = (error as { code?: string })?.code || (error instanceof Error ? error.message : String(error));
    
    // Fallback for preview mode with demo placeholder key
    if (
      errCode.includes('auth/invalid-api-key') || 
      errCode.includes('auth/api-key-not-valid') ||
      activeConfig.apiKey.includes('DemoKey')
    ) {
      console.info("Google login running in preview demo fallback mode:", errCode);
      return {
        uid: 'demo-google-user-' + Date.now(),
        displayName: 'مستخدم كورتادو (معاينة)',
        email: 'cortado202@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      } as unknown as User;
    }

    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  if (!auth) {
    return {
      uid: 'demo-' + Date.now(),
      displayName: email.split('@')[0],
      email: email,
    } as unknown as User;
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return credential.user;
  } catch (error: unknown) {
    const errCode = (error as { code?: string })?.code || (error instanceof Error ? error.message : String(error));
    if (
      errCode.includes('auth/invalid-api-key') || 
      errCode.includes('auth/api-key-not-valid') ||
      activeConfig.apiKey.includes('DemoKey')
    ) {
      console.info("Email login running in preview fallback mode:", errCode);
      return {
        uid: 'demo-' + Date.now(),
        displayName: email.split('@')[0],
        email: email,
      } as unknown as User;
    }
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string, name: string) {
  if (!auth) {
    return {
      uid: 'demo-' + Date.now(),
      displayName: name,
      email: email,
    } as unknown as User;
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    if (credential.user) {
      await updateProfile(credential.user, { displayName: name });
    }
    return credential.user;
  } catch (error: unknown) {
    const errCode = (error as { code?: string })?.code || (error instanceof Error ? error.message : String(error));
    if (
      errCode.includes('auth/invalid-api-key') || 
      errCode.includes('auth/api-key-not-valid') ||
      activeConfig.apiKey.includes('DemoKey')
    ) {
      console.info("Email register running in preview fallback mode:", errCode);
      return {
        uid: 'demo-' + Date.now(),
        displayName: name,
        email: email,
      } as unknown as User;
    }
    throw error;
  }
}

export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
}
