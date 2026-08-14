import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  Sparkles, 
  CheckCircle2, 
  Laptop, 
  Compass, 
  Layers,
  Zap,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils/haptics';

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

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const [activePlatformTab, setActivePlatformTab] = useState<'android' | 'ios' | 'desktop'>(
    isIOS ? 'ios' : isMobile ? 'android' : 'desktop'
  );

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    haptic.medium();
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast(isAr ? 'تم تثبيت تطبيق يسطا ذاكر بنجاح! 🎉' : 'Yasta Zakir installed successfully! 🎉', 'success');
          onInstalled();
          onClose();
        }
      } catch (err) {
        console.error('Install prompt error:', err);
        onClose();
      }
    } else {
      showToast(
        isAr 
          ? '💡 يمكنك التثبيت مباشرة من قائمة المتصفح (Add to Home Screen)' 
          : '💡 You can install from browser menu: Add to Home Screen', 
        'info'
      );
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg transform rounded-3xl p-5 sm:p-7 text-start shadow-2xl relative border my-auto max-h-[92vh] flex flex-col justify-between overflow-y-auto"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            color: 'var(--text-color)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-2 rounded-full hover:bg-slate-700/40 transition-colors z-20 text-slate-400 hover:text-white`}
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            {/* Header */}
            <div className="text-center mb-5 pt-1">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 text-3xl">
                🎓
              </div>
              <h3 className="text-xl sm:text-2xl font-black flex items-center justify-center gap-2">
                <span>{isAr ? 'تثبيت تطبيق «يسطا ذاكر»' : 'Install Yasta Zakir App'}</span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                {isAr 
                  ? 'ثبّت التطبيق على شاشة جهازك كـ تطبيق رسمي خفيف وسريع وبدون أي متجر!' 
                  : 'Install as an instant, standalone native-like web app without app stores!'}
              </p>
            </div>

            {/* Platform Switcher Tabs */}
            <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-5 gap-1">
              <button
                onClick={() => {
                  haptic.light();
                  setActivePlatformTab('android');
                }}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activePlatformTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isAr ? 'أندرويد / كروم' : 'Android'}</span>
              </button>

              <button
                onClick={() => {
                  haptic.light();
                  setActivePlatformTab('ios');
                }}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activePlatformTab === 'ios'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isAr ? 'آيفون (iOS)' : 'iPhone / iPad'}</span>
              </button>

              <button
                onClick={() => {
                  haptic.light();
                  setActivePlatformTab('desktop');
                }}
                className={`flex-1 py-1.5 sm:py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activePlatformTab === 'desktop'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>{isAr ? 'كمبيوتر / لابتوب' : 'Desktop / PC'}</span>
              </button>
            </div>

            {/* Instant 1-Click Install Banner (if deferredPrompt available) */}
            {deferredPrompt && (
              <div className="mb-5">
                <button
                  onClick={handleDirectInstall}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>{isAr ? 'تثبيت فوري بلمسة واحدة 📲' : '1-Click Instant Install 📲'}</span>
                </button>
              </div>
            )}

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-slate-200">{isAr ? 'سرعة فائقة وفتح فوري' : 'Lightning fast 1-tap launch'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-200">{isAr ? 'يعمل بالكامل بدون إنترنت' : 'Works 100% Offline'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Bell className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-slate-200">{isAr ? 'تنبيهات الأذان والحصص' : 'Adhan & lesson alerts'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="font-semibold text-slate-200">{isAr ? 'حجم خفيف جداً وموفر للبطارية' : 'Ultralight & battery friendly'}</span>
              </div>
            </div>

            {/* Platform-Specific Step by Step Instructions */}
            <div className="mb-5">
              {activePlatformTab === 'ios' && (
                <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 space-y-2.5 text-xs text-indigo-200">
                  <p className="font-black flex items-center gap-2 text-white">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>{isAr ? 'خطوات تثبيت الآيفون والآيباد (متصفح Safari):' : 'How to install on iPhone & iPad (Safari):'}</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed text-slate-300">
                    <li>
                      {isAr ? 'افتح الموقع في متصفح' : 'Open in'} <strong className="text-white">Safari</strong> {isAr ? 'واضغط على زر المشاركة' : 'and tap'} <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-300" /> {isAr ? 'في الأسفل.' : 'at the bottom.'}
                    </li>
                    <li>
                      {isAr ? 'مرر القائمة لأسفل واختر' : 'Scroll down and tap'} <strong className="text-white">"{isAr ? 'إضافة إلى الشاشة الرئيسية (Add to Home Screen)' : 'Add to Home Screen'}"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-indigo-300" />.
                    </li>
                    <li>
                      {isAr ? 'اضغط على' : 'Tap'} <strong className="text-emerald-400">"{isAr ? 'إضافة (Add)' : 'Add'}"</strong> {isAr ? 'في أعلى الزاوية ليظهر التطبيق في شاشتك!' : 'in the top corner.'}
                    </li>
                  </ol>
                </div>
              )}

              {activePlatformTab === 'android' && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-2.5 text-xs text-emerald-200">
                  <p className="font-black flex items-center gap-2 text-white">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'خطوات تثبيت هواتف الأندرويد (Chrome):' : 'How to install on Android (Chrome):'}</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed text-slate-300">
                    <li>
                      {isAr ? 'اضغط على قائمة النقاط الثلاث' : 'Tap the three-dots menu'} <strong className="text-white">(⋮)</strong> {isAr ? 'في أعلى أو أسفل المتصفح.' : 'in Chrome.'}
                    </li>
                    <li>
                      {isAr ? 'اختر' : 'Select'} <strong className="text-white">"{isAr ? 'تثبيت التطبيق (Install app)' : 'Install app'}"</strong> {isAr ? 'أو' : 'or'} <strong className="text-white">"{isAr ? 'إضافة إلى الشاشة الرئيسية' : 'Add to Home screen'}"</strong>.
                    </li>
                    <li>
                      {isAr ? 'اضغط "تثبيت" وسيتم إضافة أيقونة يسطا ذاكر فوراً!' : 'Tap "Install" to place the app on your home screen!'}
                    </li>
                  </ol>
                </div>
              )}

              {activePlatformTab === 'desktop' && (
                <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 space-y-2.5 text-xs text-purple-200">
                  <p className="font-black flex items-center gap-2 text-white">
                    <Laptop className="w-4 h-4 text-purple-400" />
                    <span>{isAr ? 'خطوات التثبيت على الكمبيوتر (Chrome / Edge):' : 'How to install on Computer (Chrome / Edge):'}</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed text-slate-300">
                    <li>
                      {isAr ? 'انظر إلى شريط العنوان (URL) في الأعلى.' : 'Look at your browser address bar at the top.'}
                    </li>
                    <li>
                      {isAr ? 'اضغط على أيقونة التثبيت' : 'Click the Install icon'} <Download className="w-3.5 h-3.5 inline mx-1 text-purple-300" /> {isAr ? 'الموجودة في أقصى يمين أو يسار شريط العنوان.' : 'inside the address bar.'}
                    </li>
                    <li>
                      {isAr ? 'اختر "تثبيت (Install)" وسيفتح كتطبيق مستقل على سطح المكتب!' : 'Click "Install" to launch as a dedicated desktop app!'}
                    </li>
                  </ol>
                </div>
              )}
            </div>

          </div>

          {/* Footer Action */}
          <div className="pt-2">
            {!deferredPrompt && (
              <button
                onClick={handleDirectInstall}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تثبيت التطبيق 📲' : 'Install App 📲'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
