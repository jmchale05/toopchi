import { useCallback, useEffect, useRef, useState } from "react";
import { searchPlayersLocal } from "../lib/localPlayerSearch";
import type { PlayerSearchResult } from "../types/player";

export type PlayerSuggestion = {
  source: "players";
  result: PlayerSearchResult;
};

export const PLAYER_SUGGESTION_LIMIT = 3;

export function usePlayerSearch(query: string) {
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
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
        const page = await searchPlayersLocal(trimmed, {
          limit: PLAYER_SUGGESTION_LIMIT,
        });
        if (id !== requestId.current) return;
        setSuggestions(
          page.results
            .slice(0, PLAYER_SUGGESTION_LIMIT)
            .map((result) => ({ source: "players", result })),
        );
        setHasMore(false);
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
          (result): PlayerSuggestion => ({ source: "players", result }),
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

export function getPlayerSuggestionName(item: PlayerSuggestion): string {
  return item.result.player.name;
}

export function getPlayerSuggestionKey(item: PlayerSuggestion): string {
  return String(item.result.player.id);
}
