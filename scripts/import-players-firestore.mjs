import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { buildPlayerDoc } from "./lib/playerMatch.mjs";

const BLOCKED_PROJECT_IDS = new Set(["footyfaker"]);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const playersPath = join(root, "players.json");
const credentialsPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  join(root, "firebase-service-account.json");

if (!existsSync(credentialsPath)) {
  console.error(
    "Missing Firebase service account key for the Toopchi project.\n" +
      "1. Open Firebase Console → toopchi → Project settings → Service accounts\n" +
      "2. Generate new private key\n" +
      "3. Save as firebase-service-account.json in the project root\n" +
      "   (or set GOOGLE_APPLICATION_CREDENTIALS to its path)",
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(credentialsPath, "utf8"));
const projectId =
  process.env.FIREBASE_PROJECT_ID ?? serviceAccount.project_id;

if (BLOCKED_PROJECT_IDS.has(projectId)) {
  console.error(
    `Refusing to import into "${projectId}". Use the Toopchi Firebase service account.`,
  );
  process.exit(1);
}

if (!projectId.startsWith("toopchi")) {
  console.error(
    `Service account project "${projectId}" does not look like Toopchi.\n` +
      "Download the key from the toopchi Firebase project, not footyfaker.",
  );
  process.exit(1);
}

console.log(`Importing into Firebase project: ${projectId}`);

initializeApp({
  credential: cert(serviceAccount),
  projectId,
});

const databaseId = process.env.FIRESTORE_DATABASE_ID ?? "default";
const db = getFirestore(undefined, databaseId);

console.log(`Using Firestore database: ${databaseId}`);
const raw = JSON.parse(readFileSync(playersPath, "utf8"));
const players = Object.values(raw);

const BATCH_SIZE = 500;
let imported = 0;

for (let index = 0; index < players.length; index += BATCH_SIZE) {
  const batch = db.batch();
  const chunk = players.slice(index, index + BATCH_SIZE);

  for (const player of chunk) {
    const docId = String(player.id);
    batch.set(db.collection("players").doc(docId), buildPlayerDoc(player));
  }

  try {
    await batch.commit();
  } catch (error) {
    if (error?.code === 5) {
      console.error(
        `Firestore is not set up for "${projectId}".\n` +
          "Open Firebase Console → toopchi → Firestore Database → Create database,\n" +
          "then run: npm run import:players",
      );
      process.exit(1);
    }
    throw error;
  }

  imported += chunk.length;
  console.log(`Imported ${imported} / ${players.length}`);
}

console.log(
  `Done. ${imported} players written to "${projectId}" Firestore collection "players".`,
);
