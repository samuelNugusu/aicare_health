import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errorHandlers';

async function syncUserRecord(user: any, preferredRole?: 'client' | 'doctor', specialty?: string) {
  const userRef = doc(db, 'users', user.uid);
  let userDoc;
  try {
    userDoc = await getDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
  }
  
  // Real world role resolution:
  // 1. If admin email (sami478779@gmail.com), assign 'admin'
  // 2. If new user, assign preferredRole (or default 'client' / Patient)
  // 3. If existing user, PRESERVE their role and update lastLogin
  const isOwnerAdmin = user.email === 'sami478779@gmail.com';
  
  try {
    if (!userDoc?.exists()) {
      const assignedRole = isOwnerAdmin ? 'admin' : (preferredRole || 'client');
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Member',
        photoURL: user.photoURL || null,
        role: assignedRole,
        specialty: assignedRole === 'doctor' ? (specialty || 'General Practitioner') : undefined,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isVerified: true
      });
    } else {
      const existingData = userDoc.data();
      const resolvedRole = isOwnerAdmin && !existingData.role ? 'admin' : (existingData.role || 'client');
      await setDoc(userRef, { 
        lastLogin: serverTimestamp(),
        role: resolvedRole,
        displayName: user.displayName || existingData.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL || existingData.photoURL || null,
        isVerified: existingData.isVerified !== undefined ? existingData.isVerified : true
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserRecord(result.user);
    return result.user;
  } catch (error: any) {
    console.error("Auth Error:", error);
    if (error.code === 'auth/popup-blocked') {
      alert("Popup blocked! Please allow popups for this site or open in a new tab.");
    }
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string, preferredRole?: 'client' | 'doctor', specialty?: string) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: name });
    await syncUserRecord(res.user, preferredRole, specialty);
    return res.user;
  } catch (error) {
    console.error("Register Error:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserRecord(res.user);
    return res.user;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};
