import { readFileSync } from "fs";
import { parseItemsTable } from "./lib/transfermarktFetch.mjs";

const html = readFileSync("tmp-tm-pl.html", "utf8");
const tableMatch = html.match(
  /<table class="items">[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i,
);
const row = tableMatch[1].match(
  /<tr class="odd">[\s\S]*?Mohamed Salah[\s\S]*?<\/tr>/,
)[0];

console.log("tail:", row.slice(-250));
const valueMatches = [
  ...row.matchAll(
    /<td class="zentriert hauptlink"><a[^>]*>(\d+)<\/a><\/td>/gi,
  ),
];
console.log("matches:", valueMatches.map((m) => m[1]));
console.log("parsed:", parseItemsTable(html, 3));
