import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Check, 
  Clock, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Calendar,
  Sparkles,
  CheckCircle2,
  Tag,
  Flame,
  ListTodo
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentTask, TaskPriority } from '../../types';
import { getTodayDateString, formatTime12h, timeToMinutes } from '../../utils/formatters';
import { haptic } from '../../utils/haptics';

export const TaskManager: React.FC = () => {
  const {
    tasks,
    toggleTaskCompletion,
    deleteTask,
    setEditingTask,
    setIsTaskModalOpen,
    addXP,
    triggerCelebration,
    showToast,
    settings,
    t,
  } = useApp();

  const isAr = settings.language !== 'en';
  const [filter, setFilter] = useState<'all' | 'today' | 'high' | 'completed'>('all');
  const todayStr = getTodayDateString();

  const now = new Date();
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'high') return task.priority === 'high';
    if (filter === 'today') return task.dueDate === todayStr;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleCreate = () => {
    haptic.selection();
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEdit = (task: StudentTask) => {
    haptic.selection();
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleToggleTask = (task: StudentTask) => {
    haptic.medium();
    const wasCompleted = task.completed;
    toggleTaskCompletion(task.id);
    if (!wasCompleted) {
      addXP(15, isAr ? 'إنجاز واجب دراسي' : 'Homework Task Completed');
      triggerCelebration();
      showToast(isAr ? `عاش يا بطل! أنجزت «${task.title}» (+15 XP) 🎉` : `Task completed (+15 XP) 🎉`, 'success');
    }
  };

  const handleDelete = (task: StudentTask) => {
    haptic.light();
    if (window.confirm(isAr ? `هل تريد حذف واجب «${task.title}»؟` : `Delete task "${task.title}"?`)) {
      deleteTask(task.id);
      showToast(isAr ? 'تم حذف الواجب' : 'Task deleted', 'info');
    }
  };

  const priorityBadges: Record<TaskPriority, { label: string; class: string }> = {
    high: { label: isAr ? 'أولوية قصوى 🔥' : 'High Priority', class: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    medium: { label: isAr ? 'أولوية متوسطة ⚡' : 'Medium Priority', class: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    low: { label: isAr ? 'أولوية عادية 📌' : 'Low Priority', class: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  };

  const getDueStatus = (task: StudentTask) => {
    if (task.completed) return null;
    if (!task.dueDate) return null;

    if (task.dueDate < todayStr) {
      return { label: isAr ? '⚠️ متأخر' : 'Overdue', class: 'text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20' };
    }

    if (task.dueDate === todayStr) {
      if (task.dueTime) {
        const dueMins = timeToMinutes(task.dueTime);
        const diff = dueMins - currentTotalMins;
        if (diff < 0) {
          return { label: isAr ? '⚠️ فات موعده اليوم' : 'Overdue Today', class: 'text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20' };
        }
        if (diff <= 60) {
          return { label: isAr ? `🔥 فاضل ${diff} دقيقة` : `${diff}m left`, class: 'text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20' };
        }
      }
      return { label: isAr ? '⏳ تسليم اليوم' : 'Due Today', class: 'text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20' };
    }

    return null;
  };

  return (
    <div 
      className="p-5 sm:p-6 rounded-3xl border glass-card shadow-xl space-y-4 relative overflow-hidden"
      style={{ borderColor: 'var(--card-border)' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/25">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
              <span>{isAr ? 'الواجبات والمهام الدراسية' : 'Tasks & Homework'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30">
                {totalTasksCount} {isAr ? 'مهام' : 'Tasks'}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {isAr ? 'تتبع الواجبات ومواعيد تسليمها بكل سهولة' : 'Track homework assignments and due dates'}
            </p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة واجب جديد' : 'Add Task'}</span>
        </button>
      </div>

      {/* Progress summary bar */}
      {totalTasksCount > 0 && (
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${progressPercent === 100 ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="font-bold text-slate-300">
              {isAr ? `إنجاز المهام: ${completedTasksCount} من ${totalTasksCount}` : `Progress: ${completedTasksCount} of ${totalTasksCount}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-20 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-black text-rose-300">{progressPercent}%</span>
          </div>
        </div>
      )}

      {/* Filter Tabs (Responsive Scroll/Wrap) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
        {[
          { id: 'all', label: isAr ? `جميع المهام (${tasks.length})` : `All (${tasks.length})` },
          { id: 'today', label: isAr ? `تسليم اليوم (${tasks.filter(t => t.dueDate === todayStr).length})` : `Today (${tasks.filter(t => t.dueDate === todayStr).length})` },
          { id: 'high', label: isAr ? `قصوى الأولوية (${tasks.filter(t => t.priority === 'high').length})` : `High (${tasks.filter(t => t.priority === 'high').length})` },
          { id: 'completed', label: isAr ? `المكتملة (${tasks.filter(t => t.completed).length})` : `Done (${tasks.filter(t => t.completed).length})` },
        ].map(tab => {
          const isSelected = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                haptic.selection();
                setFilter(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-[11px] ${
                isSelected
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-sm'
                  : 'bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 rounded-3xl text-center border border-dashed border-slate-800/80 bg-slate-900/30 my-2 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-2xl">
            📝
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-200">
              {isAr ? 'لا توجد واجبات في هذا التصنيف' : 'No tasks in this category'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'أضف واجباتك ومشاريعك لتنظيم مواعيد التسليم وتجنب التأخير.' : 'Add your assignments to track deadlines easily.'}
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة واجب جديد' : 'Add Task'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filteredTasks.map((task, idx) => {
              const priorityObj = priorityBadges[task.priority];
              const dueStatus = getDueStatus(task);

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    task.completed
                      ? 'opacity-65 bg-slate-950/40 border-slate-800'
                      : dueStatus?.label.includes('متأخر')
                        ? 'border-rose-500/50 bg-rose-950/20 shadow-md shadow-rose-950/30'
                        : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Checkbox & Task details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                          task.completed
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 hover:text-slate-200 border border-slate-700 active:scale-95'
                        }`}
                        title={task.completed ? (isAr ? 'إلغاء التحديد' : 'Mark Incomplete') : (isAr ? 'تحديد كمكتمل' : 'Mark Complete')}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {task.title}
                          </h4>

                          {/* Priority Pill */}
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${priorityObj.class}`}>
                            {priorityObj.label}
                          </span>

                          {/* Subject Pill */}
                          {task.subjectName && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />
                              <span>{task.subjectName}</span>
                            </span>
                          )}

                          {/* Due Status Pill */}
                          {dueStatus && (
                            <span className={`text-[10px] ${dueStatus.class}`}>
                              {dueStatus.label}
                            </span>
                          )}
                        </div>

                        {/* Description snippet */}
                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Due Date & Time */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-indigo-400" />
                              <span>{task.dueDate}</span>
                            </span>
                          )}
                          {task.dueTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{formatTime12h(task.dueTime)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title={isAr ? 'تعديل الواجب' : 'Edit Task'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={isAr ? 'حذف الواجب' : 'Delete Task'}
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
