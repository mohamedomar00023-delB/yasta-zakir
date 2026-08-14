export type AvatarType = 'preset' | 'upload' | 'emoji';

export interface UserProfile {
  name: string;
  title?: string;
  bio?: string; // Student motto or quote
  dreamGoal?: string; // e.g. "كلية الهندسة", "هندسة البرمجيات", "كلية الطب", "التفوق والامتياز"
  schoolOrUniversity?: string; // School or university name
  targetGPA?: string; // e.g. "امتياز (A+)", "95% فأعلى"
  phone?: string; // Mobile phone number e.g. 01012345678
  academicStage?: string; // e.g. "جامعي", "ثانوية عامة", "إعدادي", "دراسات عليا", "تعلم حر"
  gradeLevel?: string; // e.g. "أولى بكالوريا", "تانية بكالوريا", "3 ثانوي"
  academicTrack?: string; // e.g. "علمي علوم", "علمي رياضة", "علوم تجريبية", "علوم رياضية"
  xpPoints?: number; // XP points accumulated from completing tasks/prayers/lessons
  streakDays?: number; // Consecutive streak days
  avatarType: AvatarType;
  avatarValue: string; // URL, emoji string, or preset ID
  onboarded: boolean;
}

export type LessonType = 'online' | 'onsite';

export interface Lesson {
  id: string;
  subject: string;
  teacher: string;
  type: LessonType;
  link?: string;
  location?: string;
  startTime: string; // HH:mm (24h format)
  endTime?: string;  // Optional HH:mm (24h format)
  days: number[];    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  color: string;     // Hex or Tailwind color class key
  notes?: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface StudentTask {
  id: string;
  title: string;
  description?: string;
  subjectName?: string;
  lessonId?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  estimatedMinutes?: number;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  subjectName?: string;
  createdAt: string;
  pinned: boolean;
}

export interface StudyPlanItem {
  id: string;
  subject: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  priority: TaskPriority;
  completed: boolean;
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerItem {
  name: PrayerName;
  arabicName: string;
  time: string; // HH:mm format
  formattedTime: string; // 12-hour format with AM/PM in Arabic
  timestamp: number; // UNIX timestamp for current day
  isNext: boolean;
  isPassed: boolean;
}

export interface HijriDateInfo {
  day: string;
  monthAr: string;
  monthEn?: string;
  year: string;
  formatted: string;
  formattedEn?: string;
}

export interface PrayerConflictAlert {
  lessonId: string;
  lessonSubject: string;
  lessonStartTime: string;
  lessonEndTime?: string;
  prayerName: string;
  prayerArabicName: string;
  prayerTime: string;
  diffMinutes: number;
  isOverlapping: boolean;
}

export type ThemeId = 'midnight' | 'emerald' | 'rose' | 'violet' | 'ocean' | 'amber' | 'light';
export type ChimeToneId = 'full-adhan' | 'takbeer' | 'soft-bell' | 'oud-chime' | 'crystal' | 'oriental';
export type AdhanSoundId = 
  | 'makkah' 
  | 'madinah' 
  | 'alaqsa' 
  | 'egypt-refaat' 
  | 'abdulbasit' 
  | 'takbeer-short' 
  | 'nasr-tobbar' 
  | 'fajr-special' 
  | 'silent';

export type NotificationSoundId = 
  | 'soft-bell' 
  | 'crystal-ping' 
  | 'oud-melody' 
  | 'gentle-piano' 
  | 'success-horizon' 
  | 'modern-ping' 
  | 'birds-nature' 
  | 'water-drop' 
  | 'marimba-pop' 
  | 'subtle-breeze' 
  | 'silent';

export type AppLanguage = 'ar' | 'en';

export interface BadgeItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  category: 'prayers' | 'streak' | 'study' | 'tasks' | 'mastery';
  xpReward: number;
  requiredCount: number;
  currentCount: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface AthkarItem {
  id: string;
  title: string;
  titleEn?: string;
  text: string;
  textEn?: string;
  benefit?: string;
  benefitEn?: string;
  count: number;
  currentCount?: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  themeId: ThemeId;
  language: AppLanguage;
  chimeTone: ChimeToneId;
  adhanSound?: AdhanSoundId;
  notificationSound?: NotificationSoundId;
  volume: number; // 0 to 1
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  reminderMinutesBeforeLesson: number; // 10, 15, or 30
  reminderMinutesBeforeTask?: number; // 15, 30, 60
  selectedCity: string;
  selectedCountry: string;
  useGeolocation: boolean;
  calculationMethod: number; // Aladhan API method ID (1-12)
  tasbeehTotalCount?: number;
  quranPagesRead?: number;
}

export interface AppBackupData {
  version: string;
  exportedAt: string;
  profile: UserProfile;
  lessons: Lesson[];
  tasks: StudentTask[];
  notes?: StudyNote[];
  studyPlans?: StudyPlanItem[];
  badges?: BadgeItem[];
  lessonCompletions: Record<string, boolean>;
  prayersCompleted: Record<string, boolean>;
  settings: AppSettings;
}
