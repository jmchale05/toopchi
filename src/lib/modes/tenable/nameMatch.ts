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
  alreadyFound: string[],
  token: string,
  pick: (item: TenableItem) => string,
): TenableItem | undefined {
  const matches = items.filter((item) => {
    if (alreadyFound.includes(item.answer)) {
      return false;
    }
    return normalizeName(pick(item)) === token;
  });

  return matches.length === 1 ? matches[0] : undefined;
}

export function resolveTenableGuess(
  list: TenableList,
  input: string,
  alreadyFound: string[],
): { ok: true; answer: string; rank: number } | { ok: false; reason: "empty" | "unknown" | "duplicate" | "ambiguous" } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }

  const normalizedInput = normalizeName(trimmed);
  const matches: Array<{ answer: string; rank: number }> = [];

  for (const item of list.items) {
    if (alreadyFound.includes(item.answer)) {
      continue;
    }

    const names = [item.answer, ...(item.aliases ?? [])];
    for (const name of names) {
      if (
        normalizeName(name) === normalizedInput ||
        matchesGuessToName(normalizedInput, name)
      ) {
        matches.push({ answer: item.answer, rank: item.rank });
        break;
      }
    }
  }

  if (matches.length === 0) {
    const lastNameMatch = findUniqueByToken(
      list.items,
      alreadyFound,
      normalizedInput,
      (item) => item.answer.split(" ").pop() ?? item.answer,
    );

    if (lastNameMatch) {
      return {
        ok: true,
        answer: lastNameMatch.answer,
        rank: lastNameMatch.rank,
      };
    }

    const firstNameMatch = findUniqueByToken(
      list.items,
      alreadyFound,
      normalizedInput,
      (item) => item.answer.split(" ")[0] ?? item.answer,
    );

    if (firstNameMatch) {
      return {
        ok: true,
        answer: firstNameMatch.answer,
        rank: firstNameMatch.rank,
      };
    }

    return { ok: false, reason: "unknown" };
  }

  if (matches.length > 1) {
    return { ok: false, reason: "ambiguous" };
  }

  if (alreadyFound.includes(matches[0].answer)) {
    return { ok: false, reason: "duplicate" };
  }

  return { ok: true, answer: matches[0].answer, rank: matches[0].rank };
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
