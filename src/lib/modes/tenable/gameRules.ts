import type { Player } from "../../../types/match";
import type { TenableItem, TenableList, TenableSession } from "../../../types/tenable";

export const POINTS_PER_TENABLE_GUESS = 100;
export const NATION_REVEAL_COST = 50;
export const MAX_STALEMATE_ROUNDS = 3;

export function createTenableSession(
  list: TenableList,
  playerNames: string[],
): TenableSession {
  return {
    mode: "tenable",
    players: playerNames.map((name) => ({ name, score: 0 })),
    activePlayerIndex: 0,
    list,
    slots: Array.from({ length: 10 }, () => null),
    revealedNations: Array.from({ length: 10 }, () => false),
    guessLog: [],
    phase: "guessing",
    roundsWithoutProgress: 0,
    roundGuessesThisCycle: 0,
  };
}

export function tenableItemsFound(session: TenableSession): number {
  return session.slots.filter(Boolean).length;
}

export function finishTenableSession(session: TenableSession): TenableSession {
  return { ...session, phase: "finished", endedEarly: true };
}

export function getTenableMissedAnswers(session: TenableSession): TenableItem[] {
  return [...session.list.items]
    .filter((item) => !session.slots[item.rank - 1])
    .sort((a, b) => a.rank - b.rank);
}

export function isTenableFinished(session: TenableSession): boolean {
  if (tenableItemsFound(session) === 10) {
    return true;
  }
  return session.roundsWithoutProgress >= MAX_STALEMATE_ROUNDS;
}

export function nextActivePlayerIndex(session: TenableSession): number {
  return (session.activePlayerIndex + 1) % session.players.length;
}

export function applyTenableCorrectGuess(
  session: TenableSession,
  answer: string,
  guess: string,
  rank: number,
): TenableSession {
  const activePlayer = session.players[session.activePlayerIndex];
  const slotIndex = rank - 1;
  const updatedPlayers = session.players.map((player, index) =>
    index === session.activePlayerIndex
      ? { ...player, score: player.score + POINTS_PER_TENABLE_GUESS }
      : player,
  );
  const nextSlots = [...session.slots];
  nextSlots[slotIndex] = answer;

  return {
    ...session,
    players: updatedPlayers,
    slots: nextSlots,
    guessLog: [
      ...session.guessLog,
      {
        playerName: activePlayer.name,
        guess,
        correct: true,
        matchedAnswer: answer,
        rank,
      },
    ],
    roundsWithoutProgress: 0,
    roundGuessesThisCycle: 0,
    activePlayerIndex: nextActivePlayerIndex(session),
    phase: isTenableFinished({
      ...session,
      slots: nextSlots,
    })
      ? "finished"
      : "guessing",
  };
}

export function applyTenableWrongGuess(
  session: TenableSession,
  guess: string,
): TenableSession {
  const activePlayer = session.players[session.activePlayerIndex];
  const roundGuessesThisCycle = session.roundGuessesThisCycle + 1;
  const completedFullCycle = roundGuessesThisCycle >= session.players.length;
  const roundsWithoutProgress = completedFullCycle
    ? session.roundsWithoutProgress + 1
    : session.roundsWithoutProgress;

  const nextSession: TenableSession = {
    ...session,
    guessLog: [
      ...session.guessLog,
      { playerName: activePlayer.name, guess, correct: false },
    ],
    roundGuessesThisCycle: completedFullCycle ? 0 : roundGuessesThisCycle,
    roundsWithoutProgress,
    activePlayerIndex: nextActivePlayerIndex(session),
    phase: "guessing",
  };

  if (isTenableFinished(nextSession)) {
    return { ...nextSession, phase: "finished" };
  }

  return nextSession;
}

export function canAffordNationReveal(score: number): boolean {
  return score >= NATION_REVEAL_COST;
}

export function tryApplyNationReveal(
  session: TenableSession,
  rank: number,
  payerIndex: number,
): {
  session: TenableSession;
  applied: boolean;
  payerIndex: number | null;
  fromScore: number | null;
  toScore: number | null;
} {
  const revealedNations =
    session.revealedNations ?? Array.from({ length: 10 }, () => false);
  const slotIndex = rank - 1;

  if (revealedNations[slotIndex]) {
    return {
      session,
      applied: false,
      payerIndex: null,
      fromScore: null,
      toScore: null,
    };
  }

  const payer = session.players[payerIndex];
  if (!payer || !canAffordNationReveal(payer.score)) {
    return {
      session,
      applied: false,
      payerIndex: null,
      fromScore: null,
      toScore: null,
    };
  }

  const item = session.list.items.find((entry) => entry.rank === rank);
  if (!item?.nation) {
    return {
      session,
      applied: false,
      payerIndex: null,
      fromScore: null,
      toScore: null,
    };
  }

  const nextRevealedNations = [...revealedNations];
  nextRevealedNations[slotIndex] = true;
  const fromScore = payer.score;
  const toScore = fromScore - NATION_REVEAL_COST;

  return {
    session: {
      ...session,
      revealedNations: nextRevealedNations,
      players: session.players.map((player, index) =>
        index === payerIndex ? { ...player, score: toScore } : player,
      ),
    },
    applied: true,
    payerIndex,
    fromScore,
    toScore,
  };
}

export function applyNationReveal(
  session: TenableSession,
  rank: number,
  payerIndex = session.activePlayerIndex,
): TenableSession {
  return tryApplyNationReveal(session, rank, payerIndex).session;
}

export function getWinners(players: Player[]): Player[] {
  const topScore = Math.max(...players.map((player) => player.score));
  return players.filter((player) => player.score === topScore);
}
