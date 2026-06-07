import { fetchTransfermarkt, parseItemsTable, parseAllTimeTable } from "./lib/transfermarktFetch.mjs";

function show(label, url) {
  return fetchTransfermarkt(url)
    .then((html) => {
      const rows = parseItemsTable(html, 5);
      console.log(`\n${label}\n${url}`);
      console.log(rows.map((r) => `${r.rank}. ${r.name} (${r.value})`).join("\n") || "(empty)");
    })
    .catch((error) => console.log(`\n${label}\n${url}\nFAIL ${error.message}`));
}

await show(
  "UCL all-time goals A",
  "https://www.transfermarkt.com/uefa-champions-league/torschuetzenliste/pokalwettbewerb/CL/saison_id/0",
);
await show(
  "UCL all-time goals B",
  "https://www.transfermarkt.com/uefa-champions-league/ewigetorschuetzenliste/pokalwettbewerb/CL",
);
await show(
  "UCL 24/25 goals",
  "https://www.transfermarkt.com/uefa-champions-league/torschuetzenliste/pokalwettbewerb/CL/saison_id/2024",
);
await show(
  "UEL all-time goals",
  "https://www.transfermarkt.com/uefa-europa-league/torschuetzenliste/pokalwettbewerb/EL/saison_id/0",
);
await show(
  "CHMP all-time goals",
  "https://www.transfermarkt.com/championship/ewigetorschuetzen/wettbewerb/GB2",
);

const pl = await fetchTransfermarkt(
  "https://www.transfermarkt.com/premier-league/ewigetorschuetzen/wettbewerb/GB1",
);
console.log(
  "\nPL all-time parseItemsTable:",
  parseItemsTable(pl, 10)
    .map((r) => `${r.rank}. ${r.name} (${r.value})`)
    .join("\n"),
);
