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
  Zap,
  Sparkles,
  Camera,
  Share2,
  Layers,
  BookOpen,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ACADEMIC_STAGES, PRESET_AVATARS } from '../../utils/presets';
import { AvatarType } from '../../types';
import { haptic } from '../../utils/haptics';

export const EditProfileModal: React.FC = () => {
  const { profile, updateProfile, isEditProfileOpen, setIsEditProfileOpen, settings, setLanguage, showToast, triggerCelebration } = useApp();

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
            haptic.success();
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
    haptic.celebration();
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
    triggerCelebration();
    showToast(isAr ? 'تم حفظ بطاقة الطالب والبيانات بنجاح 🎓' : 'Profile updated successfully 🎓', 'success');
  };

  const AVATAR_PRESETS_GROUPS = [
    { label: isAr ? '🎓 طلاب وخريجون' : 'Students', items: ['🎓', '🧑‍🎓', '👩‍🎓', '📚', '🎒', '🧠'] },
    { label: isAr ? '👨‍💻 تقنية وبرمجة' : 'Tech & Coding', items: ['💻', '🧑‍💻', '👩‍💻', '⚡', '🚀', '🤖'] },
    { label: isAr ? '🩺 طب وهندسة وعلوم' : 'Medicine & STEM', items: ['🔬', '🩺', '📐', '🧬', '🔭', '🧪'] },
    { label: isAr ? '🌟 طموح وتميز' : 'Ambition & Honors', items: ['👑', '💎', '🏆', '🦁', '🦅', '✨'] },
  ];

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
          className="w-full max-w-2xl transform rounded-3xl border shadow-2xl relative my-auto overflow-hidden max-h-[92vh] flex flex-col text-start"
          style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 shrink-0 text-lg">
                🎓
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black truncate" style={{ color: 'var(--text-color)' }}>
                  {isAr ? 'كارنيه الطالب والملف الأكاديمي' : 'Student ID & Academic Profile'}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {isAr ? 'تخصيص الهوية الدراسية، المسار، والمعدل المستهدف' : 'Customize identity, major, and target GPA'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  haptic.selection();
                  setLanguage(isAr ? 'en' : 'ar');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all hover:scale-105 bg-slate-900 border-slate-700"
              >
                <span className="text-sm">{isAr ? '🇬🇧' : '🇪🇬'}</span>
                <span className="text-amber-400">{isAr ? 'English' : 'عربي'}</span>
              </button>

              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Scroll Container */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 pr-2">
            
            {/* Live Holographic Student ID Badge Preview */}
            <div className="relative p-5 rounded-3xl border overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-950/70 via-purple-950/50 to-slate-900/90 border-indigo-500/30">
              
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-400/50 shadow-xl flex items-center justify-center text-3xl overflow-hidden">
                    {avatarType === 'upload' && avatarValue ? (
                      <img src={avatarValue} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{avatarValue || '🎓'}</span>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer transition-transform hover:scale-110">
                    <Camera className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Info on Card */}
                <div className="flex-1 min-w-0 text-center sm:text-start space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-lg font-black text-white truncate">
                      {name || (isAr ? 'محمد إسماعيل' : 'Student Name')}
                    </h4>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold self-center sm:self-auto">
                      {isAr ? currentStageObj.titleAr : currentStageObj.titleEn}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-semibold truncate">
                    {schoolOrUniversity || (isAr ? 'جامعة القاهرة — كلية الهندسة وعلوم الحاسب' : 'Cairo University')}
                  </p>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                    <span className="flex items-center gap-1 text-purple-300 px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 font-mono font-bold">
                      <Zap className="w-3 h-3 fill-purple-400" />
                      <span>{profile.xpPoints || 150} XP</span>
                    </span>

                    <span className="flex items-center gap-1 text-rose-300 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 font-bold">
                      <Flame className="w-3 h-3 fill-rose-400" />
                      <span>{profile.streakDays || 1} {isAr ? 'أيام تتابع 🔥' : 'Streak'}</span>
                    </span>

                    {targetGPA && (
                      <span className="flex items-center gap-1 text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 font-bold">
                        <Award className="w-3 h-3" />
                        <span>{targetGPA}</span>
                      </span>
                    )}

                    {dreamGoal && (
                      <span className="flex items-center gap-1 text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 font-bold truncate max-w-[200px]">
                        <Target className="w-3 h-3" />
                        <span className="truncate">{dreamGoal}</span>
                      </span>
                    )}
                  </div>

                  {bio && (
                    <p className="text-[11px] text-slate-400 italic pt-1 line-clamp-1">
                      ❝ {bio} ❞
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Row 1: Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAr ? 'اسم الطالب بالكامل *' : 'Full Student Name *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? 'مثال: محمد إسماعيل' : 'e.g. Mohamed Ismail'}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Row 2: School/University & Dream Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isAr ? 'المدرسة / الكلية / الجامعة' : 'School / University'}</span>
                  </label>
                  <input
                    type="text"
                    value={schoolOrUniversity}
                    onChange={(e) => setSchoolOrUniversity(e.target.value)}
                    placeholder={isAr ? 'مثال: كلية الهندسة وعلوم الحاسب' : 'e.g. Computer Science & Engineering'}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'الهدف الأكاديمي والمهني' : 'Dream Goal'}</span>
                  </label>
                  <input
                    type="text"
                    value={dreamGoal}
                    onChange={(e) => setDreamGoal(e.target.value)}
                    placeholder={isAr ? 'مثال: مهندس برمجيات وذكاء اصطناعي' : 'e.g. Lead AI Software Engineer'}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 3: Target GPA & Presets */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'التقدير والمعدل المستهدف' : 'Target GPA / Score'}</span>
                </label>
                
                <input
                  type="text"
                  value={targetGPA}
                  onChange={(e) => setTargetGPA(e.target.value)}
                  placeholder={isAr ? 'امتياز (A+) أو GPA 3.9' : 'Summa Cum Laude (A+)'}
                  className="w-full px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-900 border border-slate-800 text-amber-300 focus:outline-none focus:border-amber-500 mb-2"
                />

                <div className="flex flex-wrap gap-1.5">
                  {[
                    isAr ? '💎 امتياز مع مرتبة الشرف (A+)' : '💎 Summa Cum Laude (A+)',
                    isAr ? '🌟 امتياز (GPA 3.8+)' : '🌟 High Honors (GPA 3.8+)',
                    isAr ? '⚡ جيد جداً مرتفع (GPA 3.4+)' : '⚡ Honors (GPA 3.4+)',
                    isAr ? '👑 98% - 100% (أوائل جمهورية)' : '👑 98%+ Top Ranked',
                    isAr ? '🎯 95% فأعلى (كليات القمة)' : '🎯 95%+ Elite Target',
                    isAr ? '🥇 90% فأعلى (تفوق)' : '🥇 90%+ High Marks',
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        haptic.selection();
                        setTargetGPA(preset);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                        targetGPA === preset
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Motto / Quote */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-300 flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isAr ? 'شعارك ومقولتك الدراسية' : 'Student Motto'}</span>
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={isAr ? 'مثال: بالجد والاجتهاد نصل إلى القمة...' : 'e.g. Hard work pays off...'}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Row 5: Academic Stage & Grade Level */}
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-300">
                  {isAr ? 'المرحلة الدراسية والسنة' : 'Academic Stage & Grade'}
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
                  {ACADEMIC_STAGES.map(stage => {
                    const isSelected = academicStage === stage.id;
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => {
                          haptic.selection();
                          setAcademicStage(stage.id);
                          const curGrades = isAr ? (stage.gradesAr || stage.grades) : (stage.gradesEn || stage.grades);
                          setGradeLevel(curGrades[0]);
                        }}
                        className={`p-2.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isAr ? stage.titleAr : stage.titleEn}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {stageGrades.map(grade => {
                    const isSelected = gradeLevel === grade;
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => {
                          haptic.selection();
                          setGradeLevel(grade);
                        }}
                        className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                          isSelected
                            ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {grade}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: Avatar Presets Grid */}
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-300 flex items-center justify-between">
                  <span>{isAr ? 'اختر الأيقونة أو الأفاتار المفضل' : 'Select Avatar Icon'}</span>
                  {avatarType === 'upload' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarType('emoji');
                        setAvatarValue('🎓');
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                    >
                      {isAr ? 'إزالة الصورة المرفوعة' : 'Remove Uploaded'}
                    </button>
                  )}
                </label>

                <div className="space-y-2">
                  {AVATAR_PRESETS_GROUPS.map(group => (
                    <div key={group.label} className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold min-w-[90px]">{group.label}:</span>
                      {group.items.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            haptic.selection();
                            setAvatarType('emoji');
                            setAvatarValue(emoji);
                          }}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                            avatarType === 'emoji' && avatarValue === emoji
                              ? 'bg-indigo-600 scale-110 shadow-md ring-2 ring-indigo-400'
                              : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  {isAr ? 'حفظ بطاقة الطالب 🎓' : 'Save Profile 🎓'}
                </button>
              </div>

            </form>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
