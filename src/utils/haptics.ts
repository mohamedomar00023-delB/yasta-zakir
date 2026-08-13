/**
 * Advanced Haptic Feedback Engine for Yasta Zakir
 * Provides realistic physical haptic sensations on mobile devices
 */

export const HapticPatterns = {
  // Ultra-subtle click for buttons, tabs and toggles
  light: [12],
  
  // Mechanical feel for digital Tasbeeh beads
  tasbeehTick: [18],
  
  // Rhythmic pulse for completing 33 or 100 Tasbeeh cycles
  tasbeehMilestone: [35, 40, 55, 40, 80],
  
  // Satisfying double-tap for marking tasks or lessons attended
  success: [25, 35, 60],
  
  // Triple pulse for unlocking an achievement badge or leveling up
  celebration: [40, 30, 70, 30, 120],
  
  // Distinct double pulse for schedule conflict warnings
  warning: [60, 50, 80],
  
  // Long pulsing chime vibration for Pomodoro study break alarm
  alarm: [120, 80, 120, 80, 250],
};

/**
 * Triggers a custom vibration pattern if supported by the browser/device
 */
export function triggerHaptic(pattern: number[] | number = [15]) {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Graceful fallback on devices where vibration is disabled or not supported
  }
}

export const haptic = {
  light: () => triggerHaptic(HapticPatterns.light),
  tasbeehTick: () => triggerHaptic(HapticPatterns.tasbeehTick),
  tasbeehMilestone: () => triggerHaptic(HapticPatterns.tasbeehMilestone),
  success: () => triggerHaptic(HapticPatterns.success),
  celebration: () => triggerHaptic(HapticPatterns.celebration),
  warning: () => triggerHaptic(HapticPatterns.warning),
  alarm: () => triggerHaptic(HapticPatterns.alarm),
};
