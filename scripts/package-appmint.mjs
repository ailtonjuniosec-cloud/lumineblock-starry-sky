import {
  cp,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const source = path.join(root, ".output", "public");
const release = path.join(root, "release");
const appDir = path.join(release, "app");
const shell = path.join(source, "_shell.html");
const index = path.join(appDir, "index.html");
const zipFile = path.join(
  release,
  "LumineBlock-AppMint-Offline.zip"
);

if (!(await stat(source).catch(() => null))) {
  throw new Error("Pasta .output/public não encontrada.");
}

if (!(await stat(shell).catch(() => null))) {
  throw new Error("_shell.html não encontrado.");
}

await rm(release, { recursive: true, force: true });
await mkdir(appDir, { recursive: true });

await cp(source, appDir, { recursive: true });
await copyFile(shell, index);

// Diagnóstico do HTML
const html = await readFile(index, "utf8");

console.log("\n========== DIAGNÓSTICO HTML ==========");
console.log(html.slice(0, 10000));

console.log("\n========== REFERÊNCIAS ==========");

const references = html.match(
  /(?:src|href)=["'][^"']+["']/g
) || [];

for (const reference of references) {
  console.log(reference);
}

console.log("\n========== ARQUIVOS ==========");

const files = await readdir(appDir);

for (const file of files) {
  console.log(file);
}

execFileSync("zip", ["-qr", zipFile, "."], {
  cwd: appDir,
});

console.log("\n========== RESULTADO ==========");
console.log("HTML:", index);
console.log("ZIP:", zipFile);
console.log("Empacotamento concluído!");
