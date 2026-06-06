export type DailyTemperatureLabel =
  | "cold"
  | "cool"
  | "warm"
  | "hot"
  | "correct";

export type DailyHintMatch = "yes" | "no" | "partial" | "higher" | "lower";

export type DailyHint = {
  label: string;
  match: DailyHintMatch;
};

export type DailyGuessResult = {
  correct: boolean;
  temperature: number;
  label: DailyTemperatureLabel;
  hints?: DailyHint[];
  answer?: string;
};

export type DailyGuessEntry = {
  guess: string;
  temperature: number;
  label: DailyTemperatureLabel;
  hints?: DailyHint[];
};

export type DailyPlayerState = {
  dateKey: string;
  solved: boolean;
  guesses: DailyGuessEntry[];
  answer?: string;
};

/** @deprecated Local mock only — daily answer comes from API in production */
export type DailyPlayer = {
  id: string;
  answer: string;
  aliases?: string[];
};
