import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

const assistsBySlug = JSON.parse(
  readFileSync(join(root, "src/data/competition-assists-by-slug.json"), "utf8"),
);

export const SHARED_EXTRA_ALIASES = {
  "Cristiano Ronaldo": ["Ronaldo", "CR7"],
  "Lionel Messi": ["Messi"],
  "Robert Lewandowski": ["Lewandowski", "Lewa"],
  "Karim Benzema": ["Benzema"],
  "Ruud van Nistelrooy": ["Van Nistelrooy", "Nistelrooy"],
  "Thomas Müller": ["Muller", "Müller"],
  "Thierry Henry": ["Henry"],
  "Filippo Inzaghi": ["Inzaghi"],
  "Andriy Shevchenko": ["Shevchenko", "Sheva"],
  "Erling Haaland": ["Haaland"],
  "Harry Kane": ["Kane"],
  "Kylian Mbappé": ["Mbappe", "Mbappé"],
  "Mohamed Salah": ["Salah"],
  "Vinícius Júnior": ["Vinicius Jr", "Vini Jr", "Vinicius Junior"],
  "Jude Bellingham": ["Bellingham"],
  "Lautaro Martínez": ["Lautaro", "Martinez"],
  "Ousmane Dembélé": ["Dembele", "Dembélé"],
  "Julián Álvarez": ["Julian Alvarez", "Alvarez", "Álvarez"],
  "João Mário": ["Joao Mario"],
  "João Pedro": ["Joao Pedro", "Pedro"],
  "Raphinha": ["Raphinha"],
  "Serhou Guirassy": ["Guirassy"],
  "Lamine Yamal": ["Yamal"],
  "Phil Foden": ["Foden"],
  "Riyad Mahrez": ["Mahrez"],
  "Victor Osimhen": ["Osimhen"],
  "Anthony Gordon": ["Gordon"],
  "Khvicha Kvaratskhelia": ["Kvaratskhelia", "Kvara"],
  "Antoine Griezmann": ["Griezmann"],
  "Rodrygo": ["Rodrygo"],
  "Rafa Silva": ["Rafa Silva"],
  "Pierre-Emerick Aubameyang": ["Aubameyang"],
  "Radamel Falcao": ["Falcao"],
  "Bruno Fernandes": ["Fernandes"],
  "Romelu Lukaku": ["Lukaku"],
  "Aritz Aduriz": ["Aduriz"],
  "Alexandre Lacazette": ["Lacazette"],
  "Edin Džeko": ["Dzeko", "Džeko"],
  "Kevin Gameiro": ["Gameiro"],
  "Óscar Cardozo": ["Oscar Cardozo", "Cardozo"],
  "Alan Shearer": ["Shearer"],
  "Wayne Rooney": ["Rooney"],
  "Andy Cole": ["Cole"],
  "Sergio Agüero": ["Aguero", "Agüero"],
  "Frank Lampard": ["Lampard"],
  "Robbie Fowler": ["Fowler"],
  "Jermain Defoe": ["Defoe"],
  "Michael Owen": ["Owen"],
  "Billy Sharp": ["Sharp"],
  "Jordan Rhodes": ["Rhodes"],
  "David Nugent": ["Nugent"],
  "Ross McCormack": ["McCormack"],
  "Chris Martin": ["Martin"],
  "Lewis Grabban": ["Grabban"],
  "Nahki Wells": ["Wells"],
  "Lukas Jutkiewicz": ["Jutkiewicz"],
  "Troy Deeney": ["Deeney"],
  "Tom Ince": ["Ince"],
  "Aleksandar Mitrović": ["Mitrovic", "Mitrović"],
  "Ivan Toney": ["Toney"],
  "James Tavernier": ["Tavernier"],
  "Gerard Moreno": ["Moreno"],
  "Václav Černý": ["Cerny", "Černý"],
  "Ayoub El Kaabi": ["El Kaabi"],
  "Kasper Høgh": ["Hogh", "Høgh"],
  "Sammie Szmodics": ["Szmodics"],
  "Joël Piroe": ["Joel Piroe", "Piroe"],
  "Chuba Akpom": ["Akpom"],
  "Viktor Gyökeres": ["Gyokeres", "Gyökeres"],
  "Zan Vipotnik": ["Vipotnik"],
  "Crysencio Summerville": ["Summerville"],
  "Morgan Gibbs-White": ["Gibbs-White", "Gibbs White"],
  "Dominic Calvert-Lewin": ["Calvert-Lewin", "DCL"],
  "Martin Ødegaard": ["Odegaard", "Ødegaard"],
  "Son Heung-min": ["Son", "Heung-min Son"],
  "Cole Palmer": ["Palmer"],
  "Alexander Isak": ["Isak"],
  "Gianluca Scamacca": ["Scamacca"],
  "Victor Boniface": ["Boniface"],
  "Marcus Rashford": ["Rashford"],
  "Paulo Dybala": ["Dybala"],
  "Yusuf Yazıcı": ["Yazici", "Yazıcı"],
  "Borja Mayoral": ["Mayoral"],
  "Munas Dabbur": ["Dabbur"],
  "Petar Stanic": ["Stanic"],
  "Igor Jesus": ["Jesus"],
  "Kerem Aktürkoglu": ["Akturkoglu", "Aktürkoglu"],
  "Ben Brereton Díaz": ["Brereton Diaz", "Brereton Díaz"],
  "Ross Stewart": ["Stewart"],
  "Adam Armstrong": ["Armstrong"],
  "Emiliano Buendía": ["Buendia", "Buendía"],
  "Josh Maupay": ["Maupay"],
  "Daniel James": ["James"],
  "Jack Clarke": ["Clarke"],
  "Gabriel Sara": ["Sara"],
  "Kiernan Dewsbury-Hall": ["Dewsbury-Hall"],
  "Josh Brownhill": ["Brownhill"],
  "Borja Sainz": ["Sainz"],
  "Josh Sargent": ["Sargent"],
  "Tommy Conway": ["Conway"],
  "Wilson Isidor": ["Isidor"],
  "Josh Windass": ["Windass"],
  "Finn Azaz": ["Azaz"],
  "Anis Mehmeti": ["Mehmeti"],
  "Carlton Morris": ["Morris"],
  "Nathan Tella": ["Tella"],
  "Tom Bradshaw": ["Bradshaw"],
  "Zian Flemming": ["Flemming"],
  "Iliman Ndiaye": ["Ndiaye"],
  "Jerry Yates": ["Yates"],
  "John Swift": ["Swift"],
  "Tom Lawrence": ["Lawrence"],
  "Harry Wilson": ["Wilson"],
  "Keane Lewis-Potter": ["Lewis-Potter"],
  "Brennan Johnson": ["Johnson"],
  "Kieffer Moore": ["Moore"],
  "Morgan Whittaker": ["Whittaker"],
  "Jaden Philogene": ["Philogene"],
  "Femi Azeez": ["Azeez"],
  "Jordan James": ["James"],
  "Sorba Thomas": ["Thomas"],
  "Ephron Mason-Clark": ["Mason-Clark"],
  "Emmanuel Latte Lath": ["Latte Lath"],
  "Conor Chaplin": ["Chaplin"],
  "Nathan Broadhead": ["Broadhead"],
  "Stephy Mavididi": ["Mavididi"],
  "Malick Fofana": ["Fofana"],
  "Nico Williams": ["Nico Williams"],
  "Iñaki Williams": ["Inaki Williams"],
  "Kenneth Taylor": ["Taylor"],
  "Yunus Akgün": ["Akgun", "Akgün"],
  "Youssef En-Nesyri": ["En-Nesyri", "En Nesyri"],
  "Rasmus Højlund": ["Hojlund", "Højlund"],
  "Barnabás Varga": ["Varga"],
  "Mohammed Kudus": ["Kudus"],
  "Ademola Lookman": ["Lookman"],
  "Patrik Schick": ["Schick"],
  "Igor Thiago": ["Igor Thiago"],
  "Lorenzo Pellegrini": ["Pellegrini"],
  "Wissam Ben Yedder": ["Ben Yedder"],
  "Ángel Di María": ["Di Maria", "Di María"],
  "Anastasios Bakasetas": ["Bakasetas"],
  "Teddy Teuma": ["Teuma"],
  "Ludovic Blas": ["Blas"],
  "Karl Toko Ekambi": ["Toko Ekambi"],
  "Daichi Kamada": ["Kamada"],
  "Ricardo Horta": ["Horta"],
  "Mislav Orsic": ["Orsic"],
  "Moussa Diaby": ["Diaby"],
  "Eljif Elmas": ["Elmas"],
  "Filip Kostić": ["Kostic", "Kostić"],
  "Florian Wirtz": ["Wirtz"],
  "Pizzi": ["Pizzi"],
  "Carlos Vinícius": ["Carlos Vinicius", "Vinícius"],
  "Willian José": ["Willian Jose"],
  "Alexander Sørloth": ["Sorloth", "Sørloth"],
  "Bilal El Khannouss": ["El Khannouss"],
  "Federico Bernardeschi": ["Bernardeschi"],
  "Antony": ["Antony"],
  "Dion Drena Beljo": ["Beljo"],
  "Olivier Giroud": ["Giroud"],
  "Karol Swiderski": ["Swiderski"],
  "Daan Heymans": ["Heymans"],
  "Mihailo Ivanović": ["Ivanovic", "Ivanović"],
  "Liam Cullen": ["Cullen"],
  "Manor Solomon": ["Solomon"],
  "Mustapha Bundu": ["Bundu"],
  "Scott Twine": ["Twine"],
  "Victor Torp": ["Torp"],
  "Ryan Giggs": ["Giggs"],
  "Andrés Iniesta": ["Iniesta"],
  "Luis Figo": ["Figo"],
  "Xavi": ["Xavi"],
  "James Milner": ["Milner"],
  "Willian": ["Willian"],
  "Ruslan Malinovskyi": ["Malinovskyi"],
  "Ivan Rakitić": ["Rakitic", "Rakitić"],
  "Barry Bannan": ["Bannan"],
  "Morgan Rogers": ["Rogers"],
  "Jonathan Rowe": ["Rowe"],
  "Amad Diallo": ["Diallo"],
  "Donyell Malen": ["Malen"],
  "Thijs Dallinga": ["Dallinga"],
  "Riccardo Orsolini": ["Orsolini"],
  "Corentin Tolisso": ["Tolisso"],
  "Vincenzo Grifo": ["Grifo"],
  "Ruben Loftus-Cheek": ["Loftus-Cheek"],
  "Mikel Oyarzabal": ["Oyarzabal"],
  "Rayan Cherki": ["Cherki"],
  "Bernardo Silva": ["Bernardo Silva"],
  "Kevin De Bruyne": ["De Bruyne", "KDB"],
  "Leroy Sané": ["Sane", "Sané"],
  "Christopher Nkunku": ["Nkunku"],
  "Vitinha": ["Vitinha"],
  "Jarrod Bowen": ["Bowen"],
  "Dominic Solanke": ["Solanke"],
  "Cesc Fàbregas": ["Fabregas", "Fàbregas"],
  "Denis Bergkamp": ["Bergkamp"],
  "David Silva": ["Silva"],
  "Steven Gerrard": ["Gerrard"],
  "Mesut Özil": ["Ozil", "Özil"],
};

