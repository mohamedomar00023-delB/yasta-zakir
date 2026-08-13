import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, BookOpen, CheckSquare, HeartHandshake, Sparkles, RefreshCw, Quote } from 'lucide-react';
import { Lesson, PrayerItem, StudentTask } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/formatters';

interface ProgressBarCardProps {
  todayLessons: Lesson[];
  todayTasks: StudentTask[];
  prayers: PrayerItem[];
}

const MOTIVATIONAL_WISDOM = {
  ar: [
    "السر مش في المذاكرة 10 ساعات في يوم واحد.. السر في الاستمرارية كل يوم حتى لو ساعة واحدة! 🚀",
    "متقارنش بدايتك بمواسم حصاد غيرك.. ركز في تقدمك أنت خطوة بخطوة كل يوم! ✨",
    "المجهود الصغير اللي بتعمله في صمت النهاردة.. هو اللي هيعمل الفرق الكبير بكرة في النتيجة! 🌟",
    "صلاتك في وقتها مش بتضيع وقتك.. دي بتنزل البركة والصفاء الذهني في كل دقيقة مذاكرة! 🕌",
    "التعب هيمشي وتعدي الأيام.. لكن فرحة الامتياز والتفوق وفرحة أهلك بيك هتفضل للأبد! 🎓",
    "ابدأ بـ 25 دقيقة بس.. أصعب خطوة هي البداية، وبمجرد ما تبدأ عقلك هيدخل في مود التركيز! 🧠",
    "قسّم المادة الصعبة لدروس صغيرة.. والجبل هيتحول لخطوات سهلة تنجزها واحدة ورا واحدة! ⛰️",
    "التوفيق مش صدفة.. التوفيق هو توكل على الله مع سعي وتخطيط ذكي ويقين في النتيجة! 🤲",
    "الناجح مش هو اللي مش بيقع.. الناجح هو اللي بيقوم بسرعة ويكمل حتى لو ضاع منه يوم! 💪",
    "كل مسألة صعبة بتفهمها النهاردة بتزود ثقتك بنفسك درجات في الامتحان! 💡",
    "ركز على فهم الفكرة مش حفظ الكلمات.. الفهم بيفضل في دماغك حتى لو الامتحان جه غير متوقع! 🎯",
    "التسويف هو سارق الأحلام.. ابدأ بأهم مادة وريح بالك بقية اليوم! ☀️",
    "طاقتك أغلى من إنك تضيعها في المقارنات.. نافس نسختك بتاعة إمبارح بس! 🔥",
    "النوم 7 ساعات مش تضييع وقت.. دي فترة تثبيت المعلومات اللي ذاكرتها في الذاكرة الدائمة! 🌙",
    "طريق الألف ميل بيبدأ بصفحة واحدة.. افتح كتابك وسمّي الله وتوكل! 📖",
    "كل دقيقة تركيز بتستثمرها دلوقتي.. بتبني بيها مستقبلك والكلية اللي بتحلم بيها! 🌟"
  ],
  en: [
    "Success isn't about studying 10 hours in one day.. it's about showing up every day even for 1 hour! 🚀",
    "Don't compare your chapter 1 to someone else's chapter 20. Stay loyal to your daily streak! ✨",
    "The silent efforts you put in today will speak loudly on your results day! 🌟",
    "Praying on time doesn't take away time—it multiplies mental clarity and blessings! 🕌",
    "The temporary exhaustion fades, but the pride of academic excellence lasts forever! 🎓",
    "Just start with 25 minutes.. breaking the friction of starting is 80% of the battle! 🧠",
    "Break giant subjects into bite-sized chapters.. steady momentum conquers everything! ⛰️",
    "True excellence is the intersection of faith, smart planning, and relentless effort! 🤲",
    "Winners aren't those who never fall; they are the ones who get up and keep moving! 💪",
    "Every hard problem you master today builds unshakeable exam confidence! 💡",
    "Focus on deep understanding over rote memorization. Concepts stick forever! 🎯",
    "Procrastination steals dreams. Win the day by starting your hardest task first! ☀️",
    "Your only competition is who you were yesterday. Focus on your growth! 🔥",
    "7 hours of sleep isn't wasted time; it's when your brain stores memories permanently! 🌙",
    "A thousand-mile journey starts with a single page. Open your book and begin! 📖",
    "Every focused minute you invest now is building the future you dream of! 🌟"
  ]
};

export const ProgressBarCard: React.FC<ProgressBarCardProps> = ({
  todayLessons,
  todayTasks,
  prayers,
}) => {
  const { lessonCompletions, prayersCompleted, settings } = useApp();
  const isAr = settings.language !== 'en';
  const todayStr = getTodayDateString();

  const quotesList = isAr ? MOTIVATIONAL_WISDOM.ar : MOTIVATIONAL_WISDOM.en;
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Auto rotate wisdom every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotesList.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [quotesList.length]);

  const handleNextQuote = () => {
    setQuoteIndex(prev => (prev + 1) % quotesList.length);
  };

  // 1. Lessons completed count
  const completedLessonsCount = todayLessons.filter(l => !!lessonCompletions[`${todayStr}_${l.id}`]).length;
  
  // 2. Tasks completed count
  const completedTasksCount = todayTasks.filter(t => t.completed).length;

  // 3. Prayers completed count
  const completedPrayersCount = prayers.filter(p => !!prayersCompleted[`${todayStr}_${p.name}`]).length;

  const totalItems = todayLessons.length + todayTasks.length + 5; // 5 main prayers
  const totalCompleted = completedLessonsCount + completedTasksCount + Math.min(completedPrayersCount, 5);

  const percentage = totalItems > 0 ? Math.min(100, Math.round((totalCompleted / totalItems) * 100)) : 0;

  return (
    <div
      className="w-full glass-card p-4 sm:p-6 rounded-3xl border shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1.5">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isAr ? 'مؤشر الإنجاز والإنتاجية اليومية' : 'Daily Productivity & Progress'}</span>
          </div>
          
          {/* Dynamic Rotating Motivational Wisdom */}
          <div className="flex items-start sm:items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-1.5 text-xs sm:text-sm md:text-base font-black leading-snug"
                style={{ color: 'var(--text-color)' }}
              >
                <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{quotesList[quoteIndex]}</span>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleNextQuote}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/40 transition-colors shrink-0"
              title={isAr ? 'حكمة أخرى' : 'Next Quote'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-start sm:text-end flex items-baseline gap-1.5 shrink-0 self-end sm:self-center">
          <span className="text-3xl sm:text-4xl font-black text-emerald-400 glow-emerald">{percentage}%</span>
          <span className="text-xs font-bold" style={{ color: 'var(--subtext-color)' }}>
            {isAr ? 'مكتمل' : 'Done'}
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div
        className="w-full h-3.5 sm:h-4 rounded-full overflow-hidden p-0.5 border relative z-10"
        style={{
          background: 'var(--input-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full shadow-md"
        />
      </div>

      {/* Item summary counters */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t text-xs font-bold relative z-10"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isAr ? 'دروس ومحاضرات اليوم:' : 'Classes:'} <strong className="text-indigo-400">{completedLessonsCount}/{todayLessons.length}</strong></span>
        </div>

        <div className="flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
          <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
          <span>{isAr ? 'واجبات ومهام اليوم:' : 'Tasks:'} <strong className="text-rose-400">{completedTasksCount}/{todayTasks.length}</strong></span>
        </div>

        <div className="flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
          <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isAr ? 'صلوات اليوم:' : 'Prayers:'} <strong className="text-emerald-400">{completedPrayersCount}/5</strong></span>
        </div>
      </div>
    </div>
  );
};
