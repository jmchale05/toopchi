import matchesData from "../data/matches.json";
import type { Match } from "../types/match";

const allMatches = matchesData as unknown as Match[];

export const DEFAULT_MATCH_ID = "inter-ac-milan-2005";

const SELECTABLE_MATCH_IDS = [DEFAULT_MATCH_ID];

export const selectableMatches = allMatches.filter((match) =>
  SELECTABLE_MATCH_IDS.includes(match.id),
);

export function findMatchById(matchId: string): Match | undefined {
  return allMatches.find((match) => match.id === matchId);
}
