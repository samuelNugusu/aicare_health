import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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

    const unsubscribeRole = onSnapshot(
      doc(db, 'users', user.uid), 
      (doc) => {
        if (doc.exists()) {
          setRoleData(doc.data() as UserRoleData);
        }
        setLoading(false);
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
