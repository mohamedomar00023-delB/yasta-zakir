import React, { useState, useEffect } from 'react';
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
  Camera,
  Download,
  HelpCircle,
  Sparkles
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
    setIsShareModalOpen,
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

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const toggleLanguage = () => {
    setLanguage(isAr ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b transition-colors shadow-sm"
      style={{ borderColor: 'var(--panel-border)' }}>
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* User Profile Info */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                haptic.light();
                setIsEditProfileOpen(true);
              }}
              className="relative group flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-800/40 transition-all text-start shrink-0 active:scale-95"
              title={isAr ? 'تعديل بطاقة الطالب' : 'Edit Profile'}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full rounded-[14px] flex items-center justify-center overflow-hidden"
                  style={{ background: 'var(--card-bg)' }}>
                  {profile.avatarType === 'upload' && profile.avatarValue ? (
                    <img src={profile.avatarValue} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl sm:text-2xl">{profile.avatarValue || '🎓'}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center min-w-0 max-w-[110px] min-[380px]:max-w-[150px] sm:max-w-[220px]">
                <div className="flex items-center gap-1">
                  <span className="font-black text-xs sm:text-sm leading-tight truncate" style={{ color: 'var(--text-color)' }}>
                    {profile.name || (isAr ? 'طالب متميز' : 'Student')}
                  </span>
                  <Edit className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:inline" />
                </div>
                <span className="text-[10px] sm:text-xs text-indigo-400 font-bold leading-tight truncate mt-0.5">
                  {profile.gradeLevel ? `${profile.gradeLevel}` : (profile.schoolOrUniversity || (isAr ? 'طالب متميز 🎓' : 'Student 🎓'))}
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs (Desktop >= lg) */}
          <nav className="hidden lg:flex items-center p-1 rounded-2xl border gap-1"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            
            <button
              onClick={() => {
                haptic.light();
                setActiveTab('today');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'today'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'hover:text-indigo-400'
              }`}
              style={activeTab !== 'today' ? { color: 'var(--subtext-color)' } : {}}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t('navToday')}</span>
            </button>

            <button
              onClick={() => {
                haptic.light();
                setActiveTab('weekly');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'hover:text-indigo-400'
              }`}
              style={activeTab !== 'weekly' ? { color: 'var(--subtext-color)' } : {}}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('navWeekly')}</span>
            </button>

            <button
              onClick={() => {
                haptic.light();
                setActiveTab('calendar');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'hover:text-indigo-400'
              }`}
              style={activeTab !== 'calendar' ? { color: 'var(--subtext-color)' } : {}}
            >
              <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('navCalendar')}</span>
            </button>

            <button
              onClick={() => {
                haptic.light();
                setActiveTab('tasks');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'hover:text-indigo-400'
              }`}
              style={activeTab !== 'tasks' ? { color: 'var(--subtext-color)' } : {}}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{t('navTasks')}</span>
            </button>

            <button
              onClick={() => {
                haptic.light();
                setActiveTab('notes');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'hover:text-indigo-400'
              }`}
              style={activeTab !== 'notes' ? { color: 'var(--subtext-color)' } : {}}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('navNotes')}</span>
            </button>
          </nav>

          {/* Feature Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
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
              <span className="hidden xl:inline">{isAr ? 'الأذكار 📿' : 'Athkar'}</span>
            </button>

            {/* AI Study Planner */}
            <button
              onClick={() => {
                haptic.light();
                setIsAIPlannerModalOpen(true);
              }}
              className="p-1.5 sm:px-3 sm:py-2 rounded-xl border bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-pink-600/30 border-purple-500/40 text-purple-300 hover:text-white transition-all text-xs font-black flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95"
              title={isAr ? 'مساعد المذاكرة والامتحانات الذكي 🤖' : 'AI Study Planner'}
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">{t('navAIPlanner')}</span>
            </button>

            {/* App Guide & Tour Button */}
            <button
              onClick={() => {
                haptic.light();
                setIsAppTourOpen(true);
              }}
              className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-400 hover:text-white hover:bg-amber-600/30 transition-all text-xs font-black flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95"
              title={isAr ? 'دليل وشرح مميزات التطبيق 💡' : 'App Guide & Tour'}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isAr ? 'دليل التطبيق 💡' : 'Guide 💡'}</span>
            </button>

            {/* Language Switcher Badge Button */}
            <button
              onClick={() => {
                haptic.light();
                toggleLanguage();
              }}
              className="px-2 py-1.5 rounded-xl border transition-all font-black text-xs flex items-center gap-1 hover:bg-slate-800/40 active:scale-95"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
              title={isAr ? 'Switch to English' : 'التحويل للغة العربية'}
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-400">{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Selector Palette */}
            <button
              onClick={() => {
                haptic.light();
                setIsThemeModalOpen(true);
              }}
              className="p-1.5 sm:p-2 rounded-xl border text-indigo-400 hover:text-indigo-300 transition-colors active:scale-95"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              title={isAr ? 'تخصيص الثيمات والأصوات' : 'Themes & Audio'}
            >
              <Palette className="w-4 h-4 text-amber-400" />
            </button>

            {/* Backup Button (Available on all devices) */}
            <button
              onClick={() => {
                haptic.light();
                setIsBackupModalOpen(true);
              }}
              className="p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center justify-center active:scale-95"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              title={isAr ? 'نسخ احتياطي واسترجاع البيانات 💾' : 'Backup & Restore 💾'}
            >
              <Database className="w-4 h-4 text-indigo-400" />
            </button>

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
