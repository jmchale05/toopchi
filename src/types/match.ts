export type Team = {
  name: string;
  code: string;
  /** Team profile image shown on every slot for this team */
  playerSprite?: string;
};

export type Match = {
  id: string;
  teamA: Team;
  teamB: Team;
  formationA?: "4-2-3-1" | "4-3-1-2";
  formationB?: "4-2-3-1" | "4-3-1-2";
  score: string;
  date: string;
  stage: string;
  competition: string;
  lineupA: string[];
  lineupB: string[];
  aliases: Record<string, string[]>;
  /** Optional map of player name → headshot URL for pitch avatars */
  playerImages?: Record<string, string>;
};

export type Player = {
  name: string;
  score: number;
};

export type GuessLogEntry = {
  playerName: string;
  guess: string;
  team: "A" | "B";
  correct: boolean;
  matchedName?: string;
};

export type GamePhase = "guessing" | "finished";

export type LineupSession = {
  mode: "lineup";
  players: Player[];
  activePlayerIndex: number;
  match: Match;
  guessedA: string[];
  guessedB: string[];
  slotA: Array<string | null>;
  slotB: Array<string | null>;
  guessLog: GuessLogEntry[];
  phase: GamePhase;
  roundsWithoutProgress: number;
  roundGuessesThisCycle: number;
};

/** @deprecated use LineupSession */
export type Session = LineupSession;
