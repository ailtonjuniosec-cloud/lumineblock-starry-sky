// Prepares the offline Android build: SPA shell as index.html + minimal-permission manifest.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
copyFileSync("dist/client/_shell.html", "dist/client/index.html");
const m = "android/app/src/main/AndroidManifest.xml";
if (existsSync(m)) {
  let x = readFileSync(m, "utf8");
  x = x.replace(/\s*<uses-permission[^>]*\/>/g, "");
  x = x.replace(/android:usesCleartextTraffic="true"/g, 'android:usesCleartextTraffic="false"');
  writeFileSync(m, x);
  console.log("Manifest: all permissions removed (no INTERNET).");
}
