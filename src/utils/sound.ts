import { ChimeToneId } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Track active HTML5 audio element (for real MP3 Adhan streaming)
let activeAudioElement: HTMLAudioElement | null = null;

// Ambient sound active nodes
let ambientOscillators: { stop: () => void }[] = [];

const getAudioContext = (): { ctx: AudioContext; master: GainNode } => {
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

export const setMasterVolume = (vol: number) => {
  const { master } = getAudioContext();
  master.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), 0);
  if (activeAudioElement) {
    activeAudioElement.volume = Math.max(0, Math.min(1, vol));
  }
};

/**
 * Stops any playing Adhan audio or chime
 */
export const stopActiveAudio = () => {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
};

/**
 * Plays a customizable prayer Adhan / Alert Chime tone
 */
export const playAdhanChime = (tone: ChimeToneId = 'full-adhan', volume: number = 0.8) => {
  stopActiveAudio();

  // 1. Real MP3 Adhan Audio
  if (tone === 'full-adhan') {
    try {
      // High-quality Makkah / Madinah Adhan stream
      const audio = new Audio('https://cdn.aladhan.com/audio/adhans/c1.mp3');
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(() => {
        // Fallback to synthesized Adhan melody if offline / blocked
        playSynthesizedTakbeer(volume);
      });
      activeAudioElement = audio;
      return;
    } catch {
      playSynthesizedTakbeer(volume);
      return;
    }
  }

  // 2. Takbeerat (Short Adhan Intro)
  if (tone === 'takbeer') {
    try {
      const audio = new Audio('https://cdn.aladhan.com/audio/adhans/a3.mp3');
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(() => {
        playSynthesizedTakbeer(volume);
      });
      activeAudioElement = audio;
      return;
    } catch {
      playSynthesizedTakbeer(volume);
      return;
    }
  }

  // 3. Web Audio API Synthesized Melodic Chimes
  try {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;

    const toneFrequencies: Record<string, number[]> = {
      'soft-bell': [349.23, 440.00, 523.25, 698.46], // F4, A4, C5, F5
      'oud-chime': [293.66, 369.99, 440.00, 587.33], // D4, F#4, A4, D5
      'crystal': [523.25, 659.25, 783.99, 1046.50],  // C5, E5, G5, C6
      'oriental': [329.63, 415.30, 493.88, 659.25], // E4, G#4, B4, E5
    };

    const freqs = toneFrequencies[tone] || toneFrequencies['soft-bell'];

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tone === 'crystal' ? 'sine' : tone === 'oud-chime' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.22);

      gain.gain.setValueAtTime(0, now + index * 0.22);
      gain.gain.linearRampToValueAtTime(0.18 * volume, now + index * 0.22 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.22 + 2.4);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + index * 0.22);
      osc.stop(now + index * 0.22 + 2.5);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
};

/**
 * Synthesized Maqam Rast / Bayati Adhan Takbeer fallback
 */
function playSynthesizedTakbeer(volume: number = 0.8) {
  try {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    // Takbeer notes (Allahu Akbar): D4, F4, G4, A4, G4, F4, D4
    const notes = [293.66, 349.23, 392.00, 440.00, 392.00, 349.23, 293.66];

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
  } catch (err) {
    console.warn('Takbeer synthesizer error:', err);
  }
}

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
export const playWarningAlert = () => {
  try {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(370, now + 0.15);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
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
