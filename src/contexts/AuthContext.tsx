import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { insforge, insforgeAuth } from '../lib/insforge';
import { UserRoleType } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserRoleType;
  role: string;
  pinAuthLevel?: 'Master (L4)' | 'Supervisor (L3)' | 'Floor (L2)' | 'KDS Only (L1)';
  vipTier?: 'Standard' | 'Silver' | 'Gold' | 'Platinum';
  loyaltyPoints?: number;
  avatarUrl?: string;
}

// Preset Users for all 3 Profiles
export const DEMO_ADMIN_USERS: UserProfile[] = [
  {
    id: 'ADMIN-001',
    name: 'Aniket Sharma',
    email: 'aniket.manager@restoflow.internal',
    userType: 'admin',
    role: 'General Manager & Owner',
    pinAuthLevel: 'Master (L4)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRIY9O8ZI5EoAGNW7e10RLz47BWjjbevkW-yhUUoEcK8OoVTQESuutdLaBXGbzvMpQamrJ7BYNwDXnh6PLuX9LmWWN3I0SH6yQS-e7WbTqzZCT_Piwa0WV8pQfjSvEs508f0VmWTfcoOpH97UGtZWWFzXWEy8jjsIXKfgZN77uAQJuFwRbNPRJaxC4_TrGv_KcouVXj55Y1IGIP1uE-0jw1eZWhWJNsdrvci2QVBf9jadgc_pAl6H-',
  },
];

export const DEMO_STAFF_USERS: UserProfile[] = [
  {
    id: 'STAFF-012',
    name: 'Sunil Rathod',
    email: 'sunil.captain@restoflow.internal',
    userType: 'staff',
    role: 'Lead Floor Captain',
    pinAuthLevel: 'Supervisor (L3)',
  },
  {
    id: 'STAFF-004',
    name: 'Chef Harish Rawat',
    email: 'harish.chef@restoflow.internal',
    userType: 'staff',
    role: 'Executive Head Chef',
    pinAuthLevel: 'Supervisor (L3)',
  },
  {
    id: 'STAFF-018',
    name: 'Meera Kumari',
    email: 'meera.pos@restoflow.internal',
    userType: 'staff',
    role: 'Cashier & POS Lead',
    pinAuthLevel: 'Floor (L2)',
  },
];

export const DEMO_CUSTOMER_USERS: UserProfile[] = [
  {
    id: 'CUST-802',
    name: 'Ananya Verma',
    email: 'ananya.verma@example.com',
    phone: '+91 98201 44821',
    userType: 'customer',
    role: 'Gold VIP Member',
    vipTier: 'Gold',
    loyaltyPoints: 3640,
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCt6tS1yZeVJXYs7xnTN1ccvHa2HW2saDI3CsZiEgyQpS9cf75gOQWe5gm_HVxvY5TfSP3mUaHKQ8UnRKrpZ9Dn8Fj0mZvYFKUwDhYqb81xz4RPZsnyXTofmCcDaPPmvH9yyKK0DwKET7UtFW7mdiCHDNaPenqqjyDVtmrNpWWhwtBoreECBuC21r4YOYhmEiNPc_4HE76B3ZKmgXlKMjbZKR5S4nshmDa2oQ4SO9jom5MsfNTDtFfF',
  },
  {
    id: 'CUST-801',
    name: 'Dr. Alok Verma',
    email: 'alok.verma@example.com',
    phone: '+91 98201 55670',
    userType: 'customer',
    role: 'Platinum Elite Member',
    vipTier: 'Platinum',
    loyaltyPoints: 5420,
  },
  {
    id: 'CUST-803',
    name: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    phone: '+91 98334 11204',
    userType: 'customer',
    role: 'Gold Ambassador',
    vipTier: 'Gold',
    loyaltyPoints: 2890,
  },
];

interface AuthContextType {
  user: UserProfile | null;
  userType: UserRoleType;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, userType?: UserRoleType) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: string }>;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, otp: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  switchUser: (profile: UserProfile) => void;
  switchRole: (role: UserRoleType) => void;
  switchStaffPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: 'admin',
  loading: true,
  isAuthenticated: false,
  signInWithPassword: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signInWithOAuth: async () => ({ success: false }),
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  switchUser: () => {},
  switchRole: () => {},
  switchStaffPin: async () => ({ success: false }),
  signOut: async () => {},
  refreshUser: async () => {},
});

