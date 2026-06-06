import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { normalizeName, lastToken } from "./lib/playerMatch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()].filter(([, group]) => group.length > 1);
}

function printGroups(title, groups, formatter, limit = 15) {
  console.log(`\n${title}: ${groups.length} duplicate groups`);
  for (const [key, group] of groups.slice(0, limit)) {
    console.log(`  [${key}]`);
    for (const item of group) {
      console.log(`    - ${formatter(item)}`);
    }
  }
  if (groups.length > limit) {
    console.log(`  ...and ${groups.length - limit} more groups`);
  }
}

function analyzeIndex(index) {
  printGroups(
    "Search index — same searchName",
    groupBy(index, (p) => p.searchName),
    (p) => `${p.id}: ${p.name} (${p.club})`,
  );

  printGroups(
    "Search index — same display name",
    groupBy(index, (p) => normalizeName(p.name)),
    (p) => `${p.id}: ${p.name} (${p.club})`,
  );

  printGroups(
    "Search index — same lastname + club",
    groupBy(index, (p) => `${p.searchLastname}|${normalizeName(p.club)}`),
    (p) => `${p.id}: ${p.name} (${p.club})`,
  );
}

function analyzeSources(players, gamePlayers) {
  const catalog = Object.values(players);

  printGroups(
    "players.json — same searchName",
    groupBy(
      catalog.map((p) => ({
        id: p.id,
        name: p.name,
        searchName: normalizeName(p.name),
        club: p.team,
      })),
      (p) => p.searchName,
    ),
    (p) => `${p.id}: ${p.name} (${p.club})`,
    10,
  );

  const gameDupes = [];
  for (const gamePlayer of gamePlayers) {
    const matched = catalog.filter((player) => {
      const sameName = normalizeName(player.name) === normalizeName(gamePlayer.name);
      const sameLast =
        lastToken(player.lastname) === lastToken(gamePlayer.lastname) &&
        normalizeName(player.nationality) === normalizeName(gamePlayer.nationality);
      return sameName || sameLast;
    });

    if (matched.length > 0 && !gamePlayer.sourcePlayerId) {
      gameDupes.push({ game: gamePlayer, catalog: matched });
    }
  }

  console.log(
    `\ngame-players.json overlapping catalog (no sourcePlayerId): ${gameDupes.length}`,
  );
  for (const item of gameDupes.slice(0, 10)) {
    console.log(`  game: ${item.game.id} ${item.game.name}`);
    for (const player of item.catalog.slice(0, 3)) {
      console.log(`    catalog: ${player.id} ${player.name} (${player.team})`);
    }
  }
}

async function analyzeFirestore() {
  const credentialsPath = join(root, "firebase-service-account.json");
  if (!existsSync(credentialsPath)) {
    console.log("\nFirestore: skipped (no service account)");
    return;
  }

  try {
    const { cert, initializeApp } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    const serviceAccount = JSON.parse(readFileSync(credentialsPath, "utf8"));

    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    const db = getFirestore(undefined, "default");
    const snapshot = await db.collection("players").select("name", "searchName", "club", "source", "sourcePlayerId").get();

    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`\nFirestore: scanned ${docs.length} documents`);

    printGroups(
      "Firestore — same searchName",
      groupBy(docs, (p) => p.searchName),
      (p) => `${p.id}: ${p.name} (${p.club ?? p.team ?? "?"})`,
      10,
    );

    const aliasDupes = docs.filter(
      (doc) =>
        String(doc.id).startsWith("game-") &&
        doc.sourcePlayerId &&
        docs.some((other) => other.id === String(doc.sourcePlayerId)),
    );
    console.log(
      `Firestore game-* aliases pointing at existing catalog docs: ${aliasDupes.length}`,
    );
    for (const doc of aliasDupes.slice(0, 10)) {
      console.log(`  - ${doc.id} (${doc.name}) -> ${doc.sourcePlayerId}`);
    }
  } catch (error) {
    console.log(`\nFirestore: could not scan (${error.message})`);
  }
}

const indexPath = join(root, "public/player-search-index.json");
if (!existsSync(indexPath)) {
  console.error("Missing public/player-search-index.json — run npm run build:player-index");
  process.exit(1);
}

const index = loadJson("public/player-search-index.json");
const players = loadJson("players.json");
const gamePlayers = loadJson("src/data/game-players.json");

console.log(`Search index: ${index.length} players`);
console.log(`players.json: ${Object.keys(players).length} players`);
console.log(`game-players.json: ${gamePlayers.length} curated entries`);

analyzeIndex(index);
analyzeSources(players, gamePlayers);
await analyzeFirestore();

console.log("\nDone.");
