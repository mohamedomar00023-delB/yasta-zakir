import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Plus, 
  Video, 
  MapPin, 
  Edit, 
  Trash2, 
  BookOpen, 
  Clock, 
  CalendarX,
  Sparkles,
  Calendar,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Lesson } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTime12h, getSubjectColorObj, getTodayDateString, timeToMinutes } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';

interface TodayScheduleProps {
  todayLessons: Lesson[];
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ todayLessons }) => {
  const {
    lessonCompletions,
    toggleLessonCompletion,
    setIsLessonModalOpen,
    setEditingLesson,
    deleteLesson,
    setLessons,
    setActiveTab,
    setIsAIPlannerModalOpen,
    settings,
    showToast,
    addXP,
    triggerCelebration,
    t,
  } = useApp();

  const isAr = settings.language !== 'en';
  const todayStr = getTodayDateString();

  const now = new Date();
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();

  const completedCount = todayLessons.filter(l => !!lessonCompletions[`${todayStr}_${l.id}`]).length;
  const progressPercent = todayLessons.length > 0 ? Math.round((completedCount / todayLessons.length) * 100) : 0;

  const handleEdit = (lesson: Lesson) => {
    haptic.selection();
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleCreate = () => {
    haptic.selection();
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleToggleAttendance = (lessonId: string) => {
    haptic.medium();
    const wasCompleted = !!lessonCompletions[`${todayStr}_${lessonId}`];
    toggleLessonCompletion(todayStr, lessonId);
    if (!wasCompleted) {
      addXP(20, isAr ? 'تسجيل حضور الدرس' : 'Class Attendance Confirmed');
      triggerCelebration();
      showToast(isAr ? 'تم تأكيد حضور الدرس بنجاح (+20 XP) 🎓' : 'Attendance confirmed (+20 XP) 🎓', 'success');
    }
  };

  const handleDelete = (lessonId: string, subjectName: string) => {
    haptic.light();
    if (window.confirm(isAr ? `هل تريد حذف درس «${subjectName}» من جدولك؟` : `Delete class "${subjectName}"?`)) {
      deleteLesson(lessonId);
      showToast(isAr ? 'تم حذف الدرس من الجدول' : 'Class deleted', 'info');
    }
  };

  const getLessonLiveStatus = (lesson: Lesson) => {
    const isCompleted = !!lessonCompletions[`${todayStr}_${lesson.id}`];
    if (isCompleted) {
      return { status: 'completed', label: isAr ? 'تم الحضور ✅' : 'Attended ✅', class: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' };
    }

    const startMins = timeToMinutes(lesson.startTime);
    const endMins = timeToMinutes(lesson.endTime);

    if (currentTotalMins >= startMins && currentTotalMins <= endMins) {
      return { status: 'live', label: isAr ? 'جارٍ الآن 🟢' : 'In Session 🟢', class: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 animate-pulse' };
    }

    const diff = startMins - currentTotalMins;
    if (diff > 0 && diff <= 60) {
      return { status: 'soon', label: isAr ? `يبدأ بعد ${diff} د` : `In ${diff}m`, class: 'bg-amber-500/20 border-amber-500/40 text-amber-400' };
    }

    if (diff < 0) {
      return { status: 'passed', label: isAr ? 'انتهى موعده' : 'Ended', class: 'bg-slate-800 border-slate-700 text-slate-400' };
    }

    return { status: 'upcoming', label: isAr ? 'قادم' : 'Upcoming', class: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' };
  };

  return (
    <div 
      className="p-5 sm:p-6 rounded-3xl border glass-card shadow-xl space-y-4 relative overflow-hidden"
      style={{ borderColor: 'var(--card-border)' }}
    >
      {/* Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
              <span>{isAr ? 'جدول دروس اليوم' : "Today's Class Schedule"}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/30">
                {todayLessons.length} {isAr ? 'حصص' : 'Classes'}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {isAr ? 'المحاضرات والحصص المجدولة لليوم مع تتبع الحضور' : 'Scheduled lectures and active attendance tracking'}
            </p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة مادة للجدول' : 'Add Class'}</span>
        </button>
      </div>

      {/* Daily Progress Tracker (If there are lessons) */}
      {todayLessons.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${progressPercent === 100 ? 'text-emerald-400' : 'text-indigo-400'}`} />
            <span className="font-bold text-slate-300">
              {isAr ? `إنجاز الحضور: ${completedCount} من ${todayLessons.length} دروس` : `Attendance: ${completedCount} of ${todayLessons.length} classes`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-20 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-black text-indigo-400">{progressPercent}%</span>
          </div>
        </div>
      )}

      {/* Empty State vs Lesson List */}
      {todayLessons.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-3xl text-center border border-dashed border-slate-800/80 bg-slate-900/30 my-2 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl shadow-inner">
            ☕
          </div>
          <div>
            <h4 className="text-base font-black text-slate-100">
              {isAr ? 'مفيش دروس مجدولة النهاردة! وقت مثالي للمراجعة أو الراحة 💆‍♂️' : 'No Classes Scheduled Today! Perfect time to review 💆‍♂️'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              {isAr ? 'استغل هذا الوقت في حل الواجبات المتراكمة، تلخيص الفصول الصعبة، أو الاسترخاء والراحة.' : 'Use this free time for focused homework, flashcards, or relaxing.'}
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleCreate}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إضافة درس للجدول' : 'Add Class'}</span>
            </button>

            <button
              onClick={() => {
                haptic.selection();
                setIsAIPlannerModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'توليد جدول ذكي بالـ AI' : 'AI Study Plan'}</span>
            </button>

            <button
              onClick={() => {
                haptic.selection();
                setActiveTab('weekly');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'عرض الجدول الأسبوعي' : 'Weekly Schedule'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {todayLessons.map((lesson, idx) => {
              const colorObj = getSubjectColorObj(lesson.color);
              const isCompleted = !!lessonCompletions[`${todayStr}_${lesson.id}`];
              const liveStatus = getLessonLiveStatus(lesson);

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    isCompleted
                      ? 'opacity-70 bg-slate-950/40 border-slate-800'
                      : liveStatus.status === 'live'
                        ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900/80 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : `${colorObj.bg} ${colorObj.border} hover:border-indigo-500/40`
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left Details */}
                    <div className="flex items-start gap-3">
                      
                      {/* Attendance Toggle Checkbox */}
                      <button
                        onClick={() => handleToggleAttendance(lesson.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-800/80 text-slate-500 hover:text-slate-200 border border-slate-700/60 active:scale-95'
                        }`}
                        title={isCompleted ? (isAr ? 'إلغاء تأكيد الحضور' : 'Cancel attendance') : (isAr ? 'تأكيد الحضور وكسب XP' : 'Confirm attendance')}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm sm:text-base font-black ${isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {lesson.subject}
                          </h4>

                          {/* Live Status Badge */}
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${liveStatus.class}`}>
                            {liveStatus.label}
                          </span>

                          {/* Mode Badge */}
                          {lesson.type === 'online' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                              <Video className="w-3 h-3" />
                              <span>{isAr ? 'أونلاين' : 'Online'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                              <MapPin className="w-3 h-3" />
                              <span>{lesson.location || (isAr ? 'حضوري' : 'Onsite')}</span>
                            </span>
                          )}
                        </div>

                        {/* Teacher & Time Row */}
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {lesson.teacher && (
                            <span>👨‍🏫 <strong className="text-slate-300">{lesson.teacher}</strong></span>
                          )}
                          <span className="flex items-center gap-1 text-slate-300 font-mono">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>{formatTime12h(lesson.startTime)} — {formatTime12h(lesson.endTime)}</span>
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title={isAr ? 'تعديل الدرس' : 'Edit Class'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(lesson.id, lesson.subject)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={isAr ? 'حذف الدرس' : 'Delete Class'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};
