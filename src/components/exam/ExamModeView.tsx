import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Target,
  Flame,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils/haptics';

interface ExamItem {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location?: string;
  topicsToRevise?: string;
  preparednessPercent?: number;
}

const INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    subject: 'الفيزياء الحديثة',
    date: '2026-06-15',
    time: '09:00',
    location: 'اللجنة 4 - الدور الثاني',
    topicsToRevise: 'قوانين كيرشوف، الحث الكهرومغناطيسي، الدوائر المهتزة',
    preparednessPercent: 75,
  },
  {
    id: 'exam-2',
    subject: 'الرياضيات البحتة',
    date: '2026-06-18',
    time: '09:00',
    location: 'اللجنة 4 - الدور الثاني',
    topicsToRevise: 'التفاضل والتكامل، الهندسة الفراغية، المصفوفات',
    preparednessPercent: 60,
  }
];

export const ExamModeView: React.FC = () => {
  const { settings, showToast, addXP, triggerCelebration } = useApp();
  const isAr = settings.language !== 'en';

  const [exams, setExams] = useState<ExamItem[]>(() => {
    const saved = localStorage.getItem('yasta_exams_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_EXAMS;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newLocation, setNewLocation] = useState('');
  const [newTopics, setNewTopics] = useState('');

  const saveExams = (updated: ExamItem[]) => {
    setExams(updated);
    localStorage.setItem('yasta_exams_v1', JSON.stringify(updated));
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDate) {
      showToast(isAr ? 'برجاء كتابة اسم المادة وتحديد تاريخ الامتحان' : 'Please provide subject and date', 'warning');
      return;
    }

    const newItem: ExamItem = {
      id: `exam-${Date.now()}`,
      subject: newSubject.trim(),
      date: newDate,
      time: newTime,
      location: newLocation.trim(),
      topicsToRevise: newTopics.trim(),
      preparednessPercent: 50,
    };

    saveExams([...exams, newItem]);
    haptic.success();
    showToast(isAr ? 'تمت إضافة مادة الامتحان للجدول 🎓' : 'Exam added to schedule 🎓', 'success');
    setIsAddModalOpen(false);
    setNewSubject('');
    setNewDate('');
    setNewLocation('');
    setNewTopics('');
  };

  const handleDeleteExam = (id: string) => {
    haptic.light();
    saveExams(exams.filter(e => e.id !== id));
    showToast(isAr ? 'تم حذف الامتحان' : 'Exam deleted', 'info');
  };

  const handleUpdateProgress = (id: string, newPercent: number) => {
    haptic.selection();
    const updated = exams.map(e => {
      if (e.id === id) {
        if (newPercent === 100 && (e.preparednessPercent || 0) < 100) {
          addXP(50, isAr ? 'إتمام مراجعة مادة الامتحان 100%' : '100% Exam Revision Completed');
          triggerCelebration();
          showToast(isAr ? 'مبروك! أتممت مراجعة المادة بالكامل (+50 XP) 🚀' : 'Exam preparation complete (+50 XP) 🚀', 'success');
        }
        return { ...e, preparednessPercent: newPercent };
      }
      return e;
    });
    saveExams(updated);
  };

  const calculateCountdown = (dateStr: string, timeStr: string) => {
    const examDate = new Date(`${dateStr}T${timeStr || '09:00'}:00`);
    const now = new Date();
    const diffMs = examDate.getTime() - now.getTime();

    if (diffMs <= 0) return { days: 0, hours: 0, mins: 0, passed: true };

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, mins, passed: false };
  };

  return (
    <div className="space-y-6">
      
      {/* Exam Countdown Banner */}
      <div className="p-5 sm:p-6 rounded-3xl border glass-card shadow-xl relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900/60"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg text-2xl">
              🎓
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <span>{isAr ? 'رادار ومؤقت الامتحانات النهائية' : 'Exam Mode & Countdown Radar'}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'تتبع العد التنازلي ونسبة جاهزيتك لكل مادة قبل دخول اللجنة' : 'Track countdown days and revision readiness per subject'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              haptic.light();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-500/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة امتحان جديد' : 'Add Exam'}</span>
          </button>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map(exam => {
          const { days, hours, mins, passed } = calculateCountdown(exam.date, exam.time);
          const percent = exam.preparednessPercent || 50;

          return (
            <div 
              key={exam.id}
              className="p-5 rounded-3xl border glass-card flex flex-col justify-between gap-4 relative overflow-hidden"
              style={{ borderColor: 'var(--card-border)' }}
            >
              {/* Header with Countdown Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-black flex items-center gap-1.5" style={{ color: 'var(--text-color)' }}>
                    <span>{exam.subject}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{exam.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{exam.time}</span>
                    </span>
                  </div>
                  {exam.location && (
                    <p className="text-[10px] text-indigo-300 mt-1 font-semibold">
                      📍 {exam.location}
                    </p>
                  )}
                </div>

                {/* Live Countdown Box */}
                <div className={`p-2 sm:p-2.5 rounded-2xl border text-center shrink-0 ${
                  passed 
                    ? 'bg-slate-900 border-slate-800 text-slate-500'
                    : days <= 3 
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' 
                      : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                }`}>
                  {passed ? (
                    <span className="text-xs font-bold">{isAr ? 'تم الامتحان' : 'Finished'}</span>
                  ) : (
                    <>
                      <div className="text-base sm:text-lg font-black leading-tight font-mono">
                        {days} <span className="text-[10px] font-sans">{isAr ? 'يوم' : 'd'}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        {hours}h {mins}m
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Topics to revise */}
              {exam.topicsToRevise && (
                <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-amber-400 block mb-0.5">
                    {isAr ? '📌 أهم نقاط المراجعة:' : 'Key Topics:'}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {exam.topicsToRevise}
                  </p>
                </div>
              )}

              {/* Preparedness slider / Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-400">{isAr ? 'مؤشر الجاهزية والاستعداد:' : 'Readiness Score:'}</span>
                  <span className={`font-black ${percent === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {percent}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={percent}
                  onChange={(e) => handleUpdateProgress(exam.id, parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Delete button */}
              <div className="flex justify-end pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حذف' : 'Delete'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exam Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 text-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md transform rounded-3xl p-5 sm:p-6 text-start shadow-2xl relative border my-auto"
              style={{
                background: 'var(--panel-bg)',
                borderColor: 'var(--panel-border)',
                color: 'var(--text-color)'
              }}
            >
              <h3 className="text-base sm:text-lg font-black mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'إضافة مادة لجدول الامتحانات' : 'Add Exam Subject'}</span>
              </h3>

              <form onSubmit={handleAddExam} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {isAr ? 'اسم المادة *' : 'Subject Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: الأحياء، اللغة الإنجليزية...' : 'e.g. Biology, Calculus...'}
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      {isAr ? 'تاريخ الامتحان *' : 'Date *'}
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      {isAr ? 'وقت البدء' : 'Time'}
                    </label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {isAr ? 'مكان اللجنة / القاعة' : 'Exam Location'}
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? 'مثال: مبنى العلوم - مدرج أ' : 'e.g. Hall A, Room 204'}
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {isAr ? 'ملاحظات وأهم نقاط المراجعة' : 'Key Topics to Revise'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isAr ? 'اكتب الفصول المهمة أو القوانين...' : 'Notes...'}
                    value={newTopics}
                    onChange={(e) => setNewTopics(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/30"
                  >
                    {isAr ? 'حفظ الامتحان' : 'Save Exam'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
