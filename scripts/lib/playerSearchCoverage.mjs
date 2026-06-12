import { normalizeName } from "./playerMatch.mjs";
import { verifyAnswerSearch } from "./playerSearchVerify.mjs";

export function verifyPlayerSearchCoverage(index, answers) {
  const report = {
    answersChecked: answers.length,
    ok: [],
    missing: [],
    wrongTop: [],
  };

  for (const item of answers) {
    const result = verifyAnswerSearch(index, item.name);
    const entry = {
      answer: item.name,
      nations: item.nations,
      sources: item.sources.slice(0, 3),
      ...result,
    };

    if (result.ok) {
      report.ok.push(entry);
      continue;
    }

    if (result.reason === "missing") {
      report.missing.push(entry);
      continue;
    }

    report.wrongTop.push(entry);
  }

  const failures = report.missing.length + report.wrongTop.length;

  return {
    ...report,
    passed: failures === 0,
    failureCount: failures,
  };
}

export function formatVerificationReport(report) {
  const lines = [];

  lines.push(`Checked ${report.answersChecked} unique game answers.`);
  lines.push(
    `OK: ${report.ok.length} | Missing from search: ${report.missing.length} | Wrong top result: ${report.wrongTop.length}`,
  );

  if (report.missing.length > 0) {
    lines.push("\nMissing from player search:");
    for (const item of report.missing) {
      lines.push(
        `  - ${item.answer}${item.nations?.[0] ? ` (${item.nations[0]})` : ""} [${item.sources.join(", ")}]`,
      );
    }
  }

  if (report.wrongTop.length > 0) {
    lines.push("\nWrong top search result:");
    for (const item of report.wrongTop) {
      lines.push(
        `  - ${item.expected} -> ${item.got} (${item.id}) [${item.sources.join(", ")}]`,
      );
    }
  }

  if (report.passed) {
    lines.push("\nAll game answers are searchable in the player search bar.");
  } else {
    lines.push(`\nVerification failed (${report.failureCount} issue(s)).`);
  }

  return lines.join("\n");
}

export function verifyListAnswers(index, list) {
  const answers = (list.items ?? []).map((item) => ({
    name: item.answer,
    nations: item.nation ? [item.nation] : [],
    sources: [list.id],
  }));

  return verifyPlayerSearchCoverage(index, answers);
}
