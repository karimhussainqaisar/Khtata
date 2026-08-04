import React from 'react';
import { UserProfile, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { Sparkles, Globe, Moon, Sun, Lock, ShieldCheck, Wallet } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenKhataAi: () => void;
  onLockApp: () => void;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onUpdateProfile,
  onOpenKhataAi,
  onLockApp,
  overdueCount,
}) => {
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-xl tracking-wider">
              KP
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-bold">
              ✓
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                {profile.isShopkeeper && profile.shopName ? profile.shopName : getTranslation(profile.language, 'appName')}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 rtl:space-x-reverse">
              <span className="font-medium">{profile.name}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">PKR (₨)</span>
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
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
