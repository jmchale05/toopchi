export type DailyAgeMatch =
  | "correct"
  | "close-higher"
  | "close-lower"
  | "higher"
  | "lower"
  | "unknown";

export type DailyFieldMatch = "correct" | "miss" | "unknown";

export type DailyLeagueMatch = "team" | "correct" | "miss" | "unknown";

export type DailyPlayerProfile = {
  age: number | null;
  position: string | null;
  league: string | null;
  team: string | null;
  nation: string | null;
};

export type DailyGuessFeedback = {
  guess: string;
  correct: boolean;
  age: number | null;
  position: string | null;
  league: string | null;
  nation: string | null;
  ageMatch: DailyAgeMatch;
  positionMatch: DailyFieldMatch;
  leagueMatch: DailyLeagueMatch;
  nationMatch: DailyFieldMatch;
};

export type DailyGuessResult = {
  correct: boolean;
  answer?: string;
  feedback: DailyGuessFeedback;
};

export type DailyGuessEntry = DailyGuessFeedback;

export type DailyPlayerState = {
  dateKey: string;
  solved: boolean;
  failed?: boolean;
  guesses: DailyGuessEntry[];
  answer?: string;
  photo?: string;
};

export type DailyPlayer = {
  id: string;
  answer: string;
  aliases?: string[];
  age?: number | null;
  position?: string | null;
  league?: string | null;
  team?: string | null;
  nationality?: string | null;
  photo?: string | null;
};
