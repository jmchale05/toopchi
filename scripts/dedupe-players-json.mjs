import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const playersPath = join(root, "players.json");
const apply = process.argv.includes("--apply");

const raw = JSON.parse(readFileSync(playersPath, "utf8"));
const entries = Object.entries(raw);

function isInvalidPlayer(player) {
  const firstname = player.firstname ?? "";
  const lastname = player.lastname ?? "";
  const hasName = Boolean(String(player.name ?? "").trim());
  const hasIdentity = Boolean(String(firstname).trim() || String(lastname).trim());
  return !hasName || !hasIdentity;
}

const invalid = entries.filter(([, player]) => isInvalidPlayer(player));

console.log(`players.json: ${entries.length} entries`);
console.log(`Invalid entries (missing firstname and lastname): ${invalid.length}`);

for (const [id, player] of invalid) {
  console.log(`  - ${id}: ${player.name} (${player.team ?? "?"})`);
}

if (!apply) {
  console.log("\nDry run only. Re-run with --apply to remove invalid entries.");
  process.exit(invalid.length > 0 ? 1 : 0);
}

const next = Object.fromEntries(
  entries.filter(([, player]) => !isInvalidPlayer(player)),
);

writeFileSync(playersPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(`\nRemoved ${invalid.length} invalid entries. ${Object.keys(next).length} remain.`);
