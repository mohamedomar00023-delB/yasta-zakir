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
  Sunrise,
  Shield,
  Layers,
  Medal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_BADGES } from '../../utils/presets';
import { BadgeItem } from '../../types';
import { haptic } from '../../utils/haptics';

export const AchievementsModal: React.FC = () => {
  const { 
    isAchievementsModalOpen, 
    setIsAchievementsModalOpen, 
    profile, 
    tasks, 
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
    haptic.celebration();
    triggerCelebration();
    addXP(badge.xpReward, isAr ? `مكافأة ${badge.titleAr}` : `Reward: ${badge.titleEn}`);
    showToast(isAr ? `تهانينا! استلمت مكافأة ${badge.titleAr} (+${badge.xpReward} XP)` : `Claimed ${badge.titleEn} (+${badge.xpReward} XP)`, 'success');
  };

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-6 h-6 stroke-[2] ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Sunrise': return <Sunrise className={iconClass} />;
      case 'Zap': return <Zap className={iconClass} />;
      case 'CheckCircle2': return <CheckCircle2 className={iconClass} />;
      case 'Flame': return <Flame className={iconClass} />;
      case 'Star': return <Star className={iconClass} />;
      case 'Heart': return <Heart className={iconClass} />;
      case 'Sparkles': return <Sparkles className={iconClass} />;
      case 'BookOpen': return <BookOpen className={iconClass} />;
      case 'Crown': return <Crown className={iconClass} />;
      case 'Trophy': return <Trophy className={iconClass} />;
      default: return <Award className={iconClass} />;
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsAchievementsModalOpen(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl transform rounded-3xl p-5 sm:p-7 shadow-2xl relative border my-auto max-h-[92vh] flex flex-col overflow-hidden text-start"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-color)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsAchievementsModalOpen(false)}
            className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'} p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-20`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 text-white shadow-xl shadow-amber-500/20 flex items-center justify-center shrink-0 border border-white/20">
                <Trophy className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                  <span>{isAr ? 'لوحة الأوسمة والتميز الأكاديمي' : 'Academic Honors & Medals'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'سجل الأوسمة ومكافآت الإنجاز ومسار التدرج في المستويات' : 'Track academic milestones and honor badges'}
                </p>
              </div>
            </div>

            {/* Total Unlocked Stats */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs self-start sm:self-center">
              <Award className="w-4 h-4" />
              <span>{unlockedCount} / {totalBadges} {isAr ? 'أوسمة مكتملة' : 'Unlocked'} ({overallPercentage}%)</span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar border-b border-slate-800/60 text-xs font-bold">
            {[
              { id: 'all', label: isAr ? 'جميع الأوسمة' : 'All Medals' },
              { id: 'study', label: isAr ? 'المذاكرة والتركيز' : 'Focus & Study' },
              { id: 'prayers', label: isAr ? 'الصلوات والقرآن' : 'Devotion & Prayers' },
              { id: 'tasks', label: isAr ? 'الواجبات والتسليمات' : 'Assignments' },
              { id: 'streak', label: isAr ? 'الاستمرارية والتتابع' : 'Streaks' },
              { id: 'mastery', label: isAr ? 'أوسمة القمة والامتياز' : 'Mastery Honors' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  haptic.selection();
                  setSelectedCategory(cat.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="py-4 overflow-y-auto max-h-[58vh] pr-1 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredBadges.map((badge) => {
                const percent = Math.min(100, Math.round((badge.currentCount / badge.requiredCount) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                      badge.isUnlocked
                        ? 'bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-indigo-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/40 border-slate-800/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      
                      {/* Badge Emblem Box */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        badge.isUnlocked
                          ? 'bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border-amber-400/50 shadow-md'
                          : 'bg-slate-950 border-slate-800'
                      }`}>
                        {getBadgeIcon(badge.icon, badge.isUnlocked)}
                      </div>

                      {/* Badge Details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs sm:text-sm font-black truncate ${badge.isUnlocked ? 'text-amber-300' : 'text-slate-300'}`}>
                            {isAr ? badge.titleAr : badge.titleEn}
                          </h4>

                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-bold shrink-0">
                            +{badge.xpReward} XP
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isAr ? badge.descriptionAr : badge.descriptionEn}
                        </p>
                      </div>

                    </div>

                    {/* Progress Bar & Status */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>
                          {isAr ? 'التقدم:' : 'Progress:'} {badge.currentCount} / {badge.requiredCount}
                        </span>
                        <span className="font-mono">{percent}%</span>
                      </div>

                      <div className="w-full h-2 rounded-full overflow-hidden bg-slate-950 border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            badge.isUnlocked
                              ? 'bg-gradient-to-r from-amber-500 to-indigo-500'
                              : 'bg-slate-700'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Unlocked / Locked Footer */}
                      <div className="flex items-center justify-between pt-1">
                        {badge.isUnlocked ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] text-amber-400 font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isAr ? 'وسام مكتمل وموثق' : 'Honor Awarded'}</span>
                            </span>

                            <button
                              onClick={() => handleClaimBadgeReward(badge)}
                              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black shadow-sm active:scale-95 transition-all"
                            >
                              {isAr ? 'احتفال بالإنجاز' : 'Celebrate'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-600" />
                            <span>{isAr ? 'قيد الإنجاز' : 'In Progress'}</span>
                          </span>
                        )}
                      </div>

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
