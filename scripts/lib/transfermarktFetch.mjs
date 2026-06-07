import { normalizeSearchText } from "./foldLatin.mjs";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const FETCH_DELAY_MS = 400;

let lastFetchAt = 0;

export async function fetchTransfermarkt(url, retries = 3) {
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const now = Date.now();
    const wait = FETCH_DELAY_MS - (now - lastFetchAt);
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    lastFetchAt = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!response.ok) {
        throw new Error(`Transfermarkt ${response.status} for ${url}`);
      }

      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        );
      }
    }
  }

  throw lastError;
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

const NATION_ALIASES = {
  "Korea, South": "South Korea",
  "Cote d'Ivoire": "Ivory Coast",
  USA: "United States",
  Czechia: "Czech Republic",
};

export function parseItemsTable(html, limit = 10) {
  const entries = [];
  const withNation =
    /<td class="zentriert">(\d+)<\/td>[\s\S]*?<a title="([^"]+)" href="[^"]*\/profil\/spieler\/\d+">[^<]+<\/a>[\s\S]*?title="([^"]+)" alt="[^"]*" class="flaggenrahmen"[\s\S]*?(?:<td class="zentriert hauptlink"><a[^>]*>(\d+)<\/a><\/td>|<td class="zentriert hauptlink">(\d+)<\/td>)/gi;
  const withoutNation =
    /<td class="zentriert">(\d+)<\/td>[\s\S]*?<a title="([^"]+)" href="[^"]*\/profil\/spieler\/\d+">[^<]+<\/a>[\s\S]*?(?:<td class="zentriert hauptlink"><a[^>]*>(\d+)<\/a><\/td>|<td class="zentriert hauptlink">(\d+)<\/td>)/gi;

  for (const match of html.matchAll(withNation)) {
    entries.push({
      rank: Number(match[1]),
      name: decodeHtml(match[2]).trim(),
      nation: NATION_ALIASES[match[3]] ?? match[3],
      value: match[4] != null ? Number(match[4]) : Number(match[5]),
    });
    if (entries.length >= limit) return entries;
  }

  for (const match of html.matchAll(withoutNation)) {
    entries.push({
      rank: Number(match[1]),
      name: decodeHtml(match[2]).trim(),
      nation: null,
      value: match[3] != null ? Number(match[3]) : Number(match[4]),
    });
    if (entries.length >= limit) break;
  }

  return entries;
}

export function parseAllTimeTable(html, limit = 10) {
  const entries = [];
  const rowPattern = /<tr(?: class="(?:odd|even)")?>([\s\S]*?)<\/tr>/gi;

  for (const match of html.matchAll(rowPattern)) {
    const row = match[1];
    if (!row.includes("/profil/spieler/")) continue;

    const rankMatch = row.match(/<td[^>]*>\s*(\d+)\s*<\/td>/i);
    const nameMatch =
      row.match(
        /<a[^>]*href="[^"]*\/profil\/spieler\/\d+"[^>]*>([^<]+)<\/a>/i,
      ) ??
      row.match(
        /<a title="([^"]+)"[^>]*href="[^"]*\/profil\/spieler\/\d+"/i,
      );

    if (!nameMatch) continue;

    const statMatches = [
      ...row.matchAll(/<td class="zentriert[^"]*">(\d{2,3})<\/td>/gi),
    ];
    const value = statMatches.length
      ? Number(statMatches.at(-1)[1])
      : null;

    entries.push({
      rank: rankMatch ? Number(rankMatch[1]) : entries.length + 1,
      name: decodeHtml(nameMatch[1]).trim(),
      value,
    });

    if (entries.length >= limit) break;
  }

  return entries.length > 0 ? entries : parseItemsTable(html, limit);
}

export function slugToSaisonId(slug) {
  if (slug === "all-time") return null;
  const [start] = slug.split("-");
  return Number(start);
}

export function normalizePlayerName(name) {
  return normalizeSearchText(name);
}

export function namesMatch(left, right) {
  const a = normalizePlayerName(left);
  const b = normalizePlayerName(right);
  if (a === b) return true;

  const aParts = a.split(" ").filter(Boolean);
  const bParts = b.split(" ").filter(Boolean);
  if (aParts.at(-1) !== bParts.at(-1)) return false;

  const aFirst = aParts[0];
  const bFirst = bParts[0];
  if (aFirst.length === 1) return bFirst.startsWith(aFirst);
  if (bFirst.length === 1) return aFirst.startsWith(bFirst);
  return aFirst === bFirst;
}

export const COMPETITION_SOURCES = {
  prem: {
    label: "Premier League",
    path: "premier-league",
    binding: "wettbewerb",
    code: "GB1",
    seasonsFile: "src/data/premier-league-seasons.json",
    inlineAssists: true,
  },
  chmp: {
    label: "Championship",
    path: "championship",
    binding: "wettbewerb",
    code: "GB2",
    seasonsFile: "src/data/championship-seasons.json",
    assistsKey: "chmp",
  },
  ucl: {
    label: "Champions League",
    path: "uefa-champions-league",
    binding: "pokalwettbewerb",
    code: "CL",
    seasonsFile: "src/data/champions-league-seasons.json",
    assistsKey: "ucl",
  },
  uel: {
    label: "Europa League",
    path: "uefa-europa-league",
    binding: "pokalwettbewerb",
    code: "EL",
    seasonsFile: "src/data/europa-league-seasons.json",
    assistsKey: "uel",
  },
};

export function buildSeasonGoalsUrl(config, saisonId) {
  return `https://www.transfermarkt.com/${config.path}/torschuetzenliste/${config.binding}/${config.code}/saison_id/${saisonId}`;
}

export function buildSeasonAssistsUrl(config, saisonId) {
  return `https://www.transfermarkt.com/${config.path}/assistliste/${config.binding}/${config.code}/saison_id/${saisonId}`;
}

export function buildAllTimeGoalsUrl(config) {
  if (config.binding === "wettbewerb") {
    return `https://www.transfermarkt.com/${config.path}/ewigetorschuetzen/${config.binding}/${config.code}`;
  }

  return `https://www.transfermarkt.com/${config.path}/torschuetzenliste/${config.binding}/${config.code}/saison_id/0`;
}

export function buildAllTimeAssistsUrl(config) {
  return `https://www.transfermarkt.com/${config.path}/assistliste/${config.binding}/${config.code}/saison_id/0`;
}
