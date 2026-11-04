
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
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

// Lê o HTML original.
let html = await readFile(shell, "utf8");

// Converte caminhos absolutos em caminhos relativos.
html = html.replace(/(["'])\/assets\//g, "$1./assets/");
html = html.replace(/(["'])\/favicon\.ico/g, "$1./favicon.ico");

// Cria o index.html corrigido.
await writeFile(index, html, "utf8");

// Confere as referências.
console.log("=== REFERÊNCIAS CORRIGIDAS ===");
console.log(
  html.match(/(?:src|href)=["'][^"']+["']/g) || []
);

if (html.includes('"/assets/')) {
  throw new Error("Ainda existem referências absolutas no HTML.");
}

execFileSync("zip", ["-qr", zipFile, "."], {
  cwd: appDir,
});

const files = await readdir(appDir);

console.log("Empacotamento concluído!");
console.log("Página inicial: index.html");
console.log("Arquivos na raiz:", files.length);
console.log("ZIP:", zipFile);
