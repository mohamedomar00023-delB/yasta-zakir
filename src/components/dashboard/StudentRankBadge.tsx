import React from 'react';
import { Sparkles, Trophy, Flame, Zap, Shield, Crown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StudentRankBadge: React.FC = () => {
  const { profile, settings, setIsAchievementsModalOpen } = useApp();
  const isAr = settings.language !== 'en';

  const xp = profile.xpPoints || 0;
  const streak = profile.streakDays || 1;

  // 10-Tier Academic Ranks
  const TIERS = [
    { min: 0, max: 150, num: 1, nameAr: 'المستوى 1: طالب مجتهد 🎓', nameEn: 'Level 1: Novice Scholar 🎓', color: 'from-slate-600 to-indigo-600', tierBadge: '🥉 برونزي' },
    { min: 150, max: 350, num: 2, nameAr: 'المستوى 2: باحث نشيط ⚡', nameEn: 'Level 2: Active Explorer ⚡', color: 'from-blue-600 to-indigo-600', tierBadge: '🥈 فضي' },
    { min: 350, max: 700, num: 3, nameAr: 'المستوى 3: مواظب متفوق 📚', nameEn: 'Level 3: Consistent Achiever 📚', color: 'from-emerald-600 to-teal-600', tierBadge: '🥇 ذهبي' },
    { min: 700, max: 1200, num: 4, nameAr: 'المستوى 4: نجم الدفعة 🌟', nameEn: 'Level 4: Class Luminary 🌟', color: 'from-cyan-500 to-blue-600', tierBadge: '💎 بلاتينيوم' },
    { min: 1200, max: 2000, num: 5, nameAr: 'المستوى 5: وحش التركيز 🔥', nameEn: 'Level 5: Focus Titan 🔥', color: 'from-amber-500 to-orange-600', tierBadge: '💠 ياقوتي' },
    { min: 2000, max: 3200, num: 6, nameAr: 'المستوى 6: عقلية علمية فذة 🧠', nameEn: 'Level 6: Master Strategist 🧠', color: 'from-purple-600 to-pink-600', tierBadge: '🔮 ماستر' },
    { min: 3200, max: 4800, num: 7, nameAr: 'المستوى 7: دحّاح أسطوري 👑', nameEn: 'Level 7: Academic Legend 👑', color: 'from-rose-600 via-purple-600 to-indigo-600', tierBadge: '👑 جراند ماستر' },
    { min: 4800, max: 7000, num: 8, nameAr: 'المستوى 8: القمة والامتياز 💎', nameEn: 'Level 8: Apex Scholar 💎', color: 'from-amber-400 via-rose-500 to-purple-700', tierBadge: '💎 ماسي نقي' },
    { min: 7000, max: 10000, num: 9, nameAr: 'المستوى 9: عبقري الكلية 🚀', nameEn: 'Level 9: Grand Master 🚀', color: 'from-yellow-400 via-amber-500 to-red-600', tierBadge: '🚀 ملك الأوائل' },
    { min: 10000, max: 99999, num: 10, nameAr: 'المستوى 10: أسطورة يسطا ذاكر الخالدة 🏆', nameEn: 'Level 10: Immortal Legend 🏆', color: 'from-amber-300 via-yellow-500 to-amber-600', tierBadge: '🏆 أسطورة خالدة' },
  ];

  const currentTier = TIERS.find(t => xp >= t.min && xp < t.max) || TIERS[TIERS.length - 1];
  const progressPercent = Math.min(100, Math.round(((xp - currentTier.min) / (currentTier.max - currentTier.min)) * 100));

  return (
    <div
      onClick={() => setIsAchievementsModalOpen(true)}
      className="glass-card p-4 sm:p-5 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] cursor-pointer group"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      title={isAr ? 'اضغط لفتح لوحة الأوسمة والإنجازات' : 'Click to view Achievements & Badges'}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Rank level info */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${currentTier.color} flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20 flex-shrink-0 group-hover:rotate-6 transition-transform`}>
          <Crown className="w-7 h-7" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm sm:text-base font-black truncate" style={{ color: 'var(--text-color)' }}>
              {isAr ? currentTier.nameAr : currentTier.nameEn}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black shrink-0">
              <Sparkles className="w-3 h-3" />
              {xp} XP
            </span>
          </div>

          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--subtext-color)' }}>
            {isAr ? (
              <>فاضلك <strong className="text-amber-400 font-bold">{Math.max(0, currentTier.max - xp)} XP</strong> وتوصل للمستوى القادم ({currentTier.num < 10 ? currentTier.num + 1 : 10})!</>
            ) : (
              <><strong className="text-amber-400 font-bold">{Math.max(0, currentTier.max - xp)} XP</strong> left to reach Level {currentTier.num < 10 ? currentTier.num + 1 : 10}!</>
            )}
          </p>
        </div>
      </div>

      {/* Streak & XP Progress Bar */}
      <div className="w-full sm:w-64 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1 text-orange-400">
            <Flame className="w-4 h-4 fill-orange-400 animate-bounce" />
            {isAr ? `تتابع المذاكرة: ${streak} أيام 🔥` : `Streak: ${streak} days 🔥`}
          </span>
          <span style={{ color: 'var(--subtext-color)' }}>{progressPercent}%</span>
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
