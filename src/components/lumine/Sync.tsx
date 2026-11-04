import { useEffect } from "react";
import { setLocale } from "@/i18n";
import { matchLocale } from "@/i18n/languages";
import { configureAudio, setAudioVisible, unlockAudio } from "@/lib/audio";
import { useSettings } from "@/lib/storage";

/** Keeps the active language in sync with the preference (or the device language). */
export function LocaleSync() {
  const { language } = useSettings();
  useEffect(() => {
    const apply = () => void setLocale(language === "auto" ? matchLocale(navigator.languages ?? [navigator.language]) : language);
    apply();
    if (language !== "auto") return;
    window.addEventListener("languagechange", apply);
    return () => window.removeEventListener("languagechange", apply);
  }, [language]);
  return null;
}

/** Feeds audio preferences to the sound engine; unlocks audio on first touch; pauses when hidden. */
export function AudioSync() {
  const { sfx, sfxVolume, ambient, ambientVolume } = useSettings();
  useEffect(() => {
    configureAudio({ sfx, sfxVolume, ambient, ambientVolume });
  }, [sfx, sfxVolume, ambient, ambientVolume]);
  useEffect(() => {
    const unlock = () => unlockAudio();
    const vis = () => setAudioVisible(document.visibilityState === "visible");
    window.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  return null;
}
