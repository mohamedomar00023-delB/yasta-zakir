/**
 * Supercharged Haptic Feedback Engine for Yasta Zakir
 * Combines Hardware Vibration API with Synthetic Micro-Acoustic Tactile Feedback
 * Ensures ultra-realistic tactile responses across all iOS, Android, and Desktop devices.
 */

// Web Vibration API Waveform Patterns
export const HapticPatterns = {
  // Ultra-light micro-tick for buttons, toggles, and navigation tabs
  light: [10],

  // Medium tactile pulse for radio picks and chips
  medium: [22],

  // Snappy physical bead click for Digital Tasbeeh
  tasbeehTick: [16],

  // Multi-frequency milestone burst for 33 or 100 Tasbeeh cycles
  tasbeehMilestone: [25, 35, 45, 35, 75],

  // Double pulse for marking tasks, attendance, or prayers fulfilled
  success: [20, 35, 55],

  // Rhythmic fanfare pulse for leveling up and unlocking badges
  celebration: [35, 25, 60, 25, 90, 30, 140],

  // Sharp double warning for schedule conflicts
  warning: [60, 50, 80],

  // Sustained pulsing chime for Pomodoro focus timer alarms
  alarm: [120, 70, 120, 70, 250],
};

// Synthetic Audio Tactile Pop Generator (Fallback for iOS and desktop)
let audioCtx: AudioContext | null = null;

function playAcousticTactilePop(type: 'click' | 'heavy' | 'milestone' = 'click') {
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    if (!audioCtx) {
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (type === 'milestone') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    } else if (type === 'heavy') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    } else {
      // Crisp mechanical micro-click (simulate Apple Taptic / Android haptic motor)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.025);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    }

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Graceful silent fallback
  }
}

/**
 * Triggers hardware vibration and/or acoustic micro-tactile feel
 */
export function triggerHaptic(pattern: number[] | number = [15], acousticType: 'click' | 'heavy' | 'milestone' = 'click') {
  try {
    let hasVibrated = false;
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      hasVibrated = navigator.vibrate(pattern);
    }
    // If vibration is not supported (e.g. iOS Safari) or failed, complement with soft acoustic pop
    if (!hasVibrated) {
      playAcousticTactilePop(acousticType);
    }
  } catch {
    playAcousticTactilePop(acousticType);
  }
}

export const haptic = {
  light: () => triggerHaptic(HapticPatterns.light, 'click'),
  medium: () => triggerHaptic(HapticPatterns.medium, 'click'),
  tasbeehTick: () => triggerHaptic(HapticPatterns.tasbeehTick, 'click'),
  tasbeehMilestone: () => triggerHaptic(HapticPatterns.tasbeehMilestone, 'milestone'),
  success: () => triggerHaptic(HapticPatterns.success, 'heavy'),
  celebration: () => triggerHaptic(HapticPatterns.celebration, 'milestone'),
  warning: () => triggerHaptic(HapticPatterns.warning, 'heavy'),
  alarm: () => triggerHaptic(HapticPatterns.alarm, 'milestone'),
};
