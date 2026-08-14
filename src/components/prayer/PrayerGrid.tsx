import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Sparkles,
  Flame,
  Clock,
  Compass
} from 'lucide-react';
import { PrayerItem, PrayerName } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, formatTime12h, timeToMinutes } from '../../utils/formatters';
import { playSuccessPing } from '../../utils/sound';
import { haptic } from '../../utils/haptics';

interface PrayerGridProps {
  prayers: PrayerItem[];
}

const PRAYER_THEMES: Record<PrayerName, { icon: string; color: string; bg: string; border: string }> = {
  Fajr: { icon: '🌅', color: 'text-indigo-300', bg: 'from-indigo-950/40 to-slate-900/60', border: 'border-indigo-500/30' },
  Sunrise: { icon: '☀️', color: 'text-amber-300', bg: 'from-amber-950/30 to-slate-900/60', border: 'border-amber-500/25' },
  Dhuhr: { icon: '🌞', color: 'text-amber-400', bg: 'from-amber-950/40 to-slate-900/60', border: 'border-amber-500/30' },
  Asr: { icon: '🌤️', color: 'text-orange-300', bg: 'from-orange-950/30 to-slate-900/60', border: 'border-orange-500/30' },
  Maghrib: { icon: '🌇', color: 'text-rose-400', bg: 'from-rose-950/40 to-slate-900/60', border: 'border-rose-500/30' },
  Isha: { icon: '🌙', color: 'text-purple-400', bg: 'from-purple-950/40 to-slate-900/60', border: 'border-purple-500/30' },
};

export const PrayerGrid: React.FC<PrayerGridProps> = ({ prayers }) => {
  const { prayersCompleted, togglePrayerCompletion, addXP, triggerCelebration, showToast, settings } = useApp();
  const isAr = settings.language !== 'en';
  const todayStr = getTodayDateString();

  const now = new Date();
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();

  if (prayers.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-card p-4 rounded-3xl animate-pulse h-32"
            style={{ background: 'var(--card-bg)' }} />
        ))}
      </div>
    );
  }

  const handleTogglePrayer = (prayerName: PrayerName, arabicName: string, wasCompleted: boolean) => {
    haptic.prayer();
    togglePrayerCompletion(todayStr, prayerName);
    if (!wasCompleted) {
      playSuccessPing();
      addXP(25, isAr ? `أداء فرض صلاة ${arabicName}` : `Completed ${prayerName} Prayer`);
      triggerCelebration();
      showToast(isAr ? `تقبل الله طاعتك! تم تسجيل صلاة ${arabicName} (+25 XP) 🤲` : `Prayer marked complete (+25 XP) 🤲`, 'success');
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
      {prayers.map((prayer, idx) => {
        const isCompleted = !!prayersCompleted[`${todayStr}_${prayer.name}`];
        const isNext = prayer.isNext;
        const theme = PRAYER_THEMES[prayer.name] || PRAYER_THEMES.Fajr;

        const prayerMins = timeToMinutes(prayer.time);
        const diff = prayerMins - currentTotalMins;

        return (
          <motion.div
            key={prayer.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`p-3.5 sm:p-4 rounded-3xl relative flex flex-col justify-between transition-all border overflow-hidden group ${
              isCompleted
                ? 'bg-gradient-to-b from-emerald-950/40 via-emerald-950/20 to-slate-900/80 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : isNext
                  ? 'bg-gradient-to-b from-amber-950/40 via-indigo-950/50 to-slate-900/90 border-amber-400/80 ring-2 ring-amber-400/60 shadow-xl shadow-amber-500/20 scale-[1.03] z-10'
                  : `bg-gradient-to-b ${theme.bg} ${theme.border} hover:border-indigo-500/40 hover:bg-slate-900/80`
            }`}
          >
            {/* Ambient subtle glow for next prayer */}
            {isNext && (
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            )}

            {/* Header: Prayer Icon + Status Badge + Checkbox */}
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-lg shadow-inner shrink-0">
                <span>{theme.icon}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {isNext && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-black animate-pulse shadow-sm">
                    {isAr ? 'القادمة' : 'Next'}
                  </span>
                )}

                {/* Completion Checkmark (Only for 5 Obligatory Prayers, not Sunrise) */}
                {prayer.name !== 'Sunrise' && (
                  <button
                    onClick={() => handleTogglePrayer(prayer.name, prayer.arabicName, isCompleted)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                        : 'bg-slate-900/80 border border-slate-700/80 text-slate-500 hover:text-white hover:border-emerald-500/50'
                    }`}
                    title={isCompleted ? (isAr ? 'تم أداء الصلاة (+25 XP)' : 'Prayer done (+25 XP)') : (isAr ? 'تأكيد أداء الفرض (+25 XP)' : 'Mark Prayer Complete (+25 XP)')}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>

            {/* Content: Name & Time */}
            <div className="space-y-0.5 mt-1">
              <h4 className={`text-xs sm:text-sm font-black ${isCompleted ? 'text-emerald-300' : isNext ? 'text-amber-300' : 'text-slate-100'}`}>
                {isAr ? prayer.arabicName : prayer.name}
              </h4>
              
              <p className={`text-sm sm:text-base font-black font-mono dir-ltr text-start ${
                isCompleted ? 'text-emerald-400' : isNext ? 'text-amber-400' : 'text-indigo-400'
              }`}>
                {formatTime12h(prayer.time)}
              </p>
            </div>

            {/* Time Status Footer */}
            <div className="pt-2 border-t border-slate-800/40 mt-2 text-[10px] font-semibold text-slate-400">
              {isCompleted ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span>✓</span>
                  <span>{isAr ? 'تمت الصلاة' : 'Fulfilled'}</span>
                </span>
              ) : isNext ? (
                <span className="text-amber-300 font-bold">
                  {diff > 0 ? (isAr ? `متبقي ${Math.floor(diff / 60)}س ${diff % 60}د` : `in ${diff}m`) : (isAr ? 'حان الوقت الآن 🕌' : 'Due now')}
                </span>
              ) : (
                <span className="text-slate-500">
                  {diff < 0 ? (isAr ? 'مضت' : 'Passed') : (isAr ? 'قادمة' : 'Upcoming')}
                </span>
              )}
            </div>

          </motion.div>
        );
      })}
    </div>
  );
};
