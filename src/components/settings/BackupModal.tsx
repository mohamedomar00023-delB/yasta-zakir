import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, Database, Volume2, Bell, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/formatters';
import { playNotificationSound, stopActiveAudio } from '../../utils/sound';

export const BackupModal: React.FC = () => {
  const {
    isBackupModalOpen,
    setIsBackupModalOpen,
    exportBackupData,
    importBackupData,
    resetAllData,
    settings,
    updateSettings,
    showToast,
  } = useApp();

  const isAr = settings.language !== 'en';
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isBackupModalOpen) return null;

  const handleExport = () => {
    const data = exportBackupData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yasta_zakir_backup_${getTodayDateString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(isAr ? 'تم تصدير النسخة الاحتياطية بنجاح 📦' : 'Backup exported successfully 📦', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const success = importBackupData(parsed);
        if (success) {
          setIsBackupModalOpen(false);
        }
      } catch (err) {
        console.error(err);
        showToast(isAr ? 'ملف التصدير غير صالح أو تالف' : 'Invalid or corrupted backup file', 'warning');
      }
    };
    reader.readAsText(file);
  };

  const handleSoundTest = () => {
    playNotificationSound(settings.notificationSound || 'soft-bell', settings.volume);
    showToast(isAr ? 'جاري تشغيل نغمة التنبيهات المختارة 🔊' : 'Playing selected notification tone 🔊', 'info');
  };

  const handleNotificationToggle = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        updateSettings({ notificationsEnabled: true });
        showToast(isAr ? 'تم تفعيل إشعارات المتصفح بنجاح 🔔' : 'Browser notifications enabled 🔔', 'success');
        
        // Trigger immediate test notification
        new Notification(isAr ? '🕌 يسطا ذاكر - الإشعارات شغالة بنجاح!' : '🕌 Yasta Zakir - Notifications Active!', {
          body: isAr ? 'أهلاً بك! ستصلك تنبيهات الصلوات ومواعيد المحاضرات والواجبات فورياً.' : 'Welcome! You will receive timely alerts for prayers, classes, and tasks.',
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕌</text></svg>',
        });
      } else {
        showToast(isAr ? 'إذن الإشعارات غير مسموح به في المتصفح' : 'Notifications permission denied', 'warning');
      }
    } else {
      showToast(isAr ? 'المتصفح لا يدعم الإشعارات المباشرة' : 'Browser does not support notifications', 'warning');
    }
  };

  const handleTestInstantNotification = () => {
    if (!('Notification' in window)) {
      showToast(isAr ? 'المتصفح لا يدعم إشعارات النظام' : 'Notifications not supported', 'warning');
      return;
    }

    if (Notification.permission !== 'granted') {
      handleNotificationToggle();
      return;
    }

    new Notification(isAr ? '🔔 تجربة الإشعار الفوري - يسطا ذاكر' : '🔔 Live Notification Test - Yasta Zakir', {
      body: isAr ? 'نظام الإشعارات شغال تمام 100% ويقوم بتنبيهك بمواعيد الصلاة والدروس!' : 'Notification engine is 100% active and will alert you for prayers and classes!',
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>',
    });
    showToast(isAr ? 'تم إرسال إشعار تجريبي فوري لسطح المكتب 🔔' : 'Test notification sent to desktop 🔔', 'success');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            stopActiveAudio();
            setIsBackupModalOpen(false);
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg glass-panel p-5 sm:p-6 rounded-3xl border border-slate-700/60 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto text-start"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
            <h3 className="text-lg font-bold text-slate-100 light:text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'النسخ الاحتياطي والإشعارات' : 'Backup & Notification Controls'}</span>
            </h3>
            <button
              onClick={() => {
                stopActiveAudio();
                setIsBackupModalOpen(false);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Notifications Permissions & Live Test */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'حالة الإشعارات الفورية (Desktop Notifications)' : 'Instant Desktop Notifications'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? 'تنبيهك بصوت الأذان واقتراب موعد المحاضرات والمهام حتى لو المتصفح في الخلفية' : 'Alerts for prayers and classes even when browser is in background.'}
                  </p>
                </div>

                <button
                  onClick={handleNotificationToggle}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs whitespace-nowrap transition-all ${
                    settings.notificationsEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {settings.notificationsEnabled ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {isAr ? 'مفعّلة' : 'Enabled'}</span> : (isAr ? 'تفعيل الإذن 🔔' : 'Enable 🔔')}
                </button>
              </div>

              {/* Instant Test Button */}
              <button
                onClick={handleTestInstantNotification}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'اختبار إرسال إشعار تجريبي لسطح المكتب الآن 🔔' : 'Send Instant Test Notification 🔔'}</span>
              </button>
            </div>

            {/* Sound Test */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200">{isAr ? 'اختبار نغمة التنبيهات والإشعارات' : 'Test Notification Sound'}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'تجربة نغمة الإشعار المختارة حالياً' : 'Play a test preview of your selected notification sound.'}
                </p>
              </div>

              <button
                onClick={handleSoundTest}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs whitespace-nowrap"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isAr ? 'تشغيل الصوت 🔊' : 'Play Test 🔊'}</span>
              </button>
            </div>

            {/* Backup Export */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200">{isAr ? 'تصدير كافة البيانات (JSON)' : 'Export All Data (JSON)'}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'تنزيل نسخة احتياطية تحوي جدول الدروس والمهام والبروفايل للحفظ بأمان' : 'Download a backup file containing your schedule, tasks, notes, and profile.'}
                </p>
              </div>

              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تصدير' : 'Export'}</span>
              </button>
            </div>

            {/* Backup Import */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200">{isAr ? 'استرجاع بيانات من ملف' : 'Restore Data from File'}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'رفع ملف JSON محفوظ سابقاً لاستعادة معلوماتك كاملة' : 'Upload a previously saved JSON backup to restore your data.'}
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                <span>{isAr ? 'استرجاع' : 'Restore'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>

            {/* Reset All Stats & Records */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-rose-300">{isAr ? 'تصفير كافة الحسابات والسجلات' : 'Reset All Stats & Records'}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr ? 'إعادة تعيين نقاط XP، الستريك، سجلات الصلاة، وإنجاز الواجبات للبداية من الصفر' : 'Reset XP points, streaks, prayer logs, and completed tasks to zero.'}
                </p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm(isAr ? 'هل أنت متأكد من تصفير كافة الحسابات ونقاط XP وسجلات الصلاة والبدء من جديد؟' : 'Are you sure you want to reset all calculations, XP points, and prayer logs?')) {
                    resetAllData();
                    setIsBackupModalOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500 text-rose-200 hover:text-white font-bold text-xs whitespace-nowrap transition-all"
              >
                <span>{isAr ? 'تصفير الحسابات 🔄' : 'Reset All 🔄'}</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
