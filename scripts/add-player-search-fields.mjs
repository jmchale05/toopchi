import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { normalizeSearchText } from "./lib/foldLatin.mjs";

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

function searchFields(player) {
  const name = String(player.name ?? "").trim();
  const firstname = String(player.firstname ?? "").trim();
  const lastname = String(player.lastname ?? "").trim();

  return {
    searchName: normalizeSearchText(name),
    searchFirstname: normalizeSearchText(firstname),
    searchLastname: normalizeSearchText(lastname),
  };
}

const PAGE_SIZE = 500;
let updated = 0;
let lastDoc = null;

console.log(`Adding search fields on "${projectId}" / database "${databaseId}"...`);

while (true) {
  let query = db.collection("players").orderBy("__name__").limit(PAGE_SIZE);
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  if (snapshot.empty) {
    break;
  }

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    batch.update(doc.ref, searchFields(doc.data()));
  }

  await batch.commit();
  updated += snapshot.size;
  lastDoc = snapshot.docs.at(-1);
  console.log(`Updated ${updated} players...`);

  if (snapshot.size < PAGE_SIZE) {
    break;
  }
}

console.log(`Done. Added search fields to ${updated} players.`);
