import { useEffect } from "react";
import { useSettings } from "@/lib/storage";

/** Applies theme / motion / effects classes to <html>. */
export function ThemeSync() {
  const { theme, animations, effects } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "auto" && mq.matches);
      root.classList.toggle("dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", !animations);
    document.documentElement.classList.toggle("no-fx", !effects);
  }, [animations, effects]);
  return null;
}

/** Inline pre-hydration script to avoid a theme flash. */
export const themeBootScript = `(function(){try{var s=JSON.parse(localStorage.getItem('lumineblock.settings')||'{}');var t=s.theme||'auto';var d=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');if(s.animations===false)r.classList.add('reduce-motion');if(s.effects===false)r.classList.add('no-fx');}catch(e){}})();`;
