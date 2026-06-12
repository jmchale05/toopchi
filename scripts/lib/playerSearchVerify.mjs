import { decodeHtmlEntities, normalizeSearchText } from "./foldLatin.mjs";
import { normalizeName } from "./playerMatch.mjs";

export function scoreMultiTokenName(firstname, lastname, displayName, term) {
  const tokens = term.split(" ").filter(Boolean);
  if (tokens.length < 2) return 0;

  const firstToken = tokens[0];
  const lastToken = tokens.at(-1) ?? "";
  const lastnameParts = lastname.split(" ").filter(Boolean);
  const displayParts = normalizeSearchText(displayName).split(" ").filter(Boolean);
  const displayFirst = displayParts[0] ?? "";

  const firstMatches =
    firstname.startsWith(firstToken) ||
    displayFirst.startsWith(firstToken) ||
    (firstToken.length === 1 &&
      (firstname.startsWith(firstToken) || displayFirst.startsWith(firstToken)));

  const lastMatches =
    lastname.startsWith(lastToken) ||
    lastnameParts.some(
      (part) => part === lastToken || part.startsWith(lastToken),
    ) ||
    displayParts.some(
      (part) => part === lastToken || part.startsWith(lastToken),
    );

  if (!firstMatches || !lastMatches) return 0;

  const penalty = firstname.length + lastname.length - term.length;
  if (
    (firstname.startsWith(firstToken) || displayFirst.startsWith(firstToken)) &&
    lastname.startsWith(lastToken)
  ) {
    return 860 - penalty;
  }

  return 820 - penalty;
}

export function scorePlayerEntry(entry, term) {
  const name = entry.searchName;
  const lastname = entry.searchLastname;
  const firstname = entry.searchFirstname;
  const displayName = normalizeSearchText(decodeHtmlEntities(entry.name));

  if (displayName === term) return 1000;
  if (name === term) return 990;
  if (lastname === term || firstname === term) return 900;

  const multiTokenScore = scoreMultiTokenName(
    firstname,
    lastname,
    entry.name,
    term,
  );
  if (multiTokenScore > 0) return multiTokenScore;

  if (name.startsWith(term)) return 800 - (name.length - term.length);
  if (lastname.startsWith(term)) return 700 - (lastname.length - term.length);
  if (firstname.startsWith(term)) return 650 - (firstname.length - term.length);
  if (name.includes(term)) return 400;
  if (lastname.includes(term)) return 350;
  if (firstname.includes(term)) return 300;
  return 0;
}

export function rankPlayerSearch(index, rawTerm) {
  const term = normalizeSearchText(rawTerm);
  if (term.length < 2) return [];

  const ranked = [];
  for (const entry of index) {
    const score = scorePlayerEntry(entry, term);
    if (score <= 0) continue;
    ranked.push({ entry, score });
  }

  ranked.sort(
    (left, right) =>
      right.score - left.score ||
      left.entry.name.localeCompare(right.entry.name),
  );

  return ranked;
}

export function namesMatchExpected(expected, resultName) {
  const expectedNorm = normalizeName(expected);
  const resultNorm = normalizeName(resultName);
  if (expectedNorm === resultNorm) return true;

  const expectedParts = expectedNorm.split(" ").filter(Boolean);
  const resultParts = resultNorm.split(" ").filter(Boolean);
  const expectedLast = expectedParts.at(-1);
  const resultLast = resultParts.at(-1);

  if (!expectedLast || expectedLast !== resultLast) {
    return false;
  }

  if (expectedParts.length === 1) {
    return true;
  }

  const expectedFirst = expectedParts[0];
  const resultFirst = resultParts[0];

  if (expectedFirst.length === 1) {
    return resultFirst.startsWith(expectedFirst);
  }

  if (resultFirst.length === 1) {
    return expectedFirst.startsWith(resultFirst);
  }

  return (
    expectedFirst.startsWith(resultFirst) ||
    resultFirst.startsWith(expectedFirst)
  );
}

export function verifyAnswerSearch(index, answer) {
  const term = normalizeSearchText(answer);
  const ranked = rankPlayerSearch(index, answer);

  if (ranked.length === 0) {
    return { ok: false, reason: "missing", term };
  }

  const top = ranked[0];
  if (!namesMatchExpected(answer, top.entry.name)) {
    return {
      ok: false,
      reason: "wrong-top",
      term,
      expected: answer,
      got: top.entry.name,
      id: top.entry.id,
      score: top.score,
    };
  }

  return {
    ok: true,
    term,
    match: top.entry.name,
    id: top.entry.id,
    score: top.score,
  };
}
