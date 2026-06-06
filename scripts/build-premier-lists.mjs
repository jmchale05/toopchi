import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seasons = JSON.parse(
  readFileSync(join(root, "src/data/premier-league-seasons.json"), "utf8"),
);

const EXTRA_ALIASES = {
  "Erling Haaland": ["Haaland"],
  "Mohamed Salah": ["Salah"],
  "Son Heung-min": ["Son", "Heung-min Son"],
  "Harry Kane": ["Kane", "H. Kane"],
  "Romelu Lukaku": ["Lukaku", "R. Lukaku"],
  "Alexis Sánchez": ["Sanchez", "Sánchez", "A. Sánchez", "A. Sanchez"],
  "Sergio Agüero": ["Aguero", "Agüero", "S. Agüero", "S. Aguero"],
  "Dele Alli": ["Alli", "D. Alli"],
  "Zlatan Ibrahimović": ["Ibrahimovic", "Ibrahimović", "Zlatan", "Z. Ibrahimović"],
  "Eden Hazard": ["Hazard", "E. Hazard"],
  "Fernando Llorente": ["Llorente"],
  "Joshua King": ["King", "J. King"],
  "Diego Costa": ["Costa"],
  "Cristiano Ronaldo": ["Ronaldo", "CR7"],
  "Kevin De Bruyne": ["De Bruyne", "KDB"],
  "Bruno Fernandes": ["Fernandes"],
  "Cole Palmer": ["Palmer"],
  "Alexander Isak": ["Isak"],
  "Morgan Gibbs-White": ["Gibbs-White", "Gibbs White"],
  "Dominic Calvert-Lewin": ["Calvert-Lewin", "DCL"],
  "Viktor Gyökeres": ["Gyokeres", "Gyökeres"],
  "João Pedro": ["Joao Pedro", "Pedro"],
  "Pierre-Emerick Aubameyang": ["Aubameyang"],
  "Raheem Sterling": ["Sterling"],
  "İlkay Gündoğan": ["Gundogan", "Gündoğan"],
  "Graziano Pellè": ["Pelle", "Pellè"],
  "Gylfi Sigurðsson": ["Sigurdsson", "Sigurðsson"],
  "Aleksandar Mitrović": ["Mitrovic", "Mitrović"],
  "Jørgen Strand Larsen": ["Strand Larsen"],
  "Martin Ødegaard": ["Odegaard", "Ødegaard"],
  "Jean-Philippe Mateta": ["Mateta"],
  "Eli Junior Kroupi": ["Kroupi", "Eli Kroupi"],
};

function buildAliases(name) {
  const aliases = new Set(EXTRA_ALIASES[name] ?? []);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length > 1) {
    aliases.add(parts[parts.length - 1]);
  }
  return [...aliases].filter((alias) => alias !== name);
}

function buildList(season, type, players) {
  const id =
    type === "scorers"
      ? `prem-top-scorers-${season.slug}`
      : `prem-top-assists-${season.slug}`;
  const title =
    type === "scorers"
      ? `Premier League Top 10 Scorers (${season.season})`
      : `Premier League Top 10 Assists (${season.season})`;

  return {
    id,
    title,
    category: type === "scorers" ? "prem-scorers" : "prem-assists",
    season: season.season,
    items: players.map((player, index) => ({
      rank: index + 1,
      answer: player.name,
      aliases: buildAliases(player.name),
      nation: player.nation,
      ...(player.value != null ? { value: player.value } : {}),
    })),
  };
}

const lists = seasons.flatMap((season) => [
  buildList(season, "scorers", season.scorers),
  buildList(season, "assists", season.assists),
]);

writeFileSync(
  join(root, "src/data/premier-league-lists.json"),
  `${JSON.stringify(lists, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${lists.length} Premier League Top Order lists.`);
