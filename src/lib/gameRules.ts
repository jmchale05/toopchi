import type { Match, Player, LineupSession } from "../types/match";
import { createEmptySlots } from "./formations";

export const POINTS_PER_GUESS = 100;
export const MAX_STALEMATE_ROUNDS = 3;

export function createSession(match: Match, playerNames: string[]): LineupSession {
  return {
    mode: "lineup",
    players: playerNames.map((name) => ({ name, score: 0 })),
    activePlayerIndex: 0,
    match,
    guessedA: [],
    guessedB: [],
    slotA: createEmptySlots(),
    slotB: createEmptySlots(),
    guessLog: [],
    phase: "guessing",
    roundsWithoutProgress: 0,
    roundGuessesThisCycle: 0,
  };
}

export function totalStartersGuessed(session: LineupSession): number {
  return session.guessedA.length + session.guessedB.length;
}

export function isGameFinished(session: LineupSession): boolean {
  if (session.guessedA.length === 11 && session.guessedB.length === 11) {
    return true;
  }
  return session.roundsWithoutProgress >= MAX_STALEMATE_ROUNDS;
}

export function finishGame(session: LineupSession): LineupSession {
  return { ...session, phase: "finished" };
}

export function nextActivePlayerIndex(session: LineupSession): number {
  return (session.activePlayerIndex + 1) % session.players.length;
}

export function applyCorrectGuess(
  session: LineupSession,
  team: "A" | "B",
  canonical: string,
  guess: string,
  slotIndex: number,
): LineupSession {
  const activePlayer = session.players[session.activePlayerIndex];
  const updatedPlayers = session.players.map((player, index) =>
    index === session.activePlayerIndex
      ? { ...player, score: player.score + POINTS_PER_GUESS }
      : player,
  );

  const nextGuessedA =
    team === "A" ? [...session.guessedA, canonical] : session.guessedA;
  const nextGuessedB =
    team === "B" ? [...session.guessedB, canonical] : session.guessedB;
  const nextSlotA = [...session.slotA];
  const nextSlotB = [...session.slotB];

  if (team === "A") {
    nextSlotA[slotIndex] = canonical;
  } else {
    nextSlotB[slotIndex] = canonical;
  }

  return {
    ...session,
    players: updatedPlayers,
    guessedA: nextGuessedA,
    guessedB: nextGuessedB,
    slotA: nextSlotA,
    slotB: nextSlotB,
    guessLog: [
      ...session.guessLog,
      {
        playerName: activePlayer.name,
        guess,
        team,
        correct: true,
        matchedName: canonical,
      },
    ],
    roundsWithoutProgress: 0,
    roundGuessesThisCycle: 0,
    activePlayerIndex: nextActivePlayerIndex(session),
    phase: isGameFinished({
      ...session,
      guessedA: nextGuessedA,
      guessedB: nextGuessedB,
    })
      ? "finished"
      : "guessing",
  };
}

export function applyWrongGuess(session: LineupSession, team: "A" | "B", guess: string): LineupSession {
  const activePlayer = session.players[session.activePlayerIndex];
  const roundGuessesThisCycle = session.roundGuessesThisCycle + 1;
  const completedFullCycle = roundGuessesThisCycle >= session.players.length;
  const roundsWithoutProgress = completedFullCycle
    ? session.roundsWithoutProgress + 1
    : session.roundsWithoutProgress;

  const nextSession: LineupSession = {
    ...session,
    guessLog: [
      ...session.guessLog,
      { playerName: activePlayer.name, guess, team, correct: false },
    ],
    roundGuessesThisCycle: completedFullCycle ? 0 : roundGuessesThisCycle,
    roundsWithoutProgress,
    activePlayerIndex: nextActivePlayerIndex(session),
    phase: "guessing",
  };

  if (isGameFinished(nextSession)) {
    return finishGame(nextSession);
  }

  return nextSession;
}

export function getWinners(players: Player[]): Player[] {
  const topScore = Math.max(...players.map((player) => player.score));
  return players.filter((player) => player.score === topScore);
}
