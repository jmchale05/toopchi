import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  buildAllTimeAssistsUrl,
  buildAllTimeGoalsUrl,
  buildSeasonAssistsUrl,
  buildSeasonGoalsUrl,
  COMPETITION_SOURCES,
  fetchTransfermarkt,
  namesMatch,
  parseItemsTable,
  slugToSaisonId,
} from "./lib/transfermarktFetch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assistsBySlug = JSON.parse(
  readFileSync(join(root, "src/data/competition-assists-by-slug.json"), "utf8"),
);


function loadJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function saveJson(path, data) {
  writeFileSync(join(root, path), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function findExisting(name, players) {
  return players.find((player) => namesMatch(player.name, name));
}

function buildPlayer(entry, existingPlayers) {
  const existing = findExisting(entry.name, existingPlayers);

  return {
    name: entry.name,
    nation: existing?.nation ?? entry.nation ?? "Unknown",
    ...(entry.value != null ? { value: entry.value } : {}),
    ...(existing?.sourcePlayerId
      ? { sourcePlayerId: existing.sourcePlayerId }
      : {}),
    ...(existing?.aliases ? { aliases: existing.aliases } : {}),
  };
}

async function fetchList(config, season, type) {
  const slug = season.slug;
  const saisonId = slugToSaisonId(slug);
  const url =
    slug === "all-time"
      ? type === "scorers"
        ? buildAllTimeGoalsUrl(config)
        : buildAllTimeAssistsUrl(config)
      : type === "scorers"
        ? buildSeasonGoalsUrl(config, saisonId)
        : buildSeasonAssistsUrl(config, saisonId);

  const html = await fetchTransfermarkt(url);
  return {
    url,
    players: parseItemsTable(html, 10),
  };
}

async function syncCompetition(key, config) {
  const seasons = loadJson(config.seasonsFile);
  const competitionAssists = config.assistsKey
    ? (assistsBySlug[config.assistsKey] ?? {})
    : null;
  let updated = 0;

  for (const season of seasons) {
    const existingScorers = season.scorers;
    const scorerData = await fetchList(config, season, "scorers");
    season.scorers = scorerData.players.map((entry) =>
      buildPlayer(entry, existingScorers),
    );
    updated += 1;
    console.log(`Synced ${config.label} scorers ${season.season}`);

    const assistPlayers =
      season.assists ?? competitionAssists?.[season.slug] ?? [];
    if (assistPlayers.length === 0) continue;

    const existingAssists = assistPlayers;
    const assistData = await fetchList(config, season, "assists");
    const syncedAssists = assistData.players.map((entry) =>
      buildPlayer(entry, existingAssists),
    );

    if (config.inlineAssists) {
      season.assists = syncedAssists;
    } else if (competitionAssists) {
      competitionAssists[season.slug] = syncedAssists;
    }
    updated += 1;
    console.log(`Synced ${config.label} assists ${season.season}`);
  }

  saveJson(config.seasonsFile, seasons);
  if (competitionAssists) {
    assistsBySlug[config.assistsKey] = competitionAssists;
    saveJson("src/data/competition-assists-by-slug.json", assistsBySlug);
  }

  return updated;
}

async function main() {
  const only = process.argv
    .slice(2)
    .find((arg) => arg.startsWith("--only="))
    ?.replace("--only=", "")
    .split(",");

  let total = 0;
  for (const [key, config] of Object.entries(COMPETITION_SOURCES)) {
    if (only?.length && !only.includes(key)) continue;
    total += await syncCompetition(key, config);
  }

  console.log(`Synced ${total} list sources from Transfermarkt.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
