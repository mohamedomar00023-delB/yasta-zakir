import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Award, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Zap, 
  Flame, 
  Trophy, 
  Star,
  Target,
  Crown,
  Heart,
  BookOpen,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_BADGES } from '../../utils/presets';
import { BadgeItem } from '../../types';

export const AchievementsModal: React.FC = () => {
  const { 
    isAchievementsModalOpen, 
    setIsAchievementsModalOpen, 
    profile, 
    tasks, 
    lessons, 
    prayersCompleted, 
    settings, 
    notes,
    addXP, 
    triggerCelebration, 
    showToast 
  } = useApp();

  const isAr = settings.language !== 'en';
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'prayers' | 'study' | 'streak' | 'tasks' | 'mastery'>('all');

  if (!isAchievementsModalOpen) return null;

  // Calculate live counts for each badge
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalPrayersLogged = Object.values(prayersCompleted).filter(Boolean).length;
  const tasbeehCount = settings.tasbeehTotalCount || 0;
  const quranPages = settings.quranPagesRead || 0;
  const notesCount = notes?.length || 0;
  const totalXP = profile.xpPoints || 0;
  const streakDays = profile.streakDays || 1;

  const badgesWithLiveProgress: BadgeItem[] = INITIAL_BADGES.map(badge => {
    let current = 0;
    if (badge.id === 'fajr-hero') current = Math.min(badge.requiredCount, Math.floor(totalPrayersLogged / 4));
    else if (badge.id === 'focus-beast') current = Math.min(badge.requiredCount, Math.floor(completedTasks / 2));
    else if (badge.id === 'backlog-slayer') current = completedTasks;
    else if (badge.id === 'streak-legend') current = streakDays;
    else if (badge.id === 'streak-titan') current = streakDays;
    else if (badge.id === 'prayer-guardian') current = totalPrayersLogged;
    else if (badge.id === 'prayer-titan') current = totalPrayersLogged;
    else if (badge.id === 'note-master') current = notesCount;
    else if (badge.id === 'tasbeeh-100') current = tasbeehCount;
    else if (badge.id === 'tasbeeh-1000') current = tasbeehCount;
    else if (badge.id === 'quran-reader') current = quranPages;
    else if (badge.id === 'excellence-star') current = totalXP;
    else if (badge.id === 'grand-master') current = totalXP;

    const isUnlocked = current >= badge.requiredCount;

    return {
      ...badge,
      currentCount: current,
      isUnlocked,
    };
  });

  const filteredBadges = selectedCategory === 'all' 
    ? badgesWithLiveProgress 
    : badgesWithLiveProgress.filter(b => b.category === selectedCategory);

  const unlockedCount = badgesWithLiveProgress.filter(b => b.isUnlocked).length;
  const totalBadges = badgesWithLiveProgress.length;
  const overallPercentage = Math.round((unlockedCount / totalBadges) * 100);

  const handleClaimBadgeReward = (badge: BadgeItem) => {
    triggerCelebration();
    addXP(badge.xpReward, isAr ? `مكافأة وسام: ${badge.titleAr}` : `Reward for: ${badge.titleEn}`);
    showToast(isAr ? `مبروك! استلمت مكافأة وسام ${badge.titleAr} (+${badge.xpReward} XP) 🏆🎉` : `Claimed ${badge.titleEn} (+${badge.xpReward} XP) 🏆🎉`, 'success');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsAchievementsModalOpen(false);
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
            onClick={() => setIsAchievementsModalOpen(false)}
            className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'} p-2 rounded-full hover:bg-slate-700/40 transition-colors z-20`}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white shadow-xl shadow-amber-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 fill-white/20" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                  <span>{isAr ? 'لوحة الأوسمة والإنجازات والمستويات 🏆' : 'Student Badges, Levels & Quests 🏆'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'افتح 13 وساماً دراسياً وإيمانياً واكسب نقاط XP لترقية مستواك للقمة' : 'Unlock 13 academic & devotion badges to reach legendary rank'}
                </p>
              </div>
            </div>

            {/* Total Unlocked Stats */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs self-start sm:self-center">
              <Award className="w-4 h-4" />
              <span>{unlockedCount} / {totalBadges} {isAr ? 'أوسمة مفتوحة' : 'Unlocked'} ({overallPercentage}%)</span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-b border-slate-800/60">
            {[
              { id: 'all', label: isAr ? 'الكل 🌟' : 'All' },
              { id: 'study', label: isAr ? 'المذاكرة والتركيز ⚡' : 'Study' },
              { id: 'prayers', label: isAr ? 'الصلوات والقرآن 🕌' : 'Prayers & Quran' },
              { id: 'tasks', label: isAr ? 'المهام والواجبات 🎯' : 'Tasks' },
              { id: 'streak', label: isAr ? 'التتابع والاستمرارية 🔥' : 'Streaks' },
              { id: 'mastery', label: isAr ? 'القمة والتسبيح 📿' : 'Mastery' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-4">
            
            {/* Level Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-indigo-950/50 border border-amber-500/30 flex items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {profile.avatarValue || '🎓'}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>{profile.name || (isAr ? 'طالب متميز' : 'Student')}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-sm">
                      {totalXP >= 3000 ? (isAr ? 'أسطورة يسطا ذاكر 👑' : 'Legend Rank') : totalXP >= 1200 ? (isAr ? 'وحش التركيز 🔥' : 'Focus Titan') : totalXP >= 350 ? (isAr ? 'مواظب متفوق 📚' : 'Consistent') : (isAr ? 'طالب مجتهد 🎓' : 'Novice')}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 font-semibold">
                    <span className="text-purple-400 flex items-center gap-1"><Zap className="w-3.5 h-3.5 fill-purple-400" /> {totalXP} XP</span>
                    <span>•</span>
                    <span className="text-rose-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5 fill-rose-400" /> {streakDays} {isAr ? 'أيام تتابع' : 'Streak Days'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredBadges.map(badge => {
                const isUnlocked = badge.isUnlocked;
                const progressPct = Math.min(100, Math.round((badge.currentCount / badge.requiredCount) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                      isUnlocked
                        ? 'border-amber-500/60 bg-gradient-to-br from-amber-950/25 via-slate-900 to-slate-900 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800/80 bg-slate-900/40 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                            isUnlocked ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-800 border border-slate-700'
                          }`}>
                            {badge.icon}
                          </div>
                          <div>
                            <h4 className={`text-xs sm:text-sm font-black flex items-center gap-1.5 ${
                              isUnlocked ? 'text-amber-300' : 'text-slate-300'
                            }`}>
                              <span>{isAr ? badge.titleAr : badge.titleEn}</span>
                              {isUnlocked ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Lock className="w-3 h-3 text-slate-500" />
                              )}
                            </h4>
                            <span className="text-[10px] text-purple-400 font-bold">+{badge.xpReward} XP</span>
                          </div>
                        </div>

                        {/* Status chip or claim button */}
                        {isUnlocked ? (
                          <button
                            onClick={() => handleClaimBadgeReward(badge)}
                            className="text-[10px] px-2.5 py-1 rounded-full font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md active:scale-95"
                          >
                            {isAr ? 'مفتوح 🎉' : 'Unlocked'}
                          </button>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            {badge.currentCount}/{badge.requiredCount}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium mt-1">
                        {isAr ? badge.descriptionAr : badge.descriptionEn}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnlocked ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-slate-700'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
