import {
  formatVerificationReport,
  verifyTenableLists,
} from "./lib/tenableListVerify.mjs";

function printHelp() {
  console.log(`Verify Top Order list answers exist in players.json

Usage:
  node scripts/verify-tenable-lists.mjs [options]

Options:
  --list <id>           Verify one list (repeatable)
  --players-json-only   Fail when an answer only exists in game-players.json
  --json                Print machine-readable JSON report
  --help                Show this help

Examples:
  npm run verify:tenable-lists
  npm run verify:tenable-lists -- --list ballon-dor-2024-25
  npm run verify:tenable-lists -- --list prem-top-scorers-2025-26 --list prem-top-assists-2025-26
`);
}

function parseArgs(argv) {
  const listIds = new Set();
  let playersJsonOnly = false;
  let json = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--players-json-only") {
      playersJsonOnly = true;
      continue;
    }

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--list") {
      const listId = argv[index + 1];
      if (!listId) {
        throw new Error("--list requires a list id");
      }
      listIds.add(listId);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    listIds: listIds.size > 0 ? listIds : null,
    playersJsonOnly,
    json,
  };
}

try {
  const options = parseArgs(process.argv.slice(2));
  const report = verifyTenableLists(options);

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
