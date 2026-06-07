import { runCompetitionScorerBuild } from "./lib/buildCompetitionScorerLists.mjs";

runCompetitionScorerBuild({
  seasonsFile: "src/data/championship-seasons.json",
  outputFile: "src/data/championship-lists.json",
  competitionKey: "chmp",
  scorerCategory: "chmp-scorers",
  assistCategory: "chmp-assists",
  idPrefix: "chmp",
  allTimeScorerListId: "chmp-all-time-scorers",
  allTimeAssistListId: "chmp-all-time-assists",
  competitionName: "Championship",
});
