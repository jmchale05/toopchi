import { runCompetitionScorerBuild } from "./lib/buildCompetitionScorerLists.mjs";

runCompetitionScorerBuild({
  seasonsFile: "src/data/europa-league-seasons.json",
  outputFile: "src/data/europa-league-lists.json",
  competitionKey: "uel",
  scorerCategory: "uel-scorers",
  assistCategory: "uel-assists",
  idPrefix: "uel",
  allTimeScorerListId: "uel-all-time-scorers",
  allTimeAssistListId: "uel-all-time-assists",
  competitionName: "Europa League",
});
