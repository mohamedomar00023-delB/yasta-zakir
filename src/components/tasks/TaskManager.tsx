import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, Check, Clock, AlertCircle, Edit, Trash2, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentTask, TaskPriority } from '../../types';
import { getTodayDateString, formatTime12h } from '../../utils/formatters';

export const TaskManager: React.FC = () => {
  const {
    tasks,
    toggleTaskCompletion,
    deleteTask,
    setEditingTask,
    setIsTaskModalOpen,
    settings,
    t,
  } = useApp();

  const isAr = settings.language !== 'en';
  const [filter, setFilter] = useState<'all' | 'high' | 'today' | 'completed'>('all');
  const todayStr = getTodayDateString();

  const filteredTasks = tasks.filter(task => {
    if (filter === 'high') return task.priority === 'high';
    if (filter === 'today') return task.dueDate === todayStr;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleCreate = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEdit = (task: StudentTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const priorityBadges: Record<TaskPriority, { label: string; class: string }> = {
    high: { label: isAr ? 'أولوية قصوى' : 'High Priority', class: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    medium: { label: isAr ? 'أولوية متوسطة' : 'Medium Priority', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    low: { label: isAr ? 'أولوية منخفضة' : 'Low Priority', class: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-100 light:text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-rose-400" />
            <span>{t('tasksTitle')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('tasksSubtitle')}
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addTask')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
              : 'bg-slate-900/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? `جميع المهام (${tasks.length})` : `All Tasks (${tasks.length})`}
        </button>

        <button
          onClick={() => setFilter('today')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            filter === 'today'
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
              : 'bg-slate-900/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? `تسليم اليوم (${tasks.filter(t => t.dueDate === todayStr).length})` : `Due Today (${tasks.filter(t => t.dueDate === todayStr).length})`}
        </button>

        <button
          onClick={() => setFilter('high')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            filter === 'high'
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
              : 'bg-slate-900/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? `قصوى الأولوية (${tasks.filter(t => t.priority === 'high').length})` : `High Priority (${tasks.filter(t => t.priority === 'high').length})`}
        </button>

        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            filter === 'completed'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
              : 'bg-slate-900/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? `المكتملة (${tasks.filter(t => t.completed).length})` : `Completed (${tasks.filter(t => t.completed).length})`}
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card p-8 rounded-3xl text-center border border-dashed border-slate-800 my-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-200">{t('noTasks')}</h4>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'حافظ على هذا التميز أو قم بإضافة واجب جديد لتنظيمه.' : 'Keep up the great work or add a new task to stay organized.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filteredTasks.map(task => {
              const priorityObj = priorityBadges[task.priority];
              const isOverdue = !task.completed && task.dueDate < todayStr;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card p-4 rounded-2xl border transition-all ${
                    task.completed
                      ? 'opacity-65 bg-slate-950/40 border-slate-800'
                      : isOverdue
                      ? 'border-rose-500/50 bg-rose-950/20 glow-rose'
                      : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Checkmark & Info */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all mt-0.5 ${
                          task.completed
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 hover:text-slate-200 border border-slate-700'
                        }`}
                        title={task.completed ? (isAr ? 'إلغاء التحديد' : 'Mark Incomplete') : (isAr ? 'تحديد كـ مكتمل' : 'Mark Completed')}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-100 light:text-slate-900'}`}>
                            {task.title}
                          </h4>

                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${priorityObj.class}`}>
                            {priorityObj.label}
                          </span>

                          {task.subjectName && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 text-[10px] font-semibold">
                              {task.subjectName}
                            </span>
                          )}

                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse">
                              <AlertCircle className="w-3 h-3" />
                              {isAr ? 'متأخر' : 'Overdue'}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {isAr ? 'تاريخ التسليم:' : 'Due date:'} <strong className="text-slate-300">{task.dueDate}</strong>
                          </span>

                          {task.dueTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              {isAr ? 'الساعة:' : 'Time:'} <strong className="text-slate-300">{formatTime12h(task.dueTime, !isAr)}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title={isAr ? 'تعديل المهمة' : 'Edit Task'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={isAr ? 'حذف المهمة' : 'Delete Task'}
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
