import React, { useState } from 'react';
import { ARABIC_DAYS, formatTime12h, getSubjectColorObj } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { Plus, Video, MapPin, Edit, Share2 } from 'lucide-react';
import { Lesson } from '../../types';

export const WeeklyScheduleView: React.FC = () => {
  const { lessons, setIsLessonModalOpen, setEditingLesson, setIsShareModalOpen, settings, t } = useApp();
  const currentDayId = new Date().getDay();
  const isAr = settings.language !== 'en';
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

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleAdd = () => {
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const mobileDayLessons = lessons
    .filter(l => l.days.includes(selectedMobileDay))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black" style={{ color: 'var(--text-color)' }}>
            {t('weeklyScheduleTitle')}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--subtext-color)' }}>
            {t('weeklyScheduleSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'مشاركة 🤝' : 'Share 🤝'}</span>
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addLesson')}</span>
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Tabs (< md screens) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {daysList.map(day => {
          const isSelected = selectedMobileDay === day.id;
          const isToday = currentDayId === day.id;
          const count = lessons.filter(l => l.days.includes(day.id)).length;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedMobileDay(day.id)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105'
                  : isToday
                  ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
              }`}
            >
              <span>{day.short}</span>
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

      {/* Mobile Single Day Card List (< md screens) */}
      <div className="block md:hidden">
        <div className="glass-panel p-4 rounded-3xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <span>{daysList.find(d => d.id === selectedMobileDay)?.name}</span>
              {selectedMobileDay === currentDayId && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                  {isAr ? 'اليوم' : 'Today'}
                </span>
              )}
            </h4>
            <span className="text-xs text-slate-400 font-bold">
              {mobileDayLessons.length} {isAr ? 'محاضرات' : 'Classes'}
            </span>
          </div>

          {mobileDayLessons.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs font-medium">
              {isAr ? 'لا توجد محاضرات مجدولة لهذا اليوم 🏖️' : 'No classes scheduled for this day 🏖️'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {mobileDayLessons.map(lesson => {
                const colorObj = getSubjectColorObj(lesson.color);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleEdit(lesson)}
                    className={`p-3.5 rounded-2xl border text-start cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform ${colorObj.bg} ${colorObj.border}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <h5 className="text-sm font-bold text-slate-100 truncate">
                        {lesson.subject}
                      </h5>
                      <Edit className="w-3.5 h-3.5 text-slate-400 opacity-70" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="font-semibold text-indigo-400 dir-ltr">
                        {formatTime12h(lesson.startTime, !isAr)}
                        {lesson.endTime ? ` - ${formatTime12h(lesson.endTime, !isAr)}` : ''}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]">{lesson.teacher || (isAr ? 'بدون محاضر' : 'TBD')}</span>
                        {lesson.type === 'online' ? (
                          <Video className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop 7-Day Grid (>= md screens) */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-7 gap-3">
        {daysList.map(day => {
          const dayLessons = lessons
            .filter(l => l.days.includes(day.id))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          const isToday = currentDayId === day.id;

          return (
            <div
              key={day.id}
              className={`glass-panel p-3.5 rounded-2xl border min-h-[320px] flex flex-col justify-between ${
                isToday
                  ? 'border-indigo-500/60 bg-indigo-950/20 ring-2 ring-indigo-500/40 glow-indigo'
                  : 'border-slate-800/80 bg-slate-900/40'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
                <span className={`text-sm font-bold ${isToday ? 'text-indigo-400' : 'text-slate-200 light:text-slate-900'}`}>
                  {day.name}
                </span>

                {isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                    {isAr ? 'اليوم' : 'Today'}
                  </span>
                )}
              </div>

              {/* Day Lessons List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] pr-0.5">
                {dayLessons.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <span className="text-[11px] text-slate-500">{isAr ? 'لا توجد محاضرات' : 'No classes'}</span>
                  </div>
                ) : (
                  dayLessons.map(lesson => {
                    const colorObj = getSubjectColorObj(lesson.color);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleEdit(lesson)}
                        className={`p-2.5 rounded-xl border text-start cursor-pointer hover:scale-[1.02] transition-transform ${colorObj.bg} ${colorObj.border}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h5 className="text-xs font-bold text-slate-100 light:text-slate-900 truncate">
                            {lesson.subject}
                          </h5>
                          <Edit className="w-3 h-3 text-slate-400 opacity-60" />
                        </div>

                        <p className="text-[10px] text-indigo-400 font-semibold dir-ltr text-start mb-1">
                          {formatTime12h(lesson.startTime, !isAr)}
                          {lesson.endTime ? ` - ${formatTime12h(lesson.endTime, !isAr)}` : ''}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate">{lesson.teacher || (isAr ? 'بدون محاضر' : 'TBD')}</span>
                          {lesson.type === 'online' ? (
                            <Video className="w-3 h-3 text-cyan-400 shrink-0" />
                          ) : (
                            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
