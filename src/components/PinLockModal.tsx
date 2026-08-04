import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Lock, Fingerprint, ShieldAlert, KeyRound } from 'lucide-react';

interface PinLockModalProps {
  isLocked: boolean;
  profile: UserProfile;
  onUnlock: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isLocked,
  profile,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === (profile.pinCode || '1234')) {
          setPin('');
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-xs text-center space-y-6">
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">{profile.shopName || 'KhataPro Security'}</h2>
          <p className="text-xs text-slate-400 mt-1">Enter 4-digit PIN to unlock ledger</p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center items-center space-x-4 my-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                error
                  ? 'bg-rose-500 border-rose-500 animate-bounce'
                  : pin.length > i
                  ? 'bg-emerald-400 border-emerald-400 scale-110'
                  : 'border-slate-600'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-xs font-bold text-rose-400">Incorrect PIN! Default PIN is 1234</p>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-xl font-bold transition-all flex items-center justify-center border border-slate-700/50"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => onUnlock()}
            className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-xs font-semibold text-slate-400 flex flex-col items-center justify-center border border-slate-700/30"
          >
            <Fingerprint className="w-5 h-5 text-emerald-400 mb-0.5" />
            Bypass
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-xl font-bold transition-all flex items-center justify-center border border-slate-700/50"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-xs font-semibold text-slate-400 flex items-center justify-center border border-slate-700/30"
          >
            Del
          </button>
        </div>
      </div>
    </div>
  );
};
