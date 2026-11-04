
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const clientDir = resolve("dist/client");
const releaseDir = resolve("release");
const packageDir = resolve(releaseDir, "appmint");
const zipPath = resolve(releaseDir, "LumineBlock-AppMint-Offline.zip");

if (!existsSync(clientDir)) {
  throw new Error("A pasta dist/client não foi encontrada.");
}

const shellPath = resolve(clientDir, "_shell.html");
const indexPath = resolve(clientDir, "index.html");

if (!existsSync(indexPath) && existsSync(shellPath)) {
  cpSync(shellPath, indexPath);
}

if (!existsSync(indexPath)) {
  throw new Error("O arquivo index.html não foi encontrado.");
}

rmSync(packageDir, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(packageDir, { recursive: true });

cpSync(clientDir, packageDir, { recursive: true });

writeFileSync(
  resolve(packageDir, "LEIA-ME.txt"),
  "LumineBlock - pacote pre-compilado para AppMint.\n" +
  "Importe como ZIP offline.\n" +
  "O index.html esta na raiz do pacote.\n"
);

const zip = spawnSync(
  "zip",
  ["-qr", zipPath, "."],
  { cwd: packageDir, stdio: "inherit" }
);

if (zip.status !== 0) {
  throw new Error("Falha ao criar o ZIP.");
}

const html = readFileSync(indexPath, "utf8");

if (!html.includes("<html") || !html.includes("<body")) {
  throw new Error("O index.html parece invalido.");
}

console.log("ZIP do LumineBlock preparado com sucesso.");
