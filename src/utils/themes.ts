import { ThemeId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  nameAr: string;
  nameEn: string;
  isDark: boolean;
  bgGradient: string;
  panelClass: string;
  cardClass: string;
  previewBg: string;
  accentColor: string;
  badgeClass: string;
}

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    nameAr: 'الليل النجمي 🌌',
    nameEn: 'Midnight Galaxy',
    isDark: true,
    bgGradient: 'bg-slate-950 text-slate-100',
    panelClass: 'bg-slate-900/75 border-slate-800/80',
    cardClass: 'bg-slate-900/45 border-slate-800/80 hover:border-indigo-500/40',
    previewBg: 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900',
    accentColor: 'indigo-500',
    badgeClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
  emerald: {
    id: 'emerald',
    nameAr: 'الزمرد الإسلامي 🌿',
    nameEn: 'Emerald Oasis',
    isDark: true,
    bgGradient: 'bg-emerald-950 text-emerald-100',
    panelClass: 'bg-emerald-950/75 border-emerald-900/60',
    cardClass: 'bg-emerald-900/35 border-emerald-800/50 hover:border-amber-400/40',
    previewBg: 'bg-gradient-to-tr from-emerald-950 via-teal-950 to-emerald-900',
    accentColor: 'emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  ocean: {
    id: 'ocean',
    nameAr: 'أزرق المحيط 🌊',
    nameEn: 'Deep Ocean Blue',
    isDark: true,
    bgGradient: 'bg-sky-950 text-sky-100',
    panelClass: 'bg-sky-950/75 border-sky-900/60',
    cardClass: 'bg-sky-900/35 border-sky-800/50 hover:border-cyan-400/40',
    previewBg: 'bg-gradient-to-tr from-slate-950 via-cyan-950 to-blue-900',
    accentColor: 'cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  rose: {
    id: 'rose',
    nameAr: 'الغروب الدافئ 🌅',
    nameEn: 'Sunset Rose',
    isDark: true,
    bgGradient: 'bg-rose-950 text-rose-100',
    panelClass: 'bg-rose-950/75 border-rose-900/60',
    cardClass: 'bg-rose-900/35 border-rose-800/50 hover:border-amber-400/40',
    previewBg: 'bg-gradient-to-tr from-rose-950 via-amber-950 to-rose-900',
    accentColor: 'rose-500',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  violet: {
    id: 'violet',
    nameAr: 'الأرجواني الملكي 🔮',
    nameEn: 'Royal Violet',
    isDark: true,
    bgGradient: 'bg-purple-950 text-purple-100',
    panelClass: 'bg-purple-950/75 border-purple-900/60',
    cardClass: 'bg-purple-900/35 border-purple-800/50 hover:border-indigo-400/40',
    previewBg: 'bg-gradient-to-tr from-purple-950 via-indigo-950 to-purple-900',
    accentColor: 'purple-500',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  amber: {
    id: 'amber',
    nameAr: 'الذهب الأسود ⚡',
    nameEn: 'Cyber Gold & Obsidian',
    isDark: true,
    bgGradient: 'bg-zinc-950 text-amber-100',
    panelClass: 'bg-zinc-900/80 border-amber-500/30',
    cardClass: 'bg-zinc-900/50 border-zinc-800 hover:border-amber-400/50',
    previewBg: 'bg-gradient-to-tr from-black via-zinc-900 to-amber-950',
    accentColor: 'amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  light: {
    id: 'light',
    nameAr: 'الصباح المشرق ☀️',
    nameEn: 'Crisp Morning Light',
    isDark: false,
    bgGradient: 'bg-slate-50 text-slate-900',
    panelClass: 'bg-white/85 border-slate-200 shadow-sm',
    cardClass: 'bg-slate-100/90 border-slate-200 hover:border-indigo-400/50 shadow-sm',
    previewBg: 'bg-gradient-to-tr from-slate-100 via-indigo-50 to-white',
    accentColor: 'indigo-600',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
};
