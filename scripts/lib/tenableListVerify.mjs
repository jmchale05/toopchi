import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  findPlayerInCatalog,
  normalizeName,
  lastToken,
} from "./playerMatch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const TENABLE_LIST_SOURCES = [
  {
    label: "core lists",
    path: "src/data/tenable-lists.json",
  },
  {
    label: "Premier League lists",
    path: "src/data/premier-league-lists.json",
  },
  {
    label: "Champions League lists",
    path: "src/data/champions-league-lists.json",
  },
  {
    label: "Europa League lists",
    path: "src/data/europa-league-lists.json",
  },
  {
    label: "Championship lists",
    path: "src/data/championship-lists.json",
  },
];

function loadJson(relativePath) {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

export function loadPlayersCatalog() {
  const players = Object.values(loadJson("players.json"));
  return players.map((player) => ({
    ...player,
    team: player.team ?? player.club ?? null,
    club: player.club ?? player.team ?? null,
  }));
}

export function loadGamePlayersCatalog() {
  return loadJson("src/data/game-players.json").map((player) => ({
    ...player,
    team: player.club ?? player.team ?? null,
    club: player.club ?? player.team ?? null,
  }));
}

export function loadAllTenableLists(extraSources = []) {
  const sources = [...TENABLE_LIST_SOURCES, ...extraSources];
  const lists = [];

  for (const source of sources) {
    const data = loadJson(source.path);
    if (!Array.isArray(data)) {
      throw new Error(`${source.path} must contain a JSON array of lists`);
    }
    lists.push(...data);
  }

  return lists;
}

function splitNameParts(value) {
  return normalizeName(value).split(" ").filter(Boolean);
}

function firstNameTokens(player) {
  return normalizeName(player.firstname).split(" ").filter(Boolean);
}

function lastNameParts(player) {
  return normalizeName(player.lastname).split(" ").filter(Boolean);
}

function lastNameMatches(answerLast, player) {
  const parts = lastNameParts(player);
  return parts.includes(answerLast) || lastToken(player.lastname) === answerLast;
}

function firstNameMatches(answerFirst, player) {
  const tokens = firstNameTokens(player);
  if (!answerFirst) {
    return false;
  }

  if (tokens.includes(answerFirst)) {
    return true;
  }

  const playerFirst = normalizeName(player.firstname);
  if (!playerFirst) {
    return false;
  }

  if (playerFirst === answerFirst) {
    return true;
  }

  if (answerFirst.length === 1) {
    return tokens.some((token) => token.startsWith(answerFirst));
  }

  if (answerFirst.length >= 2) {
    return tokens.some((token) => token.startsWith(answerFirst));
  }

  const displayFirst = splitNameParts(player.name)[0];
  return displayFirst === answerFirst;
}

/**
 * Returns how an answer maps to a catalog player, or null when no match.
 */
export function matchAnswerToPlayer(answer, nation, player) {
  if (
    nation &&
    player.nationality &&
    normalizeName(player.nationality) !== normalizeName(nation)
  ) {
    return null;
  }

  const answerNorm = normalizeName(answer);
  const displayNorm = normalizeName(player.name);
  const fullNorm = normalizeName(
    `${player.firstname ?? ""} ${player.lastname ?? ""}`.trim(),
  );
  const firstNameNorm = normalizeName(player.firstname);

  if (
    answerNorm === displayNorm ||
    answerNorm === fullNorm ||
    answerNorm === firstNameNorm
  ) {
    return { method: "exact-name", player };
  }

  const answerParts = splitNameParts(answer);
  if (answerParts.length >= 2) {
    const answerFirst = answerParts[0];
    const answerLast = answerParts.at(-1);

    if (
      lastNameMatches(answerLast, player) &&
      firstNameMatches(answerFirst, player)
    ) {
      return { method: "firstname-lastname", player };
    }

    if (
      answerParts.length === 2 &&
      firstNameNorm === answerNorm &&
      lastNameMatches(answerLast, player)
    ) {
      return { method: "compound-firstname", player };
    }
  }

  if (answerParts.length === 1) {
    const answerLast = answerParts[0];
    if (lastNameMatches(answerLast, player)) {
      return { method: "lastname-only", player };
    }
  }

  return null;
}

function resolveLinkedCatalogPlayer(gamePlayer, playersCatalog) {
  if (!gamePlayer.sourcePlayerId) {
    return null;
  }

  return (
    playersCatalog.find(
      (player) => String(player.id) === String(gamePlayer.sourcePlayerId),
    ) ?? null
  );
}

function findGamePlayerForAnswer(answer, gamePlayersCatalog) {
  const answerNorm = normalizeName(answer);
  return gamePlayersCatalog.find(
    (player) => normalizeName(player.name) === answerNorm,
  );
}

export function findPlayersForAnswer(answer, nation, catalog) {
  const catalogMatch = findPlayerInCatalog(answer, nation, catalog);
  if (catalogMatch) {
    return [{ method: "catalog", player: catalogMatch }];
  }

  const matches = [];

  for (const player of catalog) {
    const result = matchAnswerToPlayer(answer, nation, player);
    if (result) {
      matches.push(result);
    }
  }

  return matches;
}

export function verifyListItem(item, playersCatalog, gamePlayersCatalog) {
  if (item.sourcePlayerId) {
    const catalogPlayer = playersCatalog.find(
      (player) => String(player.id) === String(item.sourcePlayerId),
    );
    if (catalogPlayer) {
      return {
        status: "ok",
        source: "players.json",
        method: "list-sourcePlayerId",
        player: catalogPlayer,
      };
    }
  }

  const linkedGamePlayer = findGamePlayerForAnswer(
    item.answer,
    gamePlayersCatalog,
  );
  const linkedCatalogPlayer = linkedGamePlayer
    ? resolveLinkedCatalogPlayer(linkedGamePlayer, playersCatalog)
    : null;

  if (linkedCatalogPlayer) {
    return {
      status: "ok",
      source: "players.json",
      method: "sourcePlayerId",
      player: linkedCatalogPlayer,
    };
  }

  if (linkedGamePlayer) {
    return {
      status: "curated-only",
      source: "game-players.json",
      method: "curated",
      player: linkedGamePlayer,
    };
  }

  const playerMatches = findPlayersForAnswer(
    item.answer,
    item.nation,
    playersCatalog,
  );

  if (playerMatches.length === 1) {
    return {
      status: "ok",
      source: "players.json",
      method: playerMatches[0].method,
      player: playerMatches[0].player,
    };
  }

  if (playerMatches.length > 1) {
    return {
      status: "ambiguous",
      source: "players.json",
      matches: playerMatches.map((entry) => ({
        id: entry.player.id,
        name: entry.player.name,
        club: entry.player.team ?? entry.player.club,
        method: entry.method,
      })),
    };
  }

  const curatedMatches = findPlayersForAnswer(
    item.answer,
    item.nation,
    gamePlayersCatalog,
  );

  if (curatedMatches.length === 1) {
    return {
      status: "curated-only",
      source: "game-players.json",
      method: curatedMatches[0].method,
      player: curatedMatches[0].player,
    };
  }

  if (curatedMatches.length > 1) {
    return {
      status: "ambiguous-curated",
      source: "game-players.json",
      matches: curatedMatches.map((entry) => ({
        id: entry.player.id,
        name: entry.player.name,
        club: entry.player.team ?? entry.player.club,
        method: entry.method,
      })),
    };
  }

  return {
    status: "missing",
    source: null,
  };
}

export function verifyTenableLists(options = {}) {
  const {
    listIds = null,
    extraSources = [],
    playersJsonOnly = false,
  } = options;

  const playersCatalog = loadPlayersCatalog();
  const gamePlayersCatalog = loadGamePlayersCatalog();
  const lists = loadAllTenableLists(extraSources);
  const selectedLists = listIds
    ? lists.filter((list) => listIds.has(list.id))
    : lists;

  if (listIds && selectedLists.length === 0) {
    throw new Error(`No lists matched ids: ${[...listIds].join(", ")}`);
  }

  const report = {
    listsChecked: selectedLists.length,
    itemsChecked: 0,
    ok: [],
    curatedOnly: [],
    ambiguous: [],
    missing: [],
  };

  for (const list of selectedLists) {
    for (const item of list.items ?? []) {
      report.itemsChecked += 1;
      const result = verifyListItem(item, playersCatalog, gamePlayersCatalog);
      const entry = {
        listId: list.id,
        listTitle: list.title,
        rank: item.rank,
        answer: item.answer,
        nation: item.nation ?? null,
        ...result,
      };

      if (result.status === "ok") {
        report.ok.push(entry);
        continue;
      }

      if (result.status === "curated-only") {
        report.curatedOnly.push(entry);
        continue;
      }

      if (result.status === "ambiguous" || result.status === "ambiguous-curated") {
        report.ambiguous.push(entry);
        continue;
      }

      report.missing.push(entry);
    }
  }

  const failures = [
    ...report.missing,
    ...report.ambiguous,
    ...(playersJsonOnly ? report.curatedOnly : []),
  ];

  return {
    ...report,
    passed: failures.length === 0,
    failureCount: failures.length,
  };
}

export function formatVerificationReport(report) {
  const lines = [];

  lines.push(
    `Checked ${report.itemsChecked} answers across ${report.listsChecked} list(s).`,
  );
  lines.push(
    `OK: ${report.ok.length} | Missing: ${report.missing.length} | Ambiguous: ${report.ambiguous.length} | Curated-only: ${report.curatedOnly.length}`,
  );

  if (report.missing.length > 0) {
    lines.push("\nMissing from players.json:");
    for (const item of report.missing) {
      lines.push(
        `  - ${item.listId} #${item.rank} ${item.answer}${item.nation ? ` (${item.nation})` : ""}`,
      );
    }
  }

  if (report.ambiguous.length > 0) {
    lines.push("\nAmbiguous matches:");
    for (const item of report.ambiguous) {
      lines.push(
        `  - ${item.listId} #${item.rank} ${item.answer}${item.nation ? ` (${item.nation})` : ""}`,
      );
      for (const match of item.matches ?? []) {
        lines.push(`      · ${match.id}: ${match.name} (${match.club ?? "?"})`);
      }
    }
  }

  if (report.curatedOnly.length > 0) {
    lines.push(
      "\nOnly in game-players.json (add to players.json or accept as curated):",
    );
    for (const item of report.curatedOnly) {
      lines.push(
        `  - ${item.listId} #${item.rank} ${item.answer} -> ${item.player.name}`,
      );
    }
  }

  if (report.passed) {
    lines.push("\nAll Top Order answers verified.");
  } else {
    lines.push(`\nVerification failed (${report.failureCount} issue(s)).`);
  }

  return lines.join("\n");
}
