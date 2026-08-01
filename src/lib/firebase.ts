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

// Default fallback configuration for preview
const defaultFirebaseConfig = {
  apiKey: "AIzaSyDemoKeyForCortadoCoffeePreview2026",
  authDomain: "cortado-coffee-app.firebaseapp.com",
  projectId: "cortado-coffee-app",
  storageBucket: "cortado-coffee-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456789"
};

let app;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let authInstance: ReturnType<typeof getAuth> | null = null;
export const googleProvider = new GoogleAuthProvider();

try {
  if (!getApps().length) {
    app = initializeApp(defaultFirebaseConfig);
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
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string) {
  if (!auth) {
    return {
      uid: 'demo-' + Date.now(),
      displayName: email.split('@')[0],
      email: email,
    } as unknown as User;
  }
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

export async function registerWithEmail(email: string, pass: string, name: string) {
  if (!auth) {
    return {
      uid: 'demo-' + Date.now(),
      displayName: name,
      email: email,
    } as unknown as User;
  }
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (credential.user) {
    await updateProfile(credential.user, { displayName: name });
  }
  return credential.user;
}

export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
}
