import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  AppBackupData, 
  AppSettings, 
  Lesson, 
  StudentTask, 
  StudyNote, 
  UserProfile, 
  StudyPlanItem,
  AppLanguage 
} from '../types';
import { DEFAULT_PROFILE, INITIAL_LESSONS, INITIAL_TASKS } from '../utils/presets';
import { playSuccessPing } from '../utils/sound';
import { THEME_CONFIGS } from '../utils/themes';
import { getTranslation, translations } from '../utils/i18n';
import { haptic } from '../utils/haptics';

export type ActiveTabType = 'today' | 'weekly' | 'calendar' | 'tasks' | 'notes';

interface AppContextType {
  // Profile
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;

  // Lessons
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
  addLesson: (lesson: Omit<Lesson, 'id'>) => void;
  updateLesson: (lesson: Lesson) => void;
  deleteLesson: (id: string) => void;
  editingLesson: Lesson | null;
  setEditingLesson: (lesson: Lesson | null) => void;
  isLessonModalOpen: boolean;
  setIsLessonModalOpen: (open: boolean) => void;

  // Lesson Completions
  lessonCompletions: Record<string, boolean>;
  toggleLessonCompletion: (dateStr: string, lessonId: string) => void;

  // Tasks
  tasks: StudentTask[];
  addTask: (task: Omit<StudentTask, 'id' | 'createdAt'>) => void;
  updateTask: (task: StudentTask) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  editingTask: StudentTask | null;
  setEditingTask: (task: StudentTask | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;

  // Study Notes
  notes: StudyNote[];
  addNote: (note: Omit<StudyNote, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Study Plans (AI generated)
  studyPlans: StudyPlanItem[];
  addStudyPlans: (plans: Omit<StudyPlanItem, 'id'>[]) => void;
  toggleStudyPlanCompletion: (id: string) => void;

  // Prayer Completions
  prayersCompleted: Record<string, boolean>;
  togglePrayerCompletion: (dateStr: string, prayerName: string) => void;

  // Settings, Language & Theme
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
  t: (key: keyof typeof translations['ar'], params?: Record<string, string | number>) => string;
  setLanguage: (lang: AppLanguage) => void;

  // Active View & Modals
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  isBackupModalOpen: boolean;
  setIsBackupModalOpen: (open: boolean) => void;
  isStatsModalOpen: boolean;
  setIsStatsModalOpen: (open: boolean) => void;
  isAIPlannerModalOpen: boolean;
  setIsAIPlannerModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  isAthkarModalOpen: boolean;
  setIsAthkarModalOpen: (open: boolean) => void;
  isAchievementsModalOpen: boolean;
  setIsAchievementsModalOpen: (open: boolean) => void;
  isStudentStoryModalOpen: boolean;
  setIsStudentStoryModalOpen: (open: boolean) => void;
  isAppTourOpen: boolean;
  setIsAppTourOpen: (open: boolean) => void;

  // Backup & Restore
  exportBackupData: () => AppBackupData;
  importBackupData: (data: AppBackupData) => boolean;

  // Toast Alerts
  showToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
  toast: { message: string; type: 'success' | 'warning' | 'info' } | null;

  // XP Points
  addXP: (points: number, reason: string) => void;

  // Confetti trigger
  triggerCelebration: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'taleb_profile_v4',
  LESSONS: 'taleb_lessons_v4',
  TASKS: 'taleb_tasks_v4',
  NOTES: 'taleb_notes_v4',
  STUDY_PLANS: 'taleb_study_plans_v4',
  COMPLETIONS: 'taleb_completions_v4',
  PRAYERS: 'taleb_prayers_v4',
  SETTINGS: 'taleb_settings_v4',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  themeId: 'midnight',
  language: 'ar',
  chimeTone: 'soft-bell',
  adhanSound: 'makkah',
  notificationSound: 'soft-bell',
  volume: 0.8,
  soundEnabled: true,
  hapticsEnabled: true,
  smartAudioEnabled: true,
  gentleFadeIn: true,
  quietHoursEnabled: true,
  notificationsEnabled: false,
  reminderMinutesBeforeLesson: 15,
  reminderMinutesBeforeTask: 30,
  selectedCity: 'Cairo',
  selectedCountry: 'Egypt',
  useGeolocation: true,
  calculationMethod: 5,
};

const INITIAL_NOTES: StudyNote[] = [
  {
    id: 'note-1',
    title: 'قوانين تحليل الجبر البولي',
    content: '1. قانون دي مورجان: (A . B)\' = A\' + B\'\n2. قانون الامتصاص: A + A.B = A\n3. التبسيط باستخدام خرائط كارنوف K-Map',
    subjectName: 'الرياضيات المتقطعة',
    createdAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'note-2',
    title: 'أوامر التهيئة في C++',
    content: 'استخدام std::cin و std::cout مع تضمين iostream والهياكل الشرطية.',
    subjectName: 'البرمجة بلغة C++',
    createdAt: new Date().toISOString(),
    pinned: false,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEFAULT_PROFILE;
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!profile.onboarded);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  // 2. Lessons State
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_LESSONS;
  });
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState<boolean>(false);

