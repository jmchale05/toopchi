import { normalizeNation } from "./nationFlags";

export type DailyNationMatch = "correct" | "close" | "miss" | "unknown";

/** Nations in the same group light up yellow when the guess is close but not exact. */
const NATION_CLOSE_GROUPS: readonly string[][] = [
  ["England", "Scotland", "Wales", "Northern Ireland", "Ireland"],
  [
    "France",
    "Spain",
    "Germany",
    "Italy",
    "Belgium",
    "Netherlands",
    "Portugal",
    "Austria",
    "Switzerland",
    "Luxembourg",
  ],
  ["Norway", "Sweden", "Denmark", "Finland", "Iceland"],
  [
    "Brazil",
    "Argentina",
    "Uruguay",
    "Paraguay",
    "Chile",
    "Colombia",
    "Ecuador",
    "Peru",
    "Venezuela",
  ],
  ["Poland", "Czech Republic", "Czechia", "Slovakia", "Hungary", "Ukraine"],
  [
    "Senegal",
    "Mali",
    "Guinea",
    "Ivory Coast",
    "Cote d'Ivoire",
    "Ghana",
    "Nigeria",
    "Cameroon",
  ],
  ["Morocco", "Algeria", "Tunisia", "Egypt"],
  [
    "Croatia",
    "Serbia",
    "Slovenia",
    "Bosnia and Herzegovina",
    "Montenegro",
    "Albania",
    "North Macedonia",
  ],
  ["USA", "United States", "Mexico", "Canada"],
  ["Japan", "South Korea", "Korea", "China"],
  ["Turkey", "Türkiye", "Greece"],
  ["Australia", "New Zealand"],
  [
    "Saudi Arabia",
    "Qatar",
    "Iran",
    "Iraq",
    "Israel",
    "United Arab Emirates",
    "Jordan",
  ],
];

const nationGroupByKey = new Map<string, number>();

for (let groupIndex = 0; groupIndex < NATION_CLOSE_GROUPS.length; groupIndex++) {
  for (const nation of NATION_CLOSE_GROUPS[groupIndex]) {
    nationGroupByKey.set(normalizeNation(nation), groupIndex);
  }
}

export function compareNation(
  guessNation: string | null,
  answerNation: string | null,
): DailyNationMatch {
  if (!guessNation?.trim() || !answerNation?.trim()) {
    return "unknown";
  }

  const guess = normalizeNation(guessNation);
  const answer = normalizeNation(answerNation);

  if (guess === answer) {
    return "correct";
  }

  const guessGroup = nationGroupByKey.get(guess);
  const answerGroup = nationGroupByKey.get(answer);

  if (guessGroup != null && guessGroup === answerGroup) {
    return "close";
  }

  return "miss";
}
