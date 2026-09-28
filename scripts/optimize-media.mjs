// Usage (from project root):
//   1. Copy src/assets to originals-backup/assets  (keep the untouched originals)
//   2. npm i -D sharp
//   3. winget install ffmpeg   (then reopen the terminal)
//   4. node scripts/optimize-media.mjs
// Reads originals-backup/assets and writes optimized files into src/assets.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, rmSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";
import sharp from "sharp";

const SRC = "originals-backup/assets";
const OUT = "src/assets";
const IMG = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const VID = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const AUD = new Set([".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac"]);

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + " MB";

for (const file of walk(SRC)) {
  const ext = extname(file).toLowerCase();
  const rel = file.slice(SRC.length + 1);
  const stem = basename(rel, extname(rel));
  const outDir = join(OUT, dirname(rel));
  mkdirSync(outDir, { recursive: true });

  try {
    if (basename(file) === "panda-hug.png") continue; // small UI asset, leave as is
    if (IMG.has(ext) && ext !== ".gif") {
      const out = join(outDir, stem + ".webp");
      await sharp(file).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
      if (out !== join(OUT, rel)) rmSync(join(OUT, rel), { force: true }); // drop old .jpg/.png
      console.log("img ", rel, mb(file), "->", mb(out));
    } else if (VID.has(ext)) {
      const out = join(outDir, stem + ".mp4");
      execFileSync("ffmpeg", ["-y", "-i", file, "-vf", "scale='min(960,iw)':-2", "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out], { stdio: "ignore" });
      if (out !== join(OUT, rel)) rmSync(join(OUT, rel), { force: true });
      console.log("vid ", rel, mb(file), "->", mb(out));
    } else if (AUD.has(ext)) {
      const out = join(outDir, stem + ".mp3");
      execFileSync("ffmpeg", ["-y", "-i", file, "-vn", "-c:a", "libmp3lame", "-b:a", "128k", out], { stdio: "ignore" });
      if (out !== join(OUT, rel)) rmSync(join(OUT, rel), { force: true });
      console.log("song", rel, mb(file), "->", mb(out));
    }
  } catch (e) {
    console.warn("SKIPPED", rel, e.message);
  }
}
console.log("Done.");
