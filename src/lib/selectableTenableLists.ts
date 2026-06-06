import tenableListsData from "../data/tenable-lists.json";
import premierLeagueListsData from "../data/premier-league-lists.json";
import type { TenableList } from "../types/tenable";

type PremierLeagueList = TenableList & {
  category?: "prem-scorers" | "prem-assists";
  season?: string;
};

const coreLists = tenableListsData as unknown as TenableList[];
const premierLeagueLists =
  premierLeagueListsData as unknown as PremierLeagueList[];

export const allTenableLists: TenableList[] = [
  ...coreLists,
  ...premierLeagueLists,
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

export function findTenableListById(listId: string): TenableList | undefined {
  return allTenableLists.find((list) => list.id === listId);
}
