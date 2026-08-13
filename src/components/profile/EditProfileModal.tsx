import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Upload,
  User,
  Phone,
  GraduationCap,
  Target,
  Building2,
  Award,
  Quote,
  Flame,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACADEMIC_STAGES, PRESET_AVATARS } from '../../utils/presets';
import { AvatarType } from '../../types';

export const EditProfileModal: React.FC = () => {
  const { profile, updateProfile, isEditProfileOpen, setIsEditProfileOpen, settings, setLanguage, showToast } = useApp();

  const isAr = settings.language !== 'en';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dreamGoal, setDreamGoal] = useState('');
  const [schoolOrUniversity, setSchoolOrUniversity] = useState('');
  const [targetGPA, setTargetGPA] = useState('امتياز (A+)');
  const [bio, setBio] = useState('');
  const [academicStage, setAcademicStage] = useState('college');
  const [gradeLevel, setGradeLevel] = useState('');
  const [avatarType, setAvatarType] = useState<AvatarType>('emoji');
  const [avatarValue, setAvatarValue] = useState('🎓');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setDreamGoal(profile.dreamGoal || '');
      setSchoolOrUniversity(profile.schoolOrUniversity || '');
      setTargetGPA(profile.targetGPA || (isAr ? 'امتياز (A+)' : 'High Honors (A+)'));
      setBio(profile.bio || '');
      setAcademicStage(profile.academicStage || 'college');
      setGradeLevel(profile.gradeLevel || '');
      setAvatarType(profile.avatarType || 'emoji');
      setAvatarValue(profile.avatarValue || '🎓');
    }
  }, [profile, isEditProfileOpen, isAr]);

  if (!isEditProfileOpen) return null;

  const currentStageObj = ACADEMIC_STAGES.find(s => s.id === academicStage) || ACADEMIC_STAGES[0];
  const stageGrades = isAr ? (currentStageObj.gradesAr || currentStageObj.grades) : (currentStageObj.gradesEn || currentStageObj.grades);

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
            showToast(isAr ? 'تم تحميل صورتك الشخصية بنجاح! 📸' : 'Profile photo uploaded! 📸', 'success');
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || (isAr ? 'طالب متميز' : 'Student'),
      phone: phone.trim(),
      dreamGoal: dreamGoal.trim(),
      schoolOrUniversity: schoolOrUniversity.trim(),
      targetGPA,
      bio: bio.trim(),
      academicStage,
      gradeLevel: gradeLevel || stageGrades[0],
      avatarType,
      avatarValue,
    });
    setIsEditProfileOpen(false);
    showToast(isAr ? 'تم حفظ بطاقة الطالب والبيانات بنجاح 🎓' : 'Profile updated successfully 🎓', 'success');
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsEditProfileOpen(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl transform rounded-3xl border shadow-2xl relative my-auto overflow-hidden max-h-[90vh] flex flex-col text-start"
          style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
        >
          {/* Header with Language Switcher */}
          <div className="p-4 sm:p-6 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black truncate" style={{ color: 'var(--text-color)' }}>
                  {isAr ? 'بطاقة الطالب والملف الشخصي 🎓' : 'Student Profile Card 🎓'}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {isAr ? 'تعديل الاسم والمرحلة الدراسية واللغة' : 'Customize name, academic stage & language'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Instant Language Toggle Button */}
              <button
                type="button"
                onClick={() => setLanguage(isAr ? 'en' : 'ar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all hover:scale-105"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-color)',
                }}
                title={isAr ? 'Switch to English' : 'التحويل للغة العربية'}
              >
                <span className="text-sm">{isAr ? '🇬🇧' : '🇪🇬'}</span>
                <span className="text-amber-400">{isAr ? 'English' : 'عربي'}</span>
              </button>

              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

            {/* Live Profile Card Preview */}
            <div className="p-4 sm:p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">

                {/* Avatar with Glow Ring */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 flex-shrink-0">
                  <div className="w-full h-full rounded-[14px] sm:rounded-[22px] flex items-center justify-center overflow-hidden bg-slate-900">
                    {avatarType === 'upload' && avatarValue ? (
                      <img src={avatarValue} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl sm:text-4xl">{avatarValue || '🎓'}</span>
                    )}
                  </div>
                </div>

                {/* Info summary */}
                <div className="text-center sm:text-start flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h4 className="text-lg sm:text-xl font-black text-white truncate">{name || (isAr ? 'اسم الطالب' : 'Student Name')}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {gradeLevel || stageGrades[0]}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-300 font-semibold mb-2">
                    {isAr ? currentStageObj.titleAr : currentStageObj.titleEn} {schoolOrUniversity ? `• ${schoolOrUniversity}` : ''}
                  </p>

                  {bio && (
                    <p className="text-xs text-slate-300 italic bg-slate-900/50 p-2 rounded-xl border border-slate-700/40 flex items-center gap-1.5 justify-center sm:justify-start">
                      <Quote className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">"{bio}"</span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-[11px] font-bold text-slate-300 mt-2">
                    <span className="flex items-center gap-1 text-purple-400">
                      <Zap className="w-3.5 h-3.5 fill-purple-400" />
                      <span>{profile.xpPoints || 0} XP</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <Flame className="w-3.5 h-3.5 fill-rose-400" />
                      <span>{profile.streakDays || 1} {isAr ? 'أيام تتابع 🔥' : 'Streak Days'}</span>
                    </span>
                    {targetGPA && (
                      <span className="flex items-center gap-1 text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                        <Award className="w-3.5 h-3.5" />
                        <span>{targetGPA}</span>
                      </span>
                    )}
                    {dreamGoal && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Target className="w-3.5 h-3.5" />
                        <span>{dreamGoal}</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">

              {/* Row 1: Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAr ? 'اسم الطالب بالكامل *' : 'Full Student Name *'}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onFocus={e => e.target.select()}
                      onChange={e => setName(e.target.value)}
                      placeholder={isAr ? 'اكتب اسمك هنا (مثال: محمد)' : 'Enter your name (e.g. Mohamed)'}
                      className="w-full px-4 py-2.5 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 border"
                      style={{ background: 'var(--input-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onFocus={e => e.target.select()}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none border"
                    style={{ background: 'var(--input-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                  />
                </div>
              </div>

              {/* Row 2: School/University & Dream Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAr ? 'المدرسة / المعهد / الجامعة' : 'School / College / University'}</span>
                  </label>
                  <input
                    type="text"
                    value={schoolOrUniversity}
                    onFocus={e => e.target.select()}
                    onChange={e => setSchoolOrUniversity(e.target.value)}
                    placeholder={isAr ? 'مثال: جامعة القاهرة، كلية الهندسة...' : 'e.g. Cairo University...'}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 border"
                    style={{ background: 'var(--input-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'الهدف الأسمى / الكلية المنشودة' : 'Dream Goal / Target'}</span>
                  </label>
                  <input
                    type="text"
                    value={dreamGoal}
                    onFocus={e => e.target.select()}
                    onChange={e => setDreamGoal(e.target.value)}
                    placeholder={isAr ? 'مثال: الترتيب على الدفعة، كلية الهندسة...' : 'e.g. Top 1% in Class...'}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 border"
                    style={{ background: 'var(--input-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                  />
                </div>
              </div>

              {/* Row 3: Supercharged Target GPA & Motto */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'التقدير / المعدل المستهدف' : 'Target GPA / Score'}</span>
                  </label>
                  <span className="text-[11px] text-amber-400 font-bold">{targetGPA}</span>
                </div>

                {/* Custom input */}
                <input
                  type="text"
                  value={targetGPA}
                  onFocus={e => e.target.select()}
                  onChange={e => setTargetGPA(e.target.value)}
                  placeholder={isAr ? 'اكتب تقديرك أو اختر من النماذج أدناه (مثال: GPA 3.9 أو 97.5%)' : 'Type custom GPA or select presets below (e.g. GPA 3.9 or 98%)'}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 border mb-2"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                />

                {/* Quick Presets Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    isAr ? '💎 امتياز مع مرتبة الشرف (A+)' : '💎 Summa Cum Laude (A+)',
                    isAr ? '🌟 امتياز (GPA 3.8 - 4.0)' : '🌟 High Honors (GPA 3.8+)',
                    isAr ? '⚡ جيد جداً مرتفع (GPA 3.4+)' : '⚡ Honors (GPA 3.4+)',
                    isAr ? '👑 98% - 100% (أوائل جمهورية)' : '👑 98%+ Top Ranked',
                    isAr ? '🎯 95% فأعلى (كليات القمة)' : '🎯 95%+ Elite Target',
                    isAr ? '🥇 90% فأعلى (تفوق عالي)' : '🥇 90%+ Honors',
                    isAr ? '✨ الترتيب على الدفعة (Top 10)' : '✨ Top 10 in Class',
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetGPA(preset)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${targetGPA === preset
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black'
                          : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
                        }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motto / Quote */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isAr ? 'حكمتك المفضلة / شعارك الدراسي' : 'Student Motto / Quote'}</span>
                </label>
                <input
                  type="text"
                  value={bio}
                  onFocus={e => e.target.select()}
                  onChange={e => setBio(e.target.value)}
                  placeholder={isAr ? 'مثال: بالجد والاجتهاد نصل إلى القمة...' : 'e.g. Focus on progress, not perfection...'}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 border"
                  style={{ background: 'var(--input-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                />
              </div>

              {/* Academic Stage Picker */}
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-300">
                  {isAr ? 'المرحلة الدراسية *' : 'Academic Stage *'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACADEMIC_STAGES.map(stage => {
                    const selected = academicStage === stage.id;
                    const stageTitle = isAr ? stage.titleAr : stage.titleEn;
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => {
                          setAcademicStage(stage.id);
                          const curGrades = isAr ? (stage.gradesAr || stage.grades) : (stage.gradesEn || stage.grades);
                          setGradeLevel(curGrades[0]);
                        }}
                        className={`p-2.5 rounded-2xl border text-start text-xs font-bold transition-all ${selected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        style={!selected ? { background: 'var(--card-bg)' } : {}}
                      >
                        {stageTitle}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grade Level Pills */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-300">
                  {isAr ? 'الصف / السنة الدراسية *' : 'Grade / Year *'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {stageGrades.map(grade => {
                    const isSelected = gradeLevel === grade;
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setGradeLevel(grade)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isSelected
                            ? 'bg-emerald-600 text-white shadow-md scale-105'
                            : 'border text-slate-300'
                          }`}
                        style={!isSelected ? { background: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
                      >
                        {isSelected && '✓ '}{grade}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar & Photo Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    {isAr ? 'الصورة الشخصية أو الأفاتار التعبيري' : 'Profile Picture or Avatar'}
                  </label>
                  {avatarType === 'upload' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarType('emoji');
                        setAvatarValue('🎓');
                      }}
                      className="text-[11px] text-rose-400 hover:underline font-bold"
                    >
                      {isAr ? '🗑️ حذف الصورة واستخدام رمز تعبيري' : 'Reset to emoji avatar'}
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                <div className="mb-3">
                  <label className="cursor-pointer flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white transition-all text-xs font-bold shadow-sm">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>{avatarType === 'upload' ? (isAr ? '📸 تغيير صورتك الشخصية (اختر صورة جديدة)' : 'Change Photo') : (isAr ? '📸 اضغط هنا لاختيار أو التقاط صورة شخصية لك' : 'Upload your photo')}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 font-bold mb-2">
                  {isAr ? 'أو اختر رمزاً تعبيرياً يعبر عنك:' : 'Or choose a preset avatar:'}
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {PRESET_AVATARS.map(avatar => {
                    const avatarTitle = isAr ? avatar.titleAr : avatar.titleEn;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => {
                          setAvatarType('emoji');
                          setAvatarValue(avatar.emoji);
                        }}
                        className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${avatarType === 'emoji' && avatarValue === avatar.emoji
                            ? 'border-indigo-500 bg-indigo-500/30 text-white scale-110 shadow-lg'
                            : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600'
                          }`}
                      >
                        <span className="text-2xl">{avatar.emoji}</span>
                        <span className="text-[9px] mt-0.5 opacity-80">{avatarTitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-700/40 text-slate-400"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'حفظ بطاقة الطالب' : 'Save Profile'}</span>
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
