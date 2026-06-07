import {
  DEFAULT_TENABLE_LIST_ID,
  chmpAssistLists,
  chmpScorerLists,
  premierAssistLists,
  premierScorerLists,
  RANDOM_TENABLE_LIST_ID,
  uclAssistLists,
  uclScorerLists,
  uelAssistLists,
  uelScorerLists,
} from "./selectableTenableLists";

export const TOP_SCORERS_CATEGORY = "top-scorers";
export const TOP_ASSISTS_CATEGORY = "top-assists";

export const UCL_SCORERS_LIST_ID = "ucl-all-time-scorers";
export const UCL_ASSISTS_LIST_ID = "ucl-all-time-assists";
export const UEL_SCORERS_LIST_ID = "uel-all-time-scorers";
export const UEL_ASSISTS_LIST_ID = "uel-all-time-assists";
export const CHMP_SCORERS_LIST_ID = "chmp-all-time-scorers";
export const CHMP_ASSISTS_LIST_ID = "chmp-all-time-assists";
export const PREMIER_ALL_TIME_SCORERS_LIST_ID = "prem-all-time-scorers";
export const PREMIER_ALL_TIME_ASSISTS_LIST_ID = "prem-all-time-assists";

export const PREMIER_LEAGUE_ID = "premier-league";
export const CHAMPIONS_LEAGUE_ID = "champions-league";
export const EUROPA_LEAGUE_ID = "europa-league";
export const CHAMPIONSHIP_ID = "championship";

export type TenableListCategory =
  | typeof RANDOM_TENABLE_LIST_ID
  | typeof TOP_SCORERS_CATEGORY
  | typeof TOP_ASSISTS_CATEGORY
  | "ballon-dor-2024-25"
  | "most-expensive-transfers";

export const SPECIALTY_CATEGORIES: Array<{
  id: TenableListCategory;
  label: string;
}> = [
  { id: "ballon-dor-2024-25", label: "Ballon d'Or Top 10" },
  { id: "most-expensive-transfers", label: "Most Expensive Signings" },
];

export const SCORER_LEAGUES = [
  {
    id: CHAMPIONS_LEAGUE_ID,
    label: "Champions League",
    lists: uclScorerLists,
  },
  {
    id: EUROPA_LEAGUE_ID,
    label: "Europa League",
    lists: uelScorerLists,
  },
  {
    id: PREMIER_LEAGUE_ID,
    label: "Premier League",
    lists: premierScorerLists,
  },
  {
    id: CHAMPIONSHIP_ID,
    label: "Championship",
    lists: chmpScorerLists,
  },
] as const;

export const ASSIST_LEAGUES = [
  {
    id: CHAMPIONS_LEAGUE_ID,
    label: "Champions League",
    lists: uclAssistLists,
  },
  {
    id: EUROPA_LEAGUE_ID,
    label: "Europa League",
    lists: uelAssistLists,
  },
  {
    id: PREMIER_LEAGUE_ID,
    label: "Premier League",
    lists: premierAssistLists,
  },
  {
    id: CHAMPIONSHIP_ID,
    label: "Championship",
    lists: chmpAssistLists,
  },
] as const;

const SCORER_LIST_PREFIXES = [
  { prefix: "ucl-top-scorers-", leagueId: CHAMPIONS_LEAGUE_ID },
  { prefix: "uel-top-scorers-", leagueId: EUROPA_LEAGUE_ID },
  { prefix: "prem-top-scorers-", leagueId: PREMIER_LEAGUE_ID },
  { prefix: "chmp-top-scorers-", leagueId: CHAMPIONSHIP_ID },
] as const;

const ASSIST_LIST_PREFIXES = [
  { prefix: "ucl-top-assists-", leagueId: CHAMPIONS_LEAGUE_ID },
  { prefix: "uel-top-assists-", leagueId: EUROPA_LEAGUE_ID },
  { prefix: "prem-top-assists-", leagueId: PREMIER_LEAGUE_ID },
  { prefix: "chmp-top-assists-", leagueId: CHAMPIONSHIP_ID },
] as const;

const ALL_TIME_SCORER_LIST_IDS: Record<string, string> = {
  [CHAMPIONS_LEAGUE_ID]: UCL_SCORERS_LIST_ID,
  [EUROPA_LEAGUE_ID]: UEL_SCORERS_LIST_ID,
  [PREMIER_LEAGUE_ID]: PREMIER_ALL_TIME_SCORERS_LIST_ID,
  [CHAMPIONSHIP_ID]: CHMP_SCORERS_LIST_ID,
};

