import React from 'react';
import { Language, ThemePreset } from '../types';
import { getTranslation } from '../utils/translations';
import { getThemePresetConfig } from '../utils/theme';
import { Home, BookOpen, Receipt, PieChart, User } from 'lucide-react';

export type TabType = 'home' | 'udhar' | 'expenses' | 'reports' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: Language;
  overdueCount: number;
  themePreset?: ThemePreset;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  language,
  overdueCount,
  themePreset,
}) => {
  const theme = getThemePresetConfig(themePreset);

  const tabs = [
    { id: 'home' as TabType, labelKey: 'navHome', icon: Home },
    { id: 'udhar' as TabType, labelKey: 'navUdhar', icon: BookOpen, badge: overdueCount > 0 ? overdueCount : undefined },
    { id: 'expenses' as TabType, labelKey: 'navExpenses', icon: Receipt },
    { id: 'reports' as TabType, labelKey: 'navReports', icon: PieChart },
    { id: 'profile' as TabType, labelKey: 'navProfile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg transition-colors w-full">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = getTranslation(language, tab.labelKey as any);

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? theme.activeTabClass
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
