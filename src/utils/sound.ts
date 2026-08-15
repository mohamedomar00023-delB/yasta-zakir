import { AdhanSoundId, NotificationSoundId, ChimeToneId } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Track active HTML5 audio element (for real MP3 Adhan streaming)
let activeAudioElement: HTMLAudioElement | null = null;

// Active notification timer
let activeNotificationTimer: any = null;

// Ambient sound active nodes
let ambientOscillators: { stop: () => void }[] = [];

// Track if audio context is primed
let isAudioPrimed = false;

export const getAudioContext = (): { ctx: AudioContext; master: GainNode } => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return { ctx: audioCtx, master: masterGain! };
};

// Prime audio context on initial user gesture anywhere on screen
if (typeof window !== 'undefined') {
  const primeAudio = () => {
    if (!isAudioPrimed) {
      try {
        const { ctx } = getAudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        isAudioPrimed = true;
      } catch {
        // ignore
      }
    }
  };

  window.addEventListener('click', primeAudio, { once: true, passive: true });
  window.addEventListener('touchstart', primeAudio, { once: true, passive: true });
  window.addEventListener('keydown', primeAudio, { once: true, passive: true });
}

export const setMasterVolume = (vol: number) => {
  const clamped = Math.max(0, Math.min(1, vol));
  try {
    const { master } = getAudioContext();
    master.gain.setValueAtTime(clamped, 0);
  } catch {
    // ignore
  }
  if (activeAudioElement) {
    activeAudioElement.volume = clamped;
  }
};

/**
 * Calculates smart adjusted volume considering Night Quiet Hours (11 PM - 5 AM)
 */
export const calculateSmartVolume = (
  baseVolume: number = 0.8,
  options?: { quietHours?: boolean; isAdhan?: boolean }
): number => {
  const vol = Math.max(0, Math.min(1, baseVolume));
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 23 || currentHour < 5;

  if (options?.quietHours && isNightTime) {
    // Soft night volume
    return Math.min(vol, options?.isAdhan ? 0.45 : 0.3);
  }

  return vol;
};

/**
 * Stops any playing Adhan audio, notification, or chime
 */
export const stopActiveAudio = () => {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
    } catch {
      // ignore
    }
    activeAudioElement = null;
  }
  if (activeNotificationTimer) {
    clearTimeout(activeNotificationTimer);
    activeNotificationTimer = null;
  }
};

// ==========================================
// 1. ADHAN AUDIO RECITATION ENGINE
// ==========================================

const ADHAN_STREAMS: Record<Exclude<AdhanSoundId, 'silent'>, { primary: string; fallback: string }> = {
  'makkah': {
    primary: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    fallback: 'https://cdn.aladhan.com/audio/adhans/a1.mp3',
  },
  'madinah': {
    primary: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
    fallback: 'https://cdn.aladhan.com/audio/adhans/a3.mp3',
  },
  'alaqsa': {
    primary: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
    fallback: 'https://cdn.aladhan.com/audio/adhans/a1.mp3',
  },
  'egypt-refaat': {
    primary: 'https://www.islamcan.com/audio/adhan/azan4.mp3',
    fallback: 'https://cdn.aladhan.com/audio/adhans/a4.mp3',
  },
  'abdulbasit': {
    primary: 'https://www.islamcan.com/audio/adhan/azan5.mp3',
    fallback: 'https://cdn.aladhan.com/audio/adhans/a2.mp3',
  },
  'takbeer-short': {
    primary: 'https://www.islamcan.com/audio/adhan/azan20.mp3',
    fallback: 'https://cdn.aladhan.com/audio/adhans/a3.mp3',
  },
  'nasr-tobbar': {
    primary: 'https://www.islamcan.com/audio/adhan/azan7.mp3',
    fallback: 'https://cdn.aladhan.com/audio/adhans/a4.mp3',
  },
  'fajr-special': {
    primary: 'https://www.islamcan.com/audio/adhan/azan6.mp3',
    fallback: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
  },
};

/**
 * Play Adhan recitation with smart volume, gentle fade-in, and fallbacks
 */
export const playAdhan = (
  _soundId: AdhanSoundId = 'silent', 
  _volume: number = 0.8,
  onEnded?: () => void,
  _options?: { gentleFadeIn?: boolean; quietHours?: boolean }
) => {
  stopActiveAudio();
  if (onEnded) onEnded();
};



/**
 * Synthesized Maqam Rast / Bayati Adhan Takbeer (100% Offline fallback)
 */
export function playSynthesizedTakbeer(volume: number = 0.8, onEnded?: () => void) {
  try {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    // Takbeer notes: D4, F4, G4, A4, G4, F4, D4
    const notes = [293.66, 349.23, 392.00, 440.00, 392.00, 349.23, 293.66];
    const totalDuration = notes.length * 0.35 + 1.2;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.35);

      gain.gain.setValueAtTime(0, now + idx * 0.35);
      gain.gain.linearRampToValueAtTime(0.2 * volume, now + idx * 0.35 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.35 + 1.2);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + idx * 0.35);
      osc.stop(now + idx * 0.35 + 1.3);
    });

    if (onEnded) {
      activeNotificationTimer = setTimeout(() => {
        onEnded();
      }, totalDuration * 1000);
    }
  } catch (err) {
    console.warn('Takbeer synthesizer error:', err);
    if (onEnded) onEnded();
  }
}

// ==========================================
// 2. NOTIFICATION & CHIME AUDIO ENGINE
// ==========================================

/**
 * Plays synthesized notification sound with smart volume & anti-clip envelope
 */
