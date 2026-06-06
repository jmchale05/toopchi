import type { GamePhase, Player } from "./match";

export type TenableItem = {
  rank: number;
  answer: string;
  aliases?: string[];
  nation?: string;
  /** Goals, assists, or other stat shown as (n) beside the name when revealed */
  value?: number;
};

export type TenableValueFormat = {
  prefix?: string;
  suffix?: string;
  period?: string;
};

export type TenableList = {
  id: string;
  title: string;
  subtitle?: string;
  valueFormat?: TenableValueFormat;
  items: TenableItem[];
};

export type TenableGuessLogEntry = {
  playerName: string;
  guess: string;
  correct: boolean;
  matchedAnswer?: string;
  rank?: number;
};

export type TenableSession = {
  mode: "tenable";
  players: Player[];
  activePlayerIndex: number;
  list: TenableList;
  /** Index 0 = rank 1, index 9 = rank 10 */
  slots: Array<string | null>;
  /** Index 0 = rank 1, index 9 = rank 10 */
  revealedNations: boolean[];
  guessLog: TenableGuessLogEntry[];
  phase: GamePhase;
  roundsWithoutProgress: number;
  roundGuessesThisCycle: number;
};
