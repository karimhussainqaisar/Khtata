import React from 'react';
import { User } from 'firebase/auth';
import { UserProfile, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { getThemePresetConfig } from '../utils/theme';
import { Sparkles, Moon, Sun, Lock, LogIn, LogOut, CloudCheck } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  user: User | null;
  authLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenKhataAi: () => void;
  onLockApp: () => void;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  user,
  authLoading,
  onLogin,
  onLogout,
  onUpdateProfile,
  onOpenKhataAi,
  onLockApp,
  overdueCount,
}) => {
  const theme = getThemePresetConfig(profile.themePreset);

  const toggleLanguage = () => {
    const nextLang: Language = profile.language === 'en' ? 'ur' : 'en';
    onUpdateProfile({ language: nextLang });
  };

  const toggleDarkMode = () => {
    onUpdateProfile({ isDarkMode: !profile.isDarkMode });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & User Info */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.gradientClass} flex items-center justify-center text-white shadow-md font-bold text-xl tracking-wider overflow-hidden`}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || profile.name} className="w-full h-full object-cover" />
              ) : profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                'KP'
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-bold ${user ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              {user ? '✓' : '•'}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                {profile.isShopkeeper && profile.shopName ? profile.shopName : getTranslation(profile.language, 'appName')}
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.badgeBg} ${theme.badgeText} rounded-lg border border-slate-200/60 dark:border-slate-700/60`}>
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 rtl:space-x-reverse">
              <span className="font-medium truncate max-w-[110px]">{user ? user.displayName || user.email : profile.name}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{user ? 'Firestore Synced' : 'Guest'}</span>
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          {/* Google Login / Account Pill */}
          {!user ? (
            <button
              onClick={onLogin}
              disabled={authLoading}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
              title="Sign in with Google Account"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">Google Login</span>
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
              title={`Logged in as ${user.email}. Click to Logout.`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Khata AI Trigger Button */}
          <button
            onClick={onOpenKhataAi}
            id="btn-khata-ai"
            className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium shadow-sm hover:opacity-95 transition-transform active:scale-95"
            title="Open Khata AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span className="hidden sm:inline">Khata AI</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            id="btn-toggle-lang"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700"
            title="Toggle English / Urdu"
          >
            <span className="text-indigo-600 dark:text-indigo-400">{profile.language === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            id="btn-toggle-dark"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            title="Toggle Dark Mode"
          >
            {profile.isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Security Lock Button */}
          {profile.pinEnabled && (
            <button
              onClick={onLockApp}
              id="btn-lock-app"
              className="p-2 rounded-xl text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors"
              title="Lock App"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

