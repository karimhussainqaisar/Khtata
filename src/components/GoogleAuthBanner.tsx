import React from 'react';
import { User } from 'firebase/auth';
import { LogIn, LogOut, CheckCircle2, Cloud, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface GoogleAuthBannerProps {
  user: User | null;
  loading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  language?: Language;
}

export const GoogleAuthBanner: React.FC<GoogleAuthBannerProps> = ({
  user,
  loading,
  onLogin,
  onLogout,
  language = 'en',
}) => {
  return (
    <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-500/30 space-y-3 overflow-hidden w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3 rtl:space-x-reverse min-w-0 shrink">
          {user ? (
            <div className="relative shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 border-indigo-400 object-cover shadow-md"
                />
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 shrink-0">
              <Cloud className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
          )}

          <div className="min-w-0">
            {user ? (
              <>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                    {user.displayName || 'Google Account'}
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                    CLOUD SYNC
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-indigo-200 truncate max-w-[150px] sm:max-w-[220px]">{user.email}</p>
              </>
            ) : (
              <>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {language === 'ur' ? 'گوگل سے لاگ ان کریں' : 'Google Data Sync & Backup'}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-2">
                  {language === 'ur'
                    ? 'اپنا سارا ادھار اور خرچ کا ڈیٹا گوگل کلائوڈ پر محفوظ رکھیں'
                    : 'Sync all Udhar records & expenses safely to your Google account'}
                </p>
              </>
            )}
          </div>
        </div>

        {user ? (
          <button
            onClick={onLogout}
            disabled={loading}
            className="px-2.5 py-1.5 sm:px-3 rounded-xl bg-white/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
            title="Sign Out Google Account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <button
            onClick={onLogin}
            disabled={loading}
            className="px-3 py-2 sm:px-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>{loading ? 'Logging in...' : 'Google Login'}</span>
          </button>
        )}
      </div>

      {user && (
        <div className="flex items-center justify-between text-[11px] text-indigo-200/90 pt-1 border-t border-white/10">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Auto-Synced to Firestore Database
          </span>
          <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">
            UID: {user.uid.substring(0, 8)}...
          </span>
        </div>
      )}
    </div>
  );
};
