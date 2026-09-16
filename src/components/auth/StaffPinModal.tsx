import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface StaffPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StaffPinModal: React.FC<StaffPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { switchStaffPin } = useAuth();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      const nextPin = pin + d;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const verify = async (inputPin: string) => {
    const res = await switchStaffPin(inputPin);
    if (res.success) {
      onSuccess?.();
      onClose();
      setPin('');
    } else {
      setErrorMsg('Invalid PIN Code');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xs bg-surface-container rounded-3xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col items-center p-6 gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-container/20 text-primary">
              <span className="material-symbols-outlined text-[20px]">pin</span>
            </span>
            <span className="font-bold text-sm text-on-surface">Staff PIN Switch</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* PIN Dots Display */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-on-surface-variant font-semibold">Enter 4-digit staff terminal PIN</span>
          <div className="flex items-center gap-3 my-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all ${
                  pin.length > idx
                    ? 'bg-primary scale-110 ring-2 ring-primary/30'
                    : 'bg-surface-container-highest border border-surface-container-high'
                }`}
              />
            ))}
          </div>
          {errorMsg && <span className="text-xs text-error font-bold animate-shake">{errorMsg}</span>}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-mono-metric text-xl font-bold border border-surface-container-high/40 active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant font-semibold text-xs border border-surface-container-high/40 active:scale-95 transition-all flex items-center justify-center uppercase"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-mono-metric text-xl font-bold border border-surface-container-high/40 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant border border-surface-container-high/40 active:scale-95 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">backspace</span>
          </button>
        </div>

        {/* PIN Hint */}
        <div className="text-[10px] text-on-surface-variant text-center opacity-70">
          Demo PINs: <strong>1234</strong> (Manager) · <strong>3456</strong> (Captain) · <strong>4567</strong> (Cashier)
        </div>
      </div>
    </div>
  );
};
