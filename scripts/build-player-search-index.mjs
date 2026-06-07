import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { buildPlayerDoc, normalizeName } from "./lib/playerMatch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "players.json");
const players = Object.values(JSON.parse(readFileSync(catalogPath, "utf8")));
const gamePlayers = JSON.parse(
  readFileSync(join(root, "src/data/game-players.json"), "utf8"),
);

function toIndexEntry(doc) {
  return {
    id: doc.id,
    name: doc.name,
    age: doc.age,
    club: doc.club,
    league: doc.league ?? null,
    position: doc.position ?? null,
    nationality: doc.nationality ?? null,
    retired: doc.retired,
    searchName: doc.searchName,
    searchFirstname: doc.searchFirstname,
    searchLastname: doc.searchLastname,
  };
}

function findExactCatalogMatch(gamePlayer, catalog) {
  const target = normalizeName(gamePlayer.name);
  return catalog.find((player) => {
    const display = normalizeName(player.name);
    const full = normalizeName(
      `${player.firstname ?? ""} ${player.lastname ?? ""}`,
    );
    return display === target || full === target;
  });
}

function mergeCatalogEntry(catalogEntry, gameDoc) {
  return {
    id: catalogEntry.id,
    name: gameDoc.name,
    age: gameDoc.age ?? catalogEntry.age,
    club: gameDoc.club ?? catalogEntry.club,
    league: gameDoc.league ?? catalogEntry.league ?? null,
    position: gameDoc.position ?? catalogEntry.position ?? null,
    nationality: gameDoc.nationality ?? catalogEntry.nationality ?? null,
    retired: gameDoc.retired ?? catalogEntry.retired,
    searchName: gameDoc.searchName,
    searchFirstname: gameDoc.searchFirstname,
    searchLastname: gameDoc.searchLastname,
  };
}

function disambiguateSearchNameCollisions(entries) {
  const groups = new Map();

  for (const entry of entries) {
    const key = entry.searchName;
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  let disambiguated = 0;

  for (const [, group] of groups) {
    if (group.length <= 1) continue;

    const suffixFor = (entry) => {
      const parts = String(entry.searchLastname ?? "")
        .split(" ")
        .filter(Boolean);
      return parts.at(-1) ?? "";
    };

    const suffixCounts = new Map();
    for (const entry of group) {
      const suffix = suffixFor(entry);
      suffixCounts.set(suffix, (suffixCounts.get(suffix) ?? 0) + 1);
    }

    for (const entry of group) {
      let suffix = suffixFor(entry);
      if (!suffix || (suffixCounts.get(suffix) ?? 0) > 1) {
        suffix = String(entry.searchLastname ?? "").trim();
      }
      if (!suffix) continue;
      entry.searchName = `${entry.searchName} ${suffix}`;
      disambiguated += 1;
    }
  }

  return disambiguated;
}

const byId = new Map();

for (const player of players) {
  const doc = buildPlayerDoc(player);
  byId.set(String(doc.id), toIndexEntry(doc));
}

let merged = 0;
let added = 0;

for (const player of gamePlayers) {
  const gameDoc = buildPlayerDoc({ ...player, source: "game-curated" });

  let catalogId = player.sourcePlayerId
    ? String(player.sourcePlayerId)
    : null;

  if (!catalogId) {
    const matched = findExactCatalogMatch(player, players);
    if (matched) {
      catalogId = String(matched.id);
    }
  }

  if (catalogId && byId.has(catalogId)) {
    byId.set(catalogId, mergeCatalogEntry(byId.get(catalogId), gameDoc));
    merged++;
    continue;
  }

  if (!byId.has(String(gameDoc.id))) {
    byId.set(String(gameDoc.id), toIndexEntry(gameDoc));
    added++;
  }
}

const index = [...byId.values()].sort((left, right) =>
  left.name.localeCompare(right.name),
);

const disambiguated = disambiguateSearchNameCollisions(index);

const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });
const outputPath = join(publicDir, "player-search-index.json");
writeFileSync(outputPath, JSON.stringify(index));
console.log(
  `Wrote ${index.length} players to public/player-search-index.json (${merged} merged, ${added} unique local, ${disambiguated} searchName disambiguations).`,
);
