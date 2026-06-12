import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { normalizeName } from "./playerMatch.mjs";
import { TENABLE_LIST_SOURCES } from "./tenableListVerify.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function loadJson(relativePath) {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

export function collectGameAnswers(options = {}) {
  const { includeMatches = true, includeDaily = true } = options;
  const answers = new Map();

  const add = (name, source, meta = {}) => {
    const key = normalizeName(name);
    if (!key) return;

    const existing = answers.get(key) ?? {
      name,
      sources: new Set(),
      nations: new Set(),
      leagues: new Set(),
      aliases: new Set(),
    };

    existing.sources.add(source);
    if (meta.nation) existing.nations.add(meta.nation);
    if (meta.league) existing.leagues.add(meta.league);
    for (const alias of meta.aliases ?? []) {
      existing.aliases.add(alias);
    }

    answers.set(key, existing);
  };

  for (const source of TENABLE_LIST_SOURCES) {
    for (const list of loadJson(source.path)) {
      for (const item of list.items ?? []) {
        add(item.answer, list.id ?? list.title, {
          nation: item.nation,
          league: list.season?.includes("/")
            ? list.title?.match(/\(([^)]+)\)/)?.[1]
            : null,
          aliases: item.aliases,
        });
      }
    }
  }

  if (includeDaily) {
    for (const player of loadJson("src/data/daily-players.json")) {
      add(player.answer, "daily-players", {
        nation: player.nationality,
        league: player.league,
        aliases: player.aliases,
      });
    }

    for (const [dateKey, player] of Object.entries(
      loadJson("src/data/daily-player-schedule.json"),
    )) {
      add(player.answer, `daily-schedule:${dateKey}`, {
        nation: player.nationality,
        league: player.league,
        aliases: player.aliases,
      });
    }
  }

  if (includeMatches) {
    for (const match of loadJson("src/data/matches.json")) {
      for (const name of [...(match.lineupA ?? []), ...(match.lineupB ?? [])]) {
        add(name, `matches:${match.id}`, {
          league: match.competition,
        });
      }
    }
  }

  return [...answers.values()].map((entry) => ({
    name: entry.name,
    sources: [...entry.sources],
    nations: [...entry.nations],
    leagues: [...entry.leagues],
    aliases: [...entry.aliases],
  }));
}
