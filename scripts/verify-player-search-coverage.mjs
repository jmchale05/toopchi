import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { collectGameAnswers } from "./lib/collectGameAnswers.mjs";
import {
  formatVerificationReport,
  verifyPlayerSearchCoverage,
} from "./lib/playerSearchCoverage.mjs";

function printHelp() {
  console.log(`Verify game answers are searchable in the player search bar

Usage:
  node scripts/verify-player-search-coverage.mjs [options]

Options:
  --include-matches     Include match lineups (default: true)
  --exclude-matches     Skip match lineups
  --include-daily       Include daily player pools (default: true)
  --exclude-daily       Skip daily player pools
  --json                Print machine-readable JSON report
  --help                Show this help

Examples:
  npm run verify:player-search
  npm run verify:player-search -- --exclude-matches
`);
}

function parseArgs(argv) {
  let includeMatches = true;
  let includeDaily = true;
  let json = false;

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--include-matches") {
      includeMatches = true;
      continue;
    }
    if (arg === "--exclude-matches") {
      includeMatches = false;
      continue;
    }
    if (arg === "--include-daily") {
      includeDaily = true;
      continue;
    }
    if (arg === "--exclude-daily") {
      includeDaily = false;
      continue;
    }
    if (arg === "--json") {
      json = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { includeMatches, includeDaily, json };
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(root, "public/player-search-index.json");

if (!existsSync(indexPath)) {
  console.error("Missing public/player-search-index.json — run npm run build:player-index");
  process.exit(1);
}

try {
  const options = parseArgs(process.argv.slice(2));
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  const answers = collectGameAnswers({
    includeMatches: options.includeMatches,
    includeDaily: options.includeDaily,
  });
  const report = verifyPlayerSearchCoverage(index, answers);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatVerificationReport(report));
  }

  process.exit(report.passed ? 0 : 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
