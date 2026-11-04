
import {
  cp,
  copyFile,
  mkdir,
  readdir,
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
  throw new Error("A pasta .output/public não foi encontrada.");
}

if (!(await stat(shell).catch(() => null))) {
  throw new Error("_shell.html não foi encontrado.");
}

await rm(release, { recursive: true, force: true });
await mkdir(appDir, { recursive: true });

// Copia todos os arquivos públicos, incluindo assets e fontes.
await cp(source, appDir, { recursive: true });

// Cria a página inicial esperada pelo empacotador.
await copyFile(shell, index);

execFileSync("zip", ["-qr", zipFile, "."], {
  cwd: appDir,
});

const files = await readdir(appDir);

console.log("Empacotamento concluído!");
console.log("Página inicial: index.html");
console.log("Arquivos copiados:", files.length);
console.log("ZIP:", zipFile);
