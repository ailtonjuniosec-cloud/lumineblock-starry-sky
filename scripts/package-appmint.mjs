
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";
import { spawnSync } from "node:child_process";

const releaseDir = resolve("release");
const packageDir = resolve(releaseDir, "appmint");
const zipPath = resolve(releaseDir, "LumineBlock-AppMint-Offline.zip");

function findHtml(dir) {
  if (!existsSync(dir)) return null;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory() && entry.name !== "node_modules") {
      const found = findHtml(path);
      if (found) return found;
    }

    if (entry.isFile() && entry.name === "index.html") {
      return path;
    }
  }

  return null;
}

const indexPath = findHtml(resolve("dist"));

if (!indexPath) {
  throw new Error(
    "Nenhum index.html encontrado dentro de dist. Verifique a saída do Vite."
  );
}

const outputDir = dirname(indexPath);

console.log("HTML encontrado em:", indexPath);

rmSync(packageDir, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(packageDir, { recursive: true });

cpSync(outputDir, packageDir, { recursive: true });

writeFileSync(
  resolve(packageDir, "LEIA-ME.txt"),
  "LumineBlock - pacote pre-compilado para AppMint.\n" +
  "Importe como ZIP offline.\n"
);

const html = readFileSync(indexPath, "utf8");

if (!html.includes("<html") || !html.includes("<body")) {
  throw new Error("O index.html encontrado parece invalido.");
}

const zip = spawnSync(
  "zip",
  ["-qr", zipPath, "."],
  { cwd: packageDir, stdio: "inherit" }
);

if (zip.status !== 0) {
  throw new Error("Falha ao criar o ZIP.");
}

console.log("ZIP preparado:", zipPath);
