import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  Flame, 
  Zap, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  HeartHandshake 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StudentStoryShareModal: React.FC = () => {
  const { isStudentStoryModalOpen, setIsStudentStoryModalOpen, profile, tasks, lessons, prayersCompleted, settings, showToast } = useApp();

  const isAr = settings.language !== 'en';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspectRatio, setAspectRatio] = useState<'story' | 'square'>('story');
  const [isExporting, setIsExporting] = useState(false);

  if (!isStudentStoryModalOpen) return null;

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const streak = profile.streakDays || 1;
  const xp = profile.xpPoints || 0;
  const prayersCount = Object.values(prayersCompleted).filter(Boolean).length;

  const handleDownloadStoryImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsExporting(true);

    const width = aspectRatio === 'story' ? 1080 : 1080;
    const height = aspectRatio === 'story' ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw luxury gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#030712');
    bgGradient.addColorStop(0.5, '#1e1b4b');
    bgGradient.addColorStop(1, '#022c22');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw glow circles
    ctx.save();
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.15, 300, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.filter = 'blur(100px)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.85, 350, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.filter = 'blur(120px)';
    ctx.fill();
    ctx.restore();

    // 3. App Title Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('🎓 يسطا ذاكر • YASTA ZAKIR', width / 2, aspectRatio === 'story' ? 160 : 120);

    // 4. Student Card Panel
    const cardX = 80;
    const cardY = aspectRatio === 'story' ? 240 : 180;
    const cardW = width - 160;
    const cardH = aspectRatio === 'story' ? 1400 : 780;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.roundRect(cardX, cardY, cardW, cardH, 40);
    ctx.fill();
    ctx.stroke();

    // 5. Avatar Emoji & Student Name
    ctx.font = '90px sans-serif';
    ctx.fillText(profile.avatarValue || '🎓', width / 2, cardY + (aspectRatio === 'story' ? 180 : 130));

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(profile.name || 'طالب متميز', width / 2, cardY + (aspectRatio === 'story' ? 280 : 210));

    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${profile.gradeLevel || 'طالب متفوق'} • ${profile.schoolOrUniversity || 'يسطا ذاكر'}`, width / 2, cardY + (aspectRatio === 'story' ? 350 : 270));

    // 6. Stats Grid
    const statBoxW = (cardW - 80) / 2;
    const statBoxH = aspectRatio === 'story' ? 220 : 180;
    const startStatsY = cardY + (aspectRatio === 'story' ? 440 : 330);

    const stats = [
      { label: isAr ? 'نقاط الخبرة XP' : 'Total XP', value: `${xp} XP`, color: '#c084fc', icon: '⚡' },
      { label: isAr ? 'أيام الاستمرارية' : 'Streak Days', value: `${streak} يوم 🔥`, color: '#fb7185', icon: '🔥' },
      { label: isAr ? 'المهام المنجزة' : 'Tasks Done', value: `${completedTasksCount} مهمة`, color: '#38bdf8', icon: '🎯' },
      { label: isAr ? 'الصلوات المؤداة' : 'Prayers Logged', value: `${prayersCount} صلاة`, color: '#34d399', icon: '🕌' },
    ];

    stats.forEach((st, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = cardX + 30 + col * (statBoxW + 20);
      const by = startStatsY + row * (statBoxH + 20);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.roundRect(bx, by, statBoxW, statBoxH, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = st.color;
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText(st.value, bx + statBoxW / 2, by + (statBoxH * 0.48));

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(st.label, bx + statBoxW / 2, by + (statBoxH * 0.8));
    });

    // 7. Motivational Quote at bottom
    if (aspectRatio === 'story') {
      const quoteY = startStatsY + 540;
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('✨ حكمة اليوم الدراسية ✨', width / 2, quoteY);

      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'italic 32px sans-serif';
      ctx.fillText('"السر في الاستمرارية كل يوم.. حتى لو ساعة واحدة!" 🚀', width / 2, quoteY + 80);
    }

    // 8. Footer URL
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('yasta-zakir.app • رفيق المذاكرة ومواقيت الصلاة', width / 2, height - (aspectRatio === 'story' ? 80 : 50));

    // Export to download
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `yasta_zakir_story_${profile.name || 'student'}.png`;
      link.href = dataUrl;
      link.click();
      setIsExporting(false);
      showToast(isAr ? 'تم تصدير بطاقة الستوري بنجاح! 📸🎉' : 'Story Card Exported! 📸🎉', 'success');
    }, 400);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsStudentStoryModalOpen(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg transform rounded-3xl p-5 sm:p-7 shadow-2xl relative border my-auto max-h-[90vh] flex flex-col overflow-hidden text-start"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-color)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsStudentStoryModalOpen(false)}
            className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'} p-2 rounded-full hover:bg-slate-700/40 transition-colors z-20`}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-600 to-indigo-600 text-white shadow-xl shadow-pink-500/20 flex items-center justify-center shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">{isAr ? 'بطاقة الستوري والإنجاز للمشاركة 📸' : 'Share Student Story Card 📸'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{isAr ? 'تصدير صورة فاخرة بإنجازاتك لمشاركتها على واتساب وإنستجرام' : 'Export a story card for WhatsApp & Instagram'}</p>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setAspectRatio('story')}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                aspectRatio === 'story'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}
            >
              <span>📱 {isAr ? 'ستوري رأسي (9:16)' : 'Story Format (9:16)'}</span>
            </button>

            <button
              onClick={() => setAspectRatio('square')}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                aspectRatio === 'square'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}
            >
              <span>🖼️ {isAr ? 'مربع للمنشورات (1:1)' : 'Square (1:1)'}</span>
            </button>
          </div>

          {/* Live Preview Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/60 to-emerald-950/60 border border-indigo-500/30 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-indigo-500/40 flex items-center justify-center text-3xl mx-auto shadow-md">
              {profile.avatarValue || '🎓'}
            </div>

            <div>
              <h4 className="text-lg font-black text-white">{profile.name || (isAr ? 'طالب متميز' : 'Student')}</h4>
              <p className="text-xs text-indigo-300 font-semibold">{profile.gradeLevel || 'يسطا ذاكر 🎓'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-xs text-purple-400 font-bold block">{xp} XP</span>
                <span className="text-[10px] text-slate-400">{isAr ? 'نقاط الخبرة' : 'XP Points'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-xs text-rose-400 font-bold block">{streak} {isAr ? 'أيام 🔥' : 'Days'}</span>
                <span className="text-[10px] text-slate-400">{isAr ? 'تتابع المذاكرة' : 'Study Streak'}</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-300 italic">
              "السر مش في المذاكرة 10 ساعات في يوم واحد.. السر في الاستمرارية كل يوم!" 🚀
            </p>
          </div>

          {/* Hidden Canvas for High-Resolution Export */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Export button */}
          <div className="pt-4 mt-auto">
            <button
              onClick={handleDownloadStoryImage}
              disabled={isExporting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-pink-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isAr ? 'جاري رسم وتحميل الصورة عالي الجودة...' : 'Generating HD Image...'}</span>
                </div>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تنزيل بطاقة الستوري كصورة PNG 📥' : 'Download Story Card (PNG) 📥'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
