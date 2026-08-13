import { PrayerName } from '../types';

export const ARABIC_DAYS = [
  { id: 0, name: 'الأحد', short: 'أحد' },
  { id: 1, name: 'الاثنين', short: 'اتن' },
  { id: 2, name: 'الثلاثاء', short: 'ثلا' },
  { id: 3, name: 'الأربعاء', short: 'أرب' },
  { id: 4, name: 'الخميس', short: 'خم' },
  { id: 5, name: 'الجمعة', short: 'جمع' },
  { id: 6, name: 'السبت', short: 'سبت' },
];

export const PRAYER_TRANSLATIONS: Record<PrayerName, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

/**
 * Formats HH:mm (24h) to 12-hour format with bilingual AM/PM (ص/م or AM/PM)
 */
export const formatTime12h = (time24?: string, isEn: boolean = false): string => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = mStr || '00';

  if (isNaN(hours)) return time24;

  const period = isEn ? (hours >= 12 ? 'PM' : 'AM') : (hours >= 12 ? 'م' : 'ص');
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${period}`;
};

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns full Arabic date representation e.g. "الإثنين، 10 أغسطس 2026"
 */
export const getArabicFormattedDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Returns full English date representation e.g. "Mon, Aug 10, 2026"
 */
export const getEnglishFormattedDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats seconds remaining to 00:00:00 (Hours, Minutes, Seconds)
 */
export const formatSecondsToTimer = (totalSeconds: number): { hours: string; minutes: string; seconds: string } => {
  if (totalSeconds <= 0) return { hours: '00', minutes: '00', seconds: '00' };

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

/**
 * Converts HH:mm time string to minutes past midnight
 */
export const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Standard preset colors for subject cards
 */
export const SUBJECT_COLORS = [
  { id: 'indigo', name: 'أزرق ملكي', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', badge: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { id: 'emerald', name: 'أخضر زمردي', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'amber', name: 'كهرماني دافئ', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'rose', name: 'وردي ياقوتي', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500', ring: 'ring-rose-500' },
  { id: 'cyan', name: 'سمائي سماوي', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', badge: 'bg-cyan-500', ring: 'ring-cyan-500' },
  { id: 'purple', name: 'بنفسجي فاخر', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500', ring: 'ring-purple-500' },
];

export const getSubjectColorObj = (colorId: string) => {
  return SUBJECT_COLORS.find(c => c.id === colorId) || SUBJECT_COLORS[0];
};
