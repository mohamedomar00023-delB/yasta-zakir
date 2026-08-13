import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Palette, Volume2, Sparkles, Square, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { THEME_CONFIGS } from '../../utils/themes';
import { ChimeToneId, ThemeId } from '../../types';
import { playAdhanChime, stopActiveAudio, setMasterVolume } from '../../utils/sound';

export const ThemeSelectorModal: React.FC = () => {
  const {
    isThemeModalOpen,
    setIsThemeModalOpen,
    settings,
    updateSettings,
    showToast,
  } = useApp();

  const isAr = settings.language !== 'en';
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isThemeModalOpen) return null;

  const handleSelectTheme = (themeId: ThemeId) => {
    const config = THEME_CONFIGS[themeId];
    updateSettings({
      themeId,
      theme: config.isDark ? 'dark' : 'light',
    });
    showToast(isAr ? `تم تغيير الثيم إلى "${config.nameAr}" 🎨` : `Theme changed to "${config.nameEn}" 🎨`, 'success');
  };

  const handleSelectChime = (tone: ChimeToneId) => {
    updateSettings({ chimeTone: tone });
    setIsPlaying(true);
    playAdhanChime(tone, settings.volume);

    const chimeNames: Record<ChimeToneId, string> = {
      'full-adhan': isAr ? 'أذان كامل بصوت عذب 🕌' : 'Full Adhan Audio 🕌',
      'takbeer': isAr ? 'تكبيرات الأذان 🕋' : 'Adhan Takbeer 🕋',
      'soft-bell': isAr ? 'جرس هادئ ناعم 🔔' : 'Soft Bell 🔔',
      'oud-chime': isAr ? 'نغمة عود شرقية 🎵' : 'Oud Chime 🎵',
      'crystal': isAr ? 'نغمة الكريستال 💎' : 'Crystal Chime 💎',
      'oriental': isAr ? 'نغمة كلاسيكية 🎼' : 'Classic Melody 🎼',
    };
    showToast(isAr ? `تم اختيار ${chimeNames[tone]}` : `${chimeNames[tone]} selected`, 'info');
  };

  const handleStopAudio = () => {
    stopActiveAudio();
    setIsPlaying(false);
    showToast(isAr ? 'تم إيقاف الصوت ⏹️' : 'Audio stopped ⏹️', 'info');
  };

  const handleVolumeChange = (vol: number) => {
    updateSettings({ volume: vol });
    setMasterVolume(vol);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            stopActiveAudio();
            setIsThemeModalOpen(false);
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl transform rounded-3xl shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto text-start"
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <Palette className="w-5 h-5 text-indigo-400" />
                <span>{isAr ? 'تخصيص الثيمات وصوت الأذان والتنبيهات' : 'Customize Theme & Adhan Audio'}</span>
              </h3>
              <button
                onClick={() => {
                  stopActiveAudio();
                  setIsThemeModalOpen(false);
                }}
                className="p-1.5 rounded-xl transition-colors hover:bg-red-500/10 hover:text-red-400"
                style={{ color: 'var(--subtext-color)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">

              {/* 1. Theme Picker */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold mb-3" style={{ color: 'var(--subtext-color)' }}>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'اختر الثيم المفضل لواجهتك' : 'Select your favorite theme'}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {Object.values(THEME_CONFIGS).map(theme => {
                    const isSelected = settings.themeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`h-24 sm:h-28 p-3.5 rounded-2xl border text-start flex flex-col justify-between relative overflow-hidden transition-all ${theme.previewBg} ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 border-indigo-500 scale-[1.04] shadow-xl'
                            : 'border-slate-700/50 hover:scale-[1.02] hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                            {isAr ? theme.nameAr : theme.nameEn}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold ${theme.isDark ? 'text-slate-300/80' : 'text-slate-500'}`}>
                          {isAr ? theme.nameEn : theme.nameAr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Adhan & Chime Tone Selector */}
              <div className="pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--subtext-color)' }}>
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'اختر صوت الأذان ونغمة التنبيه' : 'Select Adhan Audio & Notification Tone'}</span>
                  </label>

                  {isPlaying && (
                    <button
                      onClick={handleStopAudio}
                      className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all animate-pulse"
                    >
                      <Square className="w-3 h-3 fill-white" />
                      <span>{isAr ? 'إيقاف الصوت' : 'Stop Audio'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'full-adhan', name: isAr ? '🕌 أذان كامل بصوت عذب' : '🕌 Full Adhan Audio' },
                    { id: 'takbeer', name: isAr ? '🕋 تكبيرات الأذان (سريع)' : '🕋 Adhan Takbeer (Short)' },
                    { id: 'soft-bell', name: isAr ? '🔔 جرس هادئ ناعم' : '🔔 Soft Bell Chime' },
                    { id: 'oud-chime', name: isAr ? '🎵 نغمة عود شرقية' : '🎵 Oriental Oud' },
                    { id: 'crystal', name: isAr ? '💎 نغمة الكريستال الصافية' : '💎 Crystal Chime' },
                    { id: 'oriental', name: isAr ? '🎼 نغمة كلاسيكية' : '🎼 Classic Melody' },
                  ].map(item => {
                    const isSelected = settings.chimeTone === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectChime(item.id as ChimeToneId)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Play className={`w-3.5 h-3.5 ${isSelected ? 'fill-white text-white' : 'text-indigo-400'}`} />
                          <span>{item.name}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>

                {/* Volume Slider */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 shrink-0">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'مستوى الصوت:' : 'Volume:'}</span>
                    <strong className="text-emerald-400">{Math.round((settings.volume ?? 0.8) * 100)}%</strong>
                  </span>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.volume ?? 0.8}
                    onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                  />
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
