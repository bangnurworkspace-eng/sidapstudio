import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminUser } from '../types';

interface AuthContextType {
  user: User | null;
  currentUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  loginBypass: (id?: string, password?: string) => Promise<boolean>;
  updateCurrentUser: (profile: Partial<AdminUser>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-default',
  username: 'admin',
  name: 'Super Admin',
  email: 'admin@sidapstudio.com',
  role: 'Super Administrator',
  avatarUrl: '',
  password: 'admin 123',
  status: 'active'
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync firebase User object with AdminUser
  const syncUserObject = (profile: AdminUser) => {
    setCurrentUser(profile);
    setUser({
      uid: profile.id,
      displayName: profile.name || profile.username,
      email: profile.email,
      photoURL: profile.avatarUrl || ''
    } as User);
    setIsAdmin(true);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedData = localStorage.getItem('adminUser');
        if (savedData) {
          let parsedUser: AdminUser;
          try {
            parsedUser = JSON.parse(savedData);
          } catch {
            parsedUser = DEFAULT_ADMIN;
          }

          syncUserObject(parsedUser);

          // Fetch fresh data from Firestore
          try {
            if (parsedUser.id) {
              const docRef = doc(db, 'users', parsedUser.id);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const fresh = { id: docSnap.id, ...docSnap.data() } as AdminUser;
                syncUserObject(fresh);
                localStorage.setItem('adminUser', JSON.stringify(fresh));
              }
            }
          } catch (err) {
            console.warn('Could not refresh user profile from Firestore:', err);
          }
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshUserProfile = async () => {
    if (!currentUser?.id) return;
    try {
      const docRef = doc(db, 'users', currentUser.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fresh = { id: docSnap.id, ...docSnap.data() } as AdminUser;
        syncUserObject(fresh);
        localStorage.setItem('adminUser', JSON.stringify(fresh));
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  };

  const loginBypass = async (id?: string, password?: string): Promise<boolean> => {
    const inputId = (id || '').trim();
    const inputPass = (password || '').trim();

    if (!inputId || !inputPass) return false;

    try {
      // 1. First check users collection in Firestore
      const usersSnap = await getDocs(collection(db, 'users'));
      let matchedUser: AdminUser | null = null;

      usersSnap.forEach((d) => {
        const data = d.data() as AdminUser;
        if (
          (data.username?.toLowerCase() === inputId.toLowerCase() ||
           data.email?.toLowerCase() === inputId.toLowerCase()) &&
          data.password === inputPass
        ) {
          matchedUser = { ...data, id: d.id };
        }
      });

      if (matchedUser) {
        syncUserObject(matchedUser);
        localStorage.setItem('adminUser', JSON.stringify(matchedUser));
        return true;
      }

      // 2. Check general settings for legacy admin credentials
      const docRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(docRef);
      
      let validId = 'admin';
      let validPassword = 'admin 123';
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.adminId) validId = data.adminId;
        if (data.adminPassword) validPassword = data.adminPassword;
      }
      
      if (inputId === validId && inputPass === validPassword) {
        // Create or get default admin profile
        const adminProfile: AdminUser = {
          id: 'admin-default',
          username: validId,
          name: 'Super Admin',
          email: 'admin@sidapstudio.com',
          role: 'Super Administrator',
          avatarUrl: '',
          password: validPassword,
          status: 'active',
          updatedAt: new Date().toISOString()
        };

        // Try to persist default admin into users collection if it doesn't exist
        try {
          await setDoc(doc(db, 'users', 'admin-default'), adminProfile, { merge: true });
        } catch (e) {
          console.warn('Could not auto-seed admin into users collection:', e);
        }

        syncUserObject(adminProfile);
        localStorage.setItem('adminUser', JSON.stringify(adminProfile));
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error checking admin credentials:', err);
      // Offline fallback
      if (inputId === 'admin' && inputPass === 'admin 123') {
        syncUserObject(DEFAULT_ADMIN);
        localStorage.setItem('adminUser', JSON.stringify(DEFAULT_ADMIN));
        return true;
      }
      return false;
    }
  };

  const updateCurrentUser = async (profileUpdate: Partial<AdminUser>) => {
    if (!currentUser) return;

    const updated: AdminUser = {
      ...currentUser,
      ...profileUpdate,
      updatedAt: new Date().toISOString()
    };

    syncUserObject(updated);
    localStorage.setItem('adminUser', JSON.stringify(updated));

    // Save to Firestore
    try {
      if (updated.id) {
        await setDoc(doc(db, 'users', updated.id), updated, { merge: true });
      }

      // Also sync adminId/adminPassword in general settings if this is primary admin
      if (updated.username || updated.password) {
        await setDoc(doc(db, 'settings', 'general'), {
          adminId: updated.username,
          ...(updated.password ? { adminPassword: updated.password } : {}),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
      throw err;
    }
  };

  const logout = async () => {
    setUser(null);
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentUser, 
      isAdmin, 
      loading, 
      logout, 
      loginBypass, 
      updateCurrentUser, 
      refreshUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

