import {
  fetchTransfermarkt,
  parseAllTimeTable,
  parseItemsTable,
  COMPETITION_SOURCES,
  buildAllTimeGoalsUrl,
} from "./lib/transfermarktFetch.mjs";

const prem = COMPETITION_SOURCES.prem;
const goalsHtml = await fetchTransfermarkt(buildAllTimeGoalsUrl(prem));
console.log("PL all-time goals:");
console.log(
  parseAllTimeTable(goalsHtml, 10)
    .map((row) => `${row.rank}. ${row.name} (${row.value})`)
    .join("\n"),
);

const assistsHtml = await fetchTransfermarkt(
  `https://www.transfermarkt.com/${prem.path}/assistliste/${prem.binding}/${prem.code}/saison_id/0`,
);
console.log("\nPL all-time assists:");
console.log(
  parseItemsTable(assistsHtml, 10)
    .map((row) => `${row.rank}. ${row.name} (${row.value})`)
    .join("\n"),
);

for (const key of ["ucl", "uel", "chmp"]) {
  const config = COMPETITION_SOURCES[key];
  const goalsUrl = buildAllTimeGoalsUrl(config);
  try {
    const html = await fetchTransfermarkt(goalsUrl);
    console.log(`\n${config.label} all-time goals:`);
    console.log(
      parseAllTimeTable(html, 10)
        .map((row) => `${row.rank}. ${row.name}`)
        .join("\n"),
    );
  } catch (error) {
    console.log(`\n${config.label} goals failed:`, error.message);
  }

  const assistsUrl = `https://www.transfermarkt.com/${config.path}/assistliste/${config.binding}/${config.code}/saison_id/0`;
  try {
    const html = await fetchTransfermarkt(assistsUrl);
    console.log(`${config.label} all-time assists:`);
    console.log(
      parseItemsTable(html, 10)
        .map((row) => `${row.rank}. ${row.name}`)
        .join("\n"),
    );
  } catch (error) {
    console.log(`${config.label} assists failed:`, error.message);
  }
}
