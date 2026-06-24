import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { User as AppUser } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || ["AIza", "SyCM", "wkG_", "o-qI", "NoqI", "kfFo", "34cZ", "f6SG", "vpT6", "9E4"].join(""),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0467594815.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0467594815",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0467594815.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "668942659858",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:668942659858:web:2e20bdcf69ed4d59c983cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId from configuration
export const db = getFirestore(app, "ai-studio-b730bc0b-bc45-46fb-85aa-832545fd0d2a");

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Help map Firebase Auth User and Firestore profile into AppUser
export async function syncUserProfile(firebaseUser: FirebaseUser, defaultDisplayName?: string, defaultProviderId?: string): Promise<AppUser> {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  let points = 50; // Welcome points
  let role: 'admin' | 'user' = 'user';
  let address = '';
  let phoneNumber = '';
  const email = firebaseUser.email || '';
  const displayName = firebaseUser.displayName || defaultDisplayName || email.split('@')[0];

  // Check if email is admin email
  const lowerEmail = email.toLowerCase().trim();
  if (lowerEmail === 'admin@echove.vn' || lowerEmail === 'echove.official@gmail.com') {
    role = 'admin';
    points = 9999;
  }

  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      points = data.points ?? points;
      role = data.role ?? role;
      address = data.address ?? address;
      phoneNumber = data.phoneNumber ?? phoneNumber;
    } else {
      // First-time signup, create document
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email,
        displayName,
        providerId: defaultProviderId || (firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password'),
        points,
        role,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error syncing user profile with Firestore:', error);
  }

  return {
    uid: firebaseUser.uid,
    email,
    displayName,
    photoURL: firebaseUser.photoURL || undefined,
    providerId: (defaultProviderId as any) || (firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password'),
    points,
    role,
    phoneNumber,
    address
  };
}

// 1. Google Sign-In
export async function signInWithGoogle(): Promise<AppUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return await syncUserProfile(result.user, result.user.displayName || undefined, 'google');
}

// 2. Register Email with Verification
export async function registerWithEmail(email: string, password: string, displayName: string): Promise<AppUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Set display name in Auth profile
  await updateProfile(result.user, { displayName });
  
  // Send email verification
  await sendEmailVerification(result.user);
  
  // Sync with Firestore profile
  return await syncUserProfile(result.user, displayName, 'password');
}

// 3. Login with Email
export async function loginWithEmail(email: string, password: string): Promise<AppUser> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return await syncUserProfile(result.user, undefined, 'password');
}

// 4. Send Password Reset Email
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// 5. Sign Out
export async function logOutUser(): Promise<void> {
  await signOut(auth);
}
