import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WeeklyStatsModal: React.FC = () => {
  const { 
    isStatsModalOpen, 
    setIsStatsModalOpen, 
    tasks, 
    lessons, 
    prayersCompleted, 
    lessonCompletions,
    profile,
    settings,
    t 
  } = useApp();

  const isAr = settings.language !== 'en';

  if (!isStatsModalOpen) return null;

  // Calculate past 7 days statistics
  const today = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days statistics breakdown
  const dailyData = past7Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Tasks due on this day and completed
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    const completedTasksCount = dayTasks.filter(t => t.completed).length;

    // Lessons on this day
    const dayLessons = lessons.filter(l => l.days.includes(dayOfWeek));
    const attendedLessonsCount = dayLessons.filter(l => lessonCompletions[`${dateStr}_${l.id}`]).length;

    // Prayers completed
    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const completedPrayersCount = prayerNames.filter(p => prayersCompleted[`${dateStr}_${p}`]).length;

    const totalPossible = (dayTasks.length || 1) + (dayLessons.length || 1) + 5;
    const totalAchieved = completedTasksCount + attendedLessonsCount + completedPrayersCount;
    const rate = Math.min(100, Math.round((totalAchieved / totalPossible) * 100));

    return {
      dateStr,
      dayName: isAr ? dayNamesAr[dayOfWeek] : dayNamesEn[dayOfWeek],
      tasksCount: dayTasks.length,
      completedTasks: completedTasksCount,
      attendedLessons: attendedLessonsCount,
      completedPrayers: completedPrayersCount,
      achievementRate: Math.max(15, rate), // Min visual height
    };
  });

  // Aggregated totals
  const totalTasksDone = tasks.filter(t => t.completed).length;
  const totalTasksAll = tasks.length;
  const taskPercent = totalTasksAll > 0 ? Math.round((totalTasksDone / totalTasksAll) * 100) : 0;
  
  // Estimated study hours: completed tasks (approx 45m) + completed lessons (approx 60m)
  const estStudyHours = Math.round((totalTasksDone * 0.75 + Object.keys(lessonCompletions).filter(k => lessonCompletions[k]).length * 1.2) * 10) / 10;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsStatsModalOpen(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl transform rounded-3xl p-5 sm:p-7 shadow-2xl relative border my-auto max-h-[90vh] flex flex-col overflow-y-auto text-start"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-color)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsStatsModalOpen(false)}
            className="absolute top-5 left-5 sm:left-6 p-2 rounded-full hover:bg-slate-700/40 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">{t('statsTitle')}</h2>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--subtext-color)' }}>
                {t('statsSubtitle')}
              </p>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            
            {/* Completed Tasks */}
            <div className="p-4 rounded-2xl border glass-card flex flex-col justify-between"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">{t('statTotalTasks')}</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black">{totalTasksDone}</span>
                <span className="text-xs text-slate-400 mr-1.5">/ {totalTasksAll}</span>
              </div>
              <div className="w-full bg-slate-700/30 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${taskPercent}%` }} />
              </div>
            </div>

            {/* Study Hours */}
            <div className="p-4 rounded-2xl border glass-card flex flex-col justify-between"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">{t('statStudyHours')}</span>
                <BookOpen className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">{estStudyHours}</span>
                <span className="text-xs text-slate-400 mr-1.5">{isAr ? 'ساعة ⏳' : 'hrs ⏳'}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">{isAr ? 'بناءً على المهام والدروس' : 'Based on tasks & classes'}</span>
            </div>

            {/* Streak & Momentum */}
            <div className="p-4 rounded-2xl border glass-card flex flex-col justify-between"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">{t('streakLabel')}</span>
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-rose-400">{profile.streakDays || 1}</span>
                <span className="text-xs text-slate-400 mr-1.5">{isAr ? 'أيام 🔥' : 'days 🔥'}</span>
              </div>
              <span className="text-[11px] text-emerald-400 mt-1">{isAr ? 'مستمر بدون انقطاع!' : 'Active streak!'}</span>
            </div>

            {/* Total XP Points */}
            <div className="p-4 rounded-2xl border glass-card flex flex-col justify-between"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400">{isAr ? 'مجموع الـ XP' : 'Total XP'}</span>
                <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-purple-400">{profile.xpPoints || 0}</span>
                <span className="text-xs text-slate-400 mr-1.5">XP ⚡</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">{profile.title || (isAr ? 'طالب متميز' : 'Student')}</span>
            </div>

          </div>

          {/* 7-Day Interactive Activity Bar Chart */}
          <div className="p-5 rounded-3xl border glass-card mb-6"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>{t('weeklyCompletionRate')}</span>
              </h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{isAr ? 'آخر 7 أيام' : 'Past 7 Days'}</span>
              </span>
            </div>

            {/* Bars */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
              {dailyData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 border border-slate-700 text-[11px] px-2 py-1 rounded-xl shadow-xl whitespace-nowrap pointer-events-none z-10">
                    <div>{isAr ? `واجبات: ${item.completedTasks}` : `Tasks: ${item.completedTasks}`}</div>
                    <div>{isAr ? `صلوات: ${item.completedPrayers}` : `Prayers: ${item.completedPrayers}`}</div>
                  </div>

                  {/* Percentage label */}
                  <span className="text-[10px] font-bold text-indigo-300 opacity-80">
                    {item.achievementRate}%
                  </span>

                  {/* Bar pillar */}
                  <div className="w-full max-w-[36px] bg-slate-700/40 rounded-2xl h-full flex items-end p-1 overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${item.achievementRate}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08 }}
                      className={`w-full rounded-xl transition-all duration-300 ${
                        idx === 6 
                          ? 'bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/40' 
                          : 'bg-gradient-to-t from-indigo-900 to-indigo-500 opacity-75 group-hover:opacity-100'
                      }`}
                    />
                  </div>

                  {/* Day label */}
                  <span className={`text-[11px] font-bold ${idx === 6 ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {item.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Footer Note */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-indigo-300">
              {isAr 
                ? '"السر مش في المذاكرة 10 ساعات في يوم واحد.. السر في الاستمرارية كل يوم حتى لو ساعة واحدة!" 🚀'
                : '"Consistency is key! Studying with focus every day leads to mastery and success!" 🚀'}
            </p>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
