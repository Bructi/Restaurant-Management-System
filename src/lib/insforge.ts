import { createClient } from '@insforge/sdk';

const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL || '';
const INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || '';

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

// Storage helper functions
export const insforgeStorage = {
  async uploadFile(bucket: string, path: string, file: File | Blob) {
    return await insforge.storage.from(bucket).upload(path, file);
  },

  async uploadAuto(bucket: string, file: File | Blob) {
    return await insforge.storage.from(bucket).uploadAuto(file);
  },

  getPublicUrl(bucket: string, key: string) {
    return `${INSFORGE_URL}/storage/v1/object/public/${bucket}/${key}`;
  },

  async deleteFile(bucket: string, key: string) {
    return await insforge.storage.from(bucket).remove(key);
  },
};

// Auth helper functions
export const insforgeAuth = {
  async signUp(params: { email: string; password: string; name?: string; redirectTo?: string }) {
    return await insforge.auth.signUp(params);
  },

  async signIn(email: string, password: string) {
    return await insforge.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return await insforge.auth.signOut();
  },

  async getCurrentUser() {
    return await insforge.auth.getCurrentUser();
  },

  async sendOtp(email: string) {
    return await insforge.auth.signInWithOtp({ email });
  },

  async verifyOtp(email: string, otp: string, name?: string) {
    return await insforge.auth.verifyOtp({ email, otp, name });
  },

  async signInWithOAuth(provider: 'google' | 'github', redirectTo?: string) {
    return await insforge.auth.signInWithOAuth(provider, {
      redirectTo: redirectTo || window.location.origin,
    });
  },
};
