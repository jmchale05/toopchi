import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  findPlayerInCatalog,
  normalizeName,
} from "./lib/playerMatch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  join(root, "firebase-service-account.json");

if (!existsSync(credentialsPath)) {
  console.error("Missing firebase-service-account.json in project root.");
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const serviceAccount = JSON.parse(readFileSync(credentialsPath, "utf8"));
const projectId =
  process.env.FIREBASE_PROJECT_ID ?? serviceAccount.project_id;

initializeApp({
  credential: cert(serviceAccount),
  projectId,
});

const databaseId = process.env.FIRESTORE_DATABASE_ID ?? "default";
const db = getFirestore(undefined, databaseId);

function isCatalogId(id) {
  return /^\d+$/.test(String(id));
}

function pickKeeper(group) {
  return [...group].sort((left, right) => {
    const score = (doc) => {
      let value = 0;
      if (isCatalogId(doc.docId)) value += 1000;
      if (doc.source === "players-json") value += 500;
      if (doc.source === "game-curated" && !doc.sourcePlayerId) value += 200;
      if (!String(doc.docId).startsWith("game-")) value += 100;
      value += String(doc.name ?? "").length;
      return value;
    };
    return score(right) - score(left);
  })[0];
}

async function loadPlayers() {
  const snapshot = await db.collection("players").get();
  return snapshot.docs.map((doc) => ({
    docId: doc.id,
    ...doc.data(),
    id: doc.data().id ?? doc.id,
  }));
}

function buildDuplicateGroups(players) {
  const bySourcePlayerId = new Map();
  const bySearchName = new Map();

  for (const player of players) {
    if (player.sourcePlayerId) {
      const key = String(player.sourcePlayerId);
      if (!bySourcePlayerId.has(key)) bySourcePlayerId.set(key, []);
      bySourcePlayerId.get(key).push(player);
    }

    const searchKey = normalizeName(player.searchName ?? player.name);
    if (searchKey) {
      if (!bySearchName.has(searchKey)) bySearchName.set(searchKey, []);
      bySearchName.get(searchKey).push(player);
    }
  }

  const deleteIds = new Set();
  const groups = [];

  for (const [sourceId, group] of bySourcePlayerId) {
    if (group.length <= 1) continue;
    const keeper = pickKeeper(group);
    const duplicates = group.filter((player) => player.docId !== keeper.docId);
    if (duplicates.length === 0) continue;

    groups.push({
      reason: `sourcePlayerId:${sourceId}`,
      keeper,
      duplicates,
    });
    for (const duplicate of duplicates) {
      deleteIds.add(duplicate.docId);
    }
  }

  const catalogPlayers = players.filter((player) => isCatalogId(player.docId));

  for (const player of players) {
    if (!String(player.docId).startsWith("game-")) continue;
    if (deleteIds.has(player.docId)) continue;
    if (player.sourcePlayerId && players.some((p) => p.docId === String(player.sourcePlayerId))) {
      deleteIds.add(player.docId);
      groups.push({
        reason: `alias-of-catalog:${player.sourcePlayerId}`,
        keeper: players.find((p) => p.docId === String(player.sourcePlayerId)),
        duplicates: [player],
      });
      continue;
    }

    const matched = findPlayerInCatalog(
      player.name,
      player.nationality,
      catalogPlayers,
    );
    if (matched && matched.docId !== player.docId) {
      deleteIds.add(player.docId);
      groups.push({
        reason: `matched-catalog:${matched.docId}`,
        keeper: matched,
        duplicates: [player],
      });
    }
  }

  for (const [searchKey, group] of bySearchName) {
    const remaining = group.filter((player) => !deleteIds.has(player.docId));
    if (remaining.length <= 1) continue;

    const keeper = pickKeeper(remaining);
    const duplicates = remaining.filter((player) => player.docId !== keeper.docId);
    if (duplicates.length === 0) continue;

    groups.push({
      reason: `searchName:${searchKey}`,
      keeper,
      duplicates,
    });
    for (const duplicate of duplicates) {
      deleteIds.add(duplicate.docId);
    }
  }

  return { deleteIds, groups };
}

const players = await loadPlayers();
const { deleteIds, groups } = buildDuplicateGroups(players);

console.log(`Scanned ${players.length} player documents.`);
console.log(`Found ${deleteIds.size} duplicates across ${groups.length} groups.`);

for (const group of groups.slice(0, 20)) {
  console.log(
    `\n[${group.reason}] keep: ${group.keeper.docId} (${group.keeper.name})`,
  );
  for (const duplicate of group.duplicates) {
    console.log(`  delete: ${duplicate.docId} (${duplicate.name})`);
  }
}

if (groups.length > 20) {
  console.log(`\n...and ${groups.length - 20} more groups`);
}

if (!apply) {
  console.log(
    "\nDry run only. Re-run with --apply to delete the duplicate documents.",
  );
  process.exit(0);
}

const ids = [...deleteIds];
const BATCH_SIZE = 400;

for (let index = 0; index < ids.length; index += BATCH_SIZE) {
  const batch = db.batch();
  const chunk = ids.slice(index, index + BATCH_SIZE);
  for (const id of chunk) {
    batch.delete(db.collection("players").doc(id));
  }
  await batch.commit();
  console.log(`Deleted ${Math.min(index + chunk.length, ids.length)} / ${ids.length}`);
}

console.log(`Done. Removed ${ids.length} duplicate player documents.`);
