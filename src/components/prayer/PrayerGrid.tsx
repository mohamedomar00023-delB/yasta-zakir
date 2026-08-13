import React from 'react';
import { Check, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { PrayerItem, PrayerName } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, formatTime12h } from '../../utils/formatters';

interface PrayerGridProps {
  prayers: PrayerItem[];
}

const PRAYER_ICONS: Record<PrayerName, React.ReactNode> = {
  Fajr: <Sunrise className="w-5 h-5 text-indigo-400" />,
  Sunrise: <Sun className="w-5 h-5 text-amber-400" />,
  Dhuhr: <Sun className="w-5 h-5 text-amber-500" />,
  Asr: <Sun className="w-5 h-5 text-orange-400" />,
  Maghrib: <Sunset className="w-5 h-5 text-rose-400" />,
  Isha: <Moon className="w-5 h-5 text-purple-400" />,
};

export const PrayerGrid: React.FC<PrayerGridProps> = ({ prayers }) => {
  const { prayersCompleted, togglePrayerCompletion, settings } = useApp();
  const isAr = settings.language !== 'en';
  const todayStr = getTodayDateString();

  if (prayers.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-card p-4 rounded-2xl animate-pulse h-28"
            style={{ background: 'var(--card-bg)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {prayers.map(prayer => {
        const isCompleted = !!prayersCompleted[`${todayStr}_${prayer.name}`];
        const isNext = prayer.isNext;

        return (
          <div
            key={prayer.name}
            className={`glass-card p-3 sm:p-4 rounded-2xl relative flex flex-col justify-between transition-all border ${
              isNext
                ? 'ring-2 ring-indigo-500 scale-[1.02] shadow-xl'
                : ''
            }`}
            style={{
              background: isCompleted ? 'rgba(16,185,129,0.1)' : 'var(--card-bg)',
              borderColor: isCompleted ? 'rgba(16,185,129,0.3)' : isNext ? '#6366f1' : 'var(--card-border)',
            }}
          >
            {/* Header: Icon & Checkmark */}
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                {PRAYER_ICONS[prayer.name]}
              </div>

              <div className="flex items-center gap-1">
                {isNext && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] sm:text-[10px] font-bold animate-pulse">
                    {isAr ? 'القادمة' : 'Next'}
                  </span>
                )}

                {/* Completion Checkmark */}
                <button
                  onClick={() => togglePrayerCompletion(todayStr, prayer.name)}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                      : 'hover:bg-indigo-500/20'
                  }`}
                  style={!isCompleted ? { background: 'var(--input-bg)', color: 'var(--subtext-color)' } : {}}
                  title={isCompleted ? (isAr ? 'تم أداء الصلاة (+10 XP)' : 'Prayer done (+10 XP)') : (isAr ? 'تحديد كـ أدّيت الصلاة (+10 XP)' : 'Mark as done (+10 XP)')}
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Content: Prayer Name & Time */}
            <div className="mt-0.5 sm:mt-1">
              <h4 className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                {isAr ? prayer.arabicName : prayer.name}
              </h4>
              <p className="text-sm sm:text-base font-black text-indigo-400 mt-0.5 dir-ltr text-start">
                {formatTime12h(prayer.time, !isAr)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
