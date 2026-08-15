import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  RefreshCw, 
  ChevronDown, 
  Check, 
  Search, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  Compass
} from 'lucide-react';
import { PrayerItem } from '../../types';
import { formatSecondsToTimer, formatTime12h } from '../../utils/formatters';
import { CALCULATION_METHODS, PRESET_CITIES, PresetCityItem } from '../../utils/presets';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils/haptics';

interface PrayerHeaderCardProps {
  nextPrayer: PrayerItem | null;
  remainingSeconds: number;
  userLocationName: string;
  loading: boolean;
  onRefreshLocation: () => void;
}

function groupByCountry(cities: PresetCityItem[], isAr: boolean): { flag: string; countryLabel: string; cities: PresetCityItem[] }[] {
  const map: Record<string, { flag: string; countryLabel: string; cities: PresetCityItem[] }> = {};
  for (const c of cities) {
    const key = c.country;
    if (!map[key]) map[key] = { flag: c.flag, countryLabel: isAr ? c.countryAr : c.country, cities: [] };
    map[key].cities.push(c);
  }
  return Object.values(map);
}

export const PrayerHeaderCard: React.FC<PrayerHeaderCardProps> = ({
  nextPrayer,
  remainingSeconds,
  userLocationName,
  loading,
  onRefreshLocation,
}) => {
  const { settings, updateSettings, setIsAthkarModalOpen, showToast, t } = useApp();
  const isAr = settings.language !== 'en';

  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [searchCityQuery, setSearchCityQuery] = useState('');
  const [customCityInput, setCustomCityInput] = useState('');

  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { hours, minutes, seconds } = formatSecondsToTimer(remainingSeconds);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isCityMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setIsCityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isCityMenuOpen]);

  const filteredCities = useMemo(() => {
    if (!searchCityQuery.trim()) return PRESET_CITIES;
    const q = searchCityQuery.toLowerCase();
    return PRESET_CITIES.filter(c =>
      c.nameAr.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.countryAr.includes(q) ||
      c.country.toLowerCase().includes(q)
    );
  }, [searchCityQuery]);

  const groupedCities = useMemo(() => groupByCountry(filteredCities, isAr), [filteredCities, isAr]);

  const handleCitySelect = (cityObj: PresetCityItem) => {
    haptic.selection();
    updateSettings({
      selectedCity: cityObj.city,
      selectedCountry: cityObj.country,
      calculationMethod: cityObj.defaultMethod,
      useGeolocation: false,
    });
    setIsCityMenuOpen(false);
    setSearchCityQuery('');
    showToast(isAr ? `تم التحديث إلى ${cityObj.flag} ${cityObj.nameAr}، ${cityObj.countryAr} 📍` : `Location set to ${cityObj.city}, ${cityObj.country} 📍`, 'success');
  };

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCityInput.trim()) return;
    haptic.selection();
    updateSettings({ selectedCity: customCityInput.trim(), selectedCountry: '', useGeolocation: false });
    setIsCityMenuOpen(false);
    setCustomCityInput('');
    showToast(isAr ? `تم تعيين المدينة إلى "${customCityInput.trim()}" 📍` : `City set to "${customCityInput.trim()}" 📍`, 'success');
  };

  const handleUseGeolocation = () => {
    haptic.selection();
    updateSettings({ useGeolocation: true });
    setIsCityMenuOpen(false);
    onRefreshLocation();
    showToast(isAr ? 'جاري تحديد موقعك تلقائياً عبر GPS 🛰️' : 'Detecting GPS location 🛰️', 'info');
  };


  const displayLocationName = useMemo(() => {
    const matchedPreset = PRESET_CITIES.find(
      p => p.city.toLowerCase() === settings.selectedCity.toLowerCase() || p.nameAr.toLowerCase() === settings.selectedCity.toLowerCase()
    );
    if (matchedPreset) {
      return isAr ? `${matchedPreset.nameAr}، ${matchedPreset.countryAr} ${matchedPreset.flag}` : `${matchedPreset.city}, ${matchedPreset.country} ${matchedPreset.flag}`;
    }
    return userLocationName || (isAr ? `${settings.selectedCity}، ${settings.selectedCountry}` : `${settings.selectedCity}, ${settings.selectedCountry}`);
  }, [settings.selectedCity, settings.selectedCountry, userLocationName, isAr]);

  return (
    <div className="relative w-full">
      
      {/* Main Spiritual Card with Balanced Responsive Grid */}
      <div 
        className="w-full p-4 sm:p-6 md:p-7 rounded-3xl border glass-card shadow-2xl relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/50"
        style={{ borderColor: 'var(--card-border)' }}
      >
        {/* Decorative Atmospheric Lights */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-center">

          {/* Right Section (7 cols): Next Prayer Title, Location, and Quick Controls */}
          <div className="md:col-span-7 text-center md:text-start space-y-2.5">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t('nextPrayerTitle')}</span>
              <span className="text-amber-400 font-mono font-black">
                {nextPrayer ? formatTime12h(nextPrayer.time) : '--:--'}
              </span>
            </div>

            {/* Next Prayer Big Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2.5 sm:gap-3 flex-wrap" style={{ color: 'var(--text-color)' }}>
              <span>{nextPrayer ? (isAr ? nextPrayer.arabicName : nextPrayer.name) : t('loading')}</span>
              {nextPrayer && (
                <span className="text-lg sm:text-2xl font-bold text-amber-400 font-mono">
                  ({formatTime12h(nextPrayer.time)})
                </span>
              )}
            </h2>

            {/* Location Selector Pill Button */}
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap pt-0.5">
              <button
                ref={btnRef}
                onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate max-w-[180px] sm:max-w-[240px]">{displayLocationName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCityMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => {
                  haptic.selection();
                  onRefreshLocation();
                }}
                disabled={loading}
                className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title={isAr ? 'تحديث الموقع ومواقيت الصلاة' : 'Refresh Prayer Times'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center justify-center md:justify-start gap-2 pt-1.5 flex-wrap">
              {/* Athkar Shortcut */}
              <button
                onClick={() => {
                  haptic.selection();
                  setIsAthkarModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? 'أذكار الصلاة' : 'Athkar'}</span>
              </button>

            </div>

          </div>

          {/* Left Section (5 cols): Radiant Digital Countdown Tiles */}
          <div className="md:col-span-5 flex items-center justify-center md:justify-end gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0">
            
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 md:w-18 lg:w-20 h-16 sm:h-20 md:h-22 rounded-2xl bg-gradient-to-b from-slate-900/90 to-indigo-950/80 border border-indigo-500/30 shadow-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-md group hover:border-indigo-500/60 transition-colors">
                <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  {hours}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-indigo-300/80 mt-1.5 uppercase tracking-wider">
                {isAr ? 'ساعة' : 'Hours'}
              </span>
            </div>

            <span className="text-xl sm:text-2xl font-black text-indigo-400/80 mb-4 animate-pulse">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 md:w-18 lg:w-20 h-16 sm:h-20 md:h-22 rounded-2xl bg-gradient-to-b from-slate-900/90 to-indigo-950/80 border border-indigo-500/30 shadow-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-md group hover:border-indigo-500/60 transition-colors">
                <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 tracking-tight">
                  {minutes}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300/80 mt-1.5 uppercase tracking-wider">
                {isAr ? 'دقيقة' : 'Minutes'}
              </span>
            </div>

            <span className="text-xl sm:text-2xl font-black text-indigo-400/80 mb-4 animate-pulse">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="w-14 sm:w-16 md:w-18 lg:w-20 h-16 sm:h-20 md:h-22 rounded-2xl bg-gradient-to-b from-slate-900/90 to-indigo-950/80 border border-indigo-500/30 shadow-2xl flex items-center justify-center relative overflow-hidden backdrop-blur-md group hover:border-indigo-500/60 transition-colors">
                <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
                  {seconds}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-300/80 mt-1.5 uppercase tracking-wider">
                {isAr ? 'ثانية' : 'Seconds'}
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* City & Country Selector Modal / Dropdown */}
      {isCityMenuOpen && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 top-full mt-2 left-0 right-0 max-w-md mx-auto sm:mx-0 p-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-start space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'اختر مدينتك أو دولتك:' : 'Select your city:'}</span>
            </span>
            <button
              onClick={handleUseGeolocation}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <Compass className="w-3 h-3" />
              <span>{isAr ? 'تحديد تلقائي (GPS)' : 'Auto GPS'}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchCityQuery}
              onChange={(e) => setSearchCityQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن مدينة أو دولة...' : 'Search city or country...'}
              className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          {/* Preset Cities Grid */}
          <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
            {groupedCities.map((group) => (
              <div key={group.countryLabel} className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block px-1">
                  {group.flag} {group.countryLabel}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.cities.map((c) => {
                    const isSelected = settings.selectedCity.toLowerCase() === c.city.toLowerCase();
                    return (
                      <button
                        key={c.city}
                        onClick={() => handleCitySelect(c)}
                        className={`p-2 rounded-xl text-start text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                        }`}
                      >
                        <span className="truncate">{isAr ? c.nameAr : c.city}</span>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Custom City Input */}
          <form onSubmit={handleCustomCitySubmit} className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
            <input
              type="text"
              value={customCityInput}
              onChange={(e) => setCustomCityInput(e.target.value)}
              placeholder={isAr ? 'أو اكتب اسم مدينتك هنا...' : 'Or enter custom city...'}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              {isAr ? 'تطبيق' : 'Apply'}
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
