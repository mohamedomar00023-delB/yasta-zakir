import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Pin, 
  Trash2, 
  Search, 
  BookOpen, 
  Check, 
  X, 
  Copy, 
  Edit3, 
  Sparkles, 
  Tag, 
  Clock, 
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyNote } from '../../types';
import { haptic } from '../../utils/haptics';

export const StudyNotesManager: React.FC = () => {
  const { notes, addNote, deleteNote, togglePinNote, lessons, settings, showToast, t } = useApp();
  const isAr = settings.language !== 'en';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [pinned, setPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pinned' | string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique subjects from existing notes and lessons
  const subjectsList = Array.from(new Set([
    ...lessons.map(l => l.subject),
    ...notes.map(n => n.subjectName).filter(Boolean)
  ])) as string[];

  const filteredNotes = notes.filter(n => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchSub = (n.subjectName || '').toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchContent) return false;
    }

    // 2. Category Filter
    if (selectedCategory === 'pinned') return n.pinned;
    if (selectedCategory !== 'all' && n.subjectName !== selectedCategory) return false;

    return true;
  }).sort((a, b) => {
    // Pinned notes first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const handleOpenCreate = () => {
    haptic.selection();
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setSubjectName('');
    setPinned(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (note: StudyNote) => {
    haptic.selection();
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSubjectName(note.subjectName || '');
    setPinned(note.pinned);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingNoteId) {
      // Delete old and re-add updated
      deleteNote(editingNoteId);
    }

    addNote({
      title: title.trim(),
      content: content.trim(),
      subjectName: subjectName || undefined,
      pinned,
    });

    haptic.success();
    showToast(isAr ? 'تم حفظ الملاحظة بنجاح 📝' : 'Study note saved 📝', 'success');

    setTitle('');
    setContent('');
    setSubjectName('');
    setPinned(false);
    setEditingNoteId(null);
    setIsFormOpen(false);
  };

  const handleCopy = (note: StudyNote) => {
    haptic.light();
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    showToast(isAr ? 'تم نسخ الملاحظة إلى الحافظة 📋' : 'Note copied to clipboard 📋', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, noteTitle: string) => {
    haptic.light();
    if (window.confirm(isAr ? `هل تريد حذف ملاحظة «${noteTitle}»؟` : `Delete note "${noteTitle}"?`)) {
      deleteNote(id);
      showToast(isAr ? 'تم حذف الملاحظة' : 'Note deleted', 'info');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div 
        className="p-5 sm:p-6 rounded-3xl border glass-card shadow-xl space-y-4 relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/60"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/25 text-xl">
              📑
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <span>{isAr ? 'النوتات والملخصات السريعة' : 'Study Notes & Cheat Sheets'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {notes.length} {isAr ? 'ملاحظة' : 'Notes'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'اكتب قوانينك وملاحظاتك المهمة وملخصات الفصول للرجوع إليها سريعاً' : 'Store formulas, chapter cheat sheets, and quick study reminders'}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة نوتة جديدة' : 'Add Note'}</span>
          </button>
        </div>

        {/* Search Input & Category Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-800/60">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في العنوان أو المحتوى...' : 'Search in notes...'}
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
          </div>

          {/* Quick Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => {
                haptic.selection();
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-[11px] ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? `الكل (${notes.length})` : `All (${notes.length})`}
            </button>

            <button
              onClick={() => {
                haptic.selection();
                setSelectedCategory('pinned');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-[11px] flex items-center gap-1 ${
                selectedCategory === 'pinned'
                  ? 'bg-amber-500/30 border border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📌</span>
              <span>{isAr ? `المثبتة (${notes.filter(n => n.pinned).length})` : `Pinned (${notes.filter(n => n.pinned).length})`}</span>
            </button>

            {subjectsList.map(sub => (
              <button
                key={sub}
                onClick={() => {
                  haptic.selection();
                  setSelectedCategory(sub);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-[11px] ${
                  selectedCategory === sub
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Notes Grid (2 columns on md, 3 columns on lg) */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 rounded-3xl text-center border border-dashed border-slate-800/80 bg-slate-900/30 my-4 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl shadow-inner">
            📑
          </div>
          <div>
            <h4 className="text-base font-black text-slate-100">
              {isAr ? 'لا توجد ملاحظات مطابقة' : 'No notes found'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              {isAr ? 'أنشئ أول ملخص دراسي، قوانين فيزياء، أو أوامر برمجية لترجع إليها في أي وقت.' : 'Create your first summary, physics formulas, or cheat sheet.'}
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shadow-purple-600/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة نوتة جديدة' : 'Add Note'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note, idx) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
                className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 group ${
                  note.pinned
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 via-purple-950/20 to-slate-900/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  
                  {/* Top Header with Pin & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-black text-slate-100 leading-tight">
                        {note.title}
                      </h4>
                      {note.pinned && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
                          <span>📌</span>
                          <span>{isAr ? 'مثبتة' : 'Pinned'}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        haptic.selection();
                        togglePinNote(note.id);
                      }}
                      className={`p-1.5 rounded-xl transition-all ${
                        note.pinned
                          ? 'text-amber-400 bg-amber-500/20'
                          : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800'
                      }`}
                      title={note.pinned ? (isAr ? 'إلغاء التثبيت' : 'Unpin') : (isAr ? 'تثبيت في الأعلى' : 'Pin to top')}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Subject Tag */}
                  {note.subjectName && (
                    <div className="mb-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold inline-flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{note.subjectName}</span>
                      </span>
                    </div>
                  )}

                  {/* Note Content */}
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 font-normal leading-relaxed whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
                    {note.content}
                  </div>

                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(note.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                      title={isAr ? 'نسخ النص' : 'Copy'}
                    >
                      {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                      title={isAr ? 'تعديل الملاحظة' : 'Edit'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title={isAr ? 'حذف الملاحظة' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Note Form Modal (Create & Edit) */}
      <AnimatePresence>
        {isFormOpen && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 text-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFormOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg transform rounded-3xl p-5 sm:p-6 text-start shadow-2xl relative border my-auto"
              style={{
                background: 'var(--panel-bg)',
                borderColor: 'var(--panel-border)',
                color: 'var(--text-color)'
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h4 className="text-base font-black flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>{editingNoteId ? (isAr ? 'تعديل الملاحظة' : 'Edit Study Note') : (isAr ? 'إضافة ملاحظة دراسية جديدة' : 'Add New Study Note')}</span>
                </h4>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'عنوان الملاحظة *' : 'Note Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={isAr ? 'مثال: قوانين تحليل الدوائر الكهربية' : 'e.g. Electric Circuit Formulas'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'المادة المرتبطة (اختياري)' : 'Related Subject'}
                  </label>
                  <select
                    value={subjectName}
                    onChange={e => setSubjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">{isAr ? 'بدون ربط بمادة خاصة' : 'General / None'}</option>
                    {subjectsList.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'محتوى الملاحظة والملخص *' : 'Note Content *'}
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={isAr ? 'اكتب القوانين، الأوامر، الملاحظات، أو النقاط المحورية...' : 'Write formulas, bullet points, or notes...'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modalPinned"
                    checked={pinned}
                    onChange={e => setPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="modalPinned" className="text-xs text-slate-300 cursor-pointer font-bold flex items-center gap-1">
                    <span>📌</span>
                    <span>{isAr ? 'تثبيت الملاحظة في أعلى القائمة' : 'Pin note to top'}</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-md shadow-purple-600/30"
                  >
                    {editingNoteId ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة الملاحظة' : 'Save Note')}
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