  // 3. Lesson Completions State
  const [lessonCompletions, setLessonCompletions] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {};
  });

  // 4. Tasks State
  const [tasks, setTasks] = useState<StudentTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_TASKS;
  });
  const [editingTask, setEditingTask] = useState<StudentTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);

  // 5. Notes State
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_NOTES;
  });

  // 6. Study Plans (AI generated)
  const [studyPlans, setStudyPlans] = useState<StudyPlanItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDY_PLANS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  // 7. Prayer Completions State
  const [prayersCompleted, setPrayersCompleted] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRAYERS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {};
  });

  // 8. Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch { /* ignore */ }
    }
    return DEFAULT_SETTINGS;
  });

  // Active Tab & Modals
  const [activeTab, setActiveTab] = useState<ActiveTabType>('today');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isAIPlannerModalOpen, setIsAIPlannerModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isAthkarModalOpen, setIsAthkarModalOpen] = useState<boolean>(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isStudentStoryModalOpen, setIsStudentStoryModalOpen] = useState<boolean>(false);
  const [isAppTourOpen, setIsAppTourOpen] = useState<boolean>(false);

  // Toast system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const triggerCelebration = useCallback(() => {
    haptic.celebration();
    if (settings.soundEnabled) {
      playSuccessPing();
    }
    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  }, [settings.soundEnabled]);

  // Translation helper
  const t = useCallback((key: keyof typeof translations['ar'], params?: Record<string, string | number>) => {
    return getTranslation(settings.language || 'ar', key, params);
  }, [settings.language]);

  const setLanguage = (lang: AppLanguage) => {
    updateSettings({ language: lang });
    showToast(lang === 'ar' ? 'تم تحويل اللغة إلى العربية 🇪🇬' : 'Language switched to English 🇬🇧', 'success');
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDY_PLANS, JSON.stringify(studyPlans));
  }, [studyPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(lessonCompletions));
  }, [lessonCompletions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(prayersCompleted));
  }, [prayersCompleted]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

    // Theme class & Language Direction application on <html>
    const root = document.documentElement;
    root.classList.remove('theme-midnight', 'theme-emerald', 'theme-rose', 'theme-violet', 'theme-light', 'dark', 'light');

    const themeId = settings.themeId || 'midnight';
    root.classList.add(`theme-${themeId}`);
    if (THEME_CONFIGS[themeId]?.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }

    // Direction and lang
    const lang = settings.language || 'ar';
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [settings]);

  // Profile actions
  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
    showToast(settings.language === 'en' ? 'Profile updated successfully' : 'تم تحديث بيانات الملف الشخصي بنجاح', 'success');
  };

  // XP points helper
  const addXP = useCallback((points: number, reason: string) => {
    setProfile(prev => {
      const currentXP = prev.xpPoints || 0;
      const nextXP = currentXP + points;
      return { ...prev, xpPoints: nextXP };
    });
    showToast(settings.language === 'en' ? `Great job! +${points} XP (${reason}) 🔥` : `عاش يا بطل! +${points} XP (${reason}) 🔥`, 'success');
  }, [settings.language, showToast]);

  const deductXP = useCallback((points: number) => {
    setProfile(prev => {
      const currentXP = prev.xpPoints || 0;
      const nextXP = Math.max(0, currentXP - points);
      return { ...prev, xpPoints: nextXP };
    });
  }, []);

  // Lesson actions
  const addLesson = (lessonData: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = {
      ...lessonData,
      id: `lesson_${Date.now()}`,
    };
    setLessons(prev => {
      const next = [...prev, newLesson];
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(next));
      return next;
    });
    showToast(settings.language === 'en' ? `Added class "${newLesson.subject}" 💾` : `تمت إضافة درس "${newLesson.subject}" 💾`, 'success');
  };

  const updateLesson = (updatedLesson: Lesson) => {
    setLessons(prev => {
      const next = prev.map(l => (l.id === updatedLesson.id ? updatedLesson : l));
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(next));
      return next;
    });
    showToast(settings.language === 'en' ? `Updated class "${updatedLesson.subject}" 💾` : `تم تعديل درس "${updatedLesson.subject}" 💾`, 'success');
  };

  const deleteLesson = (id: string) => {
    setLessons(prev => {
      const next = prev.filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(next));
      return next;
    });
    showToast(settings.language === 'en' ? 'Class deleted 🗑️' : 'تم حذف الدرس وتحديث الجدول 🗑️', 'info');
  };

  const handleSetLessons = (newLessons: Lesson[]) => {
    setLessons(newLessons);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(newLessons));
  };

  const toggleLessonCompletion = (dateStr: string, lessonId: string) => {
    const key = `${dateStr}_${lessonId}`;
    setLessonCompletions(prev => {
      const nextState = !prev[key];
      if (nextState) {
        triggerCelebration();
        addXP(15, settings.language === 'en' ? 'Class Attendance' : 'حضور وتأكيد الدرس');
      } else {
        deductXP(15);
      }
      return { ...prev, [key]: nextState };
    });
  };

  // Task actions
  const addTask = (taskData: Omit<StudentTask, 'id' | 'createdAt'>) => {
    const newTask: StudentTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    showToast(settings.language === 'en' ? `Task "${newTask.title}" added!` : `تم إضافة المهمة "${newTask.title}" بنجاح`, 'success');
  };

  const updateTask = (updatedTask: StudentTask) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    showToast(settings.language === 'en' ? 'Task updated' : 'تم تحديث تفاصيل المهمة', 'success');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast(settings.language === 'en' ? 'Task removed' : 'تم حذف المهمة', 'info');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        const taskXP = t.priority === 'high' ? 25 : t.priority === 'medium' ? 15 : 10;
        if (nextCompleted) {
          triggerCelebration();
          addXP(taskXP, settings.language === 'en' ? 'Task completion' : 'تسليم الواجب');
        } else {
          deductXP(taskXP);
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    }));
  };

  // AI Study Plans actions
  const addStudyPlans = (newPlans: Omit<StudyPlanItem, 'id'>[]) => {
    const plansWithId: StudyPlanItem[] = newPlans.map(p => ({
      ...p,
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    }));
    setStudyPlans(prev => [...plansWithId, ...prev]);

    // Auto-inject as tasks
    plansWithId.forEach(plan => {
      addTask({
        title: settings.language === 'en' ? `📚 Study: ${plan.subject} - ${plan.title}` : `📚 مذاكرة: ${plan.subject} - ${plan.title}`,
        dueDate: plan.date,
        dueTime: plan.startTime,
        priority: plan.priority || 'high',
        completed: false,
        subjectName: plan.subject,
        estimatedMinutes: plan.durationMinutes,
      });
    });

    showToast(
      settings.language === 'en' 
        ? `Added ${plansWithId.length} AI study sessions to your tasks! 🚀`
        : `تم توليد وإضافة ${plansWithId.length} جلسات مذاكرة لجدول مهامك! 🚀`, 
      'success'
    );
  };

  const toggleStudyPlanCompletion = (id: string) => {
    setStudyPlans(prev => prev.map(p => {
      if (p.id === id) {
        const nextCompleted = !p.completed;
        if (nextCompleted) {
          triggerCelebration();
          addXP(20, settings.language === 'en' ? 'Study session completed' : 'إنجاز جلسة مذاكرة');
        } else {
          deductXP(20);
        }
        return { ...p, completed: nextCompleted };
      }
      return p;
    }));
  };

  // Note actions
  const addNote = (noteData: Omit<StudyNote, 'id' | 'createdAt'>) => {
    const newNote: StudyNote = {
      ...noteData,
      id: `note_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    showToast(settings.language === 'en' ? `Note "${newNote.title}" saved` : `تم حفظ الملاحظة "${newNote.title}"`, 'success');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    showToast(settings.language === 'en' ? 'Note deleted' : 'تم حذف الملاحظة', 'info');
  };

  const togglePinNote = (id: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  // Prayer actions
  const togglePrayerCompletion = (dateStr: string, prayerName: string) => {
    const key = `${dateStr}_${prayerName}`;
    setPrayersCompleted(prev => {
      const nextState = !prev[key];
      if (nextState) {
        triggerCelebration();
        addXP(15, settings.language === 'en' ? 'Prayer fulfilled' : 'أداء الصلاة');
      } else {
        deductXP(15);
      }
      return { ...prev, [key]: nextState };
    });
  };

  // Settings action
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Backup export / import
  const exportBackupData = (): AppBackupData => {
    return {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      profile,
      lessons,
      tasks,
      notes,
      studyPlans,
      lessonCompletions,
      prayersCompleted,
      settings,
    };
  };

  const importBackupData = (data: AppBackupData): boolean => {
    try {
      if (data.profile) setProfile(data.profile);
      if (Array.isArray(data.lessons)) setLessons(data.lessons);
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (Array.isArray(data.studyPlans)) setStudyPlans(data.studyPlans);
      if (data.lessonCompletions) setLessonCompletions(data.lessonCompletions);
      if (data.prayersCompleted) setPrayersCompleted(data.prayersCompleted);
      if (data.settings) setSettings(data.settings);
      showToast(settings.language === 'en' ? 'Backup restored successfully!' : 'تم استعادة النسخة الاحتياطية بنجاح!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast(settings.language === 'en' ? 'Failed to restore backup file' : 'فشل استعادة الملف. يرجى التأكد من اختيار ملف JSON صحيح.', 'warning');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,

        lessons,
        setLessons: handleSetLessons,
        addLesson,
        updateLesson,
        deleteLesson,
        editingLesson,
        setEditingLesson,
        isLessonModalOpen,
        setIsLessonModalOpen,

        lessonCompletions,
        toggleLessonCompletion,

        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        editingTask,
        setEditingTask,
        isTaskModalOpen,
        setIsTaskModalOpen,

        notes,
        addNote,
        deleteNote,
        togglePinNote,

        studyPlans,
        addStudyPlans,
        toggleStudyPlanCompletion,

        prayersCompleted,
        togglePrayerCompletion,

        settings,
        updateSettings,
        isThemeModalOpen,
        setIsThemeModalOpen,
        t,
        setLanguage,

        activeTab,
        setActiveTab,
        isBackupModalOpen,
        setIsBackupModalOpen,
        isStatsModalOpen,
        setIsStatsModalOpen,
        isAIPlannerModalOpen,
        setIsAIPlannerModalOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        isAthkarModalOpen,
        setIsAthkarModalOpen,
        isAchievementsModalOpen,
        setIsAchievementsModalOpen,
        isStudentStoryModalOpen,
        setIsStudentStoryModalOpen,
        isAppTourOpen,
        setIsAppTourOpen,

        exportBackupData,
        importBackupData,

        showToast,
        toast,
        addXP,
        triggerCelebration,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
