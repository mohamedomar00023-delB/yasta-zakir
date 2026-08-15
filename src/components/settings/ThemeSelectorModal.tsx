import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Palette, 
  Volume2, 
  VolumeX,
  Sparkles, 
  Square, 
  Play, 
  Bell, 
  Sliders,
  Smartphone,
  Zap,
  Vibrate
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { THEME_CONFIGS } from '../../utils/themes';
import { NotificationSoundId, ThemeId } from '../../types';
import { playNotificationSound, stopActiveAudio, setMasterVolume } from '../../utils/sound';
import { haptic, setHapticsEnabled } from '../../utils/haptics';

export const ThemeSelectorModal: React.FC = () => {
  const {
    isThemeModalOpen,
    setIsThemeModalOpen,
    settings,
    updateSettings,
    showToast,
  } = useApp();

  const isAr = settings.language !== 'en';
  const [activeTab, setActiveTab] = useState<'notifications' | 'themes'>('notifications');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  if (!isThemeModalOpen) return null;

  const handleSelectTheme = (themeId: ThemeId) => {
    haptic.selection();
    const config = THEME_CONFIGS[themeId];
    updateSettings({
      themeId,
      theme: config.isDark ? 'dark' : 'light',
    });
    showToast(isAr ? `تم تغيير الثيم إلى "${config.nameAr}" 🎨` : `Theme changed to "${config.nameEn}" 🎨`, 'success');
  };

  const handleSelectNotification = (soundId: NotificationSoundId, previewName: string) => {
    haptic.notification();
    updateSettings({ notificationSound: soundId, chimeTone: soundId as any });
    if (soundId === 'silent') {
      stopActiveAudio();
      setCurrentlyPlayingId(null);
      showToast(isAr ? 'تم كتم صوت الإشعارات 🔇' : 'Notifications muted 🔇', 'info');
      return;
    }

    setCurrentlyPlayingId(soundId);
    playNotificationSound(soundId, settings.volume ?? 0.8, () => {
      setCurrentlyPlayingId(null);
    });
    showToast(isAr ? `تم اختيار: ${previewName}` : `Selected: ${previewName}`, 'info');
  };

  const handleStopAudio = () => {
    haptic.light();
    stopActiveAudio();
    setCurrentlyPlayingId(null);
    showToast(isAr ? 'تم إيقاف الصوت ⏹️' : 'Audio stopped ⏹️', 'info');
  };

  const handleVolumeChange = (vol: number) => {
    updateSettings({ volume: vol });
    setMasterVolume(vol);
  };

  const handleToggleHaptics = () => {
    const next = !(settings.hapticsEnabled ?? true);
    updateSettings({ hapticsEnabled: next });
    setHapticsEnabled(next);
    if (next) {
      haptic.celebration();
      showToast(isAr ? 'تم تفعيل الاهتزازات التفاعلية 📳' : 'Haptic vibration enabled 📳', 'success');
    } else {
      showToast(isAr ? 'تم تعطيل الاهتزازات 📴' : 'Haptic vibration disabled 📴', 'info');
    }
  };

  const handleTestHaptic = () => {
    haptic.celebration();
    showToast(isAr ? '📳 جاري إرسال نبضات اهتزاز تفاعلية (Haptic Pulse)...' : '📳 Testing Haptic Vibration Pulse...', 'info');
  };

  const handleClose = () => {
    stopActiveAudio();
    setCurrentlyPlayingId(null);
    setIsThemeModalOpen(false);
  };

  const NOTIFICATION_OPTIONS: { id: NotificationSoundId; titleAr: string; titleEn: string; descAr: string; descEn: string; icon: string }[] = [
    {
      id: 'soft-bell',
      titleAr: 'جرس هادئ ناعم',
      titleEn: 'Soft Calm Bell',
      descAr: 'نغمة جرس رباعية متدرجة ومريحة للأذن',
      descEn: 'Four-tone harmonious gentle chime',
      icon: '🔔',
    },
    {
      id: 'crystal-ping',
      titleAr: 'نغمة الكريستال الصافية',
      titleEn: 'Crystal Sparkle',
      descAr: 'رنين بلوري نقي وعالي الوضوح',
      descEn: 'Pure crystal glass resonance',
      icon: '💎',
    },
    {
      id: 'oud-melody',
      titleAr: 'نغمة عود شرقية',
      titleEn: 'Oriental Oud Pluck',
      descAr: 'عزف عود شرقي أصيل ومبهج',
      descEn: 'Acoustic warm Arabic oud tones',
      icon: '🎵',
    },
    {
      id: 'gentle-piano',
      titleAr: 'بيانو كلاسيكي لطيف',
      titleEn: 'Gentle Piano Ping',
      descAr: 'نوتات بيانو راقية تحفز على التركيز',
      descEn: 'Elegant acoustic piano chord',
      icon: '🎹',
    },
    {
      id: 'success-horizon',
      titleAr: 'نغمة الإنجاز والهمة',
      titleEn: 'Success Horizon',
      descAr: 'نغمة تصاعدية مبهجة ومحفزة للواجبات',
      descEn: 'Uplifting victorious achievement flourish',
      icon: '✨',
    },
    {
      id: 'modern-ping',
      titleAr: 'تنبيه ذكي وحديث',
      titleEn: 'Modern Tech Ping',
      descAr: 'صوت تنبيه إلكتروني سريع ونقي',
      descEn: 'Crisp futuristic dual-tone ping',
      icon: '⚡',
    },
    {
      id: 'birds-nature',
      titleAr: 'زقزقة عصافير الصباح',
      titleEn: 'Morning Birds Chirp',
      descAr: 'صوت طبيعي هادئ يبعث على النشاط',
      descEn: 'Sweet relaxing natural birdsong',
      icon: '🕊️',
    },
    {
      id: 'water-drop',
      titleAr: 'قطرات ماء منعشة',
      titleEn: 'Water Droplet',
      descAr: 'نغمة قطرة ماء نقية وفورية',
      descEn: 'Fresh resonant droplet pop',
      icon: '💧',
    },
    {
      id: 'marimba-pop',
      titleAr: 'ماريمبا خشبية نقية',
      titleEn: 'Marimba Pop',
      descAr: 'نقر خشبي دافئ ولطيف جداً',
      descEn: 'Warm acoustic marimba strike',
      icon: '🪵',
    },
    {
      id: 'subtle-breeze',
      titleAr: 'نسيم هادئ وتأملي',
      titleEn: 'Subtle Zen Bowl',
      descAr: 'رنين تأملي هادئ لا يشتت الانتباه',
      descEn: 'Meditative ambient singing bowl frequency',
      icon: '🍃',
    },
    {
      id: 'silent',
      titleAr: 'صامت (بدون صوت تنبيه)',
      titleEn: 'Silent Mode',
      descAr: 'كتم صوت التنبيهات مع الإبقاء على الإشعارات',
      descEn: 'Mute task and lesson reminder chimes',
      icon: '🔇',
    },
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-2.5 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl transform rounded-3xl shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-start border flex flex-col justify-between"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="p-4 sm:p-6 lg:p-7">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 text-lg">
                  🎵
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black flex items-center gap-1.5" style={{ color: 'var(--text-color)' }}>
                    <span>{isAr ? 'استوديو الإشعارات والمظهر والاهتزازات' : 'Notifications, Haptics & Themes Studio'}</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    {isAr ? 'خصص نغمات الإشعارات والاهتزازات وثيم التطبيق' : 'Customize notification tones, haptics & themes'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentlyPlayingId && (
                  <button
                    onClick={handleStopAudio}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/30 animate-pulse active:scale-95"
                  >
                    <Square className="w-3 h-3 fill-white" />
                    <span>{isAr ? 'إيقاف الصوت ⏹️' : 'Stop ⏹️'}</span>
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="p-1.5 sm:p-2 rounded-xl transition-colors hover:bg-slate-700/40 text-slate-400 hover:text-white"
                  title={isAr ? 'إغلاق' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs (2 Dedicated Sections) */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-5 gap-1 shadow-inner">
              <button
                onClick={() => {
                  haptic.selection();
                  setActiveTab('notifications');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'notifications'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔔</span>
                <span>{isAr ? 'نغمات الإشعارات والتنبيه' : 'Notification Tones'}</span>
              </button>

              <button
                onClick={() => {
                  haptic.selection();
                  setActiveTab('themes');
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'themes'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎨</span>
                <span>{isAr ? 'الثيمات والمظهر' : 'Visual Themes'}</span>
              </button>
            </div>

            {/* TAB CONTENT 2: NOTIFICATION TONES */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'اختر نغمة التنبيهات للدروس والواجبات:' : 'Select reminder tone for classes & tasks:'}</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {isAr ? 'فورية ونقية 0ms' : 'Instant 0ms Audio'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
                  {NOTIFICATION_OPTIONS.map((item) => {
                    const isSelected = (settings.notificationSound || 'soft-bell') === item.id;
                    const isPlaying = currentlyPlayingId === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNotification(item.id, isAr ? item.titleAr : item.titleEn)}
                        className={`p-3 rounded-2xl border text-start flex items-center justify-between gap-3 transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500'
                            : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-transform ${
                            isPlaying ? 'bg-emerald-600 scale-110 shadow-md shadow-emerald-600/30' : 'bg-slate-800/80'
                          }`}>
                            <span>{item.icon}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-100 flex items-center gap-1">
                              <span>{isAr ? item.titleAr : item.titleEn}</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                              {isAr ? item.descAr : item.descEn}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: THEMES & APPEARANCE */}
            {activeTab === 'themes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? 'اختر نمط الألوان المفضل لواجهة التطبيق:' : 'Select visual palette theme:'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {Object.values(THEME_CONFIGS).map((theme) => {
                    const isSelected = settings.themeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`h-24 sm:h-26 p-3 rounded-2xl border text-start flex flex-col justify-between relative overflow-hidden transition-all ${theme.previewBg} ${
                          isSelected
                            ? 'ring-2 ring-purple-500 border-purple-500 scale-[1.03] shadow-xl'
                            : 'border-slate-700/50 hover:scale-[1.02] hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                            {isAr ? theme.nameAr : theme.nameEn}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold ${theme.isDark ? 'text-slate-300/80' : 'text-slate-600'}`}>
                          {isAr ? theme.nameEn : theme.nameAr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Master Audio & Haptics Controls Bar */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3">
              
              {/* Row 1: Audio Switch & Haptics Switch */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                
                {/* Sound Toggle */}
                <button
                  onClick={() => {
                    haptic.selection();
                    const next = !settings.soundEnabled;
                    updateSettings({ soundEnabled: next });
                    if (!next) stopActiveAudio();
                    showToast(next ? (isAr ? 'تم تفعيل الأصوات 🔊' : 'Audio enabled 🔊') : (isAr ? 'تم كتم جميع الأصوات 🔇' : 'All audio muted 🔇'), 'info');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
                    settings.soundEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{settings.soundEnabled ? (isAr ? 'الأصوات مفعلة 🔊' : 'Sound ON') : (isAr ? 'الأصوات مكتومة 🔇' : 'Sound OFF')}</span>
                </button>

                {/* Haptics Toggle & Test */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleToggleHaptics}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
                      (settings.hapticsEnabled ?? true)
                        ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Vibrate className="w-3.5 h-3.5" />
                    <span>{(settings.hapticsEnabled ?? true) ? (isAr ? 'الاهتزازات مفعلة 📳' : 'Haptics ON') : (isAr ? 'الاهتزازات معطلة 📴' : 'Haptics OFF')}</span>
                  </button>

                  {(settings.hapticsEnabled ?? true) && (
                    <button
                      onClick={handleTestHaptic}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
                      title={isAr ? 'تجربة نبضة الاهتزاز' : 'Test Vibration'}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تجربة 📳' : 'Test'}</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Row 2: Smart Audio Toggles */}
              <div className="pt-2.5 border-t border-slate-800/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>🌙</span>
                    <span>{isAr ? 'الوضع الليلي الذكي للأصوات (11م - 5ص)' : 'Smart Quiet Hours (11PM - 5AM)'}</span>
                  </span>
                  <button
                    onClick={() => {
                      haptic.selection();
                      const next = !(settings.quietHoursEnabled ?? true);
                      updateSettings({ quietHoursEnabled: next });
                      showToast(next ? (isAr ? 'تم تفعيل الوضع الليلي الهادئ 🌙' : 'Quiet hours enabled 🌙') : (isAr ? 'تم تعطيل الوضع الليلي' : 'Quiet hours disabled'), 'info');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      (settings.quietHoursEnabled ?? true)
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}
                  >
                    {(settings.quietHoursEnabled ?? true) ? (isAr ? 'مفعل ✓' : 'ON ✓') : (isAr ? 'معطل' : 'OFF')}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>📈</span>
                    <span>{isAr ? 'التدرج الصوتي السلس للأذان (Fade-In)' : 'Gentle Spiritual Fade-In'}</span>
                  </span>
                  <button
                    onClick={() => {
                      haptic.selection();
                      const next = !(settings.gentleFadeIn ?? true);
                      updateSettings({ gentleFadeIn: next });
                      showToast(next ? (isAr ? 'تم تفعيل التدرج الصوتي 📈' : 'Fade-in enabled 📈') : (isAr ? 'تم تعطيل التدرج الصوتي' : 'Fade-in disabled'), 'info');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      (settings.gentleFadeIn ?? true)
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}
                  >
                    {(settings.gentleFadeIn ?? true) ? (isAr ? 'مفعل ✓' : 'ON ✓') : (isAr ? 'معطل' : 'OFF')}
                  </button>
                </div>
              </div>

              {/* Row 3: Volume Slider */}
              <div className="flex items-center gap-3 w-full pt-2.5 border-t border-slate-800/50">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1 shrink-0">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isAr ? 'مستوى الصوت العام:' : 'Master Volume:'}</span>
                  <strong className="text-indigo-400">{Math.round((settings.volume ?? 0.8) * 100)}%</strong>
                </span>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.volume ?? 0.8}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                />
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
