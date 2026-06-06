import { useState } from "react";
import type { Player } from "../../../types/match";
import type { PlayerRecord } from "../../../types/player";
import type { TenableList } from "../../../types/tenable";
import {
  getTenableSuggestionKey,
  getTenableSuggestionName,
  useTenablePlayerSearch,
  type TenableSuggestion,
} from "../../../hooks/useTenablePlayerSearch";
import {
  AnimatedPlayerScore,
  type ScoreAnimation,
} from "../../AnimatedPlayerScore";
import { GameExitButton } from "../../GameExitButton";
import { PrimaryButton } from "../../Layout";

function formatPlayerMeta(player: PlayerRecord): string | null {
  const club = player.club ?? player.team;
  const parts: string[] = [];

  if (typeof player.age === "number") {
    parts.push(String(player.age));
  }

  if (club) {
    parts.push(club);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function TenableSuggestionList({
  suggestions,
  hasMore,
  isLoading,
  isLoadingMore,
  onSelect,
  onLoadMore,
  disabled,
  variant,
}: {
  suggestions: TenableSuggestion[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onSelect: (name: string) => void;
  onLoadMore: () => void;
  disabled?: boolean;
  variant: "desktop" | "mobile";
}) {
  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  const listClassName =
    variant === "mobile"
      ? "absolute inset-x-3 bottom-full mb-2 max-h-48 overflow-y-auto rounded-xl border border-white/15 bg-[#0a1628] shadow-[0_-8px_32px_rgba(0,0,0,0.45)] divide-y divide-white/10"
      : "mt-3 overflow-hidden rounded-xl border border-white/10 divide-y divide-white/10";

  const buttonClassName =
    variant === "mobile"
      ? "w-full px-4 py-3 text-left font-spartan text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
      : "w-full px-4 py-3 text-left text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-base";

  return (
    <ul className={listClassName}>
      {suggestions.map((item) => {
        const name = getTenableSuggestionName(item);
        const subtitle = formatPlayerMeta(item.result.player);

        return (
          <li key={getTenableSuggestionKey(item)}>
            <button
              type="button"
              onClick={() => onSelect(name)}
              disabled={disabled}
              className={buttonClassName}
            >
              <span className="block truncate">{name}</span>
              {subtitle && (
                <span className="block truncate text-xs text-white/40">
                  {subtitle}
                </span>
              )}
            </button>
          </li>
        );
      })}

      {isLoading && suggestions.length === 0 && (
        <li className="px-4 py-3 text-sm text-white/45">Searching...</li>
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

// ── Shared guess form (desktop sidebar) ──────────────────────────────────────

export function TenableGuessForm({
  list,
  onSubmit,
  error,
  disabled = false,
}: {
  list: TenableList;
  onSubmit: (guess: string) => void;
  error: string | null;
  disabled?: boolean;
}) {
  const [guess, setGuess] = useState("");
  const { suggestions, hasMore, isLoading, isLoadingMore, loadMore } =
    useTenablePlayerSearch(list, guess);

  function submit(value: string) {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setGuess("");
  }

  return (
    <div>
      <p className="text-sm text-white/60 md:text-base">
        Name someone on the{" "}
        <span className="font-semibold text-[#f5c542]">list</span>
      </p>

      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit(guess);
          }
        }}
        placeholder="Type your guess..."
        className="field-input mt-3 disabled:cursor-not-allowed disabled:opacity-50"
        autoComplete="off"
        disabled={disabled}
      />

      <TenableSuggestionList
        suggestions={suggestions}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onSelect={submit}
        onLoadMore={loadMore}
        disabled={disabled}
        variant="desktop"
      />

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-400 md:text-base">
          {error}
        </p>
      )}

      <div className="mt-5">
        <PrimaryButton disabled={disabled} onClick={() => submit(guess)}>
          Submit
        </PrimaryButton>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M3.4 20.4 21 12 3.4 3.6l-.9 7.2 9.6 1.2-9.6 1.2.9 7.2z" />
    </svg>
  );
}

// ── Mobile fixed search bar ──────────────────────────────────────────────────

export function TenableMobileSearchBar({
  list,
  onSubmit,
  error,
  disabled = false,
}: {
  list: TenableList;
  onSubmit: (guess: string) => void;
  error: string | null;
  disabled?: boolean;
}) {
  const [guess, setGuess] = useState("");
  const { suggestions, hasMore, isLoading, isLoadingMore, loadMore } =
    useTenablePlayerSearch(list, guess);

  function submit(value: string) {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setGuess("");
  }

  const canSend = guess.trim().length > 0 && !disabled;

  return (
    <div className="tenable-mobile-footer md:hidden">
      <TenableSuggestionList
        suggestions={suggestions}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onSelect={submit}
        onLoadMore={loadMore}
        disabled={disabled}
        variant="mobile"
      />

      <div className="relative px-3 pt-2.5 pb-3">
        <div className="relative">
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit(guess);
              }
            }}
            placeholder="Guess a name..."
            className="field-input min-h-11 w-full py-2.5 pr-12 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => submit(guess)}
            disabled={!canSend}
            aria-label="Send guess"
            className={`absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center transition ${
              canSend
                ? "text-[#f5c542] hover:text-[#ffcf4d]"
                : "text-white/30"
            }`}
          >
            <SendIcon />
          </button>
        </div>

        {error && (
          <p className="mt-1.5 px-0.5 text-xs font-semibold text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Desktop sidebar ──────────────────────────────────────────────────────────

export function TenableDesktopSidebar({
  list,
  players,
  activePlayer,
  activePlayerIndex,
  foundCount,
  error,
  onSubmit,
  disabled = false,
  scoreAnimation = null,
}: {
  list: TenableList;
  players: Player[];
  activePlayer: Player;
  activePlayerIndex: number;
  foundCount: number;
  error: string | null;
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  scoreAnimation?: ScoreAnimation | null;
}) {
  const playerScores = players.map((player, index) => ({ player, index }));

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-white/10 bg-[#0a1628] lg:w-96">
      <div className="relative border-b border-white/10 px-6 py-5 pr-14">
        <div className="absolute inset-y-0 right-4 z-10 flex items-center">
          <GameExitButton />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/35">
          {list.title}
        </p>
        {list.subtitle && (
          <p className="mt-0.5 text-[10px] font-medium normal-case tracking-wide text-white/30">
            {list.subtitle}
          </p>
        )}
        <div className="mt-1.5">
          <span className="font-display text-3xl text-[#f5c542] lg:text-4xl">
            {activePlayer.name}
          </span>
        </div>
        <p className="mt-1 text-xs text-white/35">
          {foundCount} / {list.items.length} found
        </p>
      </div>

      <div className="flex divide-x divide-white/10 border-b border-white/10">
        {playerScores.map(({ player, index }) => {
          const isActive = index === activePlayerIndex;
          return (
            <div
              key={`player-${index}`}
              className={`flex min-w-0 flex-1 flex-col items-center py-3 px-2 transition-colors ${
                isActive ? "bg-[#f5c542]/10" : ""
              }`}
            >
              <span
                className={`truncate text-xs font-semibold ${
                  isActive ? "text-[#f5c542]" : "text-white/50"
                }`}
              >
                {player.name}
              </span>
              <AnimatedPlayerScore
                playerIndex={index}
                score={player.score}
                animation={scoreAnimation}
                className={`font-display text-2xl leading-tight lg:text-3xl ${
                  isActive ? "text-white" : "text-white/70"
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <TenableGuessForm
          list={list}
          onSubmit={onSubmit}
          error={error}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
