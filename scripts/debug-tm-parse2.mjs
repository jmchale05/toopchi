import { readFileSync } from "fs";

const html = readFileSync("tmp-tm-pl.html", "utf8");
const chunks = [
  ...html.matchAll(
    /<td class="zentriert">(\d+)<\/td>[\s\S]*?<a title="([^"]+)" href="[^"]*\/profil\/spieler\/\d+">[^<]+<\/a>[\s\S]*?<td class="zentriert hauptlink"><a[^>]*>(\d+)<\/a><\/td>/gi,
  ),
];

console.log(chunks.slice(0, 5).map((m) => `${m[1]}. ${m[2]} = ${m[3]}`).join("\n"));
