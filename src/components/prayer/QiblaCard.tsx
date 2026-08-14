import React from 'react';
import { Compass, Navigation, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QiblaCardProps {
  qiblaDirection: number | null;
  locationName: string;
}

export const QiblaCard: React.FC<QiblaCardProps> = ({ qiblaDirection, locationName }) => {
  const { settings } = useApp();
  const isAr = settings.language !== 'en';

  if (qiblaDirection === null) return null;

  return (
    <div className="glass-card border rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/80 shadow-xl relative overflow-hidden h-full">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Compass Dial */}
      <div className="relative shrink-0 w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 bg-slate-950/80 flex items-center justify-center shadow-inner">
          <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600" />
        </div>
        
        {/* Dynamic Arrow pointing to Qibla */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${qiblaDirection}deg)` }}
        >
          <div className="w-1.5 h-7 rounded-full bg-gradient-to-t from-amber-400 to-emerald-400 shadow-md shadow-amber-400/50" style={{ transformOrigin: 'bottom center', marginTop: '-12px' }} />
        </div>

        {/* Center Pivot Point */}
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 z-10 shadow-sm" />
      </div>

      {/* Text Details */}
      <div className="flex-1 min-w-0 space-y-0.5 text-start">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'اتجاه القبلة الشريفة' : 'Qibla Direction'}</span>
        </div>

        <p className="text-xl sm:text-2xl font-black text-white font-mono leading-none pt-0.5">
          {Math.round(qiblaDirection)}° <span className="text-xs font-sans text-slate-400 font-normal">{isAr ? 'درجة' : 'deg'}</span>
        </p>

        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
          <span className="truncate">{locationName}</span>
        </p>
      </div>

      <div className="text-2xl sm:text-3xl shrink-0 select-none opacity-80">
        🕋
      </div>
    </div>
  );
};
