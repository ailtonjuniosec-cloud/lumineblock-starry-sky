import { settingsStore } from "./storage";

/** Optional tactile feedback (works in Android WebView / Capacitor). */
export function haptic(pattern: number | number[] = 12) {
  if (!settingsStore.get().haptics) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
