import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, User, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_6C_jVMexpHKTJ_Momt4mTjeH_qISiyk",
  authDomain: "adix-media.firebaseapp.com",
  projectId: "adix-media",
  storageBucket: "adix-media.firebasestorage.app",
  messagingSenderId: "1054370758642",
  appId: "1:1054370758642:web:a5f893d111b5b49039356b",
  measurementId: "G-K8SMM80RYN"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, signInAnonymously, doc, setDoc, getDoc, onSnapshot };
export type { User };

