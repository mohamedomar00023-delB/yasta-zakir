import { useState, useEffect, useCallback } from 'react';
import { HijriDateInfo, Lesson, PrayerConflictAlert, PrayerItem, PrayerName } from '../types';
import { formatTime12h, PRAYER_TRANSLATIONS, timeToMinutes } from '../utils/formatters';
import { COUNTRY_FLAG_MAP, PRESET_CITIES } from '../utils/presets';

interface UseAladhanProps {
  city: string;
  country: string;
  useGeolocation: boolean;
  calculationMethod?: number;
  lessonsForToday: Lesson[];
  language?: string;
}

export function useAladhan({
  city,
  country,
  useGeolocation,
  calculationMethod = 5,
  lessonsForToday,
  language = 'ar',
}: UseAladhanProps) {
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerItem | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocationName, setUserLocationName] = useState<string>('');
  const [conflicts, setConflicts] = useState<PrayerConflictAlert[]>([]);
  const [hijriDate, setHijriDate] = useState<HijriDateInfo | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);

  const isEn = language === 'en';

  // Helper to format location label bilingually with flag
  const getFormattedLocationName = (cName: string, cntryName: string, isGps: boolean = false) => {
    const matchedPreset = PRESET_CITIES.find(
      p => p.city.toLowerCase() === cName.toLowerCase() || p.nameAr.toLowerCase() === cName.toLowerCase()
    );

    if (matchedPreset) {
      if (isEn) {
        return `${matchedPreset.city}, ${matchedPreset.country} ${matchedPreset.flag}${isGps ? ' (GPS)' : ''}`;
      }
      return `${matchedPreset.nameAr}، ${matchedPreset.countryAr} ${matchedPreset.flag}${isGps ? ' (تلقائي GPS)' : ''}`;
    }

    const countryObj = COUNTRY_FLAG_MAP[cntryName] || { ar: cntryName, flag: '🌍' };
    if (isEn) {
      return `${cName}, ${cntryName} ${countryObj.flag}${isGps ? ' (GPS)' : ''}`;
    }
    return `${cName}، ${countryObj.ar} ${countryObj.flag}${isGps ? ' (تلقائي GPS)' : ''}`;
  };

  // Fetch prayer timings & Reverse Geocoding
  const fetchTimings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '';
      let locLabel = getFormattedLocationName(city, country, false);

      if (useGeolocation && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
          });
          const { latitude, longitude } = position.coords;
          url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${calculationMethod}`;
          
          // Qibla direction calculation
          const kaabaLat = 21.4225;
          const kaabaLon = 39.8262;
          const y = Math.sin((kaabaLon - longitude) * (Math.PI / 180));
          const x =
            Math.cos(latitude * (Math.PI / 180)) * Math.tan(kaabaLat * (Math.PI / 180)) -
            Math.sin(latitude * (Math.PI / 180)) * Math.cos((kaabaLon - longitude) * (Math.PI / 180));
          let qiblaDegree = Math.round((Math.atan2(y, x) * (180 / Math.PI) + 360) % 360);
          setQiblaDirection(qiblaDegree);

          // Reverse geocode to get actual city name
          try {
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${isEn ? 'en' : 'ar'}`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const detectedCity = geoData.city || geoData.locality || geoData.principalSubdivision || '';
              const detectedCountry = geoData.countryName || '';
              if (detectedCity) {
                locLabel = getFormattedLocationName(detectedCity, detectedCountry, true);
              } else {
                locLabel = isEn ? 'Current Location (GPS 🛰️)' : 'موقعك الحالي (تلقائي GPS 🛰️)';
              }
            } else {
              locLabel = isEn ? 'Current Location (GPS 🛰️)' : 'موقعك الحالي (تلقائي GPS 🛰️)';
            }
          } catch {
            locLabel = isEn ? 'Current Location (GPS 🛰️)' : 'موقعك الحالي (تلقائي GPS 🛰️)';
          }
        } catch {
          url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${calculationMethod}`;
          locLabel = getFormattedLocationName(city, country, false);
        }
      } else {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${calculationMethod}`;
        locLabel = getFormattedLocationName(city, country, false);
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('تعذر جلب مواقيت الصلاة');
      const data = await res.json();

      if (data && data.data && data.data.timings) {
        const rawTimings = data.data.timings;
        setUserLocationName(locLabel);

        // Hijri date extraction
        if (data.data.date && data.data.date.hijri) {
          const h = data.data.date.hijri;
          setHijriDate({
            day: h.day,
            monthAr: h.month?.ar || h.month?.en || '',
            monthEn: h.month?.en || '',
            year: h.year,
            formatted: `${h.day} ${h.month?.ar || ''} ${h.year} هـ`,
            formattedEn: `${h.day} ${h.month?.en || 'Safar'} ${h.year} AH`,
          });
        }

        const prayerNamesOrder: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const now = new Date();

        const mappedPrayers: PrayerItem[] = prayerNamesOrder.map(pName => {
          const time24 = rawTimings[pName]?.split(' ')[0] || '00:00';
          const [h, m] = time24.split(':').map(Number);
          
          const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
          const isPassed = prayerDate.getTime() < now.getTime();

          return {
            name: pName,
            arabicName: PRAYER_TRANSLATIONS[pName],
            time: time24,
            formattedTime: formatTime12h(time24, isEn),
            timestamp: prayerDate.getTime(),
            isNext: false,
            isPassed,
          };
        });

        // Find next prayer
        let foundNext: PrayerItem | null = null;
        for (const p of mappedPrayers) {
          if (p.timestamp > now.getTime()) {
            foundNext = p;
            p.isNext = true;
            break;
          }
        }

        if (!foundNext && mappedPrayers.length > 0) {
          const fajrToday = mappedPrayers[0];
          const fajrTomorrowTime = fajrToday.timestamp + 24 * 60 * 60 * 1000;
          foundNext = {
            ...fajrToday,
            timestamp: fajrTomorrowTime,
            isNext: true,
            isPassed: false,
          };
        }

        setPrayers(mappedPrayers);
        setNextPrayer(foundNext);

        if (foundNext) {
          const diffSec = Math.max(0, Math.floor((foundNext.timestamp - now.getTime()) / 1000));
          setRemainingSeconds(diffSec);
        }
      }
    } catch (err) {
      console.error(err);
      setError('تعذر الاتصال بخدمة المواقيت. يرجى التحقق من اختيار المدينة أو الاتصال بالإنترنت.');
    } finally {
      setLoading(false);
    }
  }, [city, country, useGeolocation, calculationMethod, language, isEn]);

  useEffect(() => {
    fetchTimings();
  }, [fetchTimings]);

  // Live countdown timer ticking every second
  useEffect(() => {
    if (!nextPrayer) return;

    const interval = setInterval(() => {
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.floor((nextPrayer.timestamp - nowMs) / 1000));
      setRemainingSeconds(diffSec);

      if (diffSec === 0) {
        fetchTimings();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer, fetchTimings]);

  // Detect conflicts between today's lessons and prayer times
  useEffect(() => {
    if (prayers.length === 0 || lessonsForToday.length === 0) {
      setConflicts([]);
      return;
    }

    const detectedConflicts: PrayerConflictAlert[] = [];

    lessonsForToday.forEach(lesson => {
      const lessonStartMins = timeToMinutes(lesson.startTime);
      const lessonEndMins = lesson.endTime ? timeToMinutes(lesson.endTime) : lessonStartMins + 60;

      prayers.forEach(prayer => {
        const prayerMins = timeToMinutes(prayer.time);
        const diffStart = Math.abs(lessonStartMins - prayerMins);
        const diffEnd = Math.abs(lessonEndMins - prayerMins);
        const minDiff = Math.min(diffStart, diffEnd);

        const isOverlapping = prayerMins >= lessonStartMins && prayerMins <= lessonEndMins;

        if (isOverlapping || minDiff <= 15) {
          detectedConflicts.push({
            lessonId: lesson.id,
            lessonSubject: lesson.subject,
            lessonStartTime: formatTime12h(lesson.startTime),
            lessonEndTime: lesson.endTime ? formatTime12h(lesson.endTime) : '',
            prayerName: prayer.name,
            prayerArabicName: prayer.arabicName,
            prayerTime: prayer.formattedTime,
            diffMinutes: minDiff,
            isOverlapping,
          });
        }
      });
    });

    setConflicts(detectedConflicts);
  }, [prayers, lessonsForToday]);

  return {
    prayers,
    nextPrayer,
    remainingSeconds,
    loading,
    error,
    userLocationName,
    conflicts,
    hijriDate,
    qiblaDirection,
    refetch: fetchTimings,
  };
}
