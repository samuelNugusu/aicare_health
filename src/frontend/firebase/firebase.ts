import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errorHandlers';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Ensure user record exists
    const userRef = doc(db, 'users', user.uid);
    let userDoc;
    try {
      userDoc = await getDoc(userRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    }
    
    const role = user.email === 'sami478779@gmail.com' ? 'admin' : 'client';
    
    try {
      if (!userDoc?.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: role,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isVerified: role === 'admin'
        });
      } else {
        // Refresh role and lastLogin for existing users
        await setDoc(userRef, { 
          lastLogin: serverTimestamp(),
          role: userDoc.data().role || role, // Keep current role or set default
          // Ensure the dev email ALWAYS has admin role
          ...(user.email === 'sami478779@gmail.com' ? { role: 'admin', isVerified: true } : {})
        }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
    
    return user;
  } catch (error: any) {
    console.error("Auth Error:", error);
    if (error.code === 'auth/popup-blocked') {
      alert("Popup blocked! Please allow popups for this site or open in a new tab.");
    }
    throw error;
  }
};
