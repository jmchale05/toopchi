import { DAILY_PLAYER_API_URL } from "../config/dailyPlayer";
import { getDailyPlayer, resolveDailyPlayerGuess } from "./dailyPlayer";
import { buildDailyGuessFeedback } from "./dailyPlayerHints";
import type { DailyGuessResult } from "../types/dailyPlayer";

export async function submitDailyGuess(
  guess: string,
  dateKey: string,
): Promise<DailyGuessResult> {
  if (DAILY_PLAYER_API_URL) {
    const response = await fetch(`${DAILY_PLAYER_API_URL}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess, dateKey }),
    });

    if (!response.ok) {
      throw new Error("Daily guess API request failed.");
    }

    return (await response.json()) as DailyGuessResult;
  }

  return submitDailyGuessMock(guess);
}

async function submitDailyGuessMock(guess: string): Promise<DailyGuessResult> {
  const player = getDailyPlayer();
  const feedback = await buildDailyGuessFeedback(guess, player);

  if (resolveDailyPlayerGuess(player, guess) || feedback.correct) {
    return {
      correct: true,
      answer: player.answer,
      feedback: {
        ...feedback,
        correct: true,
        ageMatch: feedback.age == null ? "unknown" : "correct",
        positionMatch:
          feedback.positionMatch === "unknown" ? "unknown" : "correct",
        leagueMatch:
          feedback.leagueMatch === "unknown" ? "unknown" : "correct",
        nationMatch:
          feedback.nationMatch === "unknown" ? "unknown" : "correct",
      },
    };
  }

  return {
    correct: false,
    feedback,
  };
}
