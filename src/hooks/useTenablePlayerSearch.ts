import type { TenableList } from "../types/tenable";
import {
  getPlayerSuggestionKey,
  getPlayerSuggestionName,
  usePlayerSearch,
  type PlayerSuggestion,
} from "./usePlayerSearch";

export type TenableSuggestion = PlayerSuggestion;

export function useTenablePlayerSearch(_list: TenableList, query: string) {
  return usePlayerSearch(query);
}

export const getTenableSuggestionName = getPlayerSuggestionName;
export const getTenableSuggestionKey = getPlayerSuggestionKey;
