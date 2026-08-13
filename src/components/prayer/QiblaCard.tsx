import React from 'react';
import { Compass } from 'lucide-react';
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
    <div className="glass-card border rounded-3xl p-5 flex items-center gap-5 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 h-full">
      {/* Compass Arrow */}
      <div className="relative flex-shrink-0 w-20 h-20">
        {/* Compass background ring */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 bg-amber-500/5 flex items-center justify-center">
          <Compass className="w-8 h-8 text-amber-400/60" />
        </div>
        {/* Qibla direction arrow */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `rotate(${qiblaDirection}deg)` }}
        >
          <div className="w-1 h-8 rounded-full bg-gradient-to-t from-amber-500 to-emerald-400 shadow-lg" style={{ transformOrigin: 'bottom center', marginTop: '-8px' }} />
        </div>
        {/* Kaaba emoji at tip */}
        <div
          className="absolute inset-0 flex items-start justify-center pt-1"
          style={{ transform: `rotate(${qiblaDirection}deg)` }}
        >
          <span className="text-xs" style={{ transform: `rotate(-${qiblaDirection}deg)` }}>🕋</span>
        </div>
      </div>

      {/* Text info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-amber-400/80 mb-1">
          {isAr ? 'اتجاه القبلة نحو مكة المكرمة' : 'Qibla Direction to Mecca'}
        </p>
        <p className="text-2xl font-black text-slate-100 leading-tight">
          {qiblaDirection}°
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
          {isAr ? `من ${locationName}` : `From ${locationName}`}
        </p>
      </div>

      {/* Kaaba Icon large */}
      <div className="text-4xl select-none hidden sm:block">🕋</div>
    </div>
  );
};
