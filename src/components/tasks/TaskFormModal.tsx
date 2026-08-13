import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckSquare, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentTask, TaskPriority } from '../../types';
import { getTodayDateString } from '../../utils/formatters';

export const TaskFormModal: React.FC = () => {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    setEditingTask,
    addTask,
    updateTask,
    lessons,
    settings,
    t,
  } = useApp();

  const isAr = settings.language !== 'en';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('20:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setSubjectName(editingTask.subjectName || '');
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime || '20:00');
      setPriority(editingTask.priority);
    } else {
      setTitle('');
      setDescription('');
      setSubjectName(lessons.length > 0 ? lessons[0].subject : '');
      setDueDate(getTodayDateString());
      setDueTime('20:00');
      setPriority('medium');
    }
  }, [editingTask, isTaskModalOpen, lessons]);

  if (!isTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim() || undefined,
        subjectName: subjectName || undefined,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        subjectName: subjectName || undefined,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        completed: false,
      });
    }

    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg glass-panel p-5 sm:p-6 rounded-3xl border border-slate-700/60 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto text-start"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
            <h3 className="text-lg font-bold text-slate-100 light:text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-rose-400" />
              <span>{editingTask ? (isAr ? 'تعديل المهمة / الواجب' : 'Edit Task') : (isAr ? 'إضافة واجب / مهمة جديدة' : 'Add New Task')}</span>
            </h3>
            <button
              onClick={() => {
                setIsTaskModalOpen(false);
                setEditingTask(null);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'عنوان الواجب / المهمة *' : 'Task Title *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={isAr ? 'مثال: تسليم تقرير مادة الفيزياء' : 'e.g. Lab Report submission'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Subject Link */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'المادة المرتبطة (اختياري)' : 'Related Class (Optional)'}
              </label>
              <select
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">{isAr ? 'بدون ربط بمادة خاصة' : 'General / None'}</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.subject}>
                    {l.subject} ({l.teacher || (isAr ? 'محاضرة' : 'Class')})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'تفاصيل أو ملاحظات إضافية' : 'Details / Notes'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={isAr ? 'تفاصيل التقرير، رابط المجلد، أسلوب التسليم...' : 'Instructions, link, or submission requirements...'}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'درجة الأولوية *' : 'Priority Level *'}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    priority === 'high'
                      ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400'
                  }`}
                >
                  {isAr ? 'قصوى' : 'High'}
                </button>

                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    priority === 'medium'
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/30'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400'
                  }`}
                >
                  {isAr ? 'متوسطة' : 'Medium'}
                </button>

                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    priority === 'low'
                      ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-600/30'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400'
                  }`}
                >
                  {isAr ? 'منخفضة' : 'Low'}
                </button>
              </div>
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? 'تاريخ التسليم *' : 'Due Date *'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? 'وقت التسليم' : 'Due Time'}</span>
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dir-ltr text-center font-bold"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Check className="w-4 h-4" />
                <span>{editingTask ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة المهمة' : 'Add Task')}</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
