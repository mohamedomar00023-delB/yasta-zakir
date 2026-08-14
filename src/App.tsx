import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useAladhan } from './hooks/useAladhan';
import { useNotifications } from './hooks/useNotifications';

import { Navbar } from './components/Navbar';
import { PrayerHeaderCard } from './components/prayer/PrayerHeaderCard';
import { PrayerGrid } from './components/prayer/PrayerGrid';
import { QiblaCard } from './components/prayer/QiblaCard';
import { ConflictBanner } from './components/prayer/ConflictBanner';
import { ProgressBarCard } from './components/dashboard/ProgressBarCard';
import { StudentRankBadge } from './components/dashboard/StudentRankBadge';
import { DailyQuote } from './components/dashboard/DailyQuote';
import { PomodoroTimer } from './components/pomodoro/PomodoroTimer';
import { TodaySchedule } from './components/lessons/TodaySchedule';
import { WeeklyScheduleView } from './components/lessons/WeeklyScheduleView';
import { TaskManager } from './components/tasks/TaskManager';
import { TasksCalendarView } from './components/tasks/TasksCalendarView';
import { StudyNotesManager } from './components/notes/StudyNotesManager';
import { MobileBottomNav } from './components/MobileBottomNav';

import { OnboardingModal } from './components/profile/OnboardingModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { LessonFormModal } from './components/lessons/LessonFormModal';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { WeeklyStatsModal } from './components/dashboard/WeeklyStatsModal';
import { ScheduleShareCard } from './components/lessons/ScheduleShareCard';
import { AIStudyPlannerModal } from './components/ai/AIStudyPlannerModal';
import { BackupModal } from './components/settings/BackupModal';
import { ThemeSelectorModal } from './components/settings/ThemeSelectorModal';
import { AthkarModal } from './components/athkar/AthkarModal';
import { AchievementsModal } from './components/achievements/AchievementsModal';
import { StudentStoryShareModal } from './components/dashboard/StudentStoryShareModal';
import { AppTourModal } from './components/guide/AppTourModal';
import { ToastNotification } from './components/ui/ToastNotification';

import { getArabicFormattedDate, getEnglishFormattedDate, getTodayDateString } from './utils/formatters';
import { Sparkles, Heart, Moon } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { profile, lessons, tasks, settings, activeTab, isAppTourOpen, setIsAppTourOpen, t } = useApp();
  const currentDayId = new Date().getDay();
  const todayStr = getTodayDateString();
  const isAr = settings.language !== 'en';

  // Filter lessons for today
  const todayLessons = lessons
    .filter(l => l.days.includes(currentDayId))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Filter tasks for today
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);

  // Aladhan Hook
  const {
    prayers,
    nextPrayer,
    remainingSeconds,
    userLocationName,
    conflicts,
    hijriDate,
    qiblaDirection,
    refetch,
    loading,
  } = useAladhan({
    city: settings.selectedCity,
    country: settings.selectedCountry,
    useGeolocation: settings.useGeolocation,
    calculationMethod: settings.calculationMethod ?? 5,
    lessonsForToday: todayLessons,
    language: settings.language,
  });

  // Notifications Hook
  useNotifications({ prayers });

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden flex flex-col font-tajawal transition-colors duration-400">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-24 lg:pb-8">
        
        {/* Dynamic Welcome Greeting & Hijri Date Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl glass-card border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60">
          <div>
            <h1 className="text-lg sm:text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
              <span>{t('welcomeGreeting', { name: profile.name || (isAr ? 'باشا' : 'Champ') })}</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--subtext-color)' }}>
              {t('summaryStatus', { lessons: todayLessons.length, tasks: todayTasks.length })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-3.5 py-1.5 rounded-2xl border flex items-center gap-1.5"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-color)' }}>
              <span>📅</span>
              <span>{isAr ? getArabicFormattedDate() : getEnglishFormattedDate()}</span>
            </span>
            {hijriDate && (
              <span className="px-3.5 py-1.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center gap-1.5 shadow-sm">
                <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                <span>🌙 {isAr ? hijriDate.formatted : (hijriDate.formattedEn || hijriDate.formatted)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Smart Conflict Warning Banner */}
        <ConflictBanner conflicts={conflicts} />

        {/* Dynamic Content based on Active Tab */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            
            {/* Prayer Header Countdown Card */}
            <PrayerHeaderCard
              nextPrayer={nextPrayer}
              remainingSeconds={remainingSeconds}
              userLocationName={userLocationName}
              loading={loading}
              onRefreshLocation={refetch}
            />

            {/* Daily Quote & Hadith Inspiration */}
            <DailyQuote />

            {/* Qibla Compass + Prayer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <PrayerGrid prayers={prayers} />
              </div>
              <div className="lg:col-span-1">
                <QiblaCard qiblaDirection={qiblaDirection} locationName={userLocationName || `${settings.selectedCity}، ${settings.selectedCountry}`} />
              </div>
            </div>

            {/* Cumulative Daily Achievement Progress Bar */}
            <ProgressBarCard
              todayLessons={todayLessons}
              todayTasks={todayTasks}
              prayers={prayers}
            />

            {/* Gamified XP Rank Badge */}
            <StudentRankBadge />

            {/* Pomodoro Focus Studio */}
            <PomodoroTimer />

            {/* Main Today Schedule & Tasks Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Today's Lessons (2 Columns) */}
              <div className="lg:col-span-2">
                <TodaySchedule todayLessons={todayLessons} />
              </div>

              {/* Tasks Quick Widget (1 Column) */}
              <div className="lg:col-span-1">
                <TaskManager />
              </div>

            </div>

          </div>
        )}

        {activeTab === 'weekly' && (
          <WeeklyScheduleView />
        )}

        {activeTab === 'calendar' && (
          <TasksCalendarView />
        )}

        {activeTab === 'tasks' && (
          <TaskManager />
        )}

        {activeTab === 'notes' && (
          <StudyNotesManager />
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/60 light:border-slate-200 text-center text-xs text-slate-500 light:text-slate-600 mb-14 lg:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1">
            <span>{t('footerText')}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>

          <p className="text-[11px] text-slate-600">
            {t('footerPrivacy')}
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav />

      {/* Modals & Toasts */}
      <OnboardingModal />
      <EditProfileModal />
      <AppTourModal isOpen={isAppTourOpen} onClose={() => setIsAppTourOpen(false)} />
      <LessonFormModal />
      <TaskFormModal />
      <WeeklyStatsModal />
      <ScheduleShareCard />
      <AIStudyPlannerModal />
      <AthkarModal />
      <AchievementsModal />
      <StudentStoryShareModal />
      <BackupModal />
      <ThemeSelectorModal />
      <ToastNotification />

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

export default App;
