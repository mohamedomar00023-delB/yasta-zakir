import React from 'react';
import { Sparkles, Trophy, Flame, Zap, Shield, Crown, Award, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StudentRankBadge: React.FC = () => {
  const { profile, settings, setIsAchievementsModalOpen } = useApp();
  const isAr = settings.language !== 'en';

  const xp = profile.xpPoints || 0;
  const streak = profile.streakDays || 1;

  // 10-Tier Prestigious Academic Ranks (Classic, Formal & Luxury)
  const TIERS = [
    { min: 0, max: 250, num: 1, nameAr: 'المستوى 1: باحث أكاديمي واعد', nameEn: 'Level 1: Novice Scholar', color: 'from-slate-600 to-indigo-600', tierBadge: 'الدرجة البرونزية' },
    { min: 250, max: 650, num: 2, nameAr: 'المستوى 2: باحث مجتهد ومواظب', nameEn: 'Level 2: Active Explorer', color: 'from-blue-600 to-indigo-600', tierBadge: 'الدرجة الفضية' },
    { min: 650, max: 1300, num: 3, nameAr: 'المستوى 3: متفوق مع مرتبة الشرف', nameEn: 'Level 3: Consistent Achiever', color: 'from-emerald-600 to-teal-600', tierBadge: 'الدرجة الذهبية' },
    { min: 1300, max: 2200, num: 4, nameAr: 'المستوى 4: طليعة ونجم الدفعة', nameEn: 'Level 4: Class Luminary', color: 'from-cyan-500 to-blue-600', tierBadge: 'الدرجة البلاتينية' },
    { min: 2200, max: 3500, num: 5, nameAr: 'المستوى 5: باحث أول في التخصص', nameEn: 'Level 5: Senior Scholar', color: 'from-amber-500 to-orange-600', tierBadge: 'الدرجة الياقوتية' },
    { min: 3500, max: 5200, num: 6, nameAr: 'المستوى 6: عقلية علمية متميزة', nameEn: 'Level 6: Master Strategist', color: 'from-purple-600 to-pink-600', tierBadge: 'الدرجة الأكاديمية العليا' },
    { min: 5200, max: 7500, num: 7, nameAr: 'المستوى 7: رائد أكاديمي واستراتيجي', nameEn: 'Level 7: Academic Luminary', color: 'from-rose-600 via-purple-600 to-indigo-600', tierBadge: 'جراند ماستر' },
    { min: 7500, max: 10500, num: 8, nameAr: 'المستوى 8: القمة والامتياز العلمي', nameEn: 'Level 8: Apex Scholar', color: 'from-amber-400 via-rose-500 to-purple-700', tierBadge: 'الدرجة الماسية' },
    { min: 10500, max: 15000, num: 9, nameAr: 'المستوى 9: عبقري التخصص والكلية', nameEn: 'Level 9: Grand Academician', color: 'from-yellow-400 via-amber-500 to-red-600', tierBadge: 'طليعة الأوائل' },
    { min: 15000, max: 99999, num: 10, nameAr: 'المستوى 10: وسام التفوق والخلود الأكاديمي', nameEn: 'Level 10: Immortal Academician', color: 'from-amber-300 via-yellow-500 to-amber-600', tierBadge: 'وسام الشرف الخالد' },
  ];

  const currentTier = TIERS.find(t => xp >= t.min && xp < t.max) || TIERS[TIERS.length - 1];
  const progressPercent = Math.min(100, Math.round(((xp - currentTier.min) / (currentTier.max - currentTier.min)) * 100));

  return (
    <div
      onClick={() => setIsAchievementsModalOpen(true)}
      className="glass-card p-4 sm:p-5 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] cursor-pointer group"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      title={isAr ? 'اضغط لاستعراض لوحة الأوسمة والإنجازات الأكاديمية' : 'Click to view Academic Medals & Badges'}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Rank level info */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${currentTier.color} flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20 flex-shrink-0 group-hover:scale-105 transition-transform border border-white/20`}>
          <Crown className="w-7 h-7 stroke-[2]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm sm:text-base font-black truncate" style={{ color: 'var(--text-color)' }}>
              {isAr ? currentTier.nameAr : currentTier.nameEn}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black shrink-0 font-mono">
              <Zap className="w-3 h-3 fill-amber-400" />
              {xp} XP
            </span>
          </div>

          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--subtext-color)' }}>
            {isAr ? (
              <>متبقي <strong className="text-amber-400 font-bold font-mono">{Math.max(0, currentTier.max - xp)} XP</strong> للوصول إلى المستوى القادم ({currentTier.num < 10 ? currentTier.num + 1 : 10})</>
            ) : (
              <><strong className="text-amber-400 font-bold font-mono">{Math.max(0, currentTier.max - xp)} XP</strong> remaining to Level {currentTier.num < 10 ? currentTier.num + 1 : 10}</>
            )}
          </p>
        </div>
      </div>

      {/* Streak & XP Progress Bar */}
      <div className="w-full sm:w-64 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1 text-orange-400">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span>{isAr ? `أيام التتابع: ${streak} أيام` : `Streak: ${streak} days`}</span>
          </span>
          <span className="font-mono" style={{ color: 'var(--subtext-color)' }}>{progressPercent}%</span>
        </div>

        <div className="w-full h-3 rounded-full overflow-hidden p-0.5 border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${currentTier.color} transition-all duration-500 shadow-sm`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
