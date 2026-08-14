import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PrayerItem } from '../types';
import { playAdhan, playNotificationSound } from '../utils/sound';
import { timeToMinutes } from '../utils/formatters';

interface UseNotificationsProps {
  prayers: PrayerItem[];
}

export function useNotifications({ prayers }: UseNotificationsProps) {
  const { lessons, tasks, settings, updateSettings, showToast, t } = useApp();
  const notifiedPrayersRef = useRef<Set<string>>(new Set());
  const notifiedLessonsRef = useRef<Set<string>>(new Set());
  const notifiedTasksRef = useRef<Set<string>>(new Set());

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
        showToast('تم تفعيل إشعارات المتصفح بنجاح! 🔔', 'success');
        return true;
      } else {
        updateSettings({ notificationsEnabled: false });
        showToast('تم رفض إذن الإشعارات من قبل المتصفح', 'warning');
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Helper to trigger browser notification
  const triggerNotification = (title: string, body: string, icon: string = '🕌') => {
    if ('Notification' in window && Notification.permission === 'granted' && settings.notificationsEnabled) {
      new Notification(title, {
        body,
        icon: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${icon}</text></svg>`,
      });
    }
  };

  // Check loop every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();
      const currentTotalMins = currentHours * 60 + currentMins;
      const todayStr = now.toISOString().split('T')[0];

      // 1. Prayer Notifications
      prayers.forEach(prayer => {
        const prayerMins = timeToMinutes(prayer.time);
        const diff = prayerMins - currentTotalMins;
        const key = `${todayStr}_${prayer.name}`;

        // When prayer time arrives (within 1 minute window)
        if (diff >= 0 && diff <= 1 && !notifiedPrayersRef.current.has(key)) {
          notifiedPrayersRef.current.add(key);

          // Play sound if enabled
          if (settings.soundEnabled) {
            playAdhan(settings.adhanSound || 'makkah', settings.volume ?? 0.8);
          }

          triggerNotification(
            `🕌 حان الآن موعد صلاة ${prayer.arabicName}`,
            `أرحنا بها يا بلال.. حان موعد صلاة ${prayer.arabicName} حسب التوقيت المحلي.`,
            '🕌'
          );
        }
      });

      // 2. Lesson Reminders
      const todayLessons = lessons.filter(l => l.days.includes(currentDay));
      todayLessons.forEach(lesson => {
        const startMins = timeToMinutes(lesson.startTime);
        const reminderWindow = settings.reminderMinutesBeforeLesson || 15;
        const diff = startMins - currentTotalMins;
        const key = `${todayStr}_${lesson.id}_${reminderWindow}`;

        if (diff >= reminderWindow - 1 && diff <= reminderWindow && !notifiedLessonsRef.current.has(key)) {
          notifiedLessonsRef.current.add(key);

          if (settings.soundEnabled) {
            playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume ?? 0.8);
          }

          triggerNotification(
            `📚 تنبيه موعد درس: ${lesson.subject}`,
            `سيبدأ درس ${lesson.subject} بعد ${reminderWindow} دقيقة (${lesson.startTime}).`,
            '📚'
          );
        }
      });

      // 3. Task Reminders with dynamic interval
      const taskWindow = settings.reminderMinutesBeforeTask || 30;
      tasks.forEach(task => {
        if (task.completed || !task.dueDate) return;
        if (task.dueDate === todayStr && task.dueTime) {
          const dueMins = timeToMinutes(task.dueTime);
          const diff = dueMins - currentTotalMins;
          const key = `${todayStr}_${task.id}_${taskWindow}`;

          if (diff >= taskWindow - 1 && diff <= taskWindow && !notifiedTasksRef.current.has(key)) {
            notifiedTasksRef.current.add(key);

            if (settings.soundEnabled) {
              playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume ?? 0.8);
            }

            triggerNotification(
              `📌 تذكير مهمة: ${task.title}`,
              `يقترب موعد تسليم الواجب خلال ${taskWindow} دقيقة! (${task.dueTime})`,
              '📌'
            );
          }
        }
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [prayers, lessons, tasks, settings, t]);

  return {
    requestPermission,
  };
}

