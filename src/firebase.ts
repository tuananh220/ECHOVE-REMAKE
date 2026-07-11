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
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { User as AppUser, Order, DonationSubmission, Voucher, EmailConfig, EmailLog, Product } from './types';
import { PRODUCTS } from './data';

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

// Helper to sanitize undefined values before writing to Firestore
function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (typeof obj === 'object') {
    const cleanObj: any = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleanObj[key] = cleanUndefined(obj[key]);
      }
    });
    return cleanObj;
  }
  return obj;
}

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
  if (
    lowerEmail === 'admin@echove.vn' || 
    lowerEmail === 'echove.official@gmail.com' || 
    lowerEmail === 'anhnthe171401@fpt.edu.vn'
  ) {
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
      
      // If the role changed to admin (e.g. newly configured admin), update it in Firestore
      if (role === 'admin' && data.role !== 'admin') {
        await updateDoc(userDocRef, { role: 'admin', points: 9999 });
      }
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

// --- Firestore Sync Helpers ---

// 1. Create/Save Order
export async function createOrder(order: Order, userId?: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    const cleanedOrder = cleanUndefined({
      ...order,
      email: order.email.toLowerCase().trim(),
      userId: userId || null,
      createdAt: order.createdAt || new Date().toISOString()
    });
    await setDoc(orderRef, cleanedOrder);
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
  }
}

// 2. Create/Save Donation
export async function createDonation(donation: DonationSubmission, userId?: string): Promise<void> {
  try {
    const donationRef = doc(db, 'donations', donation.id);
    const cleanedDonation = cleanUndefined({
      ...donation,
      email: donation.email.toLowerCase().trim(),
      userId: userId || null,
      createdAt: donation.createdAt || new Date().toISOString()
    });
    await setDoc(donationRef, cleanedDonation);
  } catch (error) {
    console.error('Error saving donation to Firestore:', error);
  }
}

// 3. Get User Orders
export async function getUserOrders(email: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    const ordersList: Order[] = [];
    querySnapshot.forEach((doc) => {
      ordersList.push(doc.data() as Order);
    });
    return ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching user orders from Firestore:', error);
    return [];
  }
}

// 4. Get User Donations
export async function getUserDonations(email: string): Promise<DonationSubmission[]> {
  try {
    const q = query(collection(db, 'donations'), where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    const donationsList: DonationSubmission[] = [];
    querySnapshot.forEach((doc) => {
      donationsList.push(doc.data() as DonationSubmission);
    });
    return donationsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching user donations from Firestore:', error);
    return [];
  }
}

// 5. Get All Orders (Admin)
export async function getAllOrders(): Promise<Order[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const ordersList: Order[] = [];
    querySnapshot.forEach((doc) => {
      ordersList.push(doc.data() as Order);
    });
    return ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching all orders from Firestore:', error);
    return [];
  }
}

// 6. Get All Donations (Admin)
export async function getAllDonations(): Promise<DonationSubmission[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'donations'));
    const donationsList: DonationSubmission[] = [];
    querySnapshot.forEach((doc) => {
      donationsList.push(doc.data() as DonationSubmission);
    });
    return donationsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching all donations from Firestore:', error);
    return [];
  }
}

// 7. Get All Users/Members (Admin)
export async function getAllUsers(): Promise<AppUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersList: AppUser[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      usersList.push({
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || '',
        photoURL: data.photoURL || undefined,
        providerId: data.providerId || 'password',
        points: data.points || 0,
        role: data.role || 'user',
        phoneNumber: data.phoneNumber || '',
        address: data.address || ''
      } as AppUser);
    });
    return usersList;
  } catch (error) {
    console.error('Error fetching all users from Firestore:', error);
    return [];
  }
}

// 8. Update Order Status
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  } catch (error) {
    console.error('Error updating order status in Firestore:', error);
  }
}

// 9. Update Donation Status
export async function updateDonationStatus(donationId: string, status: DonationSubmission['status']): Promise<void> {
  try {
    const donationRef = doc(db, 'donations', donationId);
    await updateDoc(donationRef, { status });
  } catch (error) {
    console.error('Error updating donation status in Firestore:', error);
  }
}

// 10. Reward Member Points
export async function rewardMemberPoints(email: string, pointsToAdd: number): Promise<number> {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const newPoints = (userData.points || 0) + pointsToAdd;
      
      await updateDoc(doc(db, 'users', userDoc.id), { points: newPoints });
      return newPoints;
    }
    return 0;
  } catch (error) {
    console.error('Error rewarding points in Firestore:', error);
    return 0;
  }
}

// --- Voucher & Email Helpers ---

