import {
  fetchTransfermarkt,
  parseRankingTable,
  parseAllTimeTable,
} from "./lib/transfermarktFetch.mjs";

const tests = [
  {
    label: "PL 24/25 goals",
    url: "https://www.transfermarkt.com/premier-league/torschuetzenliste/wettbewerb/GB1/saison_id/2024",
  },
  {
    label: "PL 24/25 assists",
    url: "https://www.transfermarkt.com/premier-league/assistenzliste/wettbewerb/GB1/saison_id/2024",
  },
  {
    label: "PL all-time goals",
    url: "https://www.transfermarkt.com/premier-league/ewigetorschuetzen/wettbewerb/GB1",
  },
  {
    label: "UCL 24/25 goals",
    url: "https://www.transfermarkt.com/uefa-champions-league/torschuetzenliste/pokalwettbewerb/CL/saison_id/2024",
  },
];

for (const test of tests) {
  const html = await fetchTransfermarkt(test.url);
  const ranking = parseRankingTable(html, 10);
  const allTime = parseAllTimeTable(html, 10);
  console.log(`\n=== ${test.label} ===`);
  console.log("ranking:", ranking.map((e) => `${e.rank}. ${e.name} (${e.value})`).join(" | "));
  console.log("allTime:", allTime.map((e) => `${e.rank}. ${e.name} (${e.value})`).join(" | "));
}
