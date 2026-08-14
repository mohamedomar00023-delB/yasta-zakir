import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomQuote, getDailyQuote, QuoteItem } from '../../utils/quotes';
import { BookOpen, Copy, RefreshCw, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils/haptics';

export const DailyQuote: React.FC = () => {
  const { showToast, settings } = useApp();
  const isAr = settings.language !== 'en';

  const [quote, setQuote] = useState<QuoteItem>(() => getDailyQuote());
  const [isCopied, setIsCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const bgByType: Record<string, string> = {
    quran: 'from-emerald-950/60 via-teal-950/40 to-slate-900/80 border-emerald-500/30',
    hadith: 'from-amber-950/60 via-orange-950/40 to-slate-900/80 border-amber-500/30',
    wisdom: 'from-indigo-950/60 via-purple-950/40 to-slate-900/80 border-indigo-500/30',
  };

  const iconColor: Record<string, string> = {
    quran: 'text-emerald-400',
    hadith: 'text-amber-400',
    wisdom: 'text-indigo-400',
  };

  const labelByType: Record<string, string> = {
    quran: isAr ? '📖 آية كريمة للتأمل' : '📖 Quranic Verse',
    hadith: isAr ? '🌙 حديث نبوي شريف' : '🌙 Prophetic Hadith',
    wisdom: isAr ? '💡 حكمة اليوم للتحفيز' : '💡 Daily Wisdom',
  };

  const handleNextQuote = () => {
    haptic.selection();
    setIsRotating(true);
    const next = getRandomQuote();
    setQuote(next);
    setTimeout(() => setIsRotating(false), 400);
  };

  const handleCopy = () => {
    haptic.light();
    navigator.clipboard.writeText(`«${quote.text}»\n— ${quote.source}`);
    setIsCopied(true);
    showToast(isAr ? 'تم نسخ الاقتباس إلى الحافظة 📋' : 'Quote copied to clipboard 📋', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 sm:p-5 rounded-3xl border bg-gradient-to-r ${bgByType[quote.type]} shadow-xl backdrop-blur-md relative overflow-hidden`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Quote Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner ${
            quote.type === 'quran' ? 'bg-emerald-500/20' :
            quote.type === 'hadith' ? 'bg-amber-500/20' : 'bg-indigo-500/20'
          }`}>
            <BookOpen className={`w-5 h-5 ${iconColor[quote.type]}`} />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black uppercase tracking-wider ${iconColor[quote.type]}`}>
                {labelByType[quote.type]}
              </span>
            </div>

            <p className="text-sm sm:text-base font-bold leading-relaxed" style={{ color: 'var(--text-color)', fontFamily: 'Tajawal, sans-serif' }}>
              ❝ {quote.text} ❞
            </p>

            <p className="text-[11px] font-semibold opacity-75 text-slate-400">
              — {quote.source}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            title={isAr ? 'نسخ الاقتباس' : 'Copy Quote'}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleNextQuote}
            className="px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title={isAr ? 'عرض اقتباس آخر' : 'Next Quote'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'حكمة أخرى' : 'Next'}</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
};