export function buildAliases(name, customAliases, extraAliases = SHARED_EXTRA_ALIASES) {
  if (customAliases) {
    return customAliases.filter((alias) => alias !== name);
  }

  const aliases = new Set(extraAliases[name] ?? []);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length > 1) {
    aliases.add(parts[parts.length - 1]);
  }
  return [...aliases].filter((alias) => alias !== name);
}

function buildListItems(players, extraAliases) {
  return players.map((player, index) => ({
    rank: index + 1,
    answer: player.name,
    aliases: buildAliases(player.name, player.aliases, extraAliases),
    nation: player.nation,
    ...(player.value != null ? { value: player.value } : {}),
    ...(player.sourcePlayerId ? { sourcePlayerId: player.sourcePlayerId } : {}),
  }));
}

function buildScorerList(season, config) {
  const id =
    season.slug === "all-time"
      ? config.allTimeScorerListId
      : `${config.idPrefix}-top-scorers-${season.slug}`;
  const title =
    season.slug === "all-time"
      ? `${config.competitionName} Top 10 Goal Scorers (All time)`
      : `${config.competitionName} Top 10 Scorers (${season.season})`;

  return {
    id,
    title,
    category: config.scorerCategory,
    season: season.season,
    items: buildListItems(season.scorers, config.extraAliases),
  };
}

