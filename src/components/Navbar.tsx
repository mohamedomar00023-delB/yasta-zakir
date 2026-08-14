import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Database, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Edit, 
  FileText, 
  BarChart3, 
  Bot, 
  Share2, 
  Languages, 
  CalendarDays,
  Heart,
  Trophy,
  Download,
  Sparkles,
  Flame,
  MoreVertical,
  ChevronDown,
  HelpCircle,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstallAppModal } from './ui/InstallAppModal';
import { haptic } from '../utils/haptics';

export const Navbar: React.FC = () => {
  const {
    profile,
    setIsEditProfileOpen,
    activeTab,
    setActiveTab,
    setIsBackupModalOpen,
    setIsThemeModalOpen,
    setIsStatsModalOpen,
    setIsAIPlannerModalOpen,
    setIsAthkarModalOpen,
    setIsAchievementsModalOpen,
    setIsStudentStoryModalOpen,
    setIsAppTourOpen,
    settings,
    setLanguage,
    t,
  } = useApp();

  const isAr = settings.language !== 'en';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(isAr ? 'en' : 'ar');
  };

  const handleInstallClick = () => {
    haptic.medium();
    setIsInstallModalOpen(true);
  };

  // Student Level Calculation (100 XP per level)
  const currentLevel = Math.max(1, Math.floor((profile.xpPoints || 0) / 100) + 1);

  return (
    <header 
      className="sticky top-0 z-40 w-full glass-panel border-b transition-all shadow-md backdrop-blur-xl"
      style={{ borderColor: 'var(--panel-border)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* User Profile Card */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                haptic.light();
                setIsEditProfileOpen(true);
              }}
              className="group flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-2xl hover:bg-slate-800/40 light:hover:bg-slate-200/50 transition-all text-start shrink-0 active:scale-95 border border-transparent hover:border-slate-700/40"
              title={isAr ? 'تعديل الملف الشخصي والبيانات' : 'Edit Profile'}
            >
              {/* Avatar with dynamic glow */}
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
                  <div 
                    className="w-full h-full rounded-[14px] flex items-center justify-center overflow-hidden"
                    style={{ background: 'var(--card-bg)' }}
                  >
                    {profile.avatarType === 'upload' && profile.avatarValue ? (
                      <img src={profile.avatarValue} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg sm:text-xl">{profile.avatarValue || '🎓'}</span>
                    )}
                  </div>
                </div>

                {/* Level mini badge */}
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-md shadow-sm border border-slate-900 leading-tight">
                  Lv.{currentLevel}
                </div>
              </div>

              {/* Student Name & Details */}
              <div className="flex flex-col justify-center min-w-0 max-w-[105px] min-[380px]:max-w-[130px] sm:max-w-[180px] md:max-w-[220px]">
                <div className="flex items-center gap-1">
                  <span 
                    className="font-black text-xs sm:text-sm leading-tight truncate tracking-tight"
                    style={{ color: 'var(--text-color)' }}
                  >
                    {profile.name || (isAr ? 'طالب متميز' : 'Student')}
                  </span>
                  <Edit className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:inline" />
                </div>
                
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] sm:text-[11px] text-indigo-400 font-bold leading-tight truncate">
                    {profile.gradeLevel || profile.schoolOrUniversity || (isAr ? 'طالب ذكي 🚀' : 'Student 🚀')}
                  </span>
                  
                  {/* Streak Flame Badge */}
                  {(profile.streakDays || 1) > 0 && (
                    <span 
                      className="hidden min-[450px]:inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0"
                      title={isAr ? `تتابع دراسي مستمر لمدة ${profile.streakDays || 1} يوم` : `${profile.streakDays || 1} day study streak`}
                    >
                      <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span>{profile.streakDays || 1}d</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs (Desktop >= lg) */}
          <nav 
            className="hidden lg:flex items-center p-1 rounded-2xl border gap-1 shadow-sm backdrop-blur-md"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            {[
              { id: 'today', label: t('navToday'), icon: Clock },
              { id: 'weekly', label: t('navWeekly'), icon: Calendar },
              { id: 'calendar', label: t('navCalendar'), icon: CalendarDays },
              { id: 'tasks', label: t('navTasks'), icon: CheckSquare },
              { id: 'notes', label: t('navNotes'), icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    haptic.light();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                      : 'hover:text-indigo-400 hover:bg-slate-800/30 active:scale-95'
                  }`}
                  style={!isActive ? { color: 'var(--subtext-color)' } : {}}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* INSTALL APP PROMINENT BUTTON (Always Visible) */}
            <button
              onClick={handleInstallClick}
              className={`relative overflow-hidden group flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer ${
                isAppInstalled
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03]'
              }`}
              title={isAppInstalled ? (isAr ? 'التطبيق مثبّت على جهازك 📱' : 'App Installed 📱') : (isAr ? 'تثبيت التطبيق على الشاشة الرئيسية 📲' : 'Install Yasta Zakir App 📲')}
            >
              {/* Shimmer light effect for non-installed */}
              {!isAppInstalled && (
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              )}
              
              {isAppInstalled ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              ) : (
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-bounce shrink-0" />
              )}
              
              <span className="inline text-[11px] sm:text-xs">
                {isAppInstalled 
                  ? t('navInstalled') 
                  : (
                    <>
                      <span className="hidden sm:inline">{t('navInstallApp')}</span>
                      <span className="sm:hidden">{isAr ? 'تثبيت' : 'Install'}</span>
                      <span className="mr-0.5 sm:mr-1">📲</span>
                    </>
                  )}
              </span>
            </button>

            {/* Athkar & Tasbeeh Button */}
            <button
              onClick={() => {
                haptic.light();
                setIsAthkarModalOpen(true);
              }}
              className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:text-white hover:bg-emerald-600/30 transition-all text-xs font-black flex items-center gap-1 active:scale-95"
              title={isAr ? 'رفيق الأذكار والورد القرآني والسبحة 📿' : 'Athkar & Tasbeeh'}
            >
              <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              <span className="hidden xl:inline">{t('navAthkar')}</span>
            </button>

            {/* AI Study Planner */}
            <button
              onClick={() => {
                haptic.light();
                setIsAIPlannerModalOpen(true);
              }}
              className="p-1.5 sm:px-3 sm:py-2 rounded-xl border bg-gradient-to-r from-purple-600/25 via-indigo-600/25 to-pink-600/25 border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 transition-all text-xs font-black flex items-center gap-1 shadow-sm active:scale-95"
              title={isAr ? 'مساعد المذاكرة والامتحانات الذكي 🤖' : 'AI Study Planner'}
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">{t('navAIPlanner')}</span>
            </button>

            {/* Badges & Achievements (Trophy) */}
            <button
              onClick={() => {
                haptic.light();
                setIsAchievementsModalOpen(true);
              }}
              className="p-1.5 sm:p-2 rounded-xl border text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border-amber-500/30 transition-all active:scale-95"
              style={{ background: 'var(--card-bg)' }}
              title={isAr ? 'لوحة الأوسمة والإنجازات 🏆' : 'Achievements & Badges 🏆'}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
            </button>

            {/* Language Switcher Badge Button */}
            <button
              onClick={() => {
                haptic.light();
                toggleLanguage();
              }}
              className="px-2 py-1.5 sm:py-2 rounded-xl border transition-all font-black text-xs flex items-center gap-1 hover:bg-slate-800/40 active:scale-95"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
              title={isAr ? 'Switch to English' : 'التحويل للغة العربية'}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase text-indigo-400">{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* MORE ACTIONS DROPDOWN MENU */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => {
                  haptic.light();
                  setIsMoreMenuOpen(!isMoreMenuOpen);
                }}
                className="p-1.5 sm:p-2 rounded-xl border transition-all flex items-center justify-center hover:bg-slate-800/40 active:scale-95"
                style={{ 
                  background: isMoreMenuOpen ? 'rgba(99, 102, 241, 0.2)' : 'var(--card-bg)', 
                  borderColor: isMoreMenuOpen ? 'rgba(99, 102, 241, 0.5)' : 'var(--card-border)',
                  color: 'var(--text-color)'
                }}
                title={isAr ? 'أدوات وإعدادات إضافية ⚡' : 'More Tools ⚡'}
              >
                <MoreVertical className="w-4 h-4 text-slate-300" />
              </button>

              {/* Dropdown Popup */}
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full mt-2 ${isAr ? 'left-0' : 'right-0'} w-56 rounded-2xl p-1.5 shadow-2xl border z-50 backdrop-blur-2xl`}
                    style={{
                      background: 'var(--panel-bg)',
                      borderColor: 'var(--panel-border)',
                      color: 'var(--text-color)'
                    }}
                  >
                    {/* Weekly Stats */}
                    <button
                      onClick={() => {
                        haptic.light();
                        setIsMoreMenuOpen(false);
                        setIsStatsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600/20 text-start transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{t('navStats')}</span>
                    </button>

                    {/* Daily Student Story Card */}
                    <button
                      onClick={() => {
                        haptic.light();
                        setIsMoreMenuOpen(false);
                        setIsStudentStoryModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-pink-600/20 text-start transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>{t('navStoryShare')}</span>
                    </button>

                    {/* Theme & Sound Selector */}
                    <button
                      onClick={() => {
                        haptic.light();
                        setIsMoreMenuOpen(false);
                        setIsThemeModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-amber-600/20 text-start transition-colors"
                    >
                      <Palette className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{t('navTheme')}</span>
                    </button>

                    {/* Backup & Restore */}
                    <button
                      onClick={() => {
                        haptic.light();
                        setIsMoreMenuOpen(false);
                        setIsBackupModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-cyan-600/20 text-start transition-colors"
                    >
                      <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{t('navBackup')}</span>
                    </button>

                    {/* App Tour & Guide */}
                    <button
                      onClick={() => {
                        haptic.light();
                        setIsMoreMenuOpen(false);
                        setIsAppTourOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600/20 text-start transition-colors border-t border-slate-800/40 mt-1 pt-2"
                    >
                      <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t('navGuide')}</span>
                    </button>

                    {/* Install App row inside menu as secondary shortcut */}
                    <button
                      onClick={() => {
                        haptic.light();
                        setIsMoreMenuOpen(false);
                        handleInstallClick();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600/20 text-emerald-400 text-start transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isAppInstalled ? t('navInstalled') : (isAr ? 'تثبيت كـ تطبيق 📲' : 'Install PWA 📲')}</span>
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

      {/* Install PWA Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstalled={() => {
          setIsAppInstalled(true);
          setDeferredPrompt(null);
        }}
      />
    </header>
  );
};
