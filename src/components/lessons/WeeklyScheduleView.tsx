import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Video, 
  MapPin, 
  Edit, 
  Share2, 
  Calendar, 
  Clock, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Layers, 
  LayoutGrid, 
  List,
  Coffee,
  Check,
  Zap,
  TrendingUp
} from 'lucide-react';
import { ARABIC_DAYS, formatTime12h, getSubjectColorObj, getTodayDateString, timeToMinutes } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { Lesson } from '../../types';
import { haptic } from '../../utils/haptics';

export const WeeklyScheduleView: React.FC = () => {
  const { 
    lessons, 
    setIsLessonModalOpen, 
    setEditingLesson, 
    setIsShareModalOpen, 
    lessonCompletions, 
    toggleLessonCompletion,
    addXP,
    triggerCelebration,
    showToast,
    settings, 
    t 
  } = useApp();

  const currentDayId = new Date().getDay();
  const isAr = settings.language !== 'en';
  const todayStr = getTodayDateString();

  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(currentDayId);

  const enDays = [
    { id: 0, name: 'Sunday', short: 'Sun' },
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
  ];

  const daysList = isAr ? ARABIC_DAYS : enDays;

  // Extract unique subjects for filter
  const allSubjects = Array.from(new Set(lessons.map(l => l.subject).filter(Boolean)));

  // Calculate total weekly hours
  let totalWeeklyMinutes = 0;
  lessons.forEach(l => {
    const start = timeToMinutes(l.startTime);
    const end = timeToMinutes(l.endTime);
    const duration = end > start ? end - start : 90;
    totalWeeklyMinutes += duration * l.days.length;
  });
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

  // Find busiest day
  let maxCount = 0;
  let busiestDayName = isAr ? 'لا يوجد' : 'None';
  daysList.forEach(d => {
    const count = lessons.filter(l => l.days.includes(d.id)).length;
    if (count > maxCount) {
      maxCount = count;
      busiestDayName = d.name;
    }
  });

  const handleEdit = (lesson: Lesson, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptic.selection();
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleAdd = () => {
    haptic.selection();
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleToggleAttendance = (lessonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptic.medium();
    const wasCompleted = !!lessonCompletions[`${todayStr}_${lessonId}`];
    toggleLessonCompletion(todayStr, lessonId);
    if (!wasCompleted) {
      addXP(20, isAr ? 'تسجيل حضور الدرس' : 'Class Attendance Confirmed');
      triggerCelebration();
      showToast(isAr ? 'تم تأكيد الحضور بنجاح (+20 XP) 🎓' : 'Attendance confirmed (+20 XP) 🎓', 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Actions */}
      <div 
        className="p-5 sm:p-6 rounded-3xl border glass-card shadow-xl relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 text-xl">
              📅
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <span>{isAr ? 'نظرة عامة على الجدول الأسبوعي' : 'Weekly Academic Schedule'}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'استعراض وتنسيق مواعيد محاضراتك طوال أيام الأسبوع بدقة' : 'Comprehensive overview of all your weekly lectures and classes'}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-start lg:justify-end flex-wrap">
            
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 gap-1 text-xs">
              <button
                onClick={() => {
                  haptic.selection();
                  setViewMode('grid');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isAr ? 'شبكة الأيام' : 'Grid'}</span>
              </button>

              <button
                onClick={() => {
                  haptic.selection();
                  setViewMode('agenda');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'agenda'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{isAr ? 'أجندة مجمعة' : 'Agenda'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                haptic.selection();
                setIsShareModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'مشاركة 🤝' : 'Share'}</span>
            </button>

            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة مادة للجدول' : 'Add Class'}</span>
            </button>

          </div>

        </div>

        {/* Weekly Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800/60">
          
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-sm">
              📚
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">{isAr ? 'إجمالي الحصص' : 'Total Classes'}</span>
              <strong className="text-sm font-black text-white">{lessons.length} {isAr ? 'مواد' : 'Classes'}</strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-sm">
              ⏱️
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">{isAr ? 'ساعات الأسبوع' : 'Weekly Hours'}</span>
              <strong className="text-sm font-black text-white">{totalWeeklyHours} {isAr ? 'ساعة' : 'hrs'}</strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-sm">
              🔥
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">{isAr ? 'أكثر الأيام كثافة' : 'Busiest Day'}</span>
              <strong className="text-sm font-black text-amber-300">{busiestDayName}</strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm">
              ✨
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">{isAr ? 'اليوم الحالي' : 'Today'}</span>
              <strong className="text-sm font-black text-emerald-400">{daysList.find(d => d.id === currentDayId)?.name}</strong>
            </div>
          </div>

        </div>

      </div>

      {/* Subject Filter Chips Bar */}
      {allSubjects.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0 flex items-center gap-1 ml-1">
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span>{isAr ? 'تصفية المواد:' : 'Filter:'}</span>
          </span>

          <button
            onClick={() => {
              haptic.selection();
              setSelectedSubjectFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-[11px] ${
              selectedSubjectFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'جميع المواد' : 'All Subjects'}
          </button>

          {allSubjects.map(sub => {
            const isSelected = selectedSubjectFilter === sub;
            return (
              <button
                key={sub}
                onClick={() => {
                  haptic.selection();
                  setSelectedSubjectFilter(sub);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-[11px] ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* VIEW 1: 7-DAY MODERN GRID VIEW */}
      {viewMode === 'grid' && (
        <>
          {/* Mobile Day Selector (< md screens) */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {daysList.map(day => {
              const isSelected = selectedMobileDay === day.id;
              const isToday = currentDayId === day.id;
              const count = lessons.filter(l => l.days.includes(day.id) && (selectedSubjectFilter === 'all' || l.subject === selectedSubjectFilter)).length;

              return (
                <button
                  key={day.id}
                  onClick={() => {
                    haptic.selection();
                    setSelectedMobileDay(day.id);
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105'
                      : isToday
                      ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <span>{day.name}</span>
                  {count > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-400'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Single Day Card List */}
          <div className="block md:hidden">
            {(() => {
              const dayLessons = lessons
                .filter(l => l.days.includes(selectedMobileDay) && (selectedSubjectFilter === 'all' || l.subject === selectedSubjectFilter))
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
              const isToday = selectedMobileDay === currentDayId;

              return (
                <div className={`p-4 rounded-3xl border ${isToday ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-slate-800/80 bg-slate-900/40'} space-y-3`}>
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <span>{daysList.find(d => d.id === selectedMobileDay)?.name}</span>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                          {isAr ? 'اليوم 🌟' : 'Today 🌟'}
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-indigo-400 font-bold">
                      {dayLessons.length} {isAr ? 'محاضرات' : 'Classes'}
                    </span>
                  </div>

                  {dayLessons.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <div className="text-3xl">☕</div>
                      <p className="text-slate-400 text-xs font-semibold">
                        {isAr ? 'يوم راحة أو مراجعة ذاتية 🏖️' : 'Rest or Self-Study Day 🏖️'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {dayLessons.map(lesson => {
                        const colorObj = getSubjectColorObj(lesson.color);
                        const isCompleted = !!lessonCompletions[`${todayStr}_${lesson.id}`];

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => handleEdit(lesson)}
                            className={`p-3.5 rounded-2xl border text-start cursor-pointer hover:scale-[1.01] transition-transform ${colorObj.bg} ${colorObj.border}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <h5 className="text-sm font-black text-slate-100">
                                {lesson.subject}
                              </h5>
                              <div className="flex items-center gap-1.5">
                                {isToday && (
                                  <button
                                    onClick={(e) => handleToggleAttendance(lesson.id, e)}
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}
                                    title={isAr ? 'تسجيل حضور' : 'Attendance'}
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </button>
                                )}
                                <Edit className="w-3.5 h-3.5 text-slate-400 opacity-70" />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                              <span className="font-semibold text-indigo-400 dir-ltr font-mono">
                                {formatTime12h(lesson.startTime)} — {formatTime12h(lesson.endTime)}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[120px] text-slate-300 font-semibold">{lesson.teacher || (isAr ? 'أستاذ المادة' : 'TBD')}</span>
                                {lesson.type === 'online' ? (
                                  <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-300"><Video className="w-3 h-3" /></span>
                                ) : (
                                  <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-300"><MapPin className="w-3 h-3" /></span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Desktop 7-Day Responsive Grid (>= md screens) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-7 gap-3">
            {daysList.map(day => {
              const dayLessons = lessons
                .filter(l => l.days.includes(day.id) && (selectedSubjectFilter === 'all' || l.subject === selectedSubjectFilter))
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              const isToday = currentDayId === day.id;

              return (
                <div
                  key={day.id}
                  className={`p-3.5 rounded-3xl border min-h-[360px] flex flex-col justify-between transition-all ${
                    isToday
                      ? 'border-indigo-500/60 bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-slate-900/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-black ${isToday ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {day.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                          {isAr ? 'اليوم' : 'Today'}
                        </span>
                      )}
                      {dayLessons.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                          {dayLessons.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lessons List in Day */}
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[440px] pr-0.5">
                    {dayLessons.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-1.5 opacity-60">
                        <span className="text-xl">☕</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{isAr ? 'يوم راحة' : 'Free Day'}</span>
                      </div>
                    ) : (
                      dayLessons.map(lesson => {
                        const colorObj = getSubjectColorObj(lesson.color);
                        const isCompleted = !!lessonCompletions[`${todayStr}_${lesson.id}`];

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => handleEdit(lesson)}
                            className={`p-2.5 rounded-2xl border text-start cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group ${colorObj.bg} ${colorObj.border}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <h5 className="text-xs font-black text-slate-100 truncate">
                                {lesson.subject}
                              </h5>
                              <Edit className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <p className="text-[10px] text-indigo-400 font-bold dir-ltr text-start mb-1 font-mono">
                              {formatTime12h(lesson.startTime)} — {formatTime12h(lesson.endTime)}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                              <span className="truncate max-w-[90px]">{lesson.teacher || (isAr ? 'أستاذ المادة' : 'TBD')}</span>
                              {lesson.type === 'online' ? (
                                <span title="Online"><Video className="w-3 h-3 text-cyan-400 shrink-0" /></span>
                              ) : (
                                <span title={lesson.location || 'Onsite'}><MapPin className="w-3 h-3 text-indigo-400 shrink-0" /></span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Quick Add To Day Footer */}
                  <div className="pt-2 border-t border-slate-800/40 mt-2">
                    <button
                      onClick={handleAdd}
                      className="w-full py-1 rounded-xl text-[10px] font-bold text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAr ? 'إضافة حصة' : 'Add'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* VIEW 2: AGENDA TIMELINE LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {daysList.map(day => {
            const dayLessons = lessons
              .filter(l => l.days.includes(day.id) && (selectedSubjectFilter === 'all' || l.subject === selectedSubjectFilter))
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (dayLessons.length === 0) return null;

            const isToday = currentDayId === day.id;

            return (
              <div 
                key={day.id}
                className={`p-5 rounded-3xl border glass-card space-y-3 ${
                  isToday ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-slate-800/80 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-white">{day.name}</h4>
                    {isToday && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                        {isAr ? 'اليوم الحالي 🌟' : 'Today 🌟'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {dayLessons.length} {isAr ? 'محاضرات مجدولة' : 'Scheduled Classes'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayLessons.map(lesson => {
                    const colorObj = getSubjectColorObj(lesson.color);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleEdit(lesson)}
                        className={`p-4 rounded-2xl border text-start cursor-pointer hover:scale-[1.02] transition-transform ${colorObj.bg} ${colorObj.border}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <h5 className="text-sm font-black text-slate-100">{lesson.subject}</h5>
                          <Edit className="w-3.5 h-3.5 text-slate-400 opacity-70" />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono font-bold mb-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime12h(lesson.startTime)} — {formatTime12h(lesson.endTime)}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/40">
                          <span className="font-semibold text-slate-300">👨‍🏫 {lesson.teacher || (isAr ? 'أستاذ المادة' : 'TBD')}</span>
                          {lesson.type === 'online' ? (
                            <span className="inline-flex items-center gap-1 text-cyan-400"><Video className="w-3 h-3" /> {isAr ? 'أونلاين' : 'Online'}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-indigo-400"><MapPin className="w-3 h-3" /> {lesson.location || (isAr ? 'حضوري' : 'Onsite')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
