import React from 'react';
import { Clock, Calendar, CheckSquare, FileText, CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const tabs = [
    { id: 'today', label: t('navToday'), icon: Clock },
    { id: 'weekly', label: t('navWeekly'), icon: Calendar },
    { id: 'calendar', label: t('navCalendar'), icon: CalendarDays },
    { id: 'tasks', label: t('navTasks'), icon: CheckSquare },
    { id: 'notes', label: t('navNotes'), icon: FileText },
  ] as const;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around backdrop-blur-2xl shadow-2xl transition-all"
      style={{
        background: 'var(--panel-bg)',
        borderColor: 'var(--panel-border)',
      }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center min-w-[58px] py-1.5 px-2 rounded-2xl transition-all duration-200 ${
              isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                : 'hover:opacity-80 active:scale-95'
            }`}
            style={!isActive ? { color: 'var(--subtext-color)' } : {}}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-bold leading-none">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