function buildAssistList(season, config, players) {
  const id =
    season.slug === "all-time"
      ? config.allTimeAssistListId
      : `${config.idPrefix}-top-assists-${season.slug}`;
  const title =
    season.slug === "all-time"
      ? `${config.competitionName} Top 10 Assists (All time)`
      : `${config.competitionName} Top 10 Assists (${season.season})`;

  return {
    id,
    title,
    category: config.assistCategory,
    season: season.season,
    items: buildListItems(players, config.extraAliases),
  };
}

export function buildCompetitionLists(config) {
  const seasons = JSON.parse(
    readFileSync(join(root, config.seasonsFile), "utf8"),
  );
  const competitionAssists = assistsBySlug[config.competitionKey] ?? {};

  const lists = seasons.flatMap((season) => {
    const scorerList = buildScorerList(season, config);
    const assistPlayers =
      season.assists ?? competitionAssists[season.slug] ?? [];
    if (assistPlayers.length === 0) {
      return [scorerList];
    }
    return [scorerList, buildAssistList(season, config, assistPlayers)];
  });

  writeFileSync(
    join(root, config.outputFile),
    `${JSON.stringify(lists, null, 2)}\n`,
    "utf8",
  );

  return lists.length;
}

export function runCompetitionScorerBuild(config) {
  const count = buildCompetitionLists(config);
  console.log(`Wrote ${count} ${config.competitionName} Top Order lists.`);
}
