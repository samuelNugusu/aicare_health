import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errorHandlers';

interface UserRoleData {
  role?: 'client' | 'doctor' | 'admin';
  isVerified?: boolean;
  specialty?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  roleData: UserRoleData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, roleData: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setRoleData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribeRole = onSnapshot(
      userRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setRoleData(docSnap.data() as UserRoleData);
          setLoading(false);
        } else {
          // If profile missing, trigger an immediate sync
          console.log("Profile missing, auto-initializing...");
          // In a real app, the first user might be admin. For this app, let's default to client 
          // unless specific criteria met. For now, let's use 'client' as default.
          const defaultRole = 'client';
          setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: defaultRole,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            isVerified: true
          }, { merge: true }).catch(err => {
             console.error("Auto-init failed:", err);
             setLoading(false);
          });
        }
      },
      (error) => {
        console.error("Auth Snapshot Error:", error);
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        setLoading(false);
      }
    );

    return () => unsubscribeRole();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, roleData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
