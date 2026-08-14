/**
 * Supercharged Haptic & Tactile Vibration Engine for Yasta Zakir
 * Combines Hardware Vibration API (Android/PWA) with Synthetic Micro-Acoustic Tactile Feedback (iOS/Desktop).
 * Delivers crisp physical feedback for buttons, prayers, adhans, and task completions.
 */

// Web Vibration API Waveform Patterns (milliseconds)
export const HapticPatterns = {
  // Ultra-crisp micro-tap for buttons, tabs, and toggles
  light: [8],

  // Snappy selection tap
  selection: [6],

  // Medium tactile pulse for cards and modal actions
  medium: [24],

  // Heavy tactile bump
  heavy: [45],

  // Snappy physical bead click for Digital Tasbeeh
  tasbeehTick: [14],

  // Multi-frequency milestone burst for 33 or 100 Tasbeeh cycles
  tasbeehMilestone: [25, 30, 40, 30, 70],

  // Double pulse for marking tasks, attendance, or prayers fulfilled
  success: [15, 40, 60],

  // Rhythmic fanfare pulse for leveling up and unlocking badges
  celebration: [30, 20, 50, 20, 80, 25, 120],

  // Spiritual rhythmic pulse for prayer arrival & Adhan alert
  prayer: [40, 70, 70, 70, 100],

  // Crisp double tap for lesson/task reminder notifications
  notification: [25, 40, 45],

  // Streak celebration pulse
  streak: [20, 20, 35, 20, 50, 20, 75],

  // Sharp double warning for schedule conflicts
  warning: [50, 40, 70],

  // Sustained pulsing chime for focus timer alarms
  alarm: [100, 60, 100, 60, 180],
};

// Synthetic Audio Tactile Pop Generator (Fallback for iOS Safari and Desktop)
let audioCtx: AudioContext | null = null;
let isHapticsGloballyEnabled = true;

export function setHapticsEnabled(enabled: boolean) {
  isHapticsGloballyEnabled = enabled;
}

function playAcousticTactilePop(type: 'click' | 'heavy' | 'milestone' | 'spiritual' = 'click') {
  if (!isHapticsGloballyEnabled) return;

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
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    } else if (type === 'spiritual') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);
      osc.frequency.exponentialRampToValueAtTime(648, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    } else if (type === 'heavy') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    } else {
      // Mechanical micro-click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    }

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Graceful fallback
  }
}

/**
 * Triggers hardware vibration and/or acoustic micro-tactile feel
 */
export function triggerHaptic(pattern: number[] | number = [12], acousticType: 'click' | 'heavy' | 'milestone' | 'spiritual' = 'click') {
  if (!isHapticsGloballyEnabled) return;

  try {
    let hasVibrated = false;
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      hasVibrated = navigator.vibrate(pattern);
    }
    // Complement with acoustic feel if vibration is not supported or on desktop/iOS
    if (!hasVibrated) {
      playAcousticTactilePop(acousticType);
    }
  } catch {
    playAcousticTactilePop(acousticType);
  }
}

export const haptic = {
  light: () => triggerHaptic(HapticPatterns.light, 'click'),
  selection: () => triggerHaptic(HapticPatterns.selection, 'click'),
  medium: () => triggerHaptic(HapticPatterns.medium, 'click'),
  heavy: () => triggerHaptic(HapticPatterns.heavy, 'heavy'),
  tasbeehTick: () => triggerHaptic(HapticPatterns.tasbeehTick, 'click'),
  tasbeehMilestone: () => triggerHaptic(HapticPatterns.tasbeehMilestone, 'milestone'),
  success: () => triggerHaptic(HapticPatterns.success, 'heavy'),
  celebration: () => triggerHaptic(HapticPatterns.celebration, 'milestone'),
  prayer: () => triggerHaptic(HapticPatterns.prayer, 'spiritual'),
  notification: () => triggerHaptic(HapticPatterns.notification, 'click'),
  streak: () => triggerHaptic(HapticPatterns.streak, 'milestone'),
  warning: () => triggerHaptic(HapticPatterns.warning, 'heavy'),
  alarm: () => triggerHaptic(HapticPatterns.alarm, 'milestone'),
};
