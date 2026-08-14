import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Compass,
  BookOpen,
  CheckSquare,
  Bot,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Clock,
  Zap,
  Volume2,
  Share2,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils/haptics';

interface TourStep {
  id: string;
  badge: string;
  badgeColor: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: any;
  iconBg: string;
  features: {
    emoji: string;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
  }[];
  tipAr: string;
  tipEn: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    badge: 'مرحباً بك 🎓',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    titleAr: 'أهلاً بك في يسطا ذاكر 🎓',
    titleEn: 'Welcome to Yasta Zakir 🎓',
    subtitleAr: 'المنصة الذكية المتكاملة لتنظيم يومك الدراسي، صلواتك، ومذاكرتك بدون تشتت.',
    subtitleEn: 'Your all-in-one smart daily companion for study schedules, prayer times, and deep focus.',
    icon: Sparkles,
    iconBg: 'from-indigo-600 via-purple-600 to-pink-600',
    features: [
      {
        emoji: '🕌',
        titleAr: 'مواقيت الصلاة والقبلة',
        titleEn: 'Prayer Times & Qibla',
        descAr: 'مواقيت دقيقة حسب مدينتك مع عداد تنازلي للأذان وتنبيهات ذكية.',
        descEn: 'Accurate times based on your city with countdown timer & Adhan alerts.',
      },
      {
        emoji: '📚',
        titleAr: 'جدول المحاضرات والدروس',
        titleEn: 'Class Schedule Manager',
        descAr: 'تنظيم الحصص الحضورية والأونلاين مع كشف تعارض مواعيد الصلاة والدروس.',
        descEn: 'Track online and campus lectures with automatic conflict detection.',
      },
      {
        emoji: '⚡',
        titleAr: 'نظام نقاط الخبرة والرتب',
        titleEn: 'Gamified XP & Ranks',
        descAr: 'اجمع نقاط XP مع كل واجب وصلاة وحافظ على تتابعك الدراسي اليومي.',
        descEn: 'Earn XP for every finished task and prayer to climb academic ranks.',
      }
    ],
    tipAr: '💡 نصيحة: بياناتك كلها محفوظة محلياً على جهازك بأعلى درجات الخصوصية والأمان وتعمل بدون إنترنت.',
    tipEn: '💡 Pro Tip: All your data is stored securely and privately on your device, working offline seamlessly.',
  },
  {
    id: 'prayers',
    badge: 'الصلوات والقبلة 🕌',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    titleAr: 'مواقيت الصلاة والقبلة والعداد التنازلي',
    titleEn: 'Prayers, Qibla & Adhan Timers',
    subtitleAr: 'حافظ على صلواتك الخمس في وقتها لتنال البركة والتوفيق في مذاكرتك.',
    subtitleEn: 'Keep up with your daily prayers on time to bring blessings into your study journey.',
    icon: Compass,
    iconBg: 'from-emerald-600 to-teal-600',
    features: [
      {
        emoji: '⏳',
        titleAr: 'مؤشر العد التنازلي المباشر',
        titleEn: 'Live Countdown Timer',
        descAr: 'يعرض لك الوقت المتبقي بالساعات والدقائق والثواني حتى موعد الأذان القادم.',
        descEn: 'Real-time countdown to the next prayer so you are always prepared.',
      },
      {
        emoji: '🧭',
        titleAr: 'بوصلة القبلة الدقيقة',
        titleEn: 'Digital Qibla Compass',
        descAr: 'تحدد لك اتجاه القبلة نحو الكعبة المشرفة بدقة من موقعك الحالي.',
        descEn: 'High-precision compass showing Mecca bearing from your GPS coordinates.',
      },
      {
        emoji: '🔔',
        titleAr: 'أصوات الأذان وتنبيهات التعارض',
        titleEn: 'Adhan Chimes & Alerts',
        descAr: 'تنبيه ذكي فوري إذا كان هناك درس يتعارض مع وقت الصلاة لتعديل موعدك.',
        descEn: 'Instant smart alerts if a class conflicts with prayer time.',
      }
    ],
    tipAr: '💡 نصيحة: يمكنك تغيير نغمة الأذان وطريقة الحساب من نافذة المظهر والإعدادات.',
    tipEn: '💡 Pro Tip: Customize your Adhan audio tone and calculation method in Settings.',
  },
  {
    id: 'lessons-tasks',
    badge: 'الدروس والواجبات 📝',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    titleAr: 'الجدول الأسبوعي وإدارة الواجبات والتقويم',
    titleEn: 'Schedule, Task Tracker & Calendar',
    subtitleAr: 'وداعاً لتراكم الدروس ونسيان مواعيد الواجبات والامتحانات.',
    subtitleEn: 'Never miss a homework deadline or lecture with our intuitive trackers.',
    icon: BookOpen,
    iconBg: 'from-blue-600 to-indigo-600',
    features: [
      {
        emoji: '📅',
        titleAr: 'تقويم شهري وعرض أسبوعي',
        titleEn: 'Monthly & Weekly Views',
        descAr: 'استعرض جدول أيام الأسبوع كاملة مع تقويم تفاعلي للمهام والدروس.',
        descEn: 'Seamlessly switch between Today, Weekly Schedule, and Full Calendar.',
      },
      {
        emoji: '🔥',
        titleAr: 'تصنيف الواجبات حسب الأولوية',
        titleEn: 'Priority-based Tasks',
        descAr: 'حدد الواجبات ذات الأولوية القصوى (🔥) والمتوسطة (⚡) لتنجز الأهم أولاً.',
        descEn: 'Tag assignments as High, Medium, or Low priority to tackle urgent items first.',
      },
      {
        emoji: '🤝',
        titleAr: 'مشاركة الجدول كصورة أنيقة',
        titleEn: 'Schedule Export & Share',
        descAr: 'احفظ جدولك الدراسي كصورة بجودة عالية أو شارك ملخصه مع زملائك.',
        descEn: 'Export your timetable as a high-res PNG image or share text summary.',
      }
    ],
    tipAr: '💡 نصيحة: تأكيد حضور الدرس أو تسليم الواجب يمنحك نقاط XP فورية واهتزازاً تفاعلياً.',
    tipEn: '💡 Pro Tip: Marking classes attended or tasks completed awards instant XP & haptic feedback.',
  },
  {
    id: 'ai-focus',
    badge: 'الذكاء الاصطناعي والتركيز 🤖',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    titleAr: 'مساعد AI الذكي ومؤقت البومودورو 50/10',
    titleEn: 'AI Study Planner & Pomodoro Focus',
    subtitleAr: 'استغل قوة الذكاء الاصطناعي لتوليد خطط مذاكرة متوازنة مع فترات راحة وصلاة.',
    subtitleEn: 'Generate tailored study sessions around your daily energy and prayer breaks.',
    icon: Bot,
    iconBg: 'from-purple-600 via-pink-600 to-rose-600',
    features: [
      {
        emoji: '✨',
        titleAr: 'توليد خطة المذاكرة بالـ AI',
        titleEn: 'AI Plan Generator',
        descAr: 'اكتب المواد وساعاتك المتاحة، وسيقوم الذكاء الاصطناعي بتقسيمها وتحويلها لمهام.',
        descEn: 'Input subjects & free hours to get an optimized schedule injected into your tasks.',
      },
      {
        emoji: '⏱️',
        titleAr: 'مؤقت بومودورو مع أصوات بيئية',
        titleEn: 'Deep Focus & Ambient Noise',
        descAr: 'جلسات تركيز 50 دقيقة تليها 10 دقائق راحة مع أصوات المطر وأمواج البحر.',
        descEn: '50/10 focus intervals coupled with calming ambient sounds (Rain, Waves).',
      },
      {
        emoji: '💡',
        titleAr: 'نوتات وقوانين سريعة',
        titleEn: 'Cheat Sheets & Quick Notes',
        descAr: 'احفظ القوانين والملخصات وثبتها في الأعلى للرجوع إليها وقت المراجعة.',
        descEn: 'Pin essential formulas and study summaries for rapid exam review.',
      }
    ],
    tipAr: '💡 نصيحة: إنهاء جلسات البومودورو بدون مقاطعة يرفع تتابعك الدراسي ويزيد تركيزك.',
    tipEn: '💡 Pro Tip: Completing Pomodoro sessions builds your streak and unlocks special focus badges.',
  },
  {
    id: 'athkar-gamification',
    badge: 'السبحة والأوسمة 📿',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    titleAr: 'السبحة الذكية، حصن المسلم، ونظام الأوسمة',
    titleEn: 'Digital Tasbeeh, Athkar & 10 Ranks',
    subtitleAr: 'اهتزاز واقعي بالسبحة، أذكار المذاكرة، والتنافس للوصول لرتبة أسطورة الدفعة.',
    subtitleEn: 'Realistic haptic vibrations, study prayers, and 10 progressive scholar levels.',
    icon: Award,
    iconBg: 'from-amber-500 to-orange-600',
    features: [
      {
        emoji: '📿',
        titleAr: 'السبحة الذكية باهتزاز فيزيائي',
        titleEn: 'Haptic Tasbeeh Counter',
        descAr: 'نبضات اهتزاز واقعية عند كل تسبيحة مع اهتزاز خاص عند إتمام دورة 33 أو 100.',
        descEn: 'Tactile vibration pulse for each bead and milestone alerts on 33/100 counts.',
      },
      {
        emoji: '📖',
        titleAr: 'حصن المسلم وأذكار المذاكرة',
        titleEn: 'Study Supplications & Athkar',
        descAr: 'أدعية تيسير الصعب، تثبيت الحفظ، ودخول الامتحان مع أذكار الصباح والمساء.',
        descEn: 'Essential authentic prayers for exam success, morning & evening Athkar.',
      },
      {
        emoji: '👑',
        titleAr: '10 مستويات ورتب أكاديمية',
        titleEn: '10-Tier Academic Levels',
        descAr: 'نظام نقاط مدروس ومتوازن يتدرج بك من طالب مبتدئ حتى أسطورة يسطا ذاكر الخالدة.',
        descEn: 'Balanced XP system challenging you to ascend from Novice to Immortal Legend.',
      }
    ],
    tipAr: '💡 نصيحة: يمكنك تثبيت التطبيق على هاتفك المحمول كـ PWA ليعمل كتطبيق أصلي سريع.',
    tipEn: '💡 Pro Tip: Install the app on your phone via PWA for an authentic native experience.',
  }
];

