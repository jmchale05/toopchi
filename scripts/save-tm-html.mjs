import { fetchTransfermarkt } from "./lib/transfermarktFetch.mjs";
import { writeFileSync } from "fs";

const urls = [
  "https://www.transfermarkt.com/premier-league/ewigetorschuetzen/wettbewerb/GB1",
  "https://www.transfermarkt.com/uefa-champions-league/ewigetorschuetzenliste/pokalwettbewerb/CL",
  "https://www.transfermarkt.com/championship/ewigetorschuetzen/wettbewerb/GB2",
];

for (const url of urls) {
  try {
    const html = await fetchTransfermarkt(url);
    const file = url.split("/").slice(-3).join("-") + ".html";
    writeFileSync(file, html);
    console.log("saved", file, html.length);
  } catch (e) {
    console.log("fail", url, e.message);
  }
}
