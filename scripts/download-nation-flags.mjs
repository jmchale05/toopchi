import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(root, "public", "flags");

const FLAG_CODES = [
  "al",
  "am",
  "ao",
  "ar",
  "at",
  "au",
  "ba",
  "be",
  "bf",
  "bm",
  "br",
  "ca",
  "cd",
  "ch",
  "ci",
  "cl",
  "cm",
  "cn",
  "co",
  "cr",
  "cz",
  "de",
  "dk",
  "dz",
  "ec",
  "eg",
  "es",
  "fi",
  "fr",
  "ga",
  "gb-eng",
  "gb-nir",
  "gb-sct",
  "gb-wls",
  "ge",
  "gh",
  "gn",
  "gr",
  "hr",
  "ht",
  "hu",
  "ie",
  "il",
  "in",
  "iq",
  "ir",
  "is",
  "it",
  "jm",
  "jp",
  "kr",
  "ma",
  "me",
  "mk",
  "mt",
  "mx",
  "ng",
  "nl",
  "no",
  "nz",
  "pa",
  "pe",
  "pl",
  "pt",
  "py",
  "qa",
  "ro",
  "rs",
  "ru",
  "sa",
  "se",
  "si",
  "sk",
  "sn",
  "sr",
  "tn",
  "tr",
  "ua",
  "us",
  "uy",
  "ve",
  "za",
];

mkdirSync(outputDir, { recursive: true });

let downloaded = 0;
let skipped = 0;

for (const code of FLAG_CODES) {
  const outputPath = join(outputDir, `${code}.png`);
  if (existsSync(outputPath)) {
    skipped += 1;
    continue;
  }

  const response = await fetch(`https://flagcdn.com/w40/${code}.png`, {
    headers: { "User-Agent": "WC-GAME-flag-downloader" },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${code}: ${response.status}`);
  }

  writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
  downloaded += 1;
}

console.log(
  `Nation flags ready in public/flags (${downloaded} downloaded, ${skipped} skipped, ${FLAG_CODES.length} total).`,
);