interface AppTourModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AppTourModal: React.FC<AppTourModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { settings, isAppTourOpen, setIsAppTourOpen } = useApp();
  const isAr = settings.language !== 'en';
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAppTourOpen;
  const onClose = propOnClose || (() => setIsAppTourOpen(false));

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    haptic.light();
    if (isLast) {
      haptic.celebration();
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    haptic.light();
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepClick = (idx: number) => {
    haptic.light();
    setCurrentStepIndex(idx);
  };

  const IconComponent = currentStep.icon;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl transform rounded-3xl border shadow-2xl relative my-auto overflow-hidden max-h-[92vh] flex flex-col text-start"
          style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${currentStep.iconBg} text-white shadow-lg shrink-0`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${currentStep.badgeColor}`}>
                    {currentStep.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {currentStepIndex + 1} / {TOUR_STEPS.length}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black truncate mt-0.5" style={{ color: 'var(--text-color)' }}>
                  {isAr ? currentStep.titleAr : currentStep.titleEn}
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                haptic.light();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body with Animated Slides */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--subtext-color)' }}>
              {isAr ? currentStep.subtitleAr : currentStep.subtitleEn}
            </p>

            {/* Features List Cards */}
            <div className="space-y-2.5">
              {currentStep.features.map((feat, i) => (
                <motion.div
                  key={feat.titleAr}
                  initial={{ opacity: 0, x: isAr ? 15 : -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-3 sm:p-3.5 rounded-2xl border flex items-start gap-3 transition-all hover:border-indigo-500/50"
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                >
                  <span className="text-2xl sm:text-3xl shrink-0 p-1.5 rounded-xl bg-slate-900/40 border border-slate-800">
                    {feat.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-black mb-0.5" style={{ color: 'var(--text-color)' }}>
                      {isAr ? feat.titleAr : feat.titleEn}
                    </h4>
                    <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: 'var(--subtext-color)' }}>
                      {isAr ? feat.descAr : feat.descEn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Smart Tip Box */}
            <div className="p-3 sm:p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center gap-2">
              <span>{isAr ? currentStep.tipAr : currentStep.tipEn}</span>
            </div>
          </div>

          {/* Footer Controls & Progress Indicator */}
          <div className="p-4 sm:p-5 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--card-border)' }}>
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentStepIndex === idx
                      ? 'w-6 bg-indigo-500'
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next / Prev Buttons */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-1"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{isAr ? 'السابق' : 'Previous'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <span>{isLast ? (isAr ? 'ابدأ الآن 🚀' : 'Get Started 🚀') : (isAr ? 'التالي' : 'Next')}</span>
                {!isLast && (isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
