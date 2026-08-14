import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PrayerItem } from '../types';
import { playAdhan, playNotificationSound, playUrgentAlert, playWarningAlert } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { timeToMinutes } from '../utils/formatters';

interface UseNotificationsProps {
  prayers: PrayerItem[];
}

export function useNotifications({ prayers }: UseNotificationsProps) {
  const { lessons, tasks, prayersCompleted, lessonCompletions, settings, updateSettings, showToast } = useApp();
  const notifiedEventsRef = useRef<Set<string>>(new Set());

  // Request browser notifications permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      showToast('المتصفح لا يدعم إشعارات سطح المكتب', 'warning');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ notificationsEnabled: true });
        showToast('تم تفعيل إشعارات المتصفح الفورية بنجاح! 🔔', 'success');
        return true;
      } else {
        updateSettings({ notificationsEnabled: false });
        showToast('تم رفض إذن الإشعارات من قبل المتصفح', 'warning');
        return false;
      }
    } catch (err) {
      console.error('Notification permission error:', err);
      return false;
    }
  };

  // Helper to trigger browser notification
  const triggerNotification = (title: string, body: string, icon: string = '🎓') => {
    if ('Notification' in window && Notification.permission === 'granted' && settings.notificationsEnabled) {
      try {
        new Notification(title, {
          body,
          icon: '/app-icon.svg',
          badge: '/app-icon.svg',
          tag: title,
        });
      } catch (err) {
        console.warn('Native notification trigger notice:', err);
      }
    }
  };

  // Check loop every 10 seconds for high precision
  useEffect(() => {
    const checkScheduleAndNotify = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();
      const currentTotalMins = currentHours * 60 + currentMins;
      const todayStr = now.toISOString().split('T')[0];

      // ==========================================
      // 1. PRAYER NOTIFICATIONS & REMINDERS
      // ==========================================
      prayers.forEach(prayer => {
        const prayerMins = timeToMinutes(prayer.time);
        const diff = prayerMins - currentTotalMins; // >0 is before, 0 is now, <0 is passed

        // A. 15 Minutes before Adhan
        const prePrayerKey = `${todayStr}_prayer_pre15_${prayer.name}`;
        if (diff === 15 && !notifiedEventsRef.current.has(prePrayerKey)) {
          notifiedEventsRef.current.add(prePrayerKey);
          if (settings.soundEnabled) {
            playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume ?? 0.8, undefined, {
              quietHours: settings.quietHoursEnabled ?? true,
            });
          }
          haptic.notification();
          showToast(`⏳ اقتراب وقت الصلاة: باقي 15 دقيقة على أذان صلاة ${prayer.arabicName} 🕌`, 'info');
          triggerNotification(`🕌 اقتراب وقت صلاة ${prayer.arabicName}`, `باقي 15 دقيقة على موعد أذان ${prayer.arabicName}. استعد للوضوء والصلاة!`, '🕌');
        }

        // B. Exact Prayer Time (Adhan Arrival)
        const adhanKey = `${todayStr}_prayer_exact_${prayer.name}`;
        if (diff >= 0 && diff <= 1 && !notifiedEventsRef.current.has(adhanKey)) {
          notifiedEventsRef.current.add(adhanKey);
          if (settings.soundEnabled) {
            playAdhan(settings.adhanSound || 'makkah', settings.volume ?? 0.8, undefined, {
              gentleFadeIn: settings.gentleFadeIn ?? true,
              quietHours: settings.quietHoursEnabled ?? true,
            });
          }
          haptic.prayer();
          showToast(`🕌 حان الآن موعد أذان صلاة ${prayer.arabicName}! أرحنا بها يا بلال ✨`, 'success');
          triggerNotification(
            `🕌 حان الآن أذان صلاة ${prayer.arabicName}`,
            `أرحنا بها يا بلال.. حان موعد صلاة ${prayer.arabicName} حسب توقيتك المحلي.`,
            '🕌'
          );
        }

        // C. +20 Minutes Overdue Post-Prayer Reminder (if not yet marked fulfilled)
        const postPrayerKey = `${todayStr}_prayer_post20_${prayer.name}`;
        const isPrayed = prayersCompleted[`${todayStr}_${prayer.name}`];
        if (diff === -20 && !isPrayed && !notifiedEventsRef.current.has(postPrayerKey)) {
          notifiedEventsRef.current.add(postPrayerKey);
          if (settings.soundEnabled) playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume ?? 0.8);
          haptic.notification();
          showToast(`✨ تذكير الفرض: هل أديت صلاة ${prayer.arabicName}؟ علم عليها لتسجيل نقاطك! 🤲`, 'info');
          triggerNotification(`✨ تذكير صلاة ${prayer.arabicName}`, `مر 20 دقيقة على أذان ${prayer.arabicName}، سجل أداء الفرض لزيادة مستواك!`, '🤲');
        }
      });

      // ==========================================
      // 2. LESSON NOTIFICATIONS & ESCALATIONS
      // ==========================================
      const todayLessons = lessons.filter(l => l.days.includes(currentDay));
      todayLessons.forEach(lesson => {
        const startMins = timeToMinutes(lesson.startTime);
        const diff = startMins - currentTotalMins;

        // A. 30 Minutes Before Lesson
        const key30 = `${todayStr}_lesson_30m_${lesson.id}`;
        if (diff === 30 && !notifiedEventsRef.current.has(key30)) {
          notifiedEventsRef.current.add(key30);
          if (settings.soundEnabled) playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume ?? 0.8);
          haptic.notification();
          showToast(`📚 تذكير مبكر: درس «${lesson.subject}» بعد 30 دقيقة (${lesson.startTime})`, 'info');
          triggerNotification(`📚 موعد درس قادم: ${lesson.subject}`, `سيبدأ درس ${lesson.subject} بعد نصف ساعة.`, '📚');
        }

        // B. 15 Minutes Before Lesson
        const key15 = `${todayStr}_lesson_15m_${lesson.id}`;
        if (diff === 15 && !notifiedEventsRef.current.has(key15)) {
          notifiedEventsRef.current.add(key15);
          if (settings.soundEnabled) playWarningAlert();
          haptic.warning();
          showToast(`⚡ استعد: درس «${lesson.subject}» يبدأ بعد 15 دقيقة! (${lesson.startTime})`, 'info');
          triggerNotification(`⚡ درس ${lesson.subject} بعد 15 دقيقة`, `تأهب وجهز كتبك لدرس ${lesson.subject} (${lesson.startTime}).`, '⚡');
        }

        // C. 5 Minutes Before Lesson (Urgent Countdown)
        const key5 = `${todayStr}_lesson_5m_${lesson.id}`;
        if (diff === 5 && !notifiedEventsRef.current.has(key5)) {
          notifiedEventsRef.current.add(key5);
          if (settings.soundEnabled) playUrgentAlert();
          haptic.alarm();
          showToast(`🔥 عاجل: باقي 5 دقائق فقط على بدء درس «${lesson.subject}»! 🏃‍♂️`, 'warning');
          triggerNotification(`🔥 باقي 5 دقائق فقط: ${lesson.subject}`, `الدرس على وشك البدء الآن! جهز مكانك وركز.`, '🔥');
        }

        // D. Exact Start Time (0 mins)
        const key0 = `${todayStr}_lesson_now_${lesson.id}`;
        if (diff >= 0 && diff <= 1 && !notifiedEventsRef.current.has(key0)) {
          notifiedEventsRef.current.add(key0);
          if (settings.soundEnabled) playWarningAlert();
          haptic.medium();
          showToast(`🔔 بدأ درس «${lesson.subject}» الآن! بالتوفيق والتركيز 🎓`, 'success');
          triggerNotification(`🔔 بدأ درس ${lesson.subject}`, `بدأ موعد المحاضرة الآن (${lesson.startTime}). بالتوفيق يا بطل!`, '🎓');
        }

        // E. +15 Minutes Overdue Attendance Check
        const keyAttendance = `${todayStr}_lesson_att15_${lesson.id}`;
        const isAttended = lessonCompletions[`${todayStr}_${lesson.id}`];
        if (diff === -15 && !isAttended && !notifiedEventsRef.current.has(keyAttendance)) {
          notifiedEventsRef.current.add(keyAttendance);
          if (settings.soundEnabled) playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume ?? 0.8);
          haptic.notification();
          showToast(`✍️ تذكير الحضور: هل حضرت درس «${lesson.subject}»؟ سجل حضورك بالتطبيق!`, 'info');
          triggerNotification(`✍️ تسجيل حضور: ${lesson.subject}`, `مر 15 دقيقة على بداية الدرس، أكد حضورك لزيادة نقاط خبرتك!`, '✍️');
        }
      });

      // ==========================================
      // 3. TASKS & ASSIGNMENTS ESCALATION ALERTS
      // ==========================================
      tasks.forEach(task => {
        if (task.completed || !task.dueDate) return;

        // Check if task is for today
        if (task.dueDate === todayStr && task.dueTime) {
          const dueMins = timeToMinutes(task.dueTime);
          const diff = dueMins - currentTotalMins;

          // A. 60 Minutes Before Due Date (1 Hour Reminder)
          const task60Key = `${todayStr}_task_60m_${task.id}`;
          if (diff === 60 && !notifiedEventsRef.current.has(task60Key)) {
            notifiedEventsRef.current.add(task60Key);
            if (settings.soundEnabled) playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume ?? 0.8);
            haptic.notification();
            showToast(`📌 تذكير واجب: باقي ساعة على تسليم واجب «${task.title}» (${task.dueTime})`, 'info');
            triggerNotification(`📌 تذكير بمهمة: ${task.title}`, `موعد التسليم بعد ساعة (${task.dueTime}). أنجز المطلوب في الوقت!`, '📌');
          }

          // B. 30 Minutes Before Due Date
          const task30Key = `${todayStr}_task_30m_${task.id}`;
          if (diff === 30 && !notifiedEventsRef.current.has(task30Key)) {
            notifiedEventsRef.current.add(task30Key);
            if (settings.soundEnabled) playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume ?? 0.8);
            haptic.notification();
            showToast(`⚡ اقتراب الموعد: باقي 30 دقيقة على تسليم «${task.title}»!`, 'info');
            triggerNotification(`⚡ باقي 30 دقيقة: ${task.title}`, `يقترب موعد تسليم الواجب (${task.dueTime}). راجع إجاباتك!`, '⚡');
          }

          // C. 15 Minutes Before Due Date
          const task15Key = `${todayStr}_task_15m_${task.id}`;
          if (diff === 15 && !notifiedEventsRef.current.has(task15Key)) {
            notifiedEventsRef.current.add(task15Key);
            if (settings.soundEnabled) playWarningAlert();
            haptic.warning();
            showToast(`⏳ إنذار واجب: باقي 15 دقيقة فقط على انتهاء موعد «${task.title}»!`, 'warning');
            triggerNotification(`⏳ باقي 15 دقيقة فقط!`, `مهمة ${task.title} تقترب من الموعد النهائي (${task.dueTime})!`, '⏳');
          }

          // D. 5 Minutes Before (Critical Urgent Alarm Alert)
          const task5Key = `${todayStr}_task_5m_${task.id}`;
          if (diff === 5 && !notifiedEventsRef.current.has(task5Key)) {
            notifiedEventsRef.current.add(task5Key);
            if (settings.soundEnabled) playUrgentAlert();
            haptic.alarm();
            showToast(`🔥 إنذار أخير عاجل: باقي 5 دقائق فقط على تسليم «${task.title}»! سلم الآن! 🚨`, 'warning');
            triggerNotification(`🚨 إنذار أخير (5 دقائق): ${task.title}`, `فاضل 5 دقائق فقط على موعد التسليم النهائي! سلم حالاً!`, '🚨');
          }

          // E. At Due Time (0 mins)
          const taskNowKey = `${todayStr}_task_now_${task.id}`;
          if (diff >= 0 && diff <= 1 && !notifiedEventsRef.current.has(taskNowKey)) {
            notifiedEventsRef.current.add(taskNowKey);
            if (settings.soundEnabled) playUrgentAlert();
            haptic.alarm();
            showToast(`⏰ حان موعد تسليم الواجب: «${task.title}»! أكد إتمامه لتحصيل الـ XP!`, 'warning');
            triggerNotification(`⏰ حان الموعد الآن: ${task.title}`, `انتهى وقت تسليم ${task.title}. افتح التطبيق وعلم على المهمة كمكتملة!`, '⏰');
          }

          // F. +10 Minutes Overdue Reminder
          const taskOverdue10Key = `${todayStr}_task_overdue10_${task.id}`;
          if (diff === -10 && !notifiedEventsRef.current.has(taskOverdue10Key)) {
            notifiedEventsRef.current.add(taskOverdue10Key);
            if (settings.soundEnabled) playUrgentAlert();
            haptic.warning();
            showToast(`⚠️ مهمة متأخرة: مضى 10 دقائق على موعد «${task.title}»! متنساش تخلصه!`, 'warning');
            triggerNotification(`⚠️ مهمة متأخرة: ${task.title}`, `فات 10 دقائق على موعد التسليم المحدد. شد حيلك وخلصه!`, '⚠️');
          }

          // G. +30 Minutes Overdue Escalation
          const taskOverdue30Key = `${todayStr}_task_overdue30_${task.id}`;
          if (diff === -30 && !notifiedEventsRef.current.has(taskOverdue30Key)) {
            notifiedEventsRef.current.add(taskOverdue30Key);
            if (settings.soundEnabled) playUrgentAlert();
            haptic.alarm();
            showToast(`🚨 تنبيه تأخير: فات 30 دقيقة على واجب «${task.title}»! انجزه وحافظ على مستواك!`, 'warning');
            triggerNotification(`🚨 تأخير 30 دقيقة: ${task.title}`, `الواجب متأخر! خلصه الآن عشان تحافظ على ترتيبك ونقاطك.`, '🚨');
          }
        }
      });
    };

    // Run immediately on mount and then every 10 seconds
    checkScheduleAndNotify();
    const interval = setInterval(checkScheduleAndNotify, 10000);

    return () => clearInterval(interval);
  }, [prayers, lessons, tasks, prayersCompleted, lessonCompletions, settings, showToast]);

  return {
    requestPermission,
  };
}
