import dailyPlayersData from "../data/daily-players.json";
import dailyPlayerScheduleData from "../data/daily-player-schedule.json";
import type {
  DailyGuessEntry,
  DailyPlayer,
  DailyPlayerState,
} from "../types/dailyPlayer";
import { normalizeName } from "./nameMatch";

const STORAGE_KEY = "toopchi-daily-player";
export const DAILY_STATE_EVENT = "toopchi-daily-player-change";

export const DAILY_MAX_GUESSES = 6;
const dailyPlayers = dailyPlayersData as DailyPlayer[];
const dailyPlayerSchedule = dailyPlayerScheduleData as Record<
  string,
  DailyPlayer
>;

let cachedSnapshotKey = "";
let cachedSnapshot: DailyPlayerState | null = null;

export function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function hashDateKey(dateKey: string): number {
  let hash = 0;
  for (const char of dateKey) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function createFreshState(dateKey: string): DailyPlayerState {
  return { dateKey, solved: false, failed: false, guesses: [] };
}

function isValidGuessEntry(
  entry: DailyGuessEntry | undefined,
): entry is DailyPlayerState["guesses"][number] {
  return (
    !!entry &&
    typeof entry.guess === "string" &&
    typeof entry.ageMatch === "string" &&
    typeof entry.nationMatch === "string"
  );
}

function normalizeLoadedState(
  parsed: Partial<DailyPlayerState>,
  dateKey: string,
): DailyPlayerState {
  const guesses = (parsed.guesses ?? [])
    .filter(isValidGuessEntry)
    .slice(0, DAILY_MAX_GUESSES);
  const solved = Boolean(parsed.solved);
  const failed =
    Boolean(parsed.failed) ||
    (!solved && guesses.length >= DAILY_MAX_GUESSES);
  const complete = solved || failed;
  const dailyPlayer = getDailyPlayer(dateFromKey(dateKey));

  return {
    dateKey,
    solved,
    failed,
    guesses,
    answer: complete
      ? (parsed.answer ?? dailyPlayer.answer)
      : parsed.answer,
    photo: complete
      ? (parsed.photo ?? dailyPlayer.photo ?? undefined)
      : parsed.photo,
    completedAt: complete
      ? (parsed.completedAt ?? Date.now())
      : parsed.completedAt,
  };
}

function invalidateSnapshotCache(): void {
  cachedSnapshotKey = "";
  cachedSnapshot = null;
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

export function isDailyComplete(state: DailyPlayerState): boolean {
  return Boolean(state.solved || state.failed);
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
  const cacheKey = `${dateKey}:${localStorage.getItem(STORAGE_KEY) ?? ""}`;
  if (cachedSnapshot && cachedSnapshotKey === cacheKey) {
    return cachedSnapshot;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createFreshState(dateKey);
      cachedSnapshotKey = cacheKey;
      cachedSnapshot = fresh;
      return fresh;
    }

    const parsed = JSON.parse(raw) as Partial<DailyPlayerState>;
    if (parsed.dateKey !== dateKey) {
      const fresh = createFreshState(dateKey);
      cachedSnapshotKey = cacheKey;
      cachedSnapshot = fresh;
      return fresh;
    }

    const state = normalizeLoadedState(parsed, dateKey);
    cachedSnapshotKey = cacheKey;
    cachedSnapshot = state;
    return state;
  } catch {
    const fresh = createFreshState(dateKey);
    cachedSnapshotKey = cacheKey;
    cachedSnapshot = fresh;
    return fresh;
  }
}

export function saveDailyPlayerState(state: DailyPlayerState): void {
  const complete = isDailyComplete(state);
  const payload: DailyPlayerState = {
    ...state,
    failed: Boolean(state.failed),
    completedAt: complete ? (state.completedAt ?? Date.now()) : undefined,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    invalidateSnapshotCache();
    window.dispatchEvent(new Event(DAILY_STATE_EVENT));
  } catch {
    // Ignore quota / private-mode errors.
  }
}

export function subscribeDailyPlayerState(listener: () => void): () => void {
  const refresh = () => listener();
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      refresh();
    }
  };

  window.addEventListener(DAILY_STATE_EVENT, refresh);
  window.addEventListener("storage", refresh);
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    window.removeEventListener(DAILY_STATE_EVENT, refresh);
    window.removeEventListener("storage", refresh);
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
