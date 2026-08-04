import { ThemePreset } from '../types';

export interface ThemeConfig {
  id: ThemePreset;
  nameEn: string;
  nameUr: string;
  gradientClass: string;
  heroBannerGradient: string;
  reportBannerGradient: string;
  activeTabClass: string;
  primaryBtnClass: string;
  accentColorText: string;
  badgeBg: string;
  badgeText: string;
  activeRing: string;
  previewColors: string[];
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'corporate_blue',
    nameEn: 'Corporate Blue',
    nameUr: 'کارپوریٹ بلیو',
    gradientClass: 'from-blue-600 via-indigo-600 to-indigo-700',
    heroBannerGradient: 'from-blue-900 via-indigo-900 to-slate-950 border-indigo-700/40',
    reportBannerGradient: 'from-blue-600 to-indigo-700',
    activeTabClass: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50 font-bold scale-105',
    primaryBtnClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/20 text-white',
    accentColorText: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-950',
    badgeText: 'text-blue-700 dark:text-blue-300',
    activeRing: 'ring-blue-500',
    previewColors: ['#2563EB', '#4F46E5', '#4338CA'],
  },
  {
    id: 'emerald_forest',
    nameEn: 'Emerald Forest',
    nameUr: 'زمرد فارسٹ',
    gradientClass: 'from-emerald-600 via-teal-600 to-cyan-700',
    heroBannerGradient: 'from-emerald-950 via-teal-900 to-slate-950 border-teal-700/40',
    reportBannerGradient: 'from-emerald-600 to-teal-700',
    activeTabClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/50 font-bold scale-105',
    primaryBtnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20 text-white',
    accentColorText: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    activeRing: 'ring-emerald-500',
    previewColors: ['#059669', '#0D9488', '#0E7490'],
  },
  {
    id: 'sunset_purple',
    nameEn: 'Sunset Purple',
    nameUr: 'غروب آفتاب پرپل',
    gradientClass: 'from-purple-600 via-pink-600 to-rose-600',
    heroBannerGradient: 'from-purple-950 via-pink-950 to-slate-950 border-pink-700/40',
    reportBannerGradient: 'from-purple-600 to-pink-600',
    activeTabClass: 'text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/50 font-bold scale-105',
    primaryBtnClass: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-600/20 text-white',
    accentColorText: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-950',
    badgeText: 'text-purple-700 dark:text-purple-300',
    activeRing: 'ring-purple-500',
    previewColors: ['#9333EA', '#DB2777', '#E11D48'],
  },
  {
    id: 'midnight_slate',
    nameEn: 'Midnight Slate',
    nameUr: 'مڈ نائٹ سلیٹ',
    gradientClass: 'from-slate-700 via-slate-800 to-slate-900',
    heroBannerGradient: 'from-slate-900 via-slate-800 to-black border-slate-700/40',
    reportBannerGradient: 'from-slate-700 to-slate-900',
    activeTabClass: 'text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800/80 font-bold scale-105',
    primaryBtnClass: 'bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black shadow-slate-700/20 text-white',
    accentColorText: 'text-slate-800 dark:text-slate-200',
    badgeBg: 'bg-slate-200 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200',
    activeRing: 'ring-slate-500',
    previewColors: ['#334155', '#1E293B', '#0F172A'],
  },
  {
    id: 'royal_gold',
    nameEn: 'Royal Gold',
    nameUr: 'رائل گولڈ',
    gradientClass: 'from-amber-500 via-orange-600 to-amber-700',
    heroBannerGradient: 'from-amber-950 via-orange-950 to-slate-950 border-amber-700/40',
    reportBannerGradient: 'from-amber-500 to-orange-600',
    activeTabClass: 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/50 font-bold scale-105',
    primaryBtnClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/20 text-white',
    accentColorText: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-950',
    badgeText: 'text-amber-800 dark:text-amber-300',
    activeRing: 'ring-amber-500',
    previewColors: ['#F59E0B', '#EA580C', '#B45309'],
  },
];

export function getThemePresetConfig(preset?: ThemePreset): ThemeConfig {
  return THEME_PRESETS.find((p) => p.id === preset) || THEME_PRESETS[0];
}
