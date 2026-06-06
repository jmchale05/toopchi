import { DAILY_PLAYER_API_URL } from "../config/dailyPlayer";
import type { DailyGuessResult } from "../types/dailyPlayer";
import { getDailyPlayer, resolveDailyPlayerGuess } from "./dailyPlayer";

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

function submitDailyGuessMock(guess: string): DailyGuessResult {
  const player = getDailyPlayer();

  if (resolveDailyPlayerGuess(player, guess)) {
    return {
      correct: true,
      temperature: 100,
      label: "correct",
      answer: player.answer,
    };
  }

  return {
    correct: false,
    temperature: 0,
    label: "cold",
    hints: [],
  };
}
