import type { PlayerRecord } from "../types/player";
import {
  getPlayerSuggestionKey,
  getPlayerSuggestionName,
  type PlayerSuggestion,
} from "../hooks/usePlayerSearch";
import { NationFlag } from "./NationFlag";

function formatPlayerMeta(player: PlayerRecord): string | null {
  return player.position?.trim() || null;
}

export function PlayerSuggestionList({
  suggestions,
  hasMore,
  isLoading,
  isLoadingMore,
  onSelect,
  onLoadMore,
  disabled,
  variant = "dropdown",
  showMeta = true,
}: {
  suggestions: PlayerSuggestion[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onSelect: (name: string) => void;
  onLoadMore: () => void;
  disabled?: boolean;
  variant?: "dropdown" | "popover" | "popover-up" | "popover-up-tenable" | "stack";
  showMeta?: boolean;
}) {
  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  const listClassName =
    variant === "stack"
      ? "max-h-[min(11rem,28dvh)] shrink-0 overflow-y-auto overscroll-contain border-b border-white/10 divide-y divide-white/10"
      : variant === "popover-up-tenable"
        ? "tenable-mobile-suggestions absolute inset-x-0 bottom-full mb-2 divide-y divide-white/10"
      : variant === "popover-up"
      ? "absolute inset-x-3 bottom-full z-20 mb-2 max-h-48 overflow-y-auto rounded-xl border border-white/15 bg-[#0a1628] shadow-[0_-8px_32px_rgba(0,0,0,0.45)] divide-y divide-white/10"
      : variant === "popover"
        ? "absolute inset-x-0 top-full z-20 mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/15 bg-[#0a1628] shadow-[0_12px_32px_rgba(0,0,0,0.45)] divide-y divide-white/10"
        : "mt-2 overflow-hidden rounded-xl border border-white/10 divide-y divide-white/10";

  const buttonClassName =
    variant === "dropdown"
      ? "w-full px-4 py-3 text-left font-spartan text-base text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
      : "w-full px-4 py-3.5 text-left font-spartan text-base text-white transition hover:bg-white/10 disabled:opacity-50";

  return (
    <ul className={listClassName}>
      {suggestions.map((item) => {
        const name = getPlayerSuggestionName(item);
        const subtitle = showMeta
          ? formatPlayerMeta(item.result.player)
          : null;

        return (
          <li key={getPlayerSuggestionKey(item)}>
            <button
              type="button"
              onClick={() => onSelect(name)}
              disabled={disabled}
              className={`${buttonClassName} flex items-center gap-2.5`}
            >
              {item.result.player.nationality ? (
                <NationFlag
                  nation={item.result.player.nationality}
                  size={18}
                  compact
                  className="shrink-0"
                />
              ) : (
                <span className="h-[14px] w-[18px] shrink-0" aria-hidden />
              )}
              <span className="min-w-0 flex-1 truncate text-left">{name}</span>
              {subtitle && (
                <span className="shrink-0 text-sm text-white/40 md:text-xs">
                  {subtitle}
                </span>
              )}
            </button>
          </li>
        );
      })}

      {isLoading && suggestions.length === 0 && (
        <li className="px-4 py-3.5 text-base text-white/45 md:text-sm">
          Searching...
        </li>
      )}

      {hasMore && (
        <li>
          <button
            type="button"
            onClick={() => void onLoadMore()}
            disabled={disabled || isLoadingMore}
            className={`${buttonClassName} text-[#f5c542]`}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </li>
      )}
    </ul>
  );
}
