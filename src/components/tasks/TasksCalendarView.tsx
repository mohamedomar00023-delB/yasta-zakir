import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Calendar as CalendarIcon,
  Sparkles,
  Check,
  Tag,
  AlertCircle,
  Video,
  MapPin,
  Flame,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatTime12h, getTodayDateString } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';

export const TasksCalendarView: React.FC = () => {
  const { tasks, lessons, toggleTaskCompletion, setIsTaskModalOpen, addXP, triggerCelebration, showToast, settings, t } = useApp();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  const isAr = settings.language !== 'en';
  const todayStr = getTodayDateString();

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday

  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const weekdayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    haptic.selection();
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    haptic.selection();
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    haptic.medium();
    setCurrentMonthDate(new Date());
    setSelectedDateStr(todayStr);
  };

  // Build calendar matrix
  const calendarCells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  // Selected Day Items
  const selectedDateObj = new Date(selectedDateStr);
  const selectedDayOfWeek = selectedDateObj.getDay();

  const selectedDayTasks = tasks.filter(t => t.dueDate === selectedDateStr);
  const selectedDayLessons = lessons.filter(l => l.days.includes(selectedDayOfWeek));

  const totalMonthTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  const handleToggleTask = (taskId: string, title: string, wasCompleted: boolean) => {
    haptic.medium();
    toggleTaskCompletion(taskId);
    if (!wasCompleted) {
      addXP(15, isAr ? 'إنجاز مهمة من التقويم' : 'Calendar Task Completed');
      triggerCelebration();
      showToast(isAr ? `عاش! أنجزت «${title}» (+15 XP) 🎉` : `Task completed (+15 XP) 🎉`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Top Banner */}
      <div 
        className="p-5 sm:p-6 rounded-3xl border glass-card shadow-xl relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 text-xl">
              🗓️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <span>{isAr ? 'تقويم المهام والدروس' : 'Academic Calendar & Agenda'}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'نظرة شاملة لجدولك الدراسي وواجباتك ومواعيد التسليم على مدار الشهر' : 'Full overview of monthly study schedule, deadlines, and classes'}
              </p>
            </div>
          </div>

          {/* Month Navigator Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all"
            >
              {isAr ? 'اليوم الحالي' : 'Today'}
            </button>

            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
              <button
                onClick={isAr ? handlePrevMonth : handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
                title="Previous Month"
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              <span className="px-3 text-xs sm:text-sm font-black min-w-[120px] text-center text-white">
                {isAr ? monthNamesAr[month] : monthNamesEn[month]} {year}
              </span>

              <button
                onClick={isAr ? handleNextMonth : handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
                title="Next Month"
              >
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>

        {/* Quick Month Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-800/60 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
            <span className="text-base">📌</span>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">{isAr ? 'واجبات هذا الشهر' : 'Month Tasks'}</span>
              <strong className="text-xs font-black text-white">{totalMonthTasks} {isAr ? 'مهام' : 'Tasks'}</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
            <span className="text-base">🎓</span>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">{isAr ? 'المواد المجدولة' : 'Weekly Classes'}</span>
              <strong className="text-xs font-black text-white">{lessons.length} {isAr ? 'محاضرات' : 'Classes'}</strong>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
            <span className="text-base">✨</span>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">{isAr ? 'اليوم المختار' : 'Selected Date'}</span>
              <strong className="text-xs font-black text-indigo-400 font-mono">{selectedDateStr}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Main Calendar Matrix & Day Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Calendar Monthly Matrix (8 cols on lg) */}
        <div 
          className="lg:col-span-8 p-4 sm:p-6 rounded-3xl border glass-card shadow-xl space-y-3"
          style={{ borderColor: 'var(--card-border)' }}
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] sm:text-xs font-black text-slate-400 pb-2 border-b border-slate-800/60">
            {(isAr ? weekdayNamesAr : weekdayNamesEn).map((day, i) => (
              <div key={i} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarCells.map((dateObj, idx) => {
              if (!dateObj) {
                return <div key={`empty_${idx}`} className="h-16 sm:h-20 rounded-2xl bg-slate-950/20 border border-transparent opacity-20" />;
              }

              const dStr = dateObj.toISOString().split('T')[0];
              const isSelected = selectedDateStr === dStr;
              const isToday = todayStr === dStr;
              const dayTasks = tasks.filter(t => t.dueDate === dStr);
              const dayOfWeek = dateObj.getDay();
              const dayLessons = lessons.filter(l => l.days.includes(dayOfWeek));

              return (
                <button
                  key={dStr}
                  onClick={() => {
                    haptic.selection();
                    setSelectedDateStr(dStr);
                  }}
                  className={`h-16 sm:h-20 p-2 rounded-2xl border text-start flex flex-col justify-between transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-indigo-500 bg-gradient-to-b from-indigo-950/60 to-purple-950/40 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500 scale-[1.03] z-10'
                      : isToday
                        ? 'border-amber-500/60 bg-amber-950/15 ring-1 ring-amber-400/50 hover:border-amber-400'
                        : 'border-slate-800/70 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Day number & today marker */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black font-mono ${
                      isSelected 
                        ? 'text-white font-extrabold' 
                        : isToday 
                          ? 'text-amber-400 font-extrabold' 
                          : 'text-slate-300'
                    }`}>
                      {dateObj.getDate()}
                    </span>

                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-sm" />
                    )}
                  </div>

                  {/* Badges / Dots for items on this day */}
                  <div className="flex flex-wrap items-center gap-1 mt-auto">
                    {dayTasks.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold font-mono">
                        {dayTasks.length} {isAr ? 'واجب' : 't'}
                      </span>
                    )}
                    {dayLessons.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                        {dayLessons.length} {isAr ? 'درس' : 'c'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-800/50 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isAr ? 'اليوم الحالي' : 'Today'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-md bg-rose-500/40 border border-rose-500" />
              <span>{isAr ? 'واجبات دراسية' : 'Tasks'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-md bg-emerald-500/40 border border-emerald-500" />
              <span>{isAr ? 'حصص ومحاضرات' : 'Classes'}</span>
            </span>
          </div>

        </div>

        {/* Selected Day Agenda Drawer (4 cols on lg) */}
        <div 
          className="lg:col-span-4 p-5 rounded-3xl border glass-card shadow-xl flex flex-col justify-between gap-4"
          style={{ borderColor: 'var(--card-border)' }}
        >
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">
                  {isAr ? 'تفاصيل اليوم المحدد' : 'Selected Agenda'}
                </span>
                <h3 className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
                  {selectedDateStr}
                </h3>
              </div>

              <button
                onClick={() => {
                  haptic.selection();
                  setIsTaskModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة مهمة' : 'Add Task'}</span>
              </button>
            </div>

            {/* List of Events on Selected Day */}
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              
              {/* Tasks Section */}
              {selectedDayTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'الواجبات والمهام المجدولة' : 'Tasks Due'} ({selectedDayTasks.length})</span>
                  </h4>

                  <div className="space-y-2">
                    {selectedDayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTask(t.id, t.title, t.completed)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          t.completed
                            ? 'bg-slate-950/40 border-slate-800 opacity-60'
                            : 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                              t.completed ? 'bg-emerald-500 text-white' : 'border border-slate-700 bg-slate-800'
                            }`}>
                              {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className={`text-xs font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                              {t.title}
                            </span>
                          </div>

                          {t.dueTime && (
                            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5 shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime12h(t.dueTime)}</span>
                            </span>
                          )}
                        </div>

                        {t.subjectName && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-semibold">
                              {t.subjectName}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons Section */}
              {selectedDayLessons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isAr ? 'المحاضرات والحصص' : 'Classes'} ({selectedDayLessons.length})</span>
                  </h4>

                  <div className="space-y-2">
                    {selectedDayLessons.map(l => (
                      <div key={l.id} className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-start space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black text-emerald-300">{l.subject}</h5>
                          <span className="text-[10px] font-mono text-slate-300 font-bold">
                            {formatTime12h(l.startTime)} — {formatTime12h(l.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>👨‍🏫 {l.teacher || (isAr ? 'أستاذ المادة' : 'TBD')}</span>
                          {l.type === 'online' ? (
                            <span className="text-cyan-400 flex items-center gap-1"><Video className="w-3 h-3" /> {isAr ? 'أونلاين' : 'Online'}</span>
                          ) : (
                            <span className="text-indigo-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.location || (isAr ? 'حضوري' : 'Onsite')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDayTasks.length === 0 && selectedDayLessons.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <div className="text-3xl">🏖️</div>
                  <p className="font-semibold">{isAr ? 'لا توجد مواعيد أو واجبات في هذا اليوم' : 'No events scheduled on this date'}</p>
                  <p className="text-[11px] text-slate-500">{isAr ? 'يوم مثالي للراحة أو الاستعداد للأيام القادمة' : 'Great day to recharge or prepare'}</p>
                </div>
              )}

            </div>

          </div>

          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isAr ? 'انقر على أي يوم لاستعراض مواعيده وإضافة مهامك' : 'Click any date to view and add tasks'}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
