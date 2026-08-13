import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Pin, Trash2, Search, BookOpen, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StudyNotesManager: React.FC = () => {
  const { notes, addNote, deleteNote, togglePinNote, lessons, settings, t } = useApp();
  const isAr = settings.language !== 'en';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [pinned, setPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.subjectName && n.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addNote({
      title: title.trim(),
      content: content.trim(),
      subjectName: subjectName || undefined,
      pinned,
    });

    setTitle('');
    setContent('');
    setSubjectName('');
    setPinned(false);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-100 light:text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>{t('notesTitle')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('notesSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addNote')}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={isAr ? 'ابحث في عنوان أو محتوى الملاحظات...' : 'Search in notes title or content...'}
          className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
      </div>

      {/* Note Form Modal */}
      {isFormOpen && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-700/60 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'إضافة ملاحظة دراسية جديدة' : 'Add New Study Note'}</span>
                </h4>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'عنوان الملاحظة *' : 'Note Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={isAr ? 'مثال: ملخص القانون الأول' : 'e.g. Chapter 1 Summary'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'المادة المرتبطة (اختياري)' : 'Related Class (Optional)'}
                  </label>
                  <select
                    value={subjectName}
                    onChange={e => setSubjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{isAr ? 'بدون ربط بمادة خاصة' : 'None / General'}</option>
                    {lessons.map(l => (
                      <option key={l.id} value={l.subject}>
                        {l.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'نص الملاحظة' : 'Note Content'}
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={isAr ? 'اكتب التلخيص أو الأفكار الرئيسية هنا...' : 'Type summary or key formulas here...'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinnedNote"
                    checked={pinned}
                    onChange={e => setPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                  />
                  <label htmlFor="pinnedNote" className="text-xs text-slate-300 cursor-pointer">
                    {isAr ? 'تثبيت الملاحظة في الأعلى 📌' : 'Pin note to top 📌'}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isAr ? 'حفظ الملاحظة' : 'Save Note'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-card p-8 rounded-3xl text-center border border-dashed border-slate-800 my-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <FileText className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-200">{t('noNotes')}</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`glass-card p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                note.pinned
                  ? 'border-indigo-500/50 bg-indigo-950/20 ring-1 ring-indigo-500/30'
                  : 'border-slate-800/80 bg-slate-900/40'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">
                    {note.title}
                  </h4>
                  
                  <button
                    onClick={() => togglePinNote(note.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      note.pinned ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={note.pinned ? (isAr ? 'إلغاء التثبيت' : 'Unpin') : (isAr ? 'تثبيت بالقمة' : 'Pin')}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                {note.subjectName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 text-[10px] font-bold">
                    <BookOpen className="w-3 h-3" />
                    {note.subjectName}
                  </span>
                )}

                {note.content && (
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                    {note.content}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                <span>{new Date(note.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title={isAr ? 'حذف الملاحظة' : 'Delete note'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
