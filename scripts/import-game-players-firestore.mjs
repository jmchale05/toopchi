import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  buildPlayerDoc,
  findPlayerInCatalog,
  resolveClub,
  slugify,
} from "./lib/playerMatch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  join(root, "firebase-service-account.json");

if (!existsSync(credentialsPath)) {
  console.error("Missing firebase-service-account.json in project root.");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(credentialsPath, "utf8"));
const projectId =
  process.env.FIREBASE_PROJECT_ID ?? serviceAccount.project_id;

initializeApp({
  credential: cert(serviceAccount),
  projectId,
});

const databaseId = process.env.FIRESTORE_DATABASE_ID ?? "default";
const db = getFirestore(undefined, databaseId);

const players = Object.values(
  JSON.parse(readFileSync(join(root, "players.json"), "utf8")),
);
const gameOverrides = JSON.parse(
  readFileSync(join(root, "src/data/game-players.json"), "utf8"),
);
const tenableLists = [
  ...JSON.parse(readFileSync(join(root, "src/data/tenable-lists.json"), "utf8")),
  ...JSON.parse(
    readFileSync(join(root, "src/data/premier-league-lists.json"), "utf8"),
  ),
];
const dailyPlayers = JSON.parse(
  readFileSync(join(root, "src/data/daily-players.json"), "utf8"),
);
const matches = JSON.parse(
  readFileSync(join(root, "src/data/matches.json"), "utf8"),
);

function collectGameEntries() {
  const entries = new Map();

  for (const list of tenableLists) {
    for (const item of list.items) {
      entries.set(item.answer, {
        answer: item.answer,
        nation: item.nation ?? null,
      });
    }
  }

  for (const item of dailyPlayers) {
    if (!entries.has(item.answer)) {
      entries.set(item.answer, { answer: item.answer, nation: null });
    }
  }

  for (const match of matches) {
    for (const name of [...match.lineupA, ...match.lineupB]) {
      if (!entries.has(name)) {
        entries.set(name, { answer: name, nation: null });
      }
    }
  }

  return [...entries.values()];
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstname: "", lastname: "" };
  }
  if (parts.length === 1) {
    return { firstname: parts[0], lastname: parts[0] };
  }
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(" "),
  };
}

function buildAliasDoc(entry, matched, override) {
  const { firstname, lastname } = splitName(entry.answer);
  const clubInfo = override
    ? resolveClub(override.club ?? override.team)
    : resolveClub(matched?.team);

  return buildPlayerDoc({
    id: override?.id ?? `game-${slugify(entry.answer)}`,
    name: entry.answer,
    firstname: override?.firstname ?? matched?.firstname ?? firstname,
    lastname: override?.lastname ?? matched?.lastname ?? lastname,
    age: override?.age ?? matched?.age ?? null,
    nationality:
      override?.nationality ?? matched?.nationality ?? entry.nation ?? null,
    team: override?.club ?? clubInfo.team,
    club: override?.club ?? clubInfo.club,
    retired: override?.retired ?? clubInfo.retired,
    source: override ? "game-curated" : "game-alias",
    sourcePlayerId: override?.sourcePlayerId ?? matched?.id ?? null,
  });
}

const overrideByName = new Map(
  gameOverrides.map((player) => [player.name, player]),
);
const gameEntries = collectGameEntries();
const docs = new Map();

for (const entry of gameEntries) {
  const override = overrideByName.get(entry.answer);
  if (!override) {
    continue;
  }

  const matched = override.sourcePlayerId
    ? players.find(
        (player) => String(player.id) === String(override.sourcePlayerId),
      )
    : findPlayerInCatalog(entry.answer, entry.nation, players);

  const doc = buildAliasDoc(entry, matched, override);
  docs.set(String(doc.id), doc);
}

for (const override of gameOverrides) {
  if (!docs.has(String(override.id))) {
    docs.set(
      String(override.id),
      buildPlayerDoc({
        ...override,
        source: "game-curated",
      }),
    );
  }
}

const BATCH_SIZE = 400;
const allDocs = [...docs.values()];
let imported = 0;

for (let index = 0; index < allDocs.length; index += BATCH_SIZE) {
  const batch = db.batch();
  const chunk = allDocs.slice(index, index + BATCH_SIZE);

  for (const player of chunk) {
    batch.set(db.collection("players").doc(String(player.id)), player, {
      merge: true,
    });
  }

  await batch.commit();
  imported += chunk.length;
  console.log(`Imported ${imported} / ${allDocs.length} game players`);
}

console.log(
  `Done. ${imported} local game players merged into Firestore "players".`,
);
