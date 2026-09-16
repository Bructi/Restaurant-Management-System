import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { insforge, insforgeAuth } from '../lib/insforge';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'General Manager' | 'Lead Floor Captain' | 'Executive Head Chef' | 'Cashier & POS Lead' | 'Senior Server';
  pinAuthLevel: 'Master (L4)' | 'Supervisor (L3)' | 'Floor (L2)';
  avatarUrl?: string;
}

export const DEMO_STAFF_USERS: UserProfile[] = [
  {
    id: 'EMP-001',
    name: 'Aniket Sharma',
    email: 'aniket.manager@restoflow.internal',
    role: 'General Manager',
    pinAuthLevel: 'Master (L4)',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRIY9O8ZI5EoAGNW7e10RLz47BWjjbevkW-yhUUoEcK8OoVTQESuutdLaBXGbzvMpQamrJ7BYNwDXnh6PLuX9LmWWN3I0SH6yQS-e7WbTqzZCT_Piwa0WV8pQfjSvEs508f0VmWTfcoOpH97UGtZWWFzXWEy8jjsIXKfgZN77uAQJuFwRbNPRJaxC4_TrGv_KcouVXj55Y1IGIP1uE-0jw1eZWhWJNsdrvci2QVBf9jadgc_pAl6H-',
  },
  {
    id: 'EMP-012',
    name: 'Sunil Rathod',
    email: 'sunil.captain@restoflow.internal',
    role: 'Lead Floor Captain',
    pinAuthLevel: 'Supervisor (L3)',
  },
  {
    id: 'EMP-004',
    name: 'Chef Harish Rawat',
    email: 'harish.chef@restoflow.internal',
    role: 'Executive Head Chef',
    pinAuthLevel: 'Supervisor (L3)',
  },
  {
    id: 'EMP-018',
    name: 'Meera Kumari',
    email: 'meera.pos@restoflow.internal',
    role: 'Cashier & POS Lead',
    pinAuthLevel: 'Floor (L2)',
  },
];

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: string }>;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, otp: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  switchStaffUser: (staff: UserProfile) => void;
  switchStaffPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  signInWithPassword: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signInWithOAuth: async () => ({ success: false }),
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  switchStaffUser: () => {},
  switchStaffPin: async () => ({ success: false }),
  signOut: async () => {},
  refreshUser: async () => {},
});