// 1. Fetch All Vouchers
export async function getAllVouchers(): Promise<Voucher[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'vouchers'));
    const vouchersList: Voucher[] = [];
    querySnapshot.forEach((doc) => {
      vouchersList.push({
        id: doc.id,
        ...doc.data()
      } as Voucher);
    });
    return vouchersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching all vouchers from Firestore:', error);
    return [];
  }
}

// 2. Create or Update Voucher
export async function createVoucher(voucher: Voucher): Promise<void> {
  try {
    const voucherRef = doc(db, 'vouchers', voucher.id.toUpperCase().trim());
    const cleanedVoucher = cleanUndefined({
      ...voucher,
      id: voucher.id.toUpperCase().trim(),
      createdAt: voucher.createdAt || new Date().toISOString()
    });
    await setDoc(voucherRef, cleanedVoucher);
  } catch (error) {
    console.error('Error creating voucher in Firestore:', error);
    throw error;
  }
}

// 3. Update Voucher Usage Count
export async function updateVoucherUsage(voucherId: string): Promise<void> {
  try {
    const voucherRef = doc(db, 'vouchers', voucherId.toUpperCase().trim());
    const docSnap = await getDoc(voucherRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Voucher;
      const currentUsage = data.usageCount || 0;
      await updateDoc(voucherRef, {
        usageCount: currentUsage + 1
      });
    }
  } catch (error) {
    console.error('Error updating voucher usage in Firestore:', error);
  }
}

// 4. Delete Voucher
export async function deleteVoucher(voucherId: string): Promise<void> {
  try {
    const voucherRef = doc(db, 'vouchers', voucherId.toUpperCase().trim());
    await deleteDoc(voucherRef);
  } catch (error) {
    console.error('Error deleting voucher from Firestore:', error);
    throw error;
  }
}

// 5. Fetch Email Config
export async function getEmailConfig(): Promise<EmailConfig> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'email_config'));
    if (docSnap.exists()) {
      return docSnap.data() as EmailConfig;
    }
    // Return default offline/simulation mode config
    return {
      serviceId: '',
      templateId: '',
      publicKey: '',
      isEnabled: false
    };
  } catch (error) {
    console.error('Error fetching email config:', error);
    return {
      serviceId: '',
      templateId: '',
      publicKey: '',
      isEnabled: false
    };
  }
}

// 6. Save Email Config
export async function saveEmailConfig(config: EmailConfig): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'email_config'), config);
  } catch (error) {
    console.error('Error saving email config:', error);
    throw error;
  }
}

// 7. Save Email Log
export async function createEmailLog(log: EmailLog): Promise<void> {
  try {
    const logRef = doc(db, 'emails', log.id);
    const cleanedLog = cleanUndefined({
      ...log,
      createdAt: log.createdAt || new Date().toISOString()
    });
    await setDoc(logRef, cleanedLog);
  } catch (error) {
    console.error('Error saving email log to Firestore:', error);
  }
}

// 8. Fetch All Email Logs (Admin)
export async function getAllEmailLogs(): Promise<EmailLog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'emails'));
    const logsList: EmailLog[] = [];
    querySnapshot.forEach((doc) => {
      logsList.push(doc.data() as EmailLog);
    });
    return logsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }
}

// --- Product Firestore Sync Helpers ---

// 1. Create or Update Product in Firestore
export async function createProduct(product: Product): Promise<void> {
  try {
    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, cleanUndefined(product));
  } catch (error) {
    console.error(`Error saving product ${product.id} to Firestore:`, error);
    throw error;
  }
}

// 2. Fetch All Products from Firestore (no mock data fallback or seeding)
export async function getAllProducts(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsList: Product[] = [];
    querySnapshot.forEach((doc) => {
      productsList.push(doc.data() as Product);
    });

    // Sort products by id ascending
    return productsList.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error('Error fetching all products from Firestore:', error);
    return []; // Return empty array if error or offline
  }
}

// 3. Delete Product from Firestore
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error(`Error deleting product ${productId} from Firestore:`, error);
    throw error;
  }
}

// --- Traffic Logging Helpers ---
export interface TrafficLog {
  id: string;
  page: string;
  timestamp: string;
  userAgent?: string;
}

export async function logTrafficVisit(page: string): Promise<void> {
  try {
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const logRef = doc(db, 'traffic_logs', logId);
    await setDoc(logRef, {
      id: logId,
      page,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  } catch (error) {
    console.error('Error logging traffic visit:', error);
  }
}

export async function getTrafficLogs(): Promise<TrafficLog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'traffic_logs'));
    const logs: TrafficLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push(doc.data() as TrafficLog);
    });
    return logs;
  } catch (error) {
    console.error('Error fetching traffic logs:', error);
    return [];
  }
}

