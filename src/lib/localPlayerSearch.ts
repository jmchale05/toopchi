import { decodeHtmlEntities, normalizeSearchText } from "./foldLatin";
import type { PlayerRecord, PlayerSearchResult } from "../types/player";

export type LocalSearchPage = {
  results: PlayerSearchResult[];
  hasMore: boolean;
};

const PAGE_SIZE = 8;

type SearchIndexEntry = {
  id: number | string;
  name: string;
  age: number | null;
  club: string;
  league: string | null;
  position: string | null;
  nationality: string | null;
  retired: boolean;
  searchName: string;
  searchFirstname: string;
  searchLastname: string;
};

let indexCache: SearchIndexEntry[] | null = null;
let indexPromise: Promise<SearchIndexEntry[]> | null = null;

function toPlayerRecord(entry: SearchIndexEntry): PlayerRecord {
  return {
    id: entry.id,
    name: decodeHtmlEntities(entry.name),
    firstname: null,
    lastname: null,
    age: entry.age,
    nationality: entry.nationality,
    team: entry.club,
    club: entry.club,
    league: entry.league,
    position: entry.position,
    retired: entry.retired,
    searchName: entry.searchName,
    searchFirstname: entry.searchFirstname,
    searchLastname: entry.searchLastname,
  };
}

function scoreMultiTokenName(
  firstname: string,
  lastname: string,
  term: string,
): number {
  const tokens = term.split(" ").filter(Boolean);
  if (tokens.length < 2) return 0;

  const firstToken = tokens[0];
  const lastToken = tokens.at(-1) ?? "";
  const lastnameParts = lastname.split(" ").filter(Boolean);

  const firstMatches =
    firstname.startsWith(firstToken) ||
    (firstToken.length === 1 && firstname.startsWith(firstToken));

  const lastMatches =
    lastname.startsWith(lastToken) ||
    lastnameParts.some(
      (part) => part === lastToken || part.startsWith(lastToken),
    );

  if (!firstMatches || !lastMatches) return 0;

  const penalty = firstname.length + lastname.length - term.length;
  if (firstname.startsWith(firstToken) && lastname.startsWith(lastToken)) {
    return 860 - penalty;
  }

  return 820 - penalty;
}

function scorePlayer(entry: SearchIndexEntry, term: string): number {
  const name = entry.searchName;
  const lastname = entry.searchLastname;
  const firstname = entry.searchFirstname;
  const displayName = normalizeSearchText(entry.name);

  if (displayName === term) return 1000;
  if (name === term) return 990;
  if (lastname === term || firstname === term) return 900;

  const multiTokenScore = scoreMultiTokenName(firstname, lastname, term);
  if (multiTokenScore > 0) return multiTokenScore;

  if (name.startsWith(term)) return 800 - (name.length - term.length);
  if (lastname.startsWith(term)) return 700 - (lastname.length - term.length);
  if (firstname.startsWith(term)) return 650 - (firstname.length - term.length);
  if (name.includes(term)) return 400;
  if (lastname.includes(term)) return 350;
  if (firstname.includes(term)) return 300;
  return 0;
}

async function loadIndex(): Promise<SearchIndexEntry[]> {
  if (indexCache) return indexCache;

  if (!indexPromise) {
    indexPromise = fetch("/player-search-index.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Player search index not found.");
        }
        return response.json() as Promise<SearchIndexEntry[]>;
      })
      .then((data) => {
        indexCache = data;
        return data;
      });
  }

  return indexPromise;
}

export function resetPlayerSearchIndex(): void {
  indexCache = null;
  indexPromise = null;
}

function rankPlayers(
  players: SearchIndexEntry[],
  term: string,
): PlayerSearchResult[] {
  const ranked: PlayerSearchResult[] = [];

  for (const entry of players) {
    const score = scorePlayer(entry, term);
    if (score <= 0) continue;
    ranked.push({ player: toPlayerRecord(entry), score });
  }

  ranked.sort(
    (left, right) =>
      right.score - left.score ||
      left.player.name.localeCompare(right.player.name),
  );

  return ranked;
}

export async function searchPlayersLocal(
  rawTerm: string,
  options?: {
    offset?: number;
    limit?: number;
  },
): Promise<LocalSearchPage> {
  const term = normalizeSearchText(rawTerm);
  if (term.length < 2) {
    return { results: [], hasMore: false };
  }

  const ranked = rankPlayers(await loadIndex(), term);
  const offset = options?.offset ?? 0;
  const pageSize = options?.limit ?? PAGE_SIZE;
  const page = ranked.slice(offset, offset + pageSize);

  return {
    results: page,
    hasMore: options?.limit ? false : offset + pageSize < ranked.length,
  };
}

export async function lookupPlayersByNames(
  names: string[],
): Promise<PlayerSearchResult[]> {
  const players = await loadIndex();
  const results: PlayerSearchResult[] = [];
  const seen = new Set<number | string>();

  for (const name of names) {
    const term = normalizeSearchText(name);
    if (!term) continue;

    const ranked = rankPlayers(players, term);
    const best = ranked[0];
    if (!best || seen.has(best.player.id)) continue;

    seen.add(best.player.id);
    results.push(best);
  }

  return results;
}