const ALL_TIME_ASSIST_LIST_IDS: Record<string, string> = {
  [CHAMPIONS_LEAGUE_ID]: UCL_ASSISTS_LIST_ID,
  [EUROPA_LEAGUE_ID]: UEL_ASSISTS_LIST_ID,
  [PREMIER_LEAGUE_ID]: PREMIER_ALL_TIME_ASSISTS_LIST_ID,
  [CHAMPIONSHIP_ID]: CHMP_ASSISTS_LIST_ID,
};

export function getCategoryFromListId(listId: string): TenableListCategory {
  if (listId === RANDOM_TENABLE_LIST_ID) {
    return RANDOM_TENABLE_LIST_ID;
  }
  if (
    listId === UCL_SCORERS_LIST_ID ||
    listId.startsWith("ucl-top-scorers-") ||
    listId === UEL_SCORERS_LIST_ID ||
    listId.startsWith("uel-top-scorers-") ||
    listId === PREMIER_ALL_TIME_SCORERS_LIST_ID ||
    listId.startsWith("prem-top-scorers-") ||
    listId === CHMP_SCORERS_LIST_ID ||
    listId.startsWith("chmp-top-scorers-")
  ) {
    return TOP_SCORERS_CATEGORY;
  }
  if (
    listId === UCL_ASSISTS_LIST_ID ||
    listId.startsWith("ucl-top-assists-") ||
    listId === UEL_ASSISTS_LIST_ID ||
    listId.startsWith("uel-top-assists-") ||
    listId === PREMIER_ALL_TIME_ASSISTS_LIST_ID ||
    listId.startsWith("prem-top-assists-") ||
    listId === CHMP_ASSISTS_LIST_ID ||
    listId.startsWith("chmp-top-assists-")
  ) {
    return TOP_ASSISTS_CATEGORY;
  }
  if (listId === "ballon-dor-2024-25" || listId === "most-expensive-transfers") {
    return listId;
  }
  return TOP_SCORERS_CATEGORY;
}

export function getLeagueFromListId(listId: string): string | null {
  for (const [leagueId, id] of Object.entries(ALL_TIME_SCORER_LIST_IDS)) {
    if (listId === id) {
      return leagueId;
    }
  }
  for (const [leagueId, id] of Object.entries(ALL_TIME_ASSIST_LIST_IDS)) {
    if (listId === id) {
      return leagueId;
    }
  }

  for (const entry of SCORER_LIST_PREFIXES) {
    if (listId.startsWith(entry.prefix)) {
      return entry.leagueId;
    }
  }

  for (const entry of ASSIST_LIST_PREFIXES) {
    if (listId.startsWith(entry.prefix)) {
      return entry.leagueId;
    }
  }

  return null;
}

export function getScorerListsForLeague(leagueId: string | null) {
  return SCORER_LEAGUES.find((league) => league.id === leagueId)?.lists ?? [];
}

export function getAssistListsForLeague(leagueId: string | null) {
  return ASSIST_LEAGUES.find((league) => league.id === leagueId)?.lists ?? [];
}

export function resolveListId(
  category: TenableListCategory,
  leagueId: string | null,
  seasonListId: string | null,
): string {
  if (category === RANDOM_TENABLE_LIST_ID) {
    return RANDOM_TENABLE_LIST_ID;
  }

  if (category === TOP_SCORERS_CATEGORY) {
    const lists = getScorerListsForLeague(leagueId);
    return (
      seasonListId ??
      lists[0]?.id ??
      premierScorerLists[0]?.id ??
      UCL_SCORERS_LIST_ID
    );
  }

  if (category === TOP_ASSISTS_CATEGORY) {
    const lists = getAssistListsForLeague(leagueId);
    return (
      seasonListId ??
      lists[0]?.id ??
      premierAssistLists[0]?.id ??
      DEFAULT_TENABLE_LIST_ID
    );
  }

  return category;
}

export function defaultLeagueForCategory(
  category: TenableListCategory,
): string | null {
  if (category === TOP_SCORERS_CATEGORY || category === TOP_ASSISTS_CATEGORY) {
    return PREMIER_LEAGUE_ID;
  }
  return null;
}

export function defaultListIdForCategory(category: TenableListCategory): string {
  if (category === RANDOM_TENABLE_LIST_ID) {
    return RANDOM_TENABLE_LIST_ID;
  }
  if (category === TOP_SCORERS_CATEGORY) {
    return premierScorerLists[0]?.id ?? UCL_SCORERS_LIST_ID;
  }
  if (category === TOP_ASSISTS_CATEGORY) {
    return premierAssistLists[0]?.id ?? DEFAULT_TENABLE_LIST_ID;
  }
  return category;
}
