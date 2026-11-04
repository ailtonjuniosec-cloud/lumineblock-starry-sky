// @lovable.dev/vite-tanstack-config already includes tanstackStart, react, tailwind, nitro etc.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // SPA shell so the Android app (Capacitor) loads fully offline from bundled files.
    spa: { enabled: true },
  },
});
