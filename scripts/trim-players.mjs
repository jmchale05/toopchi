import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = join(root, "players.json");

const raw = JSON.parse(readFileSync(inputPath, "utf8"));
const trimmed = {};

for (const [key, player] of Object.entries(raw)) {
  trimmed[key] = {
    id: player.id,
    name: player.name,
    firstname: player.firstname,
    lastname: player.lastname,
    age: player.age,
    nationality: player.nationality,
    team: player.team,
  };
}

writeFileSync(inputPath, `${JSON.stringify(trimmed, null, 2)}\n`, "utf8");
console.log(`Trimmed ${Object.keys(trimmed).length} players in players.json`);
