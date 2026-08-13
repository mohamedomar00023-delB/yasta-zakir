import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Sun, 
  Moon, 
  Heart, 
  RotateCcw, 
  Check, 
  Volume2, 
  Award,
  Layers,
  ChevronRight,
  Plus,
  Play,
  Pause,
  BedDouble,
  Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ATHKAR_DATA } from '../../utils/presets';
import { AthkarItem } from '../../types';
import { haptic } from '../../utils/haptics';

// Play a soft synthesized mechanical Tasbeeh bead click
function playTasbeehClick() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // ignore audio block
  }
}

export const AthkarModal: React.FC = () => {
  const { isAthkarModalOpen, setIsAthkarModalOpen, addXP, triggerCelebration, settings, updateSettings, showToast } = useApp();

  const isAr = settings.language !== 'en';

  const [activeCategory, setActiveCategory] = useState<'study' | 'morning' | 'evening' | 'postPrayer' | 'sleep' | 'tasbeeh'>('study');
  const [athkarProgress, setAthkarProgress] = useState<Record<string, number>>({});
  
  // Digital Tasbeeh State
  const [tasbeehDhikr, setTasbeehDhikr] = useState('سبحان الله وبحمده');
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [tasbeehTarget, setTasbeehTarget] = useState(33);
  const [isAutoPulsing, setIsAutoPulsing] = useState(false);
  const autoPulseTimerRef = useRef<any>(null);

  // Quran tracker state (Pages 1 to 604)
  const [quranPages, setQuranPages] = useState(settings.quranPagesRead || 0);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (autoPulseTimerRef.current) clearInterval(autoPulseTimerRef.current);
    };
  }, []);

  if (!isAthkarModalOpen) return null;

  const currentList: AthkarItem[] = ATHKAR_DATA[activeCategory as keyof typeof ATHKAR_DATA] || [];

  const handleIncrementThikr = (id: string, maxCount: number) => {
    const current = athkarProgress[id] || 0;
    if (current < maxCount) {
      const nextVal = current + 1;
      setAthkarProgress(prev => ({ ...prev, [id]: nextVal }));

      playTasbeehClick();

      if (nextVal === maxCount) {
        haptic.success();
        addXP(5, isAr ? 'إتمام الذكر المبارك' : 'Completed Thikr');
        showToast(isAr ? 'تقبل الله طاعتك! +5 XP ✨' : 'Thikr completed! +5 XP ✨', 'success');
      } else {
        haptic.tasbeehTick();
      }
    }
  };

  const handleTasbeehClick = () => {
    const nextVal = tasbeehCount + 1;
    setTasbeehCount(nextVal);
    const newTotal = (settings.tasbeehTotalCount || 0) + 1;
    updateSettings({ tasbeehTotalCount: newTotal });

    playTasbeehClick();

    if (nextVal === tasbeehTarget || nextVal % 33 === 0 || nextVal % 100 === 0) {
      haptic.tasbeehMilestone();
    } else {
      haptic.tasbeehTick();
    }

    if (nextVal === tasbeehTarget) {
      triggerCelebration();
      const xpEarned = tasbeehTarget >= 100 ? 15 : 5;
      addXP(xpEarned, isAr ? 'إتمام دورة التسبيح' : 'Completed Tasbeeh cycle');
      showToast(isAr ? `أتممت ${tasbeehTarget} تسبيحة! تقبل الله طاعتك 📿 +${xpEarned} XP` : `Completed ${tasbeehTarget} Tasbeeh! 📿 +${xpEarned} XP`, 'success');
    }
  };

  const handleResetTasbeeh = () => {
    setTasbeehCount(0);
    if (isAutoPulsing) {
      setIsAutoPulsing(false);
      if (autoPulseTimerRef.current) clearInterval(autoPulseTimerRef.current);
    }
  };

  const toggleAutoPulse = () => {
    if (isAutoPulsing) {
      setIsAutoPulsing(false);
      if (autoPulseTimerRef.current) clearInterval(autoPulseTimerRef.current);
    } else {
      setIsAutoPulsing(true);
      autoPulseTimerRef.current = setInterval(() => {
        handleTasbeehClick();
      }, 1500);
    }
  };

  const handleAddQuranPage = () => {
    const next = quranPages + 1;
    setQuranPages(next);
    updateSettings({ quranPagesRead: next });
    addXP(15, isAr ? 'قراءة ورد القرآن الكريم' : 'Quran Page Read');
    showToast(isAr ? `بارك الله في وقتك! قرأت ${next} صفحة 📖 +15 XP` : `Quran Page Recorded! (${next}/604) +15 XP 📖`, 'success');
  };

  const tasbeehPresets = [
    'سبحان الله وبحمده',
    'الحمد لله حمداً كثيراً',
    'الله أكبر كبيراً',
    'لا إله إلا الله وحده لا شريك له',
    'أستغفر الله العظيم وأتوب إليه',
    'لا حول ولا قوة إلا بالله',
    'اللهم صلِّ وسلم على نبينا محمد',
    'يا حي يا قيوم برحمتك أستغيث'
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (autoPulseTimerRef.current) clearInterval(autoPulseTimerRef.current);
            setIsAthkarModalOpen(false);
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl transform rounded-3xl p-5 sm:p-7 shadow-2xl relative border my-auto max-h-[90vh] flex flex-col overflow-hidden text-start"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-color)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => {
              if (autoPulseTimerRef.current) clearInterval(autoPulseTimerRef.current);
              setIsAthkarModalOpen(false);
            }}
            className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'} p-2 rounded-full hover:bg-slate-700/40 transition-colors z-20`}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 fill-white/20" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                  <span>{isAr ? 'رفيق الأذكار والورد القرآني والسبحة 📿' : 'Daily Athkar & Digital Tasbeeh 📿'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'أدعية المذاكرة وتيسير الفهم، أذكار الصباح والمساء، والسبحة الذكية' : 'Study prayers, morning/evening athkar, and interactive tasbeeh'}
                </p>
              </div>
            </div>

            {/* Category Selector */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/70 border border-slate-800 self-start sm:self-center gap-1 overflow-x-auto max-w-full">
              {[
                { id: 'study', label: isAr ? 'المذاكرة 📚' : 'Study', icon: BookOpen },
                { id: 'tasbeeh', label: isAr ? 'السبحة 📿' : 'Tasbeeh', icon: Sparkles },
                { id: 'morning', label: isAr ? 'الصباح 🌅' : 'Morning', icon: Sun },
                { id: 'evening', label: isAr ? 'المساء 🌙' : 'Evening', icon: Moon },
                { id: 'postPrayer', label: isAr ? 'بعد الصلاة 🕌' : 'Post-Prayer', icon: Layers },
                { id: 'sleep', label: isAr ? 'النوم 🛌' : 'Sleep', icon: BedDouble },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (autoPulseTimerRef.current) clearInterval(autoPulseTimerRef.current);
                    setIsAutoPulsing(false);
                    setActiveCategory(cat.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-4">
            
            {/* 1. Digital Tasbeeh Mode */}
            {activeCategory === 'tasbeeh' ? (
              <div className="flex flex-col items-center justify-center space-y-5 py-4">
                
                {/* Dhikr Selector Chips */}
                <div className="flex flex-wrap justify-center gap-1.5 max-w-xl">
                  {tasbeehPresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setTasbeehDhikr(preset);
                        setTasbeehCount(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        tasbeehDhikr === preset
                          ? 'border-emerald-500 bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Target Selector */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span>{isAr ? 'الهدف:' : 'Target:'}</span>
                  {[33, 100, 500, 1000].map(target => (
                    <button
                      key={target}
                      onClick={() => {
                        setTasbeehTarget(target);
                        setTasbeehCount(0);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                        tasbeehTarget === target
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>

                {/* Big Interactive Tasbeeh Bead Button */}
                <div className="relative">
                  <button
                    onClick={handleTasbeehClick}
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-700 p-1.5 shadow-2xl shadow-emerald-500/30 flex items-center justify-center active:scale-95 transition-transform cursor-pointer group"
                  >
                    <div className="w-full h-full rounded-full bg-slate-950/90 flex flex-col items-center justify-center p-4 border border-emerald-400/30 group-hover:border-emerald-400/60 transition-colors">
                      <span className="text-xs sm:text-sm font-bold text-emerald-400 text-center max-w-[160px] line-clamp-2 mb-1">
                        {tasbeehDhikr}
                      </span>
                      <span className="text-4xl sm:text-5xl font-black text-white glow-emerald">
                        {tasbeehCount}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold mt-1">
                        / {tasbeehTarget}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Reset & Auto Pulse */}
                <div className="flex items-center justify-between w-full max-w-sm pt-2 gap-2">
                  <button
                    onClick={handleResetTasbeeh}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تصفير العداد' : 'Reset'}</span>
                  </button>

                  <button
                    onClick={toggleAutoPulse}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      isAutoPulsing 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isAutoPulsing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoPulsing ? (isAr ? 'إيقاف التلقائي' : 'Stop Auto') : (isAr ? 'تسبيح تلقائي' : 'Auto Pulse')}</span>
                  </button>

                  <span className="text-xs font-bold text-slate-400">
                    {isAr ? 'الإجمالي:' : 'Total:'} <strong className="text-emerald-400">{settings.tasbeehTotalCount || 0}</strong>
                  </span>
                </div>

              </div>
            ) : (
              /* 2. Athkar Cards List */
              <div className="space-y-3">
                {currentList.map(item => {
                  const doneCount = athkarProgress[item.id] || 0;
                  const isCompleted = doneCount >= item.count;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleIncrementThikr(item.id, item.count)}
                      className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer select-none relative overflow-hidden ${
                        isCompleted
                          ? 'border-emerald-500/60 bg-emerald-950/20'
                          : 'border-slate-800 bg-slate-900/50 hover:border-emerald-500/40 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                            <span>{isAr ? item.title : (item.titleEn || item.title)}</span>
                            {isCompleted && <Check className="w-4 h-4 text-emerald-400" />}
                          </h4>
                          {(item.benefit || item.benefitEn) && (
                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                              {isAr ? item.benefit : (item.benefitEn || item.benefit)}
                            </p>
                          )}
                        </div>

                        {/* Progress Count Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-black shrink-0">
                          <span className={isCompleted ? 'text-emerald-400' : 'text-slate-200'}>{doneCount}</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-400">{item.count}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium mt-2">
                        {isAr ? item.text : (item.textEn || item.text)}
                      </p>

                      {/* Progress Bar inside card */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (doneCount / item.count) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quran Khatmah Progress Bar at the bottom */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/60 border border-indigo-500/30 space-y-2 mt-4 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">{isAr ? 'متابعة الختمة والورد القرآني 📖' : 'Quran Reading & Khatmah Progress 📖'}</h4>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? `قرأت: ${quranPages} من 604 صفحة (الجزء ${Math.min(30, Math.floor(quranPages / 20) + 1)})` : `Read: ${quranPages} / 604 pages (Juz ${Math.min(30, Math.floor(quranPages / 20) + 1)})`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddQuranPage}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? '+ صفحة قرأتها' : '+ Read Page'}</span>
                </button>
              </div>

              {/* Quran Progress */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((quranPages / 604) * 100))}%` }}
                />
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
