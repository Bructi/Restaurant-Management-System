import React, { useState } from 'react';
import { useAuth, DEMO_STAFF_USERS } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'otp';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const { user, signInWithPassword, signUp, signInWithOAuth, sendOtp, verifyOtp, switchStaffUser, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'General Manager' | 'Lead Floor Captain' | 'Executive Head Chef' | 'Cashier & POS Lead'>('General Manager');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(`Redirecting to ${provider === 'google' ? 'Google' : 'GitHub'} authentication...`);
    const res = await signInWithOAuth(provider);
    if (!res.success && res.error) {
      setIsLoading(false);
      setErrorMessage(res.error);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'signin') {
      const res = await signInWithPassword(email || 'aniket.manager@restoflow.internal', password || 'RestoFlow@2026');
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage('Signed in successfully!');
        setTimeout(() => onClose(), 600);
      } else {
        setErrorMessage(res.error || 'Invalid credentials');
      }
    } else {
      const res = await signUp(email, password, name, role);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage('Account created and logged in!');
        setTimeout(() => onClose(), 600);
      } else {
        setErrorMessage(res.error || 'Failed to register');
      }
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setErrorMessage('Please enter an email address');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const res = await sendOtp(email);
    setIsLoading(false);
    if (res.success) {
      setOtpSent(true);
      setSuccessMessage(`6-digit OTP sent to ${email}`);
    } else {
      setErrorMessage(res.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrorMessage('Please enter the 6-digit OTP code');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const res = await verifyOtp(email, otp, name);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage('OTP verified and signed in!');
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMessage(res.error || 'Invalid or expired OTP');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                {mode === 'signin' ? 'InsForge Staff Login' : mode === 'signup' ? 'Create Staff Profile' : 'Passwordless OTP Login'}
              </h3>
              <p className="text-xs text-on-surface-variant">
                RestoFlow Unified Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current User Pill if Authenticated */}
        {user && (
          <div className="px-space-lg py-2.5 bg-surface-container-lowest flex items-center justify-between border-b border-surface-container-high/40 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-on-surface-variant truncate">
                Active Session: <strong className="text-on-surface">{user.name}</strong> ({user.role})
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-primary hover:underline font-bold shrink-0 ml-2"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-surface-container-high bg-surface-container-low/50">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
              mode === 'signin'
                ? 'border-primary text-primary bg-surface-container'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Email Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('otp');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
              mode === 'otp'
                ? 'border-primary text-primary bg-surface-container'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            OTP / Code
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
              mode === 'signup'
                ? 'border-primary text-primary bg-surface-container'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Register Staff
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mx-space-lg mt-3 p-2.5 rounded-lg bg-error/15 border border-error/30 text-error text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-space-lg mt-3 p-2.5 rounded-lg bg-secondary/15 border border-secondary/30 text-secondary text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-space-lg flex flex-col gap-4 font-body-sm text-body-sm">
          {/* OAuth Buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleOAuthLogin('google')}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-surface-container-high/60 shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
            >
              {/* Google 4-Color SVG Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleOAuthLogin('github')}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-surface-container-high/60 shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
            >
              {/* GitHub SVG Icon */}
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-2 my-0.5">
            <div className="h-[1px] bg-surface-container-high flex-1" />
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              OR EMAIL SIGN IN
            </span>
            <div className="h-[1px] bg-surface-container-high flex-1" />
          </div>

          {mode !== 'otp' ? (
            <form onSubmit={handleSubmitPassword} className="flex flex-col gap-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="text-xs uppercase font-bold text-on-surface-variant block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aniket Sharma"
                      className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-on-surface-variant block mb-1">
                      Role &amp; Terminal Permission Level
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none text-xs"
                    >
                      <option value="General Manager">General Manager — Master (L4)</option>
                      <option value="Lead Floor Captain">Lead Floor Captain — Supervisor (L3)</option>
                      <option value="Executive Head Chef">Executive Head Chef — Supervisor (L3)</option>
                      <option value="Cashier & POS Lead">Cashier &amp; POS Lead — Floor (L2)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs uppercase font-bold text-on-surface-variant block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@restoflow.internal"
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none focus:border-primary font-mono-metric text-xs"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-on-surface-variant block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none focus:border-primary font-mono-metric text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-primary-container text-on-primary-container font-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-[0.99] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isLoading ? 'sync' : mode === 'signin' ? 'login' : 'person_add'}
                </span>
                <span>{isLoading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Terminal' : 'Create & Authenticate'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
              <div>
                <label className="text-xs uppercase font-bold text-on-surface-variant block mb-1">
                  Email for Passwordless Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="flex-1 bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none font-mono-metric text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-on-surface shrink-0"
                  >
                    {otpSent ? 'Resend' : 'Send Code'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="text-xs uppercase font-bold text-on-surface-variant block mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-surface-container-lowest p-3 rounded-lg text-on-surface border border-primary text-center font-mono-metric font-bold text-lg tracking-widest outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-3 py-3 rounded-xl bg-primary-container text-on-primary-container font-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Quick Demo Staff Presets */}
          <div className="pt-3 border-t border-surface-container-high/40 flex flex-col gap-2">
            <span className="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">
              Quick Role Switch (Demo Fast-Login)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_STAFF_USERS.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => {
                    switchStaffUser(staff);
                    setSuccessMessage(`Switched to ${staff.name} (${staff.role})`);
                    setTimeout(() => onClose(), 400);
                  }}
                  className={`p-2 rounded-lg text-left border flex flex-col gap-0.5 transition-all ${
                    user?.id === staff.id
                      ? 'bg-primary-container/20 border-primary text-on-surface font-bold'
                      : 'bg-surface-container-lowest hover:bg-surface-container-high border-surface-container-high/40 text-on-surface'
                  }`}
                >
                  <span className="font-bold text-xs truncate">{staff.name}</span>
                  <span className="text-[10px] text-on-surface-variant truncate">{staff.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
