import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errorHandlers';

interface UserRoleData {
  role?: 'client' | 'doctor' | 'admin';
  isVerified?: boolean;
  specialty?: string;
  displayName?: string;
  email?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  roleData: UserRoleData | null;
  activeRole: 'client' | 'doctor' | 'admin';
  setActiveRole: (role: 'client' | 'doctor' | 'admin') => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, 
  roleData: null, 
  activeRole: 'client', 
  setActiveRole: () => {}, 
  loading: true 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [activeRoleOverride, setActiveRoleOverride] = useState<'client' | 'doctor' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setRoleData(null);
        setActiveRoleOverride(null);
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
          const data = docSnap.data() as UserRoleData;
          setRoleData(data);
          setLoading(false);
        } else {
          // If profile missing, initialize with client (or admin if owner email)
          const isOwnerEmail = user.email === 'sami478779@gmail.com';
          const defaultRole = isOwnerEmail ? 'admin' : 'client';
          setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0],
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

  const activeRole = activeRoleOverride || roleData?.role || 'client';

  const setActiveRole = (role: 'client' | 'doctor' | 'admin') => {
    // Only admins can switch to any role; doctors can switch between doctor and client
    if (roleData?.role === 'admin' || (roleData?.role === 'doctor' && role !== 'admin')) {
      setActiveRoleOverride(role);
    }
  };

  return (
    <AuthContext.Provider value={{ user, roleData, activeRole, setActiveRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
