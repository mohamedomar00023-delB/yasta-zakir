import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, BookOpen, Clock, MapPin, Video, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lesson, LessonType } from '../../types';
import { ARABIC_DAYS, SUBJECT_COLORS } from '../../utils/formatters';

export const LessonFormModal: React.FC = () => {
  const {
    isLessonModalOpen,
    setIsLessonModalOpen,
    editingLesson,
    setEditingLesson,
    addLesson,
    updateLesson,
    settings,
    showToast,
    t,
  } = useApp();

  const isAr = settings.language !== 'en';

  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [type, setType] = useState<LessonType>('onsite');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [days, setDays] = useState<number[]>([0, 2, 4]); // Sun, Tue, Thu by default
  const [color, setColor] = useState('indigo');

  useEffect(() => {
    if (editingLesson) {
      setSubject(editingLesson.subject);
      setTeacher(editingLesson.teacher);
      setType(editingLesson.type);
      setLink(editingLesson.link || '');
      setLocation(editingLesson.location || '');
      setStartTime(editingLesson.startTime);
      setDays(editingLesson.days);
      setColor(editingLesson.color);
    } else {
      setSubject('');
      setTeacher('');
      setType('onsite');
      setLink('');
      setLocation('');
      setStartTime('09:00');
      setDays([0, 2, 4]);
      setColor('indigo');
    }
  }, [editingLesson, isLessonModalOpen]);

  if (!isLessonModalOpen) return null;

  const toggleDay = (dayId: number) => {
    setDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (days.length === 0 || !subject.trim()) return;

    if (editingLesson) {
      updateLesson({
        ...editingLesson,
        subject: subject.trim(),
        teacher: teacher.trim(),
        type,
        link: link.trim() || undefined,
        location: location.trim() || undefined,
        startTime,
        days,
        color,
      });
      showToast(isAr ? 'تم تعديل المحاضرة بنجاح ✏️' : 'Class updated successfully ✏️', 'success');
    } else {
      addLesson({
        subject: subject.trim(),
        teacher: teacher.trim(),
        type,
        link: link.trim() || undefined,
        location: location.trim() || undefined,
        startTime,
        days,
        color,
      });
      showToast(isAr ? 'تمت إضافة الدرس لجدولك بنجاح 📚' : 'Class added to schedule 📚', 'success');
    }

    setIsLessonModalOpen(false);
    setEditingLesson(null);
  };

  const enDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsLessonModalOpen(false);
            setEditingLesson(null);
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg transform rounded-3xl border shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto text-start"
          style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
        >
          <div className="p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b mb-5" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>{editingLesson ? (isAr ? 'تعديل المحاضرة' : 'Edit Class') : (isAr ? 'إضافة درس/محاضرة جديدة' : 'Add New Class')}</span>
              </h3>
              <button
                onClick={() => {
                  setIsLessonModalOpen(false);
                  setEditingLesson(null);
                }}
                className="p-1.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
                style={{ color: 'var(--subtext-color)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Subject & Teacher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                    {isAr ? 'اسم المادة / المحاضرة *' : 'Class / Subject Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder={isAr ? 'مثال: الرياضيات، الفيزياء...' : 'e.g. Physics, Calculus...'}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                    {isAr ? 'اسم المحاضر / الدكتور' : 'Instructor / Teacher'}
                  </label>
                  <input
                    type="text"
                    value={teacher}
                    onChange={e => setTeacher(e.target.value)}
                    placeholder={isAr ? 'مثال: د. أحمد' : 'e.g. Dr. John'}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}
                  />
                </div>
              </div>

              {/* Type: Online vs Onsite */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-color)' }}>
                  {isAr ? 'مكان المحاضرة' : 'Class Format'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('onsite')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                      type === 'onsite'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                    style={type !== 'onsite' ? { background: 'var(--card-bg)', color: 'var(--subtext-color)' } : {}}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{isAr ? 'حضوري بالقاعة' : 'In-Person / On-site'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('online')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                      type === 'online'
                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-600/30'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                    style={type !== 'online' ? { background: 'var(--card-bg)', color: 'var(--subtext-color)' } : {}}
                  >
                    <Video className="w-4 h-4" />
                    <span>{isAr ? 'أونلاين (عن بُعد)' : 'Online / Remote'}</span>
                  </button>
                </div>
              </div>

              {/* Location or Optional Link */}
              {type === 'onsite' ? (
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                    {isAr ? 'اسم القاعة / المبنى' : 'Room / Hall / Building'}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder={isAr ? 'مثال: قاعة 302 - مبنى العلوم' : 'e.g. Hall 302'}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                    {isAr ? 'رابط المنصة / زوم (اختياري)' : 'Meeting / Zoom Link (Optional)'}
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm dir-ltr focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}
                  />
                </div>
              )}

              {/* Start Time Only */}
              <div>
                <label className="block text-xs font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--text-color)' }}>
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'وقت بداية المحاضرة *' : 'Start Time *'}</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dir-ltr text-center font-black"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}
                />
              </div>

              {/* Repeating Days Selector */}
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                  {isAr ? 'أيام التكرار الأسبوعية *' : 'Weekly Recurring Days *'}
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {ARABIC_DAYS.map((day, idx) => {
                    const selected = days.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          selected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30 scale-105'
                            : 'border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                        style={!selected ? { background: 'var(--card-bg)', color: 'var(--subtext-color)' } : {}}
                      >
                        {isAr ? day.short : enDaysShort[idx]}
                      </button>
                    );
                  })}
                </div>
                {days.length === 0 && (
                  <p className="text-[11px] text-rose-400 mt-1">{isAr ? 'يرجى اختيار يوم واحد على الأقل' : 'Please select at least one day'}</p>
                )}
              </div>

              {/* Accent Color Picker */}
              <div>
                <label className="block text-xs font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--text-color)' }}>
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isAr ? 'لون تمييز المادة' : 'Class Accent Color'}</span>
                </label>
                <div className="flex items-center gap-3">
                  {SUBJECT_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${c.badge} ${
                        color === c.id ? 'ring-4 ring-offset-2 ring-offset-slate-900 ' + c.ring + ' scale-110' : 'hover:scale-105'
                      }`}
                    >
                      {color === c.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsLessonModalOpen(false);
                    setEditingLesson(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:text-slate-200"
                  style={{ color: 'var(--subtext-color)' }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={days.length === 0 || !subject.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingLesson ? (isAr ? 'حفظ التغييرات' : 'Save Changes') : (isAr ? 'إضافة الدرس للجدول' : 'Add Class')}</span>
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
