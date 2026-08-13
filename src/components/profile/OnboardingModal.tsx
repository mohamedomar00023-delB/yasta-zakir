import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Upload, User, Phone, BookPlus, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRESET_AVATARS } from '../../utils/presets';
import { AvatarType } from '../../types';
import { haptic } from '../../utils/haptics';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, updateProfile, setLessons, setIsAppTourOpen } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [startMode, setStartMode] = useState<'demo' | 'empty'>('demo');
  const [avatarType, setAvatarType] = useState<AvatarType>('emoji');
  const [avatarValue, setAvatarValue] = useState('🎓');
  const [showTourAfter, setShowTourAfter] = useState(true);

  if (!isOnboardingOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            h = (h / w) * maxDim;
            w = maxDim;
          } else {
            w = (w / h) * maxDim;
            h = maxDim;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setAvatarType('upload');
            setAvatarValue(compressed);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.celebration();
    updateProfile({
      name: name.trim() || 'طالب متميز',
      phone: phone.trim(),
      avatarType,
      avatarValue,
      onboarded: true,
    });

    if (startMode === 'empty') {
      setLessons([]);
    }

    setIsOnboardingOpen(false);

    if (showTourAfter) {
      setTimeout(() => {
        setIsAppTourOpen(true);
      }, 400);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg rounded-3xl border shadow-2xl relative overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
        >
          {/* Decorative glowing gradient backdrop */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30">
              🎓
            </div>
            <h2 className="text-2xl font-black flex items-center justify-center gap-2" style={{ color: 'var(--text-color)' }}>
              أهلاً بك في يسطا ذاكر! <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--subtext-color)' }}>
              منظم يوميات الطالب — دروسك، مواقيت صلاتك، وواجباتك في مكان واحد.
            </p>
          </div>

          <form onSubmit={handleComplete} className="space-y-4">
            {/* Input Name */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-color)' }}>
                اسم الطالب *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onFocus={e => e.target.select()}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: محمد إسماعيل"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Input Phone Number */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-color)' }}>
                رقم الموبايل (اختياري) 📱
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onFocus={e => e.target.select()}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dir-ltr text-right"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}
                />
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Start Mode Selection */}
            <div>
              <label className="block text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-color)' }}>
                <BookPlus className="w-4 h-4 text-indigo-400" />
                طريقة بدء جدول الدروس
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStartMode('demo')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all ${
                    startMode === 'demo'
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <p>✨ جدول تجريبي جاهز</p>
                  <span className="text-[10px] font-normal opacity-80">يحتوي على مواد للتجربة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStartMode('empty')}
                  className={`p-3 rounded-xl border text-xs font-bold text-right transition-all ${
                    startMode === 'empty'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <p>📝 جدول فارغ جديد</p>
                  <span className="text-[10px] font-normal opacity-80">لإضافة موادك وحصصك بنفسك</span>
                </button>
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                اختر الأفاتار التعبيري
              </label>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PRESET_AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      setAvatarType('emoji');
                      setAvatarValue(avatar.emoji);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      avatarType === 'emoji' && avatarValue === avatar.emoji
                        ? 'border-indigo-500 bg-indigo-500/15 text-white scale-105'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <span className="text-2xl mb-0.5">{avatar.emoji}</span>
                    <span className="text-[10px] font-medium opacity-80">{avatar.title}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed hover:border-indigo-500 text-xs transition-colors"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', color: 'var(--text-color)' }}>
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>رفع صورة شخصية</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* App Tour Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 cursor-pointer text-xs font-bold text-indigo-300 hover:bg-indigo-500/15 transition-all">
              <input
                type="checkbox"
                checked={showTourAfter}
                onChange={(e) => setShowTourAfter(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>بدء جولة سريعة وشرح مميزات التطبيق بعد الدخول (موصى به ✨)</span>
            </label>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              <span>دخول يسطا ذاكر 🚀</span>
              <Check className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
