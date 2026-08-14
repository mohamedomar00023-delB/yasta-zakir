import { AppLanguage } from '../types';

export const translations = {
  ar: {
    // General & Actions
    appName: 'يسطا ذاكر',
    appSubtitle: 'رفيقك لتنظيم يومك الدراسي وصلواتك',
    save: 'حفظ التعديلات',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    add: 'إضافة',
    confirm: 'تأكيد',
    success: 'تم بنجاح',
    loading: 'جاري التحميل...',
    xpEarned: '+{xp} نقطة خبرة!',
    footerText: 'يسطا ذاكر 🎓 | Yasta Zakir © 2026 — اتعمل بـ ❤️ وعناية عشان تظبط يومك كطالب',
    footerPrivacy: 'جميع البيانات تحفظ محلياً على متصفحك بكل خصوصية وأمان.',

    // Navbar & Navigation Tabs
    navToday: 'النهاردة',
    navWeekly: 'الأسبوع',
    navCalendar: 'التقويم',
    navTasks: 'الواجبات',
    navNotes: 'النوتات',
    navStats: 'الإحصائيات',
    navAIPlanner: 'مساعد AI',
    navAthkar: 'الأذكار 📿',
    navAchievements: 'إنجازاتي 🏆',
    navStoryShare: 'بطاقة إنجازي 📸',
    navGuide: 'دليل التطبيق 💡',
    navSettings: 'الإعدادات',
    navTheme: 'المظهر والأصوات',
    navBackup: 'النسخ الاحتياطي',
    navInstallApp: 'تثبيت التطبيق',
    navInstalled: 'مثبّت 📱',
    navMore: 'المزيد',

    // Welcome Greeting
    welcomeGreeting: 'أهلاً بيك يا {name} 👋 .. جاهز تظبط يومك؟',
    summaryStatus: 'عندك النهاردة {lessons} دروس و {tasks} واجبات مستنيينك، شد حيلك 🚀',

    // Prayer Section
    nextPrayerTitle: 'الصلاة القادمة:',
    remainingTime: 'الوقت المتبقي للأذان:',
    qiblaTitle: 'بوصلة اتجاه القبلة',
    qiblaSubtitle: 'حدد اتجاه القبلة بدقة من موقعك الحالي',
    refreshLocation: 'تحديث الموقع',
    allPrayers: 'مواقيت الصلوات الخمس',
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    passed: 'مضت',
    upcoming: 'قادمة',
    prayerDone: 'أديت الفرض ✨',

    // Dashboard Cards
    dailyProgressTitle: 'مؤشر الإنجاز اليومي العام',
    dailyProgressSubtitle: 'نسبة إتمام صلواتك ودروسك وواجباتك لليوم',
    rankTitle: 'رتبة الطالب ونقاط الخبرة XP',
    currentLevel: 'المستوى الحالي',
    nextLevelAt: 'المستوى القادم عند {xp} XP',

    // Today Schedule & Weekly
    todayLessonsTitle: 'جدول دروس اليوم',
    todayLessonsSubtitle: 'المحاضرات والدروس المجدولة لليوم',
    weeklyScheduleTitle: 'نظرة عامة على الجدول الأسبوعي',
    weeklyScheduleSubtitle: 'استعراض وتنسيق مواعيد محاضراتك طوال أيام الأسبوع',
    addLesson: 'إضافة مادة للجدول',
    noLessonsToday: 'مفيش دروس مجدولة النهاردة! وقت مثالي للمراجعة أو الراحة ☕',
    onlineLesson: 'أونلاين',
    onsiteLesson: 'حضوري / سنتر',
    attended: 'تم الحضور',
    confirmAttendance: 'تأكيد الحضور',

    // Tasks Manager
    tasksTitle: 'الواجبات والمهام الدراسية',
    tasksSubtitle: 'تتبع الواجبات ومواعيد تسليمها بكل سهولة',
    addTask: 'إضافة واجب جديد',
    allTasks: 'الكل',
    pendingTasks: 'قيد التنفيذ',
    completedTasks: 'المكتملة',
    noTasks: 'مفيش واجبات متسجلة حالياً! عاش يا بطل 👏',
    dueDate: 'موعد التسليم:',
    highPriority: 'أولوية قصوى 🔥',
    medPriority: 'أولوية متوسطة ⚡',
    lowPriority: 'أولوية عادية ☕',

    // Calendar View
    calendarTitle: '📅 تقويم المهام والدروس',
    calendarSubtitle: 'نظرة شاملة لجدولك الدراسي وواجباتك على مدار الشهر',
    selectedDay: 'اليوم المحدد',
    noItemsOnDay: 'لا توجد مواعيد أو مهام في هذا اليوم',

    // Notes Manager
    notesTitle: 'النوتات والملخصات السريعة',
    notesSubtitle: 'اكتب ملاحظاتك وقوانينك المهمة عشان متنسهاش',
    addNote: 'إضافة نوتة جديدة',
    pinned: 'مثبتة 📌',
    noNotes: 'لسه مفيش نوتات متسجلة! ضيف أول ملاحظة أو قانون 📝',

    // Stats Modal
    statsTitle: '📊 إحصائيات وتقارير الأداء الأسبوعي',
    statsSubtitle: 'شوف إنجازك خلال الـ 7 أيام اللي فاتوا وطور مستواك',
    statTotalTasks: 'إجمالي الواجبات المكتملة',
    statStudyHours: 'ساعات المذاكرة المقدرة',
    weeklyCompletionRate: 'معدل الإنجاز اليومي للأسبوع',
    streakLabel: 'أيام التتابع المتواصل 🔥',

    // AI Planner
    aiPlannerTitle: '🤖 مساعد المذاكرة الذكي (AI Study Planner)',
    aiPlannerSubtitle: 'خطة مذاكرة مخصصة توزع مجهودك بذكاء مع مراعاة أوقات الصلاة والراحة',
    targetSubjects: 'المواد المراد مذاكرتها (مفصولة بفواصل)',
    availableHours: 'عدد ساعات المذاكرة المتاحة يومياً',
    studyPace: 'وتيرة التركيز',
    paceModerate: 'متوازنة (جلسات 45 دقيقة)',
    paceIntense: 'مكثفة (جلسات 60 دقيقة)',
    generatePlanBtn: '✨ توليد خطة المذاكرة الذكية',
    generatedPlanTitle: 'جدول المذاكرة المقترح لك:',
    applyPlanToTasks: '➕ إضافة الجلسات كمهام في قائمتي',

    // Share Schedule
    shareScheduleTitle: '🤝 مشاركة الجدول الدراسي',
    shareScheduleSubtitle: 'شارك جدولك مع أصحابك أو احفظه كصورة أنيقة',
    downloadImage: '📸 تحميل كصورة PNG',
    copyShareLink: '📋 نسخ ملخص الجدول',
    copiedSuccess: 'تم نسخ الجدول للحافظة!',

    // Language Toggle
    langSwitch: 'English',
    currentLangLabel: 'العربية 🇪🇬',
  },
  en: {
    // General & Actions
    appName: 'Yasta Zakir',
    appSubtitle: 'Your smart student companion for study schedules & prayers',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    add: 'Add',
    confirm: 'Confirm',
    success: 'Success',
    loading: 'Loading...',
    xpEarned: '+{xp} XP Points!',
    footerText: 'Yasta Zakir 🎓 © 2026 — Crafted with ❤️ to help students conquer their daily goals',
    footerPrivacy: 'All data is stored locally on your device with complete privacy & security.',

    // Navbar & Navigation Tabs
    navToday: 'Today',
    navWeekly: 'Weekly',
    navCalendar: 'Calendar',
    navTasks: 'Tasks',
    navNotes: 'Notes',
    navStats: 'Analytics',
    navAIPlanner: 'AI Planner',
    navAthkar: 'Athkar 📿',
    navAchievements: 'Badges 🏆',
    navStoryShare: 'Story Card 📸',
    navGuide: 'App Guide 💡',
    navSettings: 'Settings',
    navTheme: 'Themes & Audio',
    navBackup: 'Backup',
    navInstallApp: 'Install App',
    navInstalled: 'Installed 📱',
    navMore: 'More',

    // Welcome Greeting
    welcomeGreeting: 'Welcome back, {name} 👋 .. Ready to conquer the day?',
    summaryStatus: 'You have {lessons} lessons and {tasks} tasks scheduled today. Let\'s do this! 🚀',

    // Prayer Section
    nextPrayerTitle: 'Next Prayer:',
    remainingTime: 'Time remaining until Adhan:',
    qiblaTitle: 'Qibla Direction',
    qiblaSubtitle: 'Accurate compass pointing towards Mecca from your location',
    refreshLocation: 'Refresh Location',
    allPrayers: 'Five Daily Prayers',
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    passed: 'Passed',
    upcoming: 'Upcoming',
    prayerDone: 'Completed ✨',

    // Dashboard Cards
    dailyProgressTitle: 'Daily Achievement Score',
    dailyProgressSubtitle: 'Overall progress across prayers, lessons and tasks for today',
    rankTitle: 'Student Rank & XP',
    currentLevel: 'Current Rank',
    nextLevelAt: 'Next level at {xp} XP',

    // Today Schedule & Weekly
    todayLessonsTitle: 'Today\'s Classes & Lessons',
    todayLessonsSubtitle: 'Scheduled lectures and study sessions for today',
    weeklyScheduleTitle: 'Weekly Class Schedule',
    weeklyScheduleSubtitle: 'Overview of all your classes and lectures across the week',
    addLesson: 'Add New Class',
    noLessonsToday: 'No classes scheduled today! Great time to study or relax ☕',
    onlineLesson: 'Online',
    onsiteLesson: 'On-site / Campus',
    attended: 'Attended',
    confirmAttendance: 'Mark Attended',

    // Tasks Manager
    tasksTitle: 'Assignments & Tasks',
    tasksSubtitle: 'Track deadlines and coursework easily',
    addTask: 'Add New Task',
    allTasks: 'All',
    pendingTasks: 'Pending',
    completedTasks: 'Completed',
    noTasks: 'No tasks scheduled right now! Keep up the great work 👏',
    dueDate: 'Due date:',
    highPriority: 'High Priority 🔥',
    medPriority: 'Medium Priority ⚡',
    lowPriority: 'Low Priority ☕',

    // Calendar View
    calendarTitle: '📅 Tasks & Classes Calendar',
    calendarSubtitle: 'Comprehensive monthly view of all lessons and assignments',
    selectedDay: 'Selected Day',
    noItemsOnDay: 'No scheduled lessons or tasks on this day',

    // Notes Manager
    notesTitle: 'Quick Study Notes',
    notesSubtitle: 'Save essential formulas, summaries and cheat sheets',
    addNote: 'New Note',
    pinned: 'Pinned 📌',
    noNotes: 'No notes created yet! Write your first formula or summary 📝',

    // Stats Modal
    statsTitle: '📊 Weekly Performance & Insights',
    statsSubtitle: 'Track your progress and momentum over the past 7 days',
    statTotalTasks: 'Tasks Completed',
    statStudyHours: 'Est. Study Hours',
    weeklyCompletionRate: 'Daily Task Velocity',
    streakLabel: 'Active Day Streak 🔥',

    // AI Planner
    aiPlannerTitle: '🤖 AI Study Planner',
    aiPlannerSubtitle: 'Smart timetable generator tailored around your prayer breaks & available time',
    targetSubjects: 'Subjects to study (comma separated)',
    availableHours: 'Available study hours per day',
    studyPace: 'Study Pace',
    paceModerate: 'Balanced (45 min sessions)',
    paceIntense: 'Intensive (60 min sessions)',
    generatePlanBtn: '✨ Generate AI Study Plan',
    generatedPlanTitle: 'Your Customized Study Plan:',
    applyPlanToTasks: '➕ Add sessions to my Task List',

    // Share Schedule
    shareScheduleTitle: '🤝 Share Study Schedule',
    shareScheduleSubtitle: 'Share your schedule with classmates or export as an image',
    downloadImage: '📸 Download PNG Image',
    copyShareLink: '📋 Copy Schedule Text',
    copiedSuccess: 'Copied schedule to clipboard!',

    // Language Toggle
    langSwitch: 'عربي',
    currentLangLabel: 'English 🇬🇧',
  },
};

export const getTranslation = (
  lang: AppLanguage,
  key: keyof typeof translations['ar'],
  params?: Record<string, string | number>
): string => {
  const dict = translations[lang] || translations.ar;
  let text = dict[key] || translations.ar[key] || String(key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
};
