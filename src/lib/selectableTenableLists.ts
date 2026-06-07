import tenableListsData from "../data/tenable-lists.json";
import premierLeagueListsData from "../data/premier-league-lists.json";
import championsLeagueListsData from "../data/champions-league-lists.json";
import europaLeagueListsData from "../data/europa-league-lists.json";
import championshipListsData from "../data/championship-lists.json";
import type { TenableList } from "../types/tenable";

type PremierLeagueList = TenableList & {
  category?: "prem-scorers" | "prem-assists";
  season?: string;
};

type CompetitionScorerList = TenableList & {
  category?: string;
  season?: string;
};

const coreLists = tenableListsData as unknown as TenableList[];
const premierLeagueLists =
  premierLeagueListsData as unknown as PremierLeagueList[];
const championsLeagueLists =
  championsLeagueListsData as unknown as CompetitionScorerList[];
const europaLeagueLists =
  europaLeagueListsData as unknown as CompetitionScorerList[];
const championshipLists =
  championshipListsData as unknown as CompetitionScorerList[];

export const allTenableLists: TenableList[] = [
  ...coreLists,
  ...premierLeagueLists,
  ...championsLeagueLists,
  ...europaLeagueLists,
  ...championshipLists,
];

export const RANDOM_TENABLE_LIST_ID = "random";
export const DEFAULT_TENABLE_LIST_ID = "ucl-all-time-scorers";

export const selectableTenableLists = allTenableLists;

export const featuredTenableLists = coreLists;

export const premierScorerLists = premierLeagueLists.filter(
  (list) => list.category === "prem-scorers",
);

export const premierAssistLists = premierLeagueLists.filter(
  (list) => list.category === "prem-assists",
);

export const uclScorerLists = championsLeagueLists.filter(
  (list) => list.category === "ucl-scorers",
);

export const uclAssistLists = championsLeagueLists.filter(
  (list) => list.category === "ucl-assists",
);

export const uelScorerLists = europaLeagueLists.filter(
  (list) => list.category === "uel-scorers",
);

export const uelAssistLists = europaLeagueLists.filter(
  (list) => list.category === "uel-assists",
);

export const chmpScorerLists = championshipLists.filter(
  (list) => list.category === "chmp-scorers",
);

export const chmpAssistLists = championshipLists.filter(
  (list) => list.category === "chmp-assists",
);

export function findTenableListById(listId: string): TenableList | undefined {
  return allTenableLists.find((list) => list.id === listId);
}
