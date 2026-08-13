import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { PrayerConflictAlert } from '../../types';
import { useApp } from '../../context/AppContext';

interface ConflictBannerProps {
  conflicts: PrayerConflictAlert[];
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({ conflicts }) => {
  const { settings } = useApp();
  const isAr = settings.language !== 'en';

  if (!conflicts || conflicts.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="space-y-3">
        {conflicts.map((c, i) => (
          <motion.div
            key={`${c.lessonId}_${c.prayerName}_${i}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/50 text-amber-100 glass-panel shadow-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/25 text-amber-300 border border-amber-500/40 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>

              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-amber-100 flex items-center gap-2">
                  {c.isOverlapping ? (
                    <span>{isAr ? '⚠️ تعارض زمني مباشر: الدرس يتداخل مع موعد الصلاة!' : '⚠️ Prayer Conflict: Class overlaps with prayer time!'}</span>
                  ) : (
                    <span>{isAr ? '⏱️ تنبيه قرب موعد الصلاة من المحاضرة' : '⏱️ Class starts close to prayer time'}</span>
                  )}
                </h4>

                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {c.isOverlapping ? (
                    isAr ? (
                      <span>
                        محاضرة <strong className="text-amber-100 font-extrabold">{c.lessonSubject}</strong> ({c.lessonStartTime} - {c.lessonEndTime}) تتداخل مباشرة مع وقت صلاة <strong className="text-amber-100 font-extrabold">{c.prayerArabicName}</strong> ({c.prayerTime}).
                      </span>
                    ) : (
                      <span>
                        Class <strong className="text-amber-100 font-extrabold">{c.lessonSubject}</strong> ({c.lessonStartTime} - {c.lessonEndTime}) directly overlaps with <strong className="text-amber-100 font-extrabold">{c.prayerName}</strong> prayer ({c.prayerTime}).
                      </span>
                    )
                  ) : (
                    isAr ? (
                      <span>
                        محاضرة <strong className="text-amber-100 font-extrabold">{c.lessonSubject}</strong> ({c.lessonStartTime}) تبدأ أو تنتهي خلال <strong className="text-amber-100 font-extrabold">{c.diffMinutes} دقيقة</strong> من صلاة <strong className="text-amber-100 font-extrabold">{c.prayerArabicName}</strong> ({c.prayerTime}).
                      </span>
                    ) : (
                      <span>
                        Class <strong className="text-amber-100 font-extrabold">{c.lessonSubject}</strong> ({c.lessonStartTime}) is within <strong className="text-amber-100 font-extrabold">{c.diffMinutes} mins</strong> of <strong className="text-amber-100 font-extrabold">{c.prayerName}</strong> prayer ({c.prayerTime}).
                      </span>
                    )
                  )}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-bold whitespace-nowrap shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {c.isOverlapping ? (isAr ? 'تداخل أثناء الدرس ⚠️' : 'Overlaps Class ⚠️') : (isAr ? `فارق ${c.diffMinutes} دقيقة ⏱️` : `${c.diffMinutes}m diff ⏱️`)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};
