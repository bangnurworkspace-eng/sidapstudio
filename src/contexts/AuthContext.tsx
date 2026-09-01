import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  loginBypass: (id?: string, password?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already saved in localStorage for persistence
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      setUser({ uid: 'admin-bypass', email: 'admin@example.com' } as User);
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const loginBypass = async (id?: string, password?: string) => {
    try {
      const docRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(docRef);
      
      let validId = 'admin';
      let validPassword = 'admin 123';
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.adminId) validId = data.adminId;
        if (data.adminPassword) validPassword = data.adminPassword;
      }
      
      if (id === validId && password === validPassword) {
        setUser({ uid: 'admin-bypass', email: 'admin@example.com' } as User);
        setIsAdmin(true);
        localStorage.setItem('adminUser', 'true');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking admin credentials:', err);
      // Fallback if db fails
      if (id === 'admin' && password === 'admin 123') {
        setUser({ uid: 'admin-bypass', email: 'admin@example.com' } as User);
        setIsAdmin(true);
        localStorage.setItem('adminUser', 'true');
        return true;
      }
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout, loginBypass }}>
      {children}
    </AuthContext.Provider>
  );
};