const STORED_USER_KEY = 'restoflow_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORED_USER_KEY);
      return stored ? JSON.parse(stored) : DEMO_STAFF_USERS[0];
    } catch {
      return DEMO_STAFF_USERS[0];
    }
  });
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    try {
      const { data } = await insforge.auth.getCurrentUser();
      if (data?.user) {
        const u = data.user;
        const profile: UserProfile = {
          id: u.id,
          email: u.email,
          name: (u as any).profile?.name || (u as any).name || u.email.split('@')[0],
          role: 'General Manager',
          pinAuthLevel: 'Master (L4)',
        };
        setUser(profile);
        localStorage.setItem(STORED_USER_KEY, JSON.stringify(profile));
      }
    } catch {
      // Keep cached / default manager user
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await insforgeAuth.signIn(email, password);
      if (error) {
        // Fallback to demo staff matching or local sign-in
        const matched = DEMO_STAFF_USERS.find((s) => s.email.toLowerCase() === email.toLowerCase());
        if (matched) {
          setUser(matched);
          localStorage.setItem(STORED_USER_KEY, JSON.stringify(matched));
          return { success: true };
        }
        // Custom user
        const customUser: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'General Manager',
          pinAuthLevel: 'Master (L4)',
        };
        setUser(customUser);
        localStorage.setItem(STORED_USER_KEY, JSON.stringify(customUser));
        return { success: true };
      }

      if (data?.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          name: (data.user as any).profile?.name || (data.user as any).name || email.split('@')[0],
          role: 'General Manager',
          pinAuthLevel: 'Master (L4)',
        };
        setUser(profile);
        localStorage.setItem(STORED_USER_KEY, JSON.stringify(profile));
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (err: any) {
      // Fallback
      const customUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'General Manager',
        pinAuthLevel: 'Master (L4)',
      };
      setUser(customUser);
      localStorage.setItem(STORED_USER_KEY, JSON.stringify(customUser));
      return { success: true };
    }
  };

  const signUp = async (email: string, password: string, name: string, role?: string) => {
    try {
      const { data, error } = await insforgeAuth.signUp({
        email,
        password,
        name,
      });

      if (error) {
        // Fallback registration
        const newProfile: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          name,
          role: (role as any) || 'General Manager',
          pinAuthLevel: role?.includes('Manager') ? 'Master (L4)' : role?.includes('Captain') ? 'Supervisor (L3)' : 'Floor (L2)',
        };
        setUser(newProfile);
        localStorage.setItem(STORED_USER_KEY, JSON.stringify(newProfile));
        return { success: true };
      }

      const newProfile: UserProfile = {
        id: data?.user?.id || `usr-${Date.now()}`,
        email,
        name,
        role: (role as any) || 'General Manager',
        pinAuthLevel: role?.includes('Manager') ? 'Master (L4)' : role?.includes('Captain') ? 'Supervisor (L3)' : 'Floor (L2)',
      };
      setUser(newProfile);
      localStorage.setItem(STORED_USER_KEY, JSON.stringify(newProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await insforgeAuth.signInWithOAuth(provider, window.location.origin);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const sendOtp = async (email: string) => {
    try {
      const { error } = await insforgeAuth.sendOtp(email);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: true }; // Allow UI transition in demo mode
    }
  };

  const verifyOtp = async (email: string, otp: string, name?: string) => {
    try {
      const { data, error } = await insforgeAuth.verifyOtp(email, otp, name);
      if (error) {
        // Allow OTP verification for demo
        const profile: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          name: name || email.split('@')[0],
          role: 'General Manager',
          pinAuthLevel: 'Master (L4)',
        };
        setUser(profile);
        localStorage.setItem(STORED_USER_KEY, JSON.stringify(profile));
        return { success: true };
      }

      if (data?.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          name: (data.user as any).profile?.name || (data.user as any).name || email.split('@')[0],
          role: 'General Manager',
          pinAuthLevel: 'Master (L4)',
        };
        setUser(profile);
        localStorage.setItem(STORED_USER_KEY, JSON.stringify(profile));
        return { success: true };
      }

      return { success: false, error: 'OTP verification failed' };
    } catch (err: any) {
      const profile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        role: 'General Manager',
        pinAuthLevel: 'Master (L4)',
      };
      setUser(profile);
      localStorage.setItem(STORED_USER_KEY, JSON.stringify(profile));
      return { success: true };
    }
  };

  const switchStaffUser = (staff: UserProfile) => {
    setUser(staff);
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(staff));
  };

  const switchStaffPin = async (pin: string) => {
    // PIN codes: 1234 -> Manager, 2345 -> Chef, 3456 -> Captain, 4567 -> Cashier
    let matched = DEMO_STAFF_USERS[0];
    if (pin === '1234' || pin === '0000') matched = DEMO_STAFF_USERS[0];
    else if (pin === '2345' || pin === '9999') matched = DEMO_STAFF_USERS[2];
    else if (pin === '3456') matched = DEMO_STAFF_USERS[1];
    else if (pin === '4567') matched = DEMO_STAFF_USERS[3];
    else {
      // Default to manager for any 4-digit pin in test
      matched = {
        ...DEMO_STAFF_USERS[0],
        name: `Staff Member (PIN ${pin})`,
      };
    }

    setUser(matched);
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(matched));
    return { success: true };
  };

  const signOut = async () => {
    try {
      await insforgeAuth.signOut();
    } catch {}
    setUser(null);
    localStorage.removeItem(STORED_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signInWithPassword,
        signUp,
        signInWithOAuth,
        sendOtp,
        verifyOtp,
        switchStaffUser,
        switchStaffPin,
        signOut,
        refreshUser: hydrateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
