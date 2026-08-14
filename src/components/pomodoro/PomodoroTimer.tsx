import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  Coffee, 
  Brain, 
  CloudRain, 
  Waves, 
  Radio, 
  CheckCircle2,
  Zap,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playSuccessPing, startAmbientSound, stopAmbientSound } from '../../utils/sound';
import { haptic } from '../../utils/haptics';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type AmbientSoundType = 'none' | 'rain' | 'waves' | 'whitenoise';

export const PomodoroTimer: React.FC = () => {
  const { addXP, triggerCelebration, showToast, settings } = useApp();
  const isAr = settings.language !== 'en';

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customFocusMins, setCustomFocusMins] = useState(25);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [completedSessions, setCompletedSessions] = useState(0);

  const totalTime = mode === 'focus' ? customFocusMins * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed session
      setIsRunning(false);
      stopAmbientSound();
      playSuccessPing();
      haptic.celebration();

      if (mode === 'focus') {
        const nextCompleted = completedSessions + 1;
        setCompletedSessions(nextCompleted);
        addXP(25, isAr ? 'جلسة تركيز بومودورو مكتملة' : 'Completed Pomodoro Focus Session');
        triggerCelebration();
        showToast(isAr ? 'عاش يا بطل! أنهيت جلسة التركيز بنجاح (+25 XP) 🎉' : 'Great job! Focus session completed (+25 XP) 🎉', 'success');

        // Auto switch to break
        if (nextCompleted % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(15 * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(5 * 60);
        }
      } else {
        showToast(isAr ? 'انتهى وقت الراحة! جاهز لجلسة تركيز جديدة؟ 🚀' : 'Break ended! Ready for next focus session? 🚀', 'info');
        setMode('focus');
        setTimeLeft(customFocusMins * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, completedSessions, customFocusMins, addXP, triggerCelebration, showToast, isAr]);

  // Ambient Sound Manager
  const handleSelectAmbient = (sound: AmbientSoundType) => {
    haptic.selection();
    if (ambientSound === sound) {
      setAmbientSound('none');
      stopAmbientSound();
    } else {
      setAmbientSound(sound);
      if (isRunning) {
        startAmbientSound(sound);
      }
    }
  };

  const toggleTimer = () => {
    haptic.medium();
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (nextRunning) {
      if (ambientSound !== 'none') {
        startAmbientSound(ambientSound);
      }
    } else {
      stopAmbientSound();
    }
  };

  const resetTimer = () => {
    haptic.light();
    setIsRunning(false);
    stopAmbientSound();
    setTimeLeft(totalTime);
  };

  const handleModeChange = (newMode: TimerMode) => {
    haptic.selection();
    setIsRunning(false);
    stopAmbientSound();
    setMode(newMode);
    if (newMode === 'focus') setTimeLeft(customFocusMins * 60);
    else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div 
      className="p-5 sm:p-6 rounded-3xl border glass-card shadow-xl relative overflow-hidden"
      style={{ borderColor: 'var(--card-border)' }}
    >
      {/* Background Glow */}
      <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors ${
        mode === 'focus' ? 'bg-indigo-500' : 'bg-emerald-500'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md text-lg ${
            mode === 'focus' 
              ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/25' 
              : 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/25'
          }`}>
            {mode === 'focus' ? <Brain className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black flex items-center gap-1.5" style={{ color: 'var(--text-color)' }}>
              <span>{isAr ? 'مؤقت التركيز وبومودورو 🍅' : 'Focus Timer & Pomodoro 🍅'}</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {isAr ? 'جلسات تركيز عميق مع أصوات بيئية مريحة لتثبيت الفهم' : 'Deep focus blocks with ambient study noise'}
            </p>
          </div>
        </div>

        {/* Sessions Counter Badge */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>{completedSessions} {isAr ? 'جلسات' : 'Sessions'}</span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 gap-1 shadow-inner max-w-md mx-auto">
        <button
          onClick={() => handleModeChange('focus')}
          className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mode === 'focus'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>{isAr ? 'جلسة تركيز' : 'Focus'}</span>
        </button>

        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mode === 'shortBreak'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{isAr ? 'استراحة قصيرة (5د)' : 'Short (5m)'}</span>
        </button>

        <button
          onClick={() => handleModeChange('longBreak')}
          className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mode === 'longBreak'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'استراحة طويلة (15د)' : 'Long (15m)'}</span>
        </button>
      </div>

      {/* Center Countdown Display with Ring Progress */}
      <div className="relative my-6 flex flex-col items-center justify-center">
        
        {/* Circular SVG Gauge */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800/80 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress Animated Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`stroke-current transition-all duration-1000 ${
                mode === 'focus' ? 'text-indigo-500' : 'text-emerald-500'
              }`}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight" style={{ color: 'var(--text-color)' }}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-indigo-400 mt-1 uppercase tracking-wider">
              {isRunning 
                ? (mode === 'focus' ? (isAr ? 'جاري التركيز 🧠' : 'Focusing 🧠') : (isAr ? 'وقت الراحة ☕' : 'Resting ☕')) 
                : (isAr ? 'اضغط للبدء' : 'Press Start')}
            </span>
          </div>
        </div>

        {/* Focus Duration Quick Selector (25m / 45m / 60m) */}
        {mode === 'focus' && !isRunning && (
          <div className="flex items-center gap-1.5 mt-3">
            {[25, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => {
                  haptic.selection();
                  setCustomFocusMins(mins);
                  setTimeLeft(mins * 60);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  customFocusMins === mins
                    ? 'bg-indigo-600/30 border border-indigo-500 text-indigo-300'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mins} {isAr ? 'دقيقة' : 'min'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Play / Pause & Reset Controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={toggleTimer}
          className={`px-8 sm:px-10 py-3.5 rounded-2xl font-black text-sm text-white shadow-xl flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer ${
            isRunning
              ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              : mode === 'focus'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 shadow-indigo-500/30 hover:scale-105'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 shadow-emerald-500/30 hover:scale-105'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
          <span>{isRunning ? (isAr ? 'إيقاف مؤقت' : 'Pause') : (isAr ? 'ابدأ الجلسة 🚀' : 'Start Focus 🚀')}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
          title={isAr ? 'إعادة ضبط المؤقت' : 'Reset Timer'}
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Ambient Study Sounds Selector Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>{isAr ? 'أصوات التركيز البيئية (أوفلاين):' : 'Ambient Focus Noise (Offline):'}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'none', label: isAr ? 'بدون صوت' : 'None', icon: VolumeX },
            { id: 'rain', label: isAr ? 'مطر 🌧️' : 'Rain 🌧️', icon: CloudRain },
            { id: 'waves', label: isAr ? 'أمواج 🌊' : 'Waves 🌊', icon: Waves },
            { id: 'whitenoise', label: isAr ? 'ضوضاء بيضاء 🎧' : 'White Noise 🎧', icon: Radio },
          ].map(item => {
            const isSelected = ambientSound === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectAmbient(item.id as AmbientSoundType)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
