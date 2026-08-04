import React, { useState } from 'react';
import { UserProfile, Language, ThemePreset } from '../types';
import { getTranslation } from '../utils/translations';
import { resetToDemoData } from '../utils/storage';
import { THEME_PRESETS, getThemePresetConfig } from '../utils/theme';
import { User, Store, Lock, Globe, Moon, Sun, RefreshCw, ShieldCheck, Check, Phone, DollarSign, Fingerprint, Camera, Upload, Image as ImageIcon, Palette, Sparkles } from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetDemo: () => void;
  language: Language;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onResetDemo,
  language,
}) => {
  const [name, setName] = useState(profile.name);
  const [shopName, setShopName] = useState(profile.shopName);
  const [phone, setPhone] = useState(profile.phone);
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [isShopkeeper, setIsShopkeeper] = useState(profile.isShopkeeper);
  const [pinEnabled, setPinEnabled] = useState(profile.pinEnabled);
  const [pinCode, setPinCode] = useState(profile.pinCode || '1234');
  const [biometricEnabled, setBiometricEnabled] = useState(profile.biometricEnabled ?? true);
  const [currency, setCurrency] = useState(profile.currency || 'Rs.');
  const [budget, setBudget] = useState(profile.monthlyBudget.toString());
  const [themePreset, setThemePreset] = useState<ThemePreset>(profile.themePreset || 'corporate_blue');
  const [saved, setSaved] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim(),
      shopName: shopName.trim(),
      phone: phone.trim(),
      avatar,
      isShopkeeper,
      pinEnabled,
      pinCode,
      biometricEnabled,
      currency,
      monthlyBudget: parseFloat(budget) || 85000,
      themePreset,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentTheme = getThemePresetConfig(themePreset);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Title */}
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
          {getTranslation(language, 'userProfile')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Account settings, PIN lock & Pakistani preferences
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4">
        {/* Profile Info Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative group">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentTheme.gradientClass} text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden border-2 border-indigo-200 dark:border-indigo-800`}>
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name.substring(0, 2).toUpperCase()
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-indigo-700 hover:scale-110 transition-all border-2 border-white dark:border-slate-900">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{name || 'Your Name'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{shopName || 'Personal Account'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                  Verified Account ✓
                </span>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Preset Avatars */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Choose Profile Photo (پروفائل تصویر منتخب کریں)
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <label className="w-10 h-10 rounded-xl border border-dashed border-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors flex-shrink-0">
                <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>

              {PRESET_AVATARS.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(imgUrl)}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-transform ${
                    avatar === imgUrl
                      ? 'border-indigo-600 scale-105 shadow-md'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shop / Business Name (Optional)
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Mehmood General Store"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
              />
            </div>

            {/* Shopkeeper Mode Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-indigo-500" /> Shopkeeper / Business Mode
              </span>
              <button
                type="button"
                onClick={() => setIsShopkeeper(!isShopkeeper)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                  isShopkeeper ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isShopkeeper ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Settings Section Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" /> Theme Settings (تھیم کی ترتیبات)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Select custom gradient theme preset for headers, avatars & highlights
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
              {currentTheme.nameEn}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {THEME_PRESETS.map((preset) => {
              const isSelected = themePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setThemePreset(preset.id);
                    onUpdateProfile({ themePreset: preset.id });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    {/* Gradient Swatch Circle */}
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${preset.gradientClass} shadow-md flex items-center justify-center text-white flex-shrink-0`}
                    >
                      <Sparkles className="w-4 h-4 text-white/90" />
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {preset.nameEn}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {preset.nameUr}
                      </div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white scale-110'
                      : 'border border-slate-300 dark:border-slate-600 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security & Currency Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Security & Preferences
          </h3>

          {/* PIN Lock */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-500" /> Security PIN Lock
              </span>
              <p className="text-[11px] text-slate-400">Require 4-digit PIN to open Khata</p>
            </div>
            <button
              type="button"
              onClick={() => setPinEnabled(!pinEnabled)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                pinEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  pinEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {pinEnabled && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                4-Digit Security PIN Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base font-bold text-center tracking-widest"
              />
            </div>
          )}

          {/* Biometric Unlock */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/50">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-500" /> Biometric Unlock (Fingerprint / Face ID)
              </span>
              <p className="text-[11px] text-slate-400">Enable fast biometric access on supported devices</p>
            </div>
            <button
              type="button"
              onClick={() => setBiometricEnabled(!biometricEnabled)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                biometricEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Currency Display */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency Symbol Display
            </label>
            <div className="flex gap-2">
              {['Rs.', 'PKR', '₨'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currency === c
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 ${currentTheme.primaryBtnClass}`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" /> Settings Saved!
            </>
          ) : (
            'Save Profile & Preferences'
          )}
        </button>
      </form>

      {/* Demo Data Reset Card */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">Restore Pakistani Demo Ledger</span>
          <span className="text-slate-400 text-[11px]">Resets mock records for testing</span>
        </div>
        <button
          onClick={onResetDemo}
          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restore
        </button>
      </div>
    </div>
  );
};
