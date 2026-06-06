import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const credentialsPath = join(root, "firebase-service-account.json");
const serviceAccount = JSON.parse(readFileSync(credentialsPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore(undefined, "default");
const term = process.argv[2] ?? "messi";

const snapshot = await db
  .collection("players")
  .orderBy("searchName")
  .startAt(term)
  .endAt(`${term}\uf8ff`)
  .limit(5)
  .get();

console.log(`searchName prefix "${term}": ${snapshot.size} results`);
for (const doc of snapshot.docs) {
  const data = doc.data();
  console.log(`- ${doc.id}: ${data.name} (${data.club ?? data.team})`);
}

const missingSearch = await db
  .collection("players")
  .limit(20)
  .get();

const without = missingSearch.docs.filter(
  (doc) => !doc.data().searchName,
).length;
console.log(`sample docs missing searchName: ${without}/20`);
