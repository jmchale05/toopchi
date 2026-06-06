import dailyPlayersData from "../data/daily-players.json";
import dailyPlayerScheduleData from "../data/daily-player-schedule.json";
import type { DailyPlayer, DailyPlayerState } from "../types/dailyPlayer";
import { normalizeName } from "./nameMatch";

const STORAGE_KEY = "toopchi-daily-player";

export const DAILY_MAX_GUESSES = 6;
const dailyPlayers = dailyPlayersData as DailyPlayer[];
const dailyPlayerSchedule = dailyPlayerScheduleData as Record<
  string,
  DailyPlayer
>;

export function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashDateKey(dateKey: string): number {
  let hash = 0;
  for (const char of dateKey) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

/** Local fallback until daily answer is served by API */
export function getDailyPlayer(date = new Date()): DailyPlayer {
  const dateKey = getTodayKey(date);
  const scheduled = dailyPlayerSchedule[dateKey];
  if (scheduled) {
    return scheduled;
  }

  const index = hashDateKey(dateKey) % dailyPlayers.length;
  return dailyPlayers[index];
}

export function resolveDailyPlayerGuess(player: DailyPlayer, input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) {
    return false;
  }

  const normalizedInput = normalizeName(trimmed);
  const names = [player.answer, ...(player.aliases ?? [])];

  if (names.some((name) => normalizeName(name) === normalizedInput)) {
    return true;
  }

  const lastName = normalizeName(player.answer.split(" ").pop() ?? "");
  return lastName.length > 2 && normalizedInput === lastName;
}

export function loadDailyPlayerState(dateKey = getTodayKey()): DailyPlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { dateKey, solved: false, guesses: [] };
    }

    const parsed = JSON.parse(raw) as DailyPlayerState;
    if (parsed.dateKey !== dateKey) {
      return { dateKey, solved: false, guesses: [] };
    }

    const guesses = (parsed.guesses ?? [])
      .filter(
        (entry) =>
          typeof entry.ageMatch === "string" &&
          typeof entry.nationMatch === "string",
      )
      .slice(0, DAILY_MAX_GUESSES);
    const failed =
      parsed.failed ??
      (!parsed.solved && guesses.length >= DAILY_MAX_GUESSES);

    return {
      dateKey: parsed.dateKey,
      solved: parsed.solved,
      failed,
      guesses,
      answer: parsed.answer ?? (failed ? getDailyPlayer().answer : undefined),
      photo: parsed.photo,
    };
  } catch {
    return { dateKey, solved: false, guesses: [] };
  }
}

export function saveDailyPlayerState(state: DailyPlayerState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
