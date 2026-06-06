export function formatMatchScore(score: string): string {
  return score.replace(/\s*-\s*/g, " - ");
}

export function getMatchYear(date: string): string {
  const year = date.match(/\b(19|20)\d{2}\b/);
  return year?.[0] ?? date;
}

export function formatMatchMeta(match: {
  date: string;
  competition: string;
  stage: string;
}): string {
  return `${getMatchYear(match.date)} · ${match.competition} · ${match.stage}`;
}
