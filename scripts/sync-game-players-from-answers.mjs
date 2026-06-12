import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { collectGameAnswers } from "./lib/collectGameAnswers.mjs";
import {
  getRetiredPlayer,
  getSourcePlayerOverride,
} from "./lib/gamePlayerOverrides.mjs";
import {
  findPlayerInCatalog,
  normalizeName,
  slugify,
} from "./lib/playerMatch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gamePlayersPath = join(root, "src/data/game-players.json");
const catalog = Object.values(
  JSON.parse(readFileSync(join(root, "players.json"), "utf8")),
);

function splitAnswerName(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstname: name, lastname: name };
  }

  if (parts.length === 1) {
    return { firstname: parts[0], lastname: parts[0] };
  }

  return {
    firstname: parts.slice(0, -1).join(" "),
    lastname: parts.at(-1),
  };
}

function buildGamePlayerFromCatalog(answer, catalogPlayer, nations = []) {
  const { firstname, lastname } = splitAnswerName(answer);
  const retired = /retired|career break|without club|free agent|no team/i.test(
    catalogPlayer.team ?? "",
  );

  return {
    id: `game-${slugify(answer)}`,
    name: answer,
    firstname,
    lastname,
    age: catalogPlayer.age ?? null,
    nationality: nations[0] ?? catalogPlayer.nationality ?? null,
    club: retired ? "Retired" : (catalogPlayer.team ?? catalogPlayer.club),
    retired,
    sourcePlayerId: String(catalogPlayer.id),
  };
}

function buildGamePlayerFromRetired(retiredPlayer) {
  return {
    id: `game-${slugify(retiredPlayer.name)}`,
    ...retiredPlayer,
  };
}

function resolveCatalogPlayer(answer, nations) {
  const overrideId = getSourcePlayerOverride(answer);
  if (overrideId) {
    const player = catalog.find((entry) => String(entry.id) === overrideId);
    if (player) {
      return player;
    }
  }

  for (const nation of nations) {
    const match = findPlayerInCatalog(answer, nation, catalog);
    if (match) {
      return match;
    }
  }

  return findPlayerInCatalog(answer, null, catalog);
}

function mergeGamePlayers(existing, additions) {
  const byName = new Map(
    existing.map((player) => [normalizeName(player.name), player]),
  );
  const byId = new Map(existing.map((player) => [String(player.id), player]));

  let added = 0;
  let updated = 0;

  for (const candidate of additions) {
    const nameKey = normalizeName(candidate.name);
    const current = byName.get(nameKey);

    if (current) {
      let changed = false;
      if (candidate.sourcePlayerId && !current.sourcePlayerId) {
        current.sourcePlayerId = candidate.sourcePlayerId;
        changed = true;
      }
      if (candidate.retired && !current.retired) {
        current.retired = true;
        current.club = "Retired";
        changed = true;
      }
      if (changed) updated += 1;
      continue;
    }

    let id = candidate.id;
    if (byId.has(id)) {
      id = `${id}-${added + 1}`;
    }

    const next = { ...candidate, id };
    byName.set(nameKey, next);
    byId.set(id, next);
    added += 1;
  }

  return {
    players: [...byName.values()].sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
    added,
    updated,
  };
}

function syncGamePlayers() {
  const answers = collectGameAnswers();
  const existing = JSON.parse(readFileSync(gamePlayersPath, "utf8"));
  const additions = [];

  for (const item of answers) {
    if (existing.some((player) => normalizeName(player.name) === normalizeName(item.name))) {
      continue;
    }

    const retired = getRetiredPlayer(item.name);
    if (retired) {
      additions.push(buildGamePlayerFromRetired(retired));
      continue;
    }

    const catalogPlayer = resolveCatalogPlayer(item.name, item.nations);
    if (catalogPlayer) {
      additions.push(
        buildGamePlayerFromCatalog(item.name, catalogPlayer, item.nations),
      );
    }
  }

  return mergeGamePlayers(existing, additions);
}

const apply = process.argv.includes("--apply");
const result = syncGamePlayers();

console.log(
  `Game player sync: ${result.added} to add, ${result.updated} to update (${result.players.length} total).`,
);

if (!apply) {
  console.log("Dry run only. Re-run with --apply to write src/data/game-players.json.");
  process.exit(0);
}

writeFileSync(
  gamePlayersPath,
  `${JSON.stringify(result.players, null, 2)}\n`,
  "utf8",
);
console.log(`Wrote ${gamePlayersPath}`);
