import { fetchTransfermarkt, parseItemsTable } from "./lib/transfermarktFetch.mjs";

const candidates = [
  "https://www.transfermarkt.com/premier-league/assistliste/wettbewerb/GB1/plus/0/galerie/0?saison_id=&sort=vorlagen",
  "https://www.transfermarkt.com/premier-league/ewigvorlagengeber/wettbewerb/GB1",
  "https://www.transfermarkt.com/premier-league/ewigvorlagengeberliste/wettbewerb/GB1",
  "https://www.transfermarkt.com/premier-league/assistliste/wettbewerb/GB1/saison_id/0",
];

for (const url of candidates) {
  try {
    const html = await fetchTransfermarkt(url);
    const top = parseItemsTable(html, 5);
    console.log("\n", url);
    console.log(
      top.map((row) => `${row.rank}. ${row.name} (${row.value})`).join("\n") ||
        "no rows",
    );
  } catch (error) {
    console.log("\n", url, "->", error.message);
  }
}
