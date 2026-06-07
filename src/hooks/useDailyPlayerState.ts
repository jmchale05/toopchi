import { useCallback, useSyncExternalStore } from "react";
import {
  getTodayKey,
  loadDailyPlayerState,
  saveDailyPlayerState,
  subscribeDailyPlayerState,
} from "../lib/dailyPlayer";
import type { DailyPlayerState } from "../types/dailyPlayer";

export function useDailyPlayerState() {
  const dateKey = getTodayKey();
  const state = useSyncExternalStore(
    subscribeDailyPlayerState,
    () => loadDailyPlayerState(dateKey),
    () => loadDailyPlayerState(dateKey),
  );

  const persistState = useCallback((next: DailyPlayerState) => {
    saveDailyPlayerState(next);
  }, []);

  return { dateKey, state, persistState };
}
