import { runCompetitionScorerBuild } from "./lib/buildCompetitionScorerLists.mjs";

runCompetitionScorerBuild({
  seasonsFile: "src/data/champions-league-seasons.json",
  outputFile: "src/data/champions-league-lists.json",
  competitionKey: "ucl",
  scorerCategory: "ucl-scorers",
  assistCategory: "ucl-assists",
  idPrefix: "ucl",
  allTimeScorerListId: "ucl-all-time-scorers",
  allTimeAssistListId: "ucl-all-time-assists",
  competitionName: "Champions League",
});