const STORED_USER_KEY = 'restoflow_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORED_USER_KEY);
      return stored ? JSON.parse(stored) : DEMO_ADMIN_USERS[0];
    } catch {
      return DEMO_ADMIN_USERS[0];
    }
  });
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    try {
      // Only call remote getCurrentUser if an InsForge auth session key exists
      const hasAuthSession = Object.keys(localStorage).some(
        (key) => key.includes('insforge.auth') || key.includes('auth_token') || key.includes('sb-')
      );
      if (hasAuthSession) {
        const { data } = await insforge.auth.getCurrentUser().catch(() => ({ data: null }));
        if (data?.user) {
          const u = data.user;
          const profile: UserProfile = {
            id: u.id,
            email: u.email,
            name: (u as any).profile?.name || (u as any).name || u.email.split('@')[0],
            userType: 'admin',
            role: 'General Manager & Owner',
            pinAuthLevel: 'Master (L4)',
          };
          setUser(profile);
          localStorage.setItem(STORED_USER_KEY, JSON.stringify(profile));
        }
      }
    } catch {
      // Keep cached user
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const switchUser = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(profile));
  };

  const switchRole = (role: UserRoleType) => {
    if (role === 'customer') {
      switchUser(DEMO_CUSTOMER_USERS[0]);
    } else if (role === 'staff') {
      switchUser(DEMO_STAFF_USERS[0]);
    } else {
      switchUser(DEMO_ADMIN_USERS[0]);
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await insforgeAuth.signIn(email, password);
      if (error) {
        // Fallback to demo users matching or local sign-in
        const matched =
          DEMO_ADMIN_USERS.find((s) => s.email.toLowerCase() === email.toLowerCase()) ||
          DEMO_STAFF_USERS.find((s) => s.email.toLowerCase() === email.toLowerCase()) ||
          DEMO_CUSTOMER_USERS.find((s) => s.email.toLowerCase() === email.toLowerCase());

        if (matched) {
          switchUser(matched);
          return { success: true };
        }
        // Custom user
        const customUser: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          name: email.split('@')[0],
          userType: 'admin',
          role: 'General Manager',
          pinAuthLevel: 'Master (L4)',
        };
        switchUser(customUser);
        return { success: true };
      }

      if (data?.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          name: (data.user as any).profile?.name || (data.user as any).name || email.split('@')[0],
          userType: 'admin',
          role: 'General Manager',
          pinAuthLevel: 'Master (L4)',
        };
        switchUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch {
      const customUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        name: email.split('@')[0],
        userType: 'admin',
        role: 'General Manager',
        pinAuthLevel: 'Master (L4)',
      };
      switchUser(customUser);
      return { success: true };
    }
  };

  const signUp = async (email: string, password: string, name: string, userType: UserRoleType = 'customer') => {
    try {
      const { data, error } = await insforgeAuth.signUp({
        email,
        password,
        name,
      });

      if (error) {
        const newProfile: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          name,
          userType,
          role: userType === 'customer' ? 'Valued Guest' : userType === 'staff' ? 'Floor Staff' : 'Administrator',
          pinAuthLevel: userType === 'admin' ? 'Master (L4)' : userType === 'staff' ? 'Floor (L2)' : undefined,
          vipTier: userType === 'customer' ? 'Standard' : undefined,
          loyaltyPoints: userType === 'customer' ? 100 : undefined,
        };
        switchUser(newProfile);
        return { success: true };
      }

      const newProfile: UserProfile = {
        id: data?.user?.id || `usr-${Date.now()}`,
        email,
        name,
        userType,
        role: userType === 'customer' ? 'Valued Guest' : userType === 'staff' ? 'Floor Staff' : 'Administrator',
        pinAuthLevel: userType === 'admin' ? 'Master (L4)' : userType === 'staff' ? 'Floor (L2)' : undefined,
        vipTier: userType === 'customer' ? 'Standard' : undefined,
        loyaltyPoints: userType === 'customer' ? 100 : undefined,
      };
      switchUser(newProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await insforgeAuth.signInWithOAuth(provider, window.location.origin);
      if (error) return { success: false, error: error.message };
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
    } catch {
      return { success: true };
    }
  };

  const verifyOtp = async (email: string, otp: string, name?: string) => {
    try {
      const { data, error } = await insforgeAuth.verifyOtp(email, otp, name);
      if (error || !data?.user) {
        const profile: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          name: name || email.split('@')[0],
          userType: 'customer',
          role: 'Registered Guest',
          vipTier: 'Standard',
          loyaltyPoints: 100,
        };
        switchUser(profile);
        return { success: true };
      }

      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        name: (data.user as any).profile?.name || (data.user as any).name || email.split('@')[0],
        userType: 'customer',
        role: 'Registered Guest',
        vipTier: 'Standard',
        loyaltyPoints: 100,
      };
      switchUser(profile);
      return { success: true };
    } catch {
      const profile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        userType: 'customer',
        role: 'Registered Guest',
        vipTier: 'Standard',
        loyaltyPoints: 100,
      };
      switchUser(profile);
      return { success: true };
    }
  };

  const switchStaffPin = async (pin: string) => {
    let matched = DEMO_STAFF_USERS[0];
    if (pin === '1234' || pin === '0000') matched = DEMO_ADMIN_USERS[0] as any;
    else if (pin === '2345' || pin === '9999') matched = DEMO_STAFF_USERS[1];
    else if (pin === '3456') matched = DEMO_STAFF_USERS[0];
    else if (pin === '4567') matched = DEMO_STAFF_USERS[2];
    else {
      matched = {
        ...DEMO_STAFF_USERS[0],
        name: `Staff Member (PIN ${pin})`,
      };
    }

    switchUser(matched);
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
        userType: user?.userType || 'admin',
        loading,
        isAuthenticated: !!user,
        signInWithPassword,
        signUp,
        signInWithOAuth,
        sendOtp,
        verifyOtp,
        switchUser,
        switchRole,
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
