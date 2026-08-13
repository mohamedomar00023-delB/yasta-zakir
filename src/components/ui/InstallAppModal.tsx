import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Download, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}) => {
  const { settings, showToast } = useApp();
  const isAr = settings.language !== 'en';

  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast(isAr ? 'شكراً لتثبيت تطبيق يسطا ذاكر! 🎉' : 'Thanks for installing Yasta Zakir! 🎉', 'success');
          onInstalled();
          onClose();
        }
      } catch {
        onClose();
      }
    } else {
      showToast(isAr ? 'يمكنك تثبيت التطبيق من خيارات المتصفح (Add to Home Screen)' : 'Use browser menu to Add to Home Screen', 'info');
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-3 sm:p-4 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md transform rounded-3xl p-5 sm:p-6 text-start shadow-2xl relative border my-auto max-h-[88vh] flex flex-col justify-between overflow-y-auto"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-color)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-2 rounded-full hover:bg-slate-700/40 transition-colors z-20`}
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div>
            {/* Header */}
            <div className="text-center mb-4 pt-1">
              <div className="w-13 h-13 mx-auto mb-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 text-2xl">
                📲
              </div>
              <h3 className="text-lg sm:text-xl font-black flex items-center justify-center gap-1.5">
                <span>{isAr ? 'تثبيت تطبيق «يسطا ذاكر»' : 'Install Yasta Zakir App'}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {isAr ? 'ثبّت التطبيق على شاشة هاتفك أو جهازك للوصول الفوري والعمل بدون إنترنت!' : 'Install on your Home Screen for instant 1-tap offline access!'}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-200">{isAr ? 'يعمل بدون إنترنت وفي أي وقت (Full Offline)' : 'Works 100% Offline anytime'}</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-200">{isAr ? 'تشغيل فوري بلمسة واحدة كأي تطبيق هاتف' : 'Instant 1-tap launch without browser tabs'}</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-200">{isAr ? 'تنبيهات صوتية حية بالأذان والحصص' : 'Real-time audio adhan & class alerts'}</span>
              </div>
            </div>
          </div>

          {/* Action or iOS Guidance */}
          <div>
            {isIOS ? (
              <div className="p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 space-y-2 text-xs text-indigo-200">
                <p className="font-bold flex items-center gap-1.5 text-white">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'خطوات التثبيت على الآيفون (iOS Safari):' : 'Installation on iPhone / iPad:'}</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-300">
                  <li>{isAr ? 'اضغط على زر المشاركة' : 'Tap the Share button'} <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-300" /> {isAr ? 'في أسفل المتصفح.' : 'at the bottom of Safari.'}</li>
                  <li>{isAr ? 'مرر للأسفل واضغط' : 'Scroll down and tap'} <strong className="text-white">"{isAr ? 'إضافة إلى الشاشة الرئيسية' : 'Add to Home Screen'}"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-indigo-300" />.</li>
                  <li>{isAr ? 'اضغط "إضافة (Add)" في أعلى الشاشة.' : 'Tap "Add" in top right corner.'}</li>
                </ol>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تثبيت التطبيق الآن 📲' : 'Install App Now 📲'}</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-center space-y-2">
                <p className="text-slate-300 text-[11px] font-medium">
                  {isAr ? '💡 اضغط على قائمة المتصفح (⋮) ثم اختر «تثبيت التطبيق (Install App)» أو «إضافة للشاشة الرئيسية».' : '💡 Open browser menu (⋮) and choose "Install App" or "Add to Home Screen".'}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {isAr ? 'حسناً، فهمت' : 'Got it'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
