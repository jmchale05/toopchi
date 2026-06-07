import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  buildAllTimeAssistsUrl,
  buildAllTimeGoalsUrl,
  buildSeasonAssistsUrl,
  buildSeasonGoalsUrl,
  COMPETITION_SOURCES,
  fetchTransfermarkt,
  namesMatch,
  normalizePlayerName,
  parseAllTimeTable,
  parseItemsTable,
  slugToSaisonId,
} from "./lib/transfermarktFetch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assistsBySlug = JSON.parse(
  readFileSync(join(root, "src/data/competition-assists-by-slug.json"), "utf8"),
);

function loadSeasons(file) {
  return JSON.parse(readFileSync(join(root, file), "utf8"));
}

function compareLists(label, expected, actual) {
  const issues = [];

  for (let index = 0; index < expected.length; index += 1) {
    const want = expected[index];
    const got = actual[index];
    const rank = index + 1;

    if (!got) {
      issues.push({
        label,
        rank,
        type: "missing-row",
        expected: want.name,
        actual: null,
      });
      continue;
    }

    if (!namesMatch(want.name, got.name)) {
      issues.push({
        label,
        rank,
        type: "name",
        expected: want.name,
        actual: got.name,
        expectedValue: want.value ?? null,
        actualValue: got.value ?? null,
      });
    } else if (
      want.value != null &&
      got.value != null &&
      Number(want.value) !== Number(got.value)
    ) {
      issues.push({
        label,
        rank,
        type: "value",
        expected: want.name,
        actual: got.name,
        expectedValue: want.value,
        actualValue: got.value,
      });
    }
  }

  return issues;
}

async function verifySeasonList(config, season, type, players) {
  const slug = season.slug;
  const saisonId = slugToSaisonId(slug);
  const url =
    slug === "all-time"
      ? type === "scorers"
        ? buildAllTimeGoalsUrl(config)
        : buildAllTimeAssistsUrl(config)
      : type === "scorers"
        ? buildSeasonGoalsUrl(config, saisonId)
        : buildSeasonAssistsUrl(config, saisonId);

  const label = `${config.label} ${type} ${season.season}`;

  try {
    const html = await fetchTransfermarkt(url);
    const actual = parseItemsTable(html, players.length);
    return {
      label,
      url,
      issues: compareLists(label, players, actual),
      transfermarkt: actual,
      error: null,
    };
  } catch (error) {
    return {
      label,
      url,
      issues: [
        {
          label,
          rank: 0,
          type: "fetch-error",
          expected: null,
          actual: error instanceof Error ? error.message : String(error),
        },
      ],
      transfermarkt: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const only = new Set(
    process.argv
      .slice(2)
      .filter((arg) => arg.startsWith("--only="))
      .flatMap((arg) => arg.replace("--only=", "").split(",")),
  );
  const json = process.argv.includes("--json");
  const fix = process.argv.includes("--fix");

  const reports = [];
  const allIssues = [];

  for (const [key, config] of Object.entries(COMPETITION_SOURCES)) {
    if (only.size > 0 && !only.has(key)) continue;

    const seasons = loadSeasons(config.seasonsFile);
    const competitionAssists = assistsBySlug[config.assistsKey] ?? {};

    for (const season of seasons) {
      const scorerReport = await verifySeasonList(
        config,
        season,
        "scorers",
        season.scorers,
      );
      reports.push(scorerReport);
      allIssues.push(...scorerReport.issues);

      const assistPlayers =
        season.assists ?? competitionAssists[season.slug] ?? [];
      if (assistPlayers.length > 0) {
        const assistReport = await verifySeasonList(
          config,
          season,
          "assists",
          assistPlayers,
        );
        reports.push(assistReport);
        allIssues.push(...assistReport.issues);
      }
    }
  }

  const summary = {
    checked: reports.length,
    issues: allIssues.length,
    passed: reports.length - new Set(allIssues.map((i) => i.label)).size,
    reports: reports.map((report) => ({
      label: report.label,
      url: report.url,
      ok: report.issues.length === 0,
      issues: report.issues,
      transfermarkt: report.transfermarkt,
    })),
  };

  if (json) {
    writeFileSync(
      join(root, "transfermarkt-verify-report.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    );
    console.log("Wrote transfermarkt-verify-report.json");
  } else {
    console.log(`Checked ${summary.checked} lists against Transfermarkt.`);
    console.log(`Issues: ${summary.issues}`);

    for (const report of summary.reports) {
      if (report.ok) {
        console.log(`OK  ${report.label}`);
        continue;
      }

      console.log(`BAD ${report.label}`);
      console.log(`    ${report.url}`);
      for (const issue of report.issues) {
        if (issue.type === "value") {
          console.log(
            `    #${issue.rank}: value ${issue.expected}=${issue.expectedValue}, TM ${issue.actual}=${issue.actualValue}`,
          );
        } else {
          console.log(
            `    #${issue.rank}: expected ${issue.expected}, got ${issue.actual ?? "—"}`,
          );
        }
      }
    }
  }

  if (fix && allIssues.length > 0) {
    console.log("\n--fix not implemented in this pass; update source JSON manually.");
  }

  process.exit(allIssues.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
