import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Video, MapPin, Edit, Trash2, BookOpen, Clock, CalendarX } from 'lucide-react';
import { Lesson } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTime12h, getSubjectColorObj, getTodayDateString } from '../../utils/formatters';

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
    settings,
    showToast,
    t,
  } = useApp();

  const isAr = settings.language !== 'en';
  const todayStr = getTodayDateString();

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleClearAllLessons = () => {
    if (window.confirm(isAr ? 'متأكد إنك عاوز تمسح كل الدروس التجريبية وتبدأ تعمل جدولك بنفسك؟' : 'Are you sure you want to clear all sample classes and create your own?')) {
      setLessons([]);
      showToast(isAr ? 'تم مسح الدروس التجريبية! تقدر تضيف دروسك دلوقتي 📝' : 'Sample classes cleared! Add your custom classes now 📝', 'info');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>{t('todayLessonsTitle')}</span>
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--subtext-color)' }}>
            {t('todayLessonsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {todayLessons.length > 0 && (
            <button
              onClick={handleClearAllLessons}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all hover:bg-red-500/10 text-red-400 border-red-500/30"
              title={isAr ? 'مسح الدروس التجريبية لإضافة جدولك بنفسك' : 'Clear sample classes'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'فضّي الجدول' : 'Clear all'}</span>
            </button>
          )}

          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addLesson')}</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {todayLessons.length === 0 ? (
        <div className="glass-card p-8 rounded-3xl text-center border border-dashed border-slate-800/80 my-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <CalendarX className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-200">{t('noLessonsToday')}</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {isAr ? 'استغل هذا الوقت في المذاكرة، مراجعة الواجبات، أو الاسترخاء والراحة.' : 'Use this free time for focused study, homework, or relaxing.'}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addLesson')}</span>
          </button>
        </div>
      ) : (
        /* Lessons Timeline List */
        <div className="space-y-3">
          <AnimatePresence>
            {todayLessons.map((lesson, idx) => {
              const colorObj = getSubjectColorObj(lesson.color);
              const isCompleted = !!lessonCompletions[`${todayStr}_${lesson.id}`];

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass-card p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'opacity-70 bg-emerald-950/10 border-emerald-500/20'
                      : `${colorObj.bg} ${colorObj.border}`
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Lesson Main Details */}
                    <div className="flex items-start gap-4">
                      
                      {/* Checkmark Button */}
                      <button
                        onClick={() => toggleLessonCompletion(todayStr, lesson.id)}
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-800/80 text-slate-500 hover:text-slate-200 border border-slate-700/60'
                        }`}
                        title={isCompleted ? t('attended') : t('confirmAttendance')}
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-base font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-100 light:text-slate-900'}`}>
                            {lesson.subject}
                          </h4>

                          {/* Online / Onsite badge */}
                          {lesson.type === 'online' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
                              <Video className="w-3 h-3" />
                              {t('onlineLesson')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold">
                              <MapPin className="w-3 h-3" />
                              {t('onsiteLesson')}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 font-medium">
                          {isAr ? 'المحاضر:' : 'Instructor:'} <span className="text-slate-300">{lesson.teacher || (isAr ? 'غير محدد' : 'TBD')}</span>
                        </p>

                        {/* Location or Zoom link */}
                        {lesson.type === 'online' && lesson.link && (
                          <a
                            href={lesson.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline font-medium mt-1 dir-ltr"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>{isAr ? 'انضم للمحاضرة عبر الرابط' : 'Join class link'}</span>
                          </a>
                        )}

                        {lesson.type === 'onsite' && lesson.location && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{lesson.location}</span>
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Time & Action buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/60">
                      
                      {/* Time pill */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold text-indigo-400 dir-ltr"
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatTime12h(lesson.startTime, !isAr)}
                          {lesson.endTime ? ` - ${formatTime12h(lesson.endTime, !isAr)}` : ''}
                        </span>
                      </div>

                      {/* Edit / Delete Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                          title={isAr ? 'تعديل الدرس' : 'Edit Class'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLesson(lesson.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title={isAr ? 'حذف الدرس' : 'Delete Class'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

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
