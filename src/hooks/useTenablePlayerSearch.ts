import { useCallback, useEffect, useRef, useState } from "react";
import { searchPlayersLocal } from "../lib/localPlayerSearch";
import type { PlayerSearchResult } from "../types/player";
import type { TenableList } from "../types/tenable";

export type TenableSuggestion = {
  source: "players";
  result: PlayerSearchResult;
};

export function useTenablePlayerSearch(_list: TenableList, query: string) {
  const [suggestions, setSuggestions] = useState<TenableSuggestion[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setHasMore(false);
      setSearchError(null);
      return;
    }

    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setSearchError(null);
      try {
        const page = await searchPlayersLocal(trimmed);
        if (id !== requestId.current) return;
        setSuggestions(
          page.results.map((result) => ({ source: "players", result })),
        );
        setHasMore(page.hasMore);
      } catch {
        if (id !== requestId.current) return;
        setSuggestions([]);
        setHasMore(false);
        setSearchError("Player search unavailable.");
      } finally {
        if (id === requestId.current) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    setIsLoadingMore(true);
    try {
      const offset = suggestions.length;
      const page = await searchPlayersLocal(trimmed, { offset });
      setSuggestions((previous) => [
        ...previous,
        ...page.results.map(
          (result): TenableSuggestion => ({ source: "players", result }),
        ),
      ]);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, query, suggestions.length]);

  return {
    suggestions,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    searchError,
  };
}

export function getTenableSuggestionName(item: TenableSuggestion): string {
  return item.result.player.name;
}

export function getTenableSuggestionKey(item: TenableSuggestion): string {
  return String(item.result.player.id);
}
