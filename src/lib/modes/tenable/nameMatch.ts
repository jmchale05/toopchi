import { normalizeName } from "../../nameMatch";
import type { TenableItem, TenableList } from "../../../types/tenable";

function splitTokens(value: string): string[] {
  return normalizeName(value).split(" ").filter(Boolean);
}

function matchesGuessToName(guessNorm: string, candidate: string): boolean {
  if (normalizeName(candidate) === guessNorm) {
    return true;
  }

  const guessParts = splitTokens(guessNorm);
  const candidateParts = splitTokens(candidate);

  if (guessParts.length < 2 || candidateParts.length < 2) {
    return false;
  }

  const guessLast = guessParts.at(-1);
  const candidateLast = candidateParts.at(-1);
  if (!guessLast || !candidateLast || guessLast !== candidateLast) {
    return false;
  }

  const guessFirst = guessParts[0];
  const candidateFirst = candidateParts[0];

  if (guessFirst.length === 1) {
    return candidateFirst.startsWith(guessFirst);
  }

  return false;
}

function findUniqueByToken(
  items: TenableItem[],
  token: string,
  pick: (item: TenableItem) => string,
): TenableItem | undefined {
  const matches = items.filter(
    (item) => normalizeName(pick(item)) === token,
  );

  return matches.length === 1 ? matches[0] : undefined;
}

function collectDirectMatches(
  items: TenableItem[],
  normalizedInput: string,
): TenableItem[] {
  const matches: TenableItem[] = [];

  for (const item of items) {
    const names = [item.answer, ...(item.aliases ?? [])];
    for (const name of names) {
      if (
        normalizeName(name) === normalizedInput ||
        matchesGuessToName(normalizedInput, name)
      ) {
        matches.push(item);
        break;
      }
    }
  }

  return matches;
}

function matchTenableItem(
  items: TenableItem[],
  normalizedInput: string,
): TenableItem | "ambiguous" | null {
  const directMatches = collectDirectMatches(items, normalizedInput);

  if (directMatches.length === 1) {
    return directMatches[0];
  }

  if (directMatches.length > 1) {
    return "ambiguous";
  }

  const lastNameMatch = findUniqueByToken(
    items,
    normalizedInput,
    (item) => item.answer.split(" ").pop() ?? item.answer,
  );
  if (lastNameMatch) {
    return lastNameMatch;
  }

  const firstNameMatch = findUniqueByToken(
    items,
    normalizedInput,
    (item) => item.answer.split(" ")[0] ?? item.answer,
  );
  if (firstNameMatch) {
    return firstNameMatch;
  }

  return null;
}

export type TenableGuessResult =
  | { ok: true; answer: string; rank: number }
  | { ok: false; reason: "empty" | "unknown" | "ambiguous" }
  | { ok: false; reason: "duplicate"; answer: string; rank: number };

export function resolveTenableGuess(
  list: TenableList,
  input: string,
  alreadyFound: string[],
): TenableGuessResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }

  const normalizedInput = normalizeName(trimmed);
  const foundItems = list.items.filter((item) =>
    alreadyFound.includes(item.answer),
  );
  const unfoundItems = list.items.filter(
    (item) => !alreadyFound.includes(item.answer),
  );

  const duplicateMatch = matchTenableItem(foundItems, normalizedInput);
  if (duplicateMatch === "ambiguous") {
    return { ok: false, reason: "ambiguous" };
  }
  if (duplicateMatch) {
    return {
      ok: false,
      reason: "duplicate",
      answer: duplicateMatch.answer,
      rank: duplicateMatch.rank,
    };
  }

  const successMatch = matchTenableItem(unfoundItems, normalizedInput);
  if (successMatch === "ambiguous") {
    return { ok: false, reason: "ambiguous" };
  }
  if (successMatch) {
    return {
      ok: true,
      answer: successMatch.answer,
      rank: successMatch.rank,
    };
  }

  return { ok: false, reason: "unknown" };
}

export function getTenableSuggestions(list: TenableList, query: string): string[] {
  const normalizedQuery = normalizeName(query);
  if (!normalizedQuery) {
    return [];
  }

  const suggestions = new Set<string>();
  for (const item of list.items) {
    if (normalizeName(item.answer).includes(normalizedQuery)) {
      suggestions.add(item.answer);
    }
  }

  return [...suggestions].slice(0, 5);
}
