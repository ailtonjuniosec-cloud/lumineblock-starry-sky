// @lovable.dev/vite-tanstack-config already includes tanstackStart, react, tailwind, nitro etc.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  base: "./",

  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
  },
});
