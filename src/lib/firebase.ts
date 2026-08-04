import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UdharRecord, Expense, UserProfile } from '../types';
import { compressImage } from '../utils/imageCompressor';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Database ID comes from firebase-applet-config.json's firestoreDatabaseId property
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google Popup sign-in error or blocked, falling back to redirect:', error);
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      throw error;
    }
  }
}

export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (err) {
    console.error('Error getting redirect result:', err);
    return null;
  }
}

export async function logOutUser() {
  await signOut(auth);
}

// Firestore Collection References
export function listenToUserUdhar(userId: string, callback: (records: UdharRecord[]) => void) {
  const q = query(collection(db, 'udharRecords'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: UdharRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        // Exclude userId internal property for local app state
        const { userId: _, ...recordData } = data;
        records.push(recordData as UdharRecord);
      });
      callback(records);
    },
    (err) => {
      console.error('Firestore udharRecords listener error:', err);
    }
  );
}

export function listenToUserExpenses(userId: string, callback: (expenses: Expense[]) => void) {
  const q = query(collection(db, 'expenses'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const { userId: _, ...expenseData } = data;
        list.push(expenseData as Expense);
      });
      callback(list);
    },
    (err) => {
      console.error('Firestore expenses listener error:', err);
    }
  );
}

export function listenToUserProfile(userId: string, callback: (profile: Partial<UserProfile>) => void) {
  const docRef = doc(db, 'userProfiles', userId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        const { userId: _, ...profileData } = data;
        callback(profileData);
      }
    },
    (err) => {
      console.error('Firestore userProfile listener error:', err);
    }
  );
}

// Single Item Mutations in Firestore
export async function saveUdharRecordToCloud(userId: string, record: UdharRecord) {
  try {
    const docRef = doc(db, 'udharRecords', record.id);
    let profilePhoto = record.profilePhoto;
    if (profilePhoto && profilePhoto.length > 100000) {
      profilePhoto = await compressImage(profilePhoto, 250, 250, 0.7);
    }
    await setDoc(docRef, { ...record, profilePhoto, userId });
  } catch (err) {
    console.error('Error saving Udhar to Firestore:', err);
  }
}

export async function deleteUdharRecordFromCloud(recordId: string) {
  try {
    const docRef = doc(db, 'udharRecords', recordId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting Udhar from Firestore:', err);
  }
}

export async function saveExpenseToCloud(userId: string, expense: Expense) {
  try {
    const docRef = doc(db, 'expenses', expense.id);
    let receiptPhotoUrl = expense.receiptPhotoUrl;
    if (receiptPhotoUrl && receiptPhotoUrl.length > 100000) {
      receiptPhotoUrl = await compressImage(receiptPhotoUrl, 300, 300, 0.7);
    }
    await setDoc(docRef, { ...expense, receiptPhotoUrl, userId });
  } catch (err) {
    console.error('Error saving Expense to Firestore:', err);
  }
}

export async function deleteExpenseFromCloud(expenseId: string) {
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting Expense from Firestore:', err);
  }
}

export async function saveProfileToCloud(userId: string, profile: UserProfile) {
  try {
    const docRef = doc(db, 'userProfiles', userId);
    let avatar = profile.avatar;
    if (avatar && avatar.length > 100000) {
      avatar = await compressImage(avatar, 250, 250, 0.7);
    }
    await setDoc(docRef, { ...profile, avatar, userId });
  } catch (err) {
    console.error('Error saving Profile to Firestore:', err);
  }
}

// Initial Sync / Migration for existing local data when logging in for first time
export async function syncLocalDataToCloud(
  userId: string,
  udharRecords: UdharRecord[],
  expenses: Expense[],
  profile: UserProfile
) {
  try {
    const batch = writeBatch(db);

    // Profile
    let avatar = profile.avatar;
    if (avatar && avatar.length > 100000) {
      avatar = await compressImage(avatar, 250, 250, 0.7);
    }
    const profileRef = doc(db, 'userProfiles', userId);
    batch.set(profileRef, { ...profile, avatar, userId });

    // Udhar records
    for (const rec of udharRecords) {
      let photo = rec.profilePhoto;
      if (photo && photo.length > 100000) {
        photo = await compressImage(photo, 250, 250, 0.7);
      }
      const recRef = doc(db, 'udharRecords', rec.id);
      batch.set(recRef, { ...rec, profilePhoto: photo, userId });
    }

    // Expenses
    for (const exp of expenses) {
      let receipt = exp.receiptPhotoUrl;
      if (receipt && receipt.length > 100000) {
        receipt = await compressImage(receipt, 300, 300, 0.7);
      }
      const expRef = doc(db, 'expenses', exp.id);
      batch.set(expRef, { ...exp, receiptPhotoUrl: receipt, userId });
    }

    await batch.commit();
  } catch (err) {
    console.error('Error syncing local data to cloud:', err);
  }
}