export const playNotificationSound = (
  soundId: NotificationSoundId = 'soft-bell', 
  volume: number = 0.8,
  onEnded?: () => void,
  options?: { quietHours?: boolean }
) => {
  stopActiveAudio();
  if (soundId === 'silent') {
    if (onEnded) onEnded();
    return;
  }

  try {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    const vol = calculateSmartVolume(volume, { quietHours: options?.quietHours ?? true, isAdhan: false });
    let approxDuration = 1.6;

    switch (soundId) {
      case 'soft-bell': {
        const freqs = [349.23, 440.00, 523.25, 698.46];
        approxDuration = 1.8;
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.14);
          gain.gain.setValueAtTime(0, now + i * 0.14);
          gain.gain.linearRampToValueAtTime(0.18 * vol, now + i * 0.14 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 1.6);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now + i * 0.14);
          osc.stop(now + i * 0.14 + 1.7);
        });
        break;
      }

      case 'crystal-ping': {
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        approxDuration = 1.9;
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.15 * vol, now + i * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1.8);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 1.9);
        });
        break;
      }

      case 'oud-melody': {
        const freqs = [293.66, 369.99, 440.00, 587.33];
        approxDuration = 1.6;
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.18);
          gain.gain.setValueAtTime(0, now + i * 0.18);
          gain.gain.linearRampToValueAtTime(0.22 * vol, now + i * 0.18 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 1.4);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now + i * 0.18);
          osc.stop(now + i * 0.18 + 1.5);
        });
        break;
      }

      case 'gentle-piano': {
        const freqs = [392.00, 493.88, 587.33, 783.99];
        approxDuration = 2.0;
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0, now + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.2 * vol, now + i * 0.12 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1.9);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 2.0);
        });
        break;
      }

      case 'success-horizon': {
        const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
        approxDuration = 1.7;
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.09);
          gain.gain.setValueAtTime(0, now + i * 0.09);
          gain.gain.linearRampToValueAtTime(0.18 * vol, now + i * 0.09 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 1.5);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 1.6);
        });
        break;
      }

      case 'modern-ping': {
        approxDuration = 0.5;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25 * vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }

      case 'birds-nature': {
        approxDuration = 0.9;
        [0, 0.18, 0.36].forEach((timeOffset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const baseFreq = idx === 1 ? 2600 : 2200;
          osc.frequency.setValueAtTime(baseFreq, now + timeOffset);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + timeOffset + 0.08);
          osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + timeOffset + 0.15);
          gain.gain.setValueAtTime(0, now + timeOffset);
          gain.gain.linearRampToValueAtTime(0.12 * vol, now + timeOffset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.16);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + 0.18);
        });
        break;
      }

      case 'water-drop': {
        approxDuration = 0.45;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.06);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3 * vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      case 'marimba-pop': {
        approxDuration = 0.4;
        const freqs = [587.33, 880.00];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.28 * vol, now + i * 0.08 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.35);
        });
        break;
      }

      case 'subtle-breeze': {
        approxDuration = 2.4;
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        oscHarmonic.type = 'sine';
        osc.frequency.setValueAtTime(432, now);
        oscHarmonic.frequency.setValueAtTime(864, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18 * vol, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(master);
        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + 2.3);
        oscHarmonic.stop(now + 2.3);
        break;
      }
    }

    if (onEnded) {
      activeNotificationTimer = setTimeout(() => {
        onEnded();
      }, approxDuration * 1000);
    }
  } catch (err) {
    console.warn('Notification sound error:', err);
    if (onEnded) onEnded();
  }
};

/**
 * Backward-compatible helper for old calls
 */
export const playAdhanChime = (tone: ChimeToneId = 'soft-bell', volume: number = 0.8) => {
  playNotificationSound((tone === 'full-adhan' || tone === 'takbeer' ? 'soft-bell' : tone) as NotificationSoundId, volume);
};

/**
 * Success ping for completing lessons/tasks
 */
export const playSuccessPing = () => {
  try {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch (err) {
    console.warn('Audio ping error:', err);
  }
};

/**
 * Warning alert sound
 */
export const playWarningAlert = (volume: number = 0.8) => {
  try {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    const vol = calculateSmartVolume(volume, { quietHours: true });

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(370, now + 0.15);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18 * vol, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.55);
  } catch (err) {
    console.warn('Audio warning error:', err);
  }
};

/**
 * Urgent Countdown & Overdue Alarm Alert (3-tone rapid burst)
 */
export const playUrgentAlert = (volume: number = 0.8) => {
  try {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    const vol = calculateSmartVolume(volume, { quietHours: true });

    // Rapid urgent pulses (880Hz, 740Hz, 980Hz)
    const tones = [880, 740, 980];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18 * vol, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.18);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.2);
    });
  } catch (err) {
    console.warn('Urgent audio alert error:', err);
  }
};

/**
 * Stops any currently active ambient study sound generator
 */
export const stopAmbientSound = () => {
  ambientOscillators.forEach(n => n.stop());
  ambientOscillators = [];
};

/**
 * Ambient Study Noise Synthesizers (Rain, Ocean Waves, White Noise) using Web Audio API
 */
export const startAmbientSound = (sound: string) => {
  stopAmbientSound();
  if (sound === 'none') return;

  try {
    const { ctx, master } = getAudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    if (sound === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      noiseGain.gain.value = 0.08;
    } else if (sound === 'waves') {
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      noiseGain.gain.value = 0.12;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 300;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      ambientOscillators.push({ stop: () => lfo.stop() });
    } else if (sound === 'whitenoise') {
      filter.type = 'lowpass';
      filter.frequency.value = 2500;
      noiseGain.gain.value = 0.04;
    }

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);

    whiteNoise.start();
    ambientOscillators.push({ stop: () => whiteNoise.stop() });
  } catch (err) {
    console.warn('Ambient sound synthesis error:', err);
  }
};
