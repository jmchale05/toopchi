import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getPlayersDb, isFirebaseConfigured } from "../config/firebase";
import { normalizeSearchText } from "./foldLatin";
import type { PlayerRecord, PlayerSearchResult } from "../types/player";

const SEARCH_FIELDS = [
  "searchLastname",
  "searchName",
  "searchFirstname",
] as const;

type SearchField = (typeof SEARCH_FIELDS)[number];

export type SearchFieldCursors = Partial<
  Record<SearchField, QueryDocumentSnapshot<DocumentData>>
>;

export type PlayerSearchPage = {
  results: PlayerSearchResult[];
  cursors: SearchFieldCursors;
  hasMore: boolean;
};

const PER_FIELD_FETCH = 6;
const PAGE_SIZE = 8;

function normalizeTerm(raw: string): string {
  return normalizeSearchText(raw);
}

function mapDoc(doc: QueryDocumentSnapshot<DocumentData>): PlayerRecord {
  const data = doc.data();
  return {
    id: data.id,
    name: data.name,
    firstname: data.firstname ?? null,
    lastname: data.lastname ?? null,
    age: data.age ?? null,
    nationality: data.nationality ?? null,
    team: data.team,
    club: data.club ?? data.team,
    retired: data.retired ?? false,
    searchName: data.searchName,
    searchFirstname: data.searchFirstname,
    searchLastname: data.searchLastname,
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

function scorePlayer(player: PlayerRecord, term: string): number {
  const name = player.searchName ?? player.name.toLowerCase();
  const lastname =
    player.searchLastname ?? (player.lastname ?? "").toLowerCase();
  const firstname =
    player.searchFirstname ?? (player.firstname ?? "").toLowerCase();
  const displayName = normalizeSearchText(player.name);

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

async function fetchFieldPage(
  field: SearchField,
  term: string,
  after?: QueryDocumentSnapshot<DocumentData>,
) {
  const playersRef = collection(getPlayersDb(), "players");
  const constraints = [
    orderBy(field),
    startAt(term),
    endAt(`${term}\uf8ff`),
    ...(after ? [startAfter(after)] : []),
    limit(PER_FIELD_FETCH),
  ];
  const snapshot = await getDocs(query(playersRef, ...constraints));

  return {
    players: snapshot.docs.map((doc) => {
      const player = mapDoc(doc);
      return { player, score: scorePlayer(player, term) };
    }),
    lastDoc: snapshot.docs.at(-1),
    hasMore: snapshot.docs.length === PER_FIELD_FETCH,
  };
}

function mergeAndRank(
  batches: PlayerSearchResult[][],
  excludeIds: Set<number | string>,
  maxResults: number,
): PlayerSearchResult[] {
  const seen = new Set(excludeIds);
  const merged: PlayerSearchResult[] = [];

  for (const batch of batches) {
    for (const item of batch) {
      if (seen.has(item.player.id)) continue;
      seen.add(item.player.id);
      merged.push(item);
    }
  }

  merged.sort(
    (left, right) =>
      right.score - left.score ||
      left.player.name.localeCompare(right.player.name),
  );

  return merged.slice(0, maxResults);
}

export async function searchPlayers(
  rawTerm: string,
  options?: {
    cursors?: SearchFieldCursors;
    excludeIds?: Set<number | string>;
  },
): Promise<PlayerSearchPage> {
  const term = normalizeTerm(rawTerm);
  if (!isFirebaseConfigured() || term.length < 2) {
    return { results: [], cursors: {}, hasMore: false };
  }

  const cursors = options?.cursors ?? {};
  const excludeIds = options?.excludeIds ?? new Set<number | string>();

  const [lastname, name, firstname] = await Promise.all(
    SEARCH_FIELDS.map((field) =>
      fetchFieldPage(field, term, cursors[field]),
    ),
  );

  const results = mergeAndRank(
    [lastname.players, name.players, firstname.players],
    excludeIds,
    PAGE_SIZE,
  );

  const nextCursors: SearchFieldCursors = {};
  for (const [field, page] of [
    ["searchLastname", lastname],
    ["searchName", name],
    ["searchFirstname", firstname],
  ] as const) {
    if (page.lastDoc) {
      nextCursors[field] = page.lastDoc;
    } else if (cursors[field]) {
      nextCursors[field] = cursors[field];
    }
  }

  return {
    results,
    cursors: nextCursors,
    hasMore: lastname.hasMore || name.hasMore || firstname.hasMore,
  };
}
