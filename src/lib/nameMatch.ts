import type { Match } from "../types/match";
import { normalizeSearchText } from "./foldLatin";

export function normalizeName(value: string): string {
  return normalizeSearchText(value);
}

function buildLookup(match: Match, team: "A" | "B"): Map<string, string> {
  const lineup = team === "A" ? match.lineupA : match.lineupB;
  const lookup = new Map<string, string>();

  for (const canonical of lineup) {
    lookup.set(normalizeName(canonical), canonical);

    const lastName = canonical.split(" ").pop();
    if (lastName) {
      const normalizedLast = normalizeName(lastName);
      if (!lookup.has(normalizedLast)) {
        lookup.set(normalizedLast, canonical);
      }
    }

    const aliases = match.aliases[canonical] ?? [];
    for (const alias of aliases) {
      lookup.set(normalizeName(alias), canonical);
    }
  }

  return lookup;
}

export function resolvePlayerName(
  match: Match,
  team: "A" | "B",
  input: string,
  alreadyGuessed: string[],
): { ok: true; canonical: string } | { ok: false; reason: "empty" | "unknown" | "duplicate" | "ambiguous" } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }

  const lookup = buildLookup(match, team);
  const normalized = normalizeName(trimmed);
  const canonical = lookup.get(normalized);

  if (!canonical) {
    return { ok: false, reason: "unknown" };
  }

  if (alreadyGuessed.includes(canonical)) {
    return { ok: false, reason: "duplicate" };
  }

  const lastName = normalizeName(trimmed);
  const lineup = team === "A" ? match.lineupA : match.lineupB;
  const lastNameMatches = lineup.filter((name) => {
    const ln = normalizeName(name.split(" ").pop() ?? "");
    return ln === lastName && lookup.get(lastName) === name;
  });

  if (!lookup.has(normalized) && lastNameMatches.length > 1) {
    return { ok: false, reason: "ambiguous" };
  }

  return { ok: true, canonical };
}

export function getSquadSuggestions(match: Match, query: string, limit = 6): string[] {
  const normalizedQuery = normalizeName(query);
  if (!normalizedQuery) {
    return [];
  }

  const pool = [...match.lineupA, ...match.lineupB];
  const expanded = new Set<string>();

  for (const name of pool) {
    expanded.add(name);
    for (const alias of match.aliases[name] ?? []) {
      expanded.add(alias);
    }
  }

  return [...expanded]
    .filter((name) => normalizeName(name).includes(normalizedQuery))
    .slice(0, limit);
}
