import React from 'react';
import { motion } from 'framer-motion';
import { getDailyQuote } from '../../utils/quotes';
import { BookOpen } from 'lucide-react';

export const DailyQuote: React.FC = () => {
  const quote = getDailyQuote();

  const bgByType: Record<string, string> = {
    quran: 'from-emerald-950/60 via-teal-950/40 to-slate-900/60 border-emerald-500/25',
    hadith: 'from-amber-950/60 via-orange-950/40 to-slate-900/60 border-amber-500/25',
    wisdom: 'from-indigo-950/60 via-purple-950/40 to-slate-900/60 border-indigo-500/25',
  };

  const iconColor: Record<string, string> = {
    quran: 'text-emerald-400',
    hadith: 'text-amber-400',
    wisdom: 'text-indigo-400',
  };

  const labelByType: Record<string, string> = {
    quran: '📖 آية كريمة',
    hadith: '🌙 حديث شريف',
    wisdom: '💡 حكمة اليوم',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-4 sm:p-5 rounded-3xl border bg-gradient-to-r ${bgByType[quote.type]} shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
          quote.type === 'quran' ? 'bg-emerald-500/20' :
          quote.type === 'hadith' ? 'bg-amber-500/20' : 'bg-indigo-500/20'
        }`}>
          <BookOpen className={`w-4.5 h-4.5 ${iconColor[quote.type]}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-bold mb-1.5 ${iconColor[quote.type]}`}>
            {labelByType[quote.type]}
          </p>
          <p className="text-sm sm:text-base font-bold leading-relaxed" style={{ color: 'var(--text-color)', fontFamily: 'var(--font-arabic, Tajawal)' }}>
            {quote.text}
          </p>
          <p className="text-[11px] mt-1.5 opacity-70" style={{ color: 'var(--subtext-color)' }}>
            — {quote.source}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
