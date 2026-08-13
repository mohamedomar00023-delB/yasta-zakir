import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Calendar 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ScheduleShareCard: React.FC = () => {
  const { isShareModalOpen, setIsShareModalOpen, lessons, profile, settings, t, showToast } = useApp();
  const isAr = settings.language !== 'en';
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isShareModalOpen) return null;

  const arDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNames = isAr ? arDays : enDays;

  // Copy textual schedule
  const handleCopyText = () => {
    let text = isAr 
      ? `📅 جدول المذاكرة والدروس الأسبوعي - ${profile.name || 'طالب متميز'}\nيسطا ذاكر 🎓 | Yasta Zakir\n\n`
      : `📅 Weekly Class Schedule - ${profile.name || 'Student'}\nYasta Zakir 🎓\n\n`;

    dayNames.forEach((dayName, dayIdx) => {
      const dayLessons = lessons.filter(l => l.days.includes(dayIdx));
      if (dayLessons.length > 0) {
        text += `🔹 ${dayName}:\n`;
        dayLessons.forEach(l => {
          text += `  • ${l.subject} (${l.startTime}) - ${l.teacher}\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(t('copiedSuccess'), 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  // Export as image via HTML Canvas rendering
  const handleDownloadImage = () => {
    if (!cardRef.current) return;

    const svgWidth = 800;
    const svgHeight = 600;
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth;
    canvas.height = svgHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, svgWidth, svgHeight);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e1b4b');
    gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, svgWidth, svgHeight);

    // Decorative Borders
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, svgWidth - 40, svgHeight - 40);

    // Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Tajawal, sans-serif';
    ctx.textAlign = isAr ? 'right' : 'left';
    const headerX = isAr ? svgWidth - 50 : 50;
    ctx.fillText(isAr ? `📚 جدول دروس: ${profile.name || 'طالب يسطا ذاكر'}` : `📚 Class Timetable: ${profile.name || 'Student'}`, headerX, 70);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Tajawal, sans-serif';
    ctx.fillText(isAr ? 'تطبيق يسطا ذاكر | تنظيم الدروس والصلوات 🕌' : 'Yasta Zakir | Student Planner & Prayer Routine 🕌', headerX, 105);

    // Draw lines for each day
    let startY = 150;
    dayNames.forEach((dayName, dayIdx) => {
      const dayLessons = lessons.filter(l => l.days.includes(dayIdx));
      if (dayLessons.length > 0 && startY < svgHeight - 80) {
        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 18px Tajawal, sans-serif';
        ctx.fillText(`📅 ${dayName}`, headerX, startY);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '15px Tajawal, sans-serif';
        const summary = dayLessons.map(l => `${l.subject} (${l.startTime})`).join('  |  ');
        const detailX = isAr ? svgWidth - 160 : 160;
        ctx.fillText(summary, detailX, startY);

        startY += 45;
      }
    });

    // Footer Watermark
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 13px Tajawal, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Exported via Yasta Zakir 🎓 - yasta-zakir.app', svgWidth / 2, svgHeight - 35);

    // Download trigger
    const imageURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `schedule_${profile.name || 'yasta_zakir'}.png`;
    link.href = imageURL;
    link.click();
    showToast(isAr ? 'تم تحميل صورة الجدول بنجاح! 📸' : 'Schedule image downloaded! 📸', 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative border"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-color)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsShareModalOpen(false)}
            className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'} p-2 rounded-full hover:bg-slate-700/40 transition-colors`}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">{t('shareScheduleTitle')}</h2>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--subtext-color)' }}>
                {t('shareScheduleSubtitle')}
              </p>
            </div>
          </div>

          {/* Schedule Preview Card */}
          <div
            ref={cardRef}
            className="p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/60 shadow-2xl mb-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-400">{isAr ? 'الجدول الدراسي الأسبوعي' : 'Weekly Timetable'}</span>
                <h3 className="text-lg font-black text-white">{profile.name || (isAr ? 'طالب متميز' : 'Student')} 🎓</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'يسطا ذاكر' : 'Yasta Zakir'}</span>
              </span>
            </div>

            {/* Days list preview */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {dayNames.map((dayName, dayIdx) => {
                const dayLessons = lessons.filter(l => l.days.includes(dayIdx));
                if (dayLessons.length === 0) return null;

                return (
                  <div key={dayIdx} className="p-3 rounded-2xl bg-slate-900/50 border border-slate-700/40 flex items-center justify-between gap-3 text-xs">
                    <span className="font-black text-indigo-300 min-w-[70px] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{dayName}</span>
                    </span>

                    <div className="flex-1 flex flex-wrap gap-2 justify-end">
                      {dayLessons.map(l => (
                        <span key={l.id} className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-medium flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-emerald-400" />
                          <span>{l.subject}</span>
                          <span className="text-[10px] text-slate-400">({l.startTime})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadImage}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>{t('downloadImage')}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-5 py-3 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isAr ? 'تم النسخ بنجاح!' : 'Copied!') : t('copyShareLink')}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
