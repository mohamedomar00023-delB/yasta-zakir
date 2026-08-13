import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Clock, MapPin, RefreshCw, ChevronDown, Check, Search, Settings2, Plus, Layers } from 'lucide-react';
import { PrayerItem } from '../../types';
import { formatSecondsToTimer, formatTime12h } from '../../utils/formatters';
import { CALCULATION_METHODS, PRESET_CITIES, PresetCityItem } from '../../utils/presets';
import { useApp } from '../../context/AppContext';

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
  const { settings, updateSettings, showToast, t } = useApp();
  const isAr = settings.language !== 'en';

  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [searchCityQuery, setSearchCityQuery] = useState('');
  const [customCityInput, setCustomCityInput] = useState('');
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0, left: 0 });

  const { hours, minutes, seconds } = formatSecondsToTimer(remainingSeconds);

  // Calculate dropdown position relative to viewport
  const openDropdown = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      setDropdownPos({
        top: isMobile ? rect.bottom + 6 : rect.bottom + window.scrollY + 6,
        right: isMobile ? 12 : window.innerWidth - rect.right,
        left: isMobile ? 12 : rect.left,
      });
    }
    setIsCityMenuOpen(true);
    setSearchCityQuery('');
  };

  // Close on outside click
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
    updateSettings({ selectedCity: customCityInput.trim(), selectedCountry: '', useGeolocation: false });
    setIsCityMenuOpen(false);
    setCustomCityInput('');
    showToast(isAr ? `تم تعيين المدينة إلى "${customCityInput.trim()}" 📍` : `City set to "${customCityInput.trim()}" 📍`, 'success');
  };

  const handleUseGeolocation = () => {
    updateSettings({ useGeolocation: true });
    setIsCityMenuOpen(false);
    onRefreshLocation();
    showToast(isAr ? 'جاري تحديد موقعك تلقائياً 🛰️' : 'Detecting your location via GPS 🛰️', 'info');
  };

  const currentMethodName = CALCULATION_METHODS.find(m => m.id === settings.calculationMethod)?.nameAr || '';

  const getPrayerDisplayName = (p: PrayerItem | null) => {
    if (!p) return t('loading');
    if (!isAr) return p.name;
    return p.arabicName;
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
    <>
      <div
        className="w-full glass-panel p-4 sm:p-6 md:p-8 rounded-3xl border shadow-2xl relative"
        style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
      >
        {/* Ambient blobs */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">

          {/* Right/Left: Prayer name + location button */}
          <div className="text-center md:text-start space-y-2 sm:space-y-3 w-full md:w-auto flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('nextPrayerTitle')}</span>
            </div>

            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2 sm:gap-3 flex-wrap"
              style={{ color: 'var(--text-color)' }}
            >
              <span>{getPrayerDisplayName(nextPrayer)}</span>
              {nextPrayer && (
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-400">
                  ({formatTime12h(nextPrayer.time, !isAr)})
                </span>
              )}
            </h2>

            {/* Location Selector Button */}
            <div className="flex justify-center md:justify-start">
              <button
                ref={btnRef}
                onClick={openDropdown}
                className="flex items-center gap-2 text-xs font-bold px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] max-w-full"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-color)',
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="max-w-[180px] sm:max-w-[240px] truncate">
                  {displayLocationName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform text-slate-400 ${isCityMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex items-end justify-center gap-1 sm:gap-2 dir-ltr shrink-0">
            {[
              { val: hours, label: isAr ? 'ساعة' : 'Hours' },
              { val: minutes, label: isAr ? 'دقيقة' : 'Mins' },
              { val: seconds, label: isAr ? 'ثانية' : 'Secs' },
            ].map((item, idx) => (
              <React.Fragment key={item.label}>
                <div className="flex flex-col items-center">
                  <div
                    className="timer-digit-box w-12 min-[400px]:w-14 sm:w-16 md:w-20 h-12 min-[400px]:h-14 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg min-[400px]:text-xl sm:text-2xl md:text-3xl font-black shadow-inner border transition-all"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                  >
                    <span className="text-indigo-400">{item.val}</span>
                  </div>
                  <span className="text-[9px] min-[400px]:text-[10px] sm:text-[11px] font-bold mt-1" style={{ color: 'var(--subtext-color)' }}>
                    {item.label}
                  </span>
                </div>
                {idx < 2 && (
                  <span className="text-lg sm:text-2xl font-black text-indigo-400 animate-pulse mb-3 min-[400px]:mb-4 sm:mb-5">:</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Dropdown menu */}
      {isCityMenuOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-[calc(100vw-24px)] sm:w-80 max-w-sm rounded-2xl border shadow-2xl overflow-hidden"
          style={{
            top: dropdownPos.top,
            ...(window.innerWidth < 640 ? { left: '12px' } : (isAr ? { right: dropdownPos.right } : { left: dropdownPos.left })),
            background: 'var(--panel-bg)',
            borderColor: 'var(--panel-border)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="p-3 space-y-2">
            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                value={searchCityQuery}
                onChange={e => setSearchCityQuery(e.target.value)}
                placeholder={isAr ? 'ابحث: القاهرة، المنصورة، الرياض...' : 'Search: Cairo, Riyadh, Dubai...'}
                autoFocus
                className="w-full px-3 py-2 pr-8 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--card-border)',
                }}
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5" style={{ color: 'var(--subtext-color)' }} />
            </div>

            {/* GPS Button */}
            <button
              onClick={handleUseGeolocation}
              className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: settings.useGeolocation ? 'rgba(16,185,129,0.2)' : 'var(--card-bg)',
                color: '#10b981',
                border: `1px solid ${settings.useGeolocation ? 'rgba(16,185,129,0.4)' : 'var(--card-border)'}`,
              }}
            >
              <span className="flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {isAr ? 'تحديد موقعي تلقائياً 🛰️ (GPS)' : 'Auto-detect location (GPS)'}
              </span>
              {settings.useGeolocation && <Check className="w-4 h-4" />}
            </button>

            <div className="h-px" style={{ background: 'var(--card-border)' }} />
          </div>

          {/* Cities grouped by country */}
          <div className="max-h-60 overflow-y-auto px-3 pb-2 space-y-3">
            {groupedCities.length === 0 ? (
              <p className="text-center text-xs py-4" style={{ color: 'var(--subtext-color)' }}>
                {isAr ? '😕 مفيش نتائج، جرب كلمة تانية أو أدخل المدينة يدوياً.' : 'No results found. Type your city below.'}
              </p>
            ) : (
              groupedCities.map(group => (
                <div key={group.countryLabel}>
                  {/* Country header */}
                  <div
                    className="flex items-center gap-2 py-1.5 sticky top-0"
                    style={{ background: 'var(--panel-bg)' }}
                  >
                    <span className="text-base">{group.flag}</span>
                    <span className="text-[11px] font-black" style={{ color: 'var(--subtext-color)' }}>
                      {group.countryLabel}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--card-border)' }} />
                  </div>

                  {/* City chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {group.cities.map(c => {
                      const isSelected = !settings.useGeolocation && settings.selectedCity === c.city;
                      return (
                        <button
                          key={`${c.city}_${c.country}`}
                          onClick={() => handleCitySelect(c)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: isSelected ? '#4f46e5' : 'var(--card-bg)',
                            color: isSelected ? '#ffffff' : 'var(--text-color)',
                            border: `1px solid ${isSelected ? '#4f46e5' : 'var(--card-border)'}`,
                          }}
                        >
                          {isSelected && '✓ '}{isAr ? c.nameAr : c.city}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Custom city input + method selector */}
          <div className="p-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <form onSubmit={handleCustomCitySubmit} className="flex items-center gap-1.5 mb-2">
              <input
                type="text"
                value={customCityInput}
                onChange={e => setCustomCityInput(e.target.value)}
                placeholder={isAr ? 'مدينتك مش موجودة؟ اكتبها هنا...' : 'Custom city name...'}
                className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                style={{
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--card-border)',
                }}
              />
              <button
                type="submit"
                disabled={!customCityInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                {t('save')}
              </button>
            </form>

            {/* Method selector toggle */}
            <button
              type="button"
              onClick={() => setShowMethodSelector(!showMethodSelector)}
              className="w-full flex items-center justify-between text-[11px] py-1 transition-colors"
              style={{ color: 'var(--subtext-color)' }}
            >
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                {isAr ? `طريقة الحساب: ${currentMethodName.split('(')[0].trim()}` : 'Calculation Method'}
              </span>
              <Settings2 className="w-3 h-3 text-indigo-400" />
            </button>

            {showMethodSelector && (
              <div className="mt-1 space-y-1 max-h-36 overflow-y-auto">
                {CALCULATION_METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      updateSettings({ calculationMethod: m.id });
                      showToast(isAr ? 'تم تحديث طريقة الحساب ✅' : 'Method updated ✅', 'info');
                    }}
                    className="w-full text-start px-2 py-1.5 rounded-lg text-[10px] flex items-center justify-between transition-all"
                    style={{
                      background: settings.calculationMethod === m.id ? 'rgba(16,185,129,0.15)' : 'transparent',
                      color: settings.calculationMethod === m.id ? '#10b981' : 'var(--subtext-color)',
                      border: `1px solid ${settings.calculationMethod === m.id ? 'rgba(16,185,129,0.3)' : 'transparent'}`,
                    }}
                  >
                    <span>{m.nameAr}</span>
                    {settings.calculationMethod === m.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
