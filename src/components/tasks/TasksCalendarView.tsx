import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TasksCalendarView: React.FC = () => {
  const { tasks, lessons, toggleTaskCompletion, setIsTaskModalOpen, settings, t } = useApp();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  const isAr = settings.language !== 'en';

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Days in month
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

  const weekdayNamesAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  const weekdayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
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

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* Calendar Header Card */}
      <div className="p-4 sm:p-6 rounded-3xl glass-card border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            <span>{t('calendarTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--subtext-color)' }}>
            {t('calendarSubtitle')}
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-2xl bg-slate-900/40 border border-slate-700/40 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={isAr ? handlePrevMonth : handleNextMonth}
            className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-300 transition-colors"
          >
            {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <span className="px-2 sm:px-3 text-xs sm:text-sm font-bold min-w-[110px] text-center">
            {isAr ? monthNamesAr[month] : monthNamesEn[month]} {year}
          </span>
          <button
            onClick={isAr ? handleNextMonth : handlePrevMonth}
            className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-300 transition-colors"
          >
            {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Monthly Grid (2 cols) */}
        <div className="lg:col-span-2 p-3 sm:p-6 rounded-3xl border glass-card"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 text-center text-[10px] sm:text-xs font-black text-slate-400">
            {(isAr ? weekdayNamesAr : weekdayNamesEn).map((day, i) => (
              <div key={i} className="py-1">{day}</div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((dateObj, idx) => {
              if (!dateObj) {
                return <div key={`empty_${idx}`} className="h-12 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl bg-slate-900/10 opacity-30" />;
              }

              const dStr = dateObj.toISOString().split('T')[0];
              const isSelected = selectedDateStr === dStr;
              const isToday = todayStr === dStr;
              const dayTasks = tasks.filter(t => t.dueDate === dStr);
              const dayOfWeek = dateObj.getDay();
              const hasLessons = lessons.some(l => l.days.includes(dayOfWeek));

              return (
                <button
                  key={dStr}
                  onClick={() => setSelectedDateStr(dStr)}
                  className={`h-12 sm:h-16 md:h-20 p-1 sm:p-2 rounded-xl sm:rounded-2xl border flex flex-col justify-between text-start transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600/20 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                      : 'border-slate-800/60 hover:border-slate-600 bg-slate-900/30'
                  } ${isToday ? 'ring-1 ring-amber-400/80' : ''}`}
                >
                  {/* Day number & indicators */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[11px] sm:text-xs font-black ${isToday ? 'text-amber-400 font-extrabold' : ''}`}>
                      {dateObj.getDate()}
                    </span>

                    {isToday && (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>

                  {/* Dot pills for events */}
                  <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 mt-auto">
                    {dayTasks.length > 0 && (
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-bold leading-tight">
                        {dayTasks.length}
                      </span>
                    )}
                    {hasLessons && (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" title={isAr ? 'دروس مجدولة' : 'Scheduled classes'} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel (1 col) */}
        <div className="p-4 sm:p-6 rounded-3xl border glass-card space-y-4 flex flex-col justify-between"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 mb-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-400">{t('selectedDay')}</span>
                <h3 className="text-sm sm:text-base font-black">{selectedDateStr}</h3>
              </div>
              
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'مهمة' : 'Task'}</span>
              </button>
            </div>

            {/* Events for this day */}
            <div className="space-y-3 max-h-[350px] sm:max-h-[420px] overflow-y-auto pr-1">
              
              {/* Tasks */}
              {selectedDayTasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAr ? 'الواجبات والمهام' : 'Tasks'} ({selectedDayTasks.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedDayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => toggleTaskCompletion(t.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          t.completed 
                            ? 'bg-slate-800/30 border-slate-700/30 opacity-60 line-through' 
                            : 'bg-slate-800/60 border-slate-700/60 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{t.title}</span>
                          {t.dueTime && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{t.dueTime}</span>
                            </span>
                          )}
                        </div>
                        {t.subjectName && (
                          <span className="text-[10px] text-indigo-400 font-medium">{t.subjectName}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons on this day */}
              {selectedDayLessons.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'الدروس والمحاضرات' : 'Classes'} ({selectedDayLessons.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedDayLessons.map(l => (
                      <div key={l.id} className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-300">{l.subject}</span>
                          <span className="text-slate-400">{l.startTime}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{isAr ? `مع: ${l.teacher}` : `Instructor: ${l.teacher}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDayTasks.length === 0 && selectedDayLessons.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <span>🍃 {t('noItemsOnDay')}</span>
                </div>
              )}

            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{isAr ? 'انقر على أي يوم لاستعراض مواعيده وإضافة مهامك' : 'Click any date to view and add tasks'}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
