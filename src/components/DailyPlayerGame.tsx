import { useCallback, useEffect, useRef, useState } from "react";
import {
  DAILY_MAX_GUESSES,
  getDailyPlayer,
  getTodayKey,
  loadDailyPlayerState,
  saveDailyPlayerState,
} from "../lib/dailyPlayer";
import { submitDailyGuess } from "../lib/dailyPlayerApi";
import { playerInitials } from "../lib/playerImages";
import { usePlayerSearch } from "../hooks/usePlayerSearch";
import type {
  DailyAgeMatch,
  DailyFieldMatch,
  DailyGuessEntry,
  DailyLeagueMatch,
} from "../types/dailyPlayer";
import { NationFlag } from "./NationFlag";
import { PlayerSuggestionList } from "./PlayerSuggestionList";

const HINT_STAGGER_MS = 420;
const HINT_REVEAL_DURATION_MS = HINT_STAGGER_MS * 4 + 600;

type HintResult = DailyAgeMatch | DailyFieldMatch | DailyLeagueMatch;

function BlankProfileAvatar() {
  return (
    <div
      aria-hidden
      className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-white/12 bg-white/[0.03] md:h-44 md:w-44"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-20 w-20 text-white/18 md:h-24 md:w-24"
        fill="currentColor"
      >
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.87 0-7 2.69-7 6v1h14v-1c0-3.31-3.13-6-7-6z" />
      </svg>
    </div>
  );
}

function SolvedProfileAvatar({
  name,
  photo,
  failed = false,
}: {
  name: string;
  photo?: string | null;
  failed?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const showPhoto = Boolean(photo) && !imageError;
  const frameClass = failed
    ? "border-red-400/85 shadow-[0_0_32px_rgba(248,113,113,0.45)]"
    : "border-emerald-400/80 shadow-[0_0_32px_rgba(52,211,153,0.4)]";
  const initialsClass = failed ? "text-red-300" : "text-emerald-300";

  if (showPhoto) {
    return (
      <div
        className={`h-36 w-36 overflow-hidden rounded-full border-2 bg-[#1a2840] md:h-44 md:w-44 ${frameClass}`}
      >
        <img
          src={photo ?? undefined}
          alt={name}
          draggable={false}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover object-top brightness-110"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-36 w-36 items-center justify-center rounded-full border-2 bg-gradient-to-b from-[#2a3f5f] to-[#1a2840] font-display text-4xl md:h-44 md:w-44 md:text-5xl ${frameClass} ${initialsClass}`}
    >
      {playerInitials(name)}
    </div>
  );
}

function DailyGuessCounter({
  used,
  max,
}: {
  used: number;
  max: number;
}) {
  const remaining = Math.max(0, max - used);

  return (
    <p className="mt-4 text-center font-spartan text-sm font-semibold tracking-wide text-white/50">
      <span className="text-white/90">{remaining}</span>
      <span className="text-white/40"> / </span>
      <span>{max}</span>
      <span className="text-white/40"> guesses left</span>
    </p>
  );
}

function staticHintClass(result: HintResult): string {
  switch (result) {
    case "team":
      return "daily-hint-ultra";
    case "correct":
      return "daily-hint-correct";
    case "close-higher":
    case "close-lower":
      return "daily-hint-close";
    case "higher":
    case "lower":
    case "miss":
      return "daily-hint-miss";
    default:
      return "daily-hint-unknown";
  }
}

function ageArrow(match: DailyAgeMatch): string | null {
  if (match === "higher" || match === "close-higher") return "↑";
  if (match === "lower" || match === "close-lower") return "↓";
  return null;
}

function formatHintValue(value: string | number | null): string {
  if (value == null || value === "") return "—";
  return String(value);
}

function DailyHintCell({
  index,
  label,
  result,
  animate,
  compact,
  hintTitle,
  children,
}: {
  index: number;
  label: string;
  result: HintResult;
  animate: boolean;
  compact?: boolean;
  hintTitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`daily-hint-cell ${compact ? "daily-hint-cell--compact" : ""} ${
        animate ? "daily-hint-cell--animate" : staticHintClass(result)
      }`}
      style={
        animate
          ? ({ "--hint-index": index } as React.CSSProperties)
          : undefined
      }
      data-result={animate ? result : undefined}
      title={hintTitle ?? label}
    >
      <span className="daily-hint-label">{label}</span>
      <span className="daily-hint-value">{children}</span>
    </div>
  );
}

function DailySolvedReveal({
  name,
  failed,
  guessCount,
}: {
  name: string;
  failed?: boolean;
  guessCount?: number;
}) {
  return (
    <div
      className={`daily-solved-reveal mt-6 w-full max-w-lg rounded-2xl border px-6 py-6 text-center md:px-8 md:py-7 ${
        failed
          ? "border-red-400/35 bg-gradient-to-b from-red-400/15 to-red-400/5 shadow-[0_0_28px_rgba(248,113,113,0.15)]"
          : "border-emerald-400/35 bg-gradient-to-b from-emerald-400/15 to-emerald-400/5 shadow-[0_0_28px_rgba(52,211,153,0.15)]"
      }`}
    >
      {failed && (
        <p className="mb-2 font-spartan text-xs font-semibold uppercase tracking-[0.22em] text-red-300/70">
          Out of guesses
        </p>
      )}
      <p
        className={`font-spartan text-xs font-semibold uppercase tracking-[0.28em] md:text-sm ${
          failed ? "text-red-300/75" : "text-emerald-300/75"
        }`}
      >
        Today&apos;s player was
      </p>
      <p
        className={`mt-3 font-display text-4xl uppercase leading-none tracking-wide text-white md:text-5xl ${
          failed
            ? "drop-shadow-[0_0_18px_rgba(248,113,113,0.35)]"
            : "drop-shadow-[0_0_18px_rgba(52,211,153,0.35)]"
        }`}
      >
        {name}
      </p>
      {!failed && guessCount != null && guessCount > 0 && (
        <p className="mt-4 font-spartan text-sm font-semibold tracking-wide text-emerald-200/90 md:text-base">
          Got it in {guessCount} {guessCount === 1 ? "guess" : "guesses"}
        </p>
      )}
    </div>
  );
}

function DailyGuessRow({
  entry,
  animate,
  compact,
  onRevealComplete,
}: {
  entry: DailyGuessEntry;
  animate: boolean;
  compact?: boolean;
  onRevealComplete?: () => void;
}) {
  const arrow = ageArrow(entry.ageMatch);

  useEffect(() => {
    if (!animate || !onRevealComplete) return;
    const timer = window.setTimeout(onRevealComplete, HINT_REVEAL_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [animate, onRevealComplete]);

  if (compact) {
    return (
      <li className="daily-guess-row-compact">
        <p className="daily-guess-row-compact-name truncate">{entry.guess}</p>
        <div className="daily-guess-hints daily-guess-hints--horizontal">
          <DailyHintCell
            index={0}
            label="Age"
            result={entry.ageMatch}
            animate={animate}
            compact
          >
            {formatHintValue(entry.age)}
            {arrow && (
              <span className="daily-hint-arrow" aria-hidden>
                {arrow}
              </span>
            )}
          </DailyHintCell>

          <DailyHintCell
            index={1}
            label="Position"
            result={entry.positionMatch}
            animate={animate}
            compact
            hintTitle={formatHintValue(entry.position)}
          >
            <span className="daily-hint-value--wrap">
              {formatHintValue(entry.position)}
            </span>
          </DailyHintCell>

          <DailyHintCell
            index={2}
            label="League"
            result={entry.leagueMatch}
            animate={animate}
            compact
            hintTitle={formatHintValue(entry.league)}
          >
            <span className="daily-hint-value--wrap">
              {formatHintValue(entry.league)}
            </span>
          </DailyHintCell>

          <DailyHintCell
            index={3}
            label="Nation"
            result={entry.nationMatch}
            animate={animate}
            compact
          >
            {entry.nation ? (
              <NationFlag nation={entry.nation} size={28} />
            ) : (
              "—"
            )}
          </DailyHintCell>
        </div>
      </li>
    );
  }

  return (
    <li className="daily-guess-row">
      <p className="daily-guess-name truncate">{entry.guess}</p>

      <div className="daily-guess-hints">
        <DailyHintCell
          index={0}
          label="Age"
          result={entry.ageMatch}
          animate={animate}
        >
          {formatHintValue(entry.age)}
          {arrow && (
            <span className="daily-hint-arrow" aria-hidden>
              {arrow}
            </span>
          )}
        </DailyHintCell>

        <DailyHintCell
          index={1}
          label="Position"
          result={entry.positionMatch}
          animate={animate}
        >
          {formatHintValue(entry.position)}
        </DailyHintCell>

        <DailyHintCell
          index={2}
          label="League"
          result={entry.leagueMatch}
          animate={animate}
        >
          <span className="block max-w-full truncate">
            {formatHintValue(entry.league)}
          </span>
        </DailyHintCell>

        <DailyHintCell
          index={3}
          label="Nation"
          result={entry.nationMatch}
          animate={animate}
        >
          {entry.nation ? (
            <span className="flex flex-col items-center gap-1">
              <NationFlag nation={entry.nation} size={30} />
              <span className="max-w-full truncate text-[11px] font-medium leading-tight md:text-xs">
                {entry.nation}
              </span>
            </span>
          ) : (
            "—"
          )}
        </DailyHintCell>
      </div>
    </li>
  );
}

export function DailyPlayerGame() {
  const dateKey = getTodayKey();
  const [state, setState] = useState(() => loadDailyPlayerState(dateKey));
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealLatestGuess, setRevealLatestGuess] = useState(false);
  const guessBoardRef = useRef<HTMLUListElement>(null);
  const { suggestions, hasMore, isLoading, isLoadingMore, loadMore } =
    usePlayerSearch(guess);

  const handleRevealComplete = useCallback(() => {
    setIsRevealing(false);
    setRevealLatestGuess(false);
  }, []);

  useEffect(() => {
    const board = guessBoardRef.current;
    if (!board || state.guesses.length === 0) return;

    board.scrollTo({
      left: board.scrollWidth,
      behavior: "smooth",
    });
  }, [state.guesses.length]);

  const gameOver = state.solved || Boolean(state.failed);
  const guessesUsed = state.guesses.length;
  const canGuess =
    !gameOver && guessesUsed < DAILY_MAX_GUESSES && !isRevealing;

  async function submitGuess(value: string) {
    if (!canGuess || isSubmitting) return;

    const trimmed = value.trim();
    if (!trimmed) {
      setFeedback("Type a player name first.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await submitDailyGuess(trimmed, dateKey);
      const dailyPlayer = getDailyPlayer();
      const nextGuesses = [...state.guesses, result.feedback].slice(
        0,
        DAILY_MAX_GUESSES,
      );
      const failed =
        !result.correct && nextGuesses.length >= DAILY_MAX_GUESSES;
      const revealAnswer = result.correct || failed;

      const nextState = {
        dateKey,
        solved: result.correct,
        failed,
        guesses: nextGuesses,
        answer: revealAnswer ? dailyPlayer.answer : state.answer,
        photo: revealAnswer ? (dailyPlayer.photo ?? undefined) : undefined,
      };

      setState(nextState);
      saveDailyPlayerState(nextState);
      setGuess("");
      setRevealLatestGuess(true);
      setIsRevealing(true);
    } catch {
      setFeedback("Could not check that guess. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputDisabled = isSubmitting || isRevealing || !canGuess;
  const latestGuessIndex = state.guesses.length - 1;
  const solvedPhoto =
    state.photo ?? (gameOver ? getDailyPlayer().photo : undefined);
  const revealComplete = gameOver && !isRevealing;
  const showSolvedAvatar = revealComplete && state.answer;
  const showGuessBoard = !revealComplete && state.guesses.length > 0;
  const showSolvedMessage = revealComplete && state.answer;
  const showGuessCounter = !revealComplete;

  return (
    <div className="flex w-full flex-col items-center px-2 pt-2 pb-6 md:pt-4">
      {showSolvedAvatar && state.answer ? (
        <SolvedProfileAvatar
          name={state.answer}
          photo={solvedPhoto}
          failed={state.failed}
        />
      ) : (
        <BlankProfileAvatar />
      )}

      {showGuessCounter && (
        <DailyGuessCounter used={guessesUsed} max={DAILY_MAX_GUESSES} />
      )}

      {showGuessBoard && (
        <div className="mt-4 w-full max-w-lg">
          <ul
            ref={guessBoardRef}
            className="daily-guess-board"
            aria-label="Previous guesses"
          >
            {state.guesses.map((entry, index) => (
              <DailyGuessRow
                key={`${entry.guess}-${index}`}
                entry={entry}
                compact
                animate={revealLatestGuess && index === latestGuessIndex}
                onRevealComplete={
                  revealLatestGuess && index === latestGuessIndex
                    ? handleRevealComplete
                    : undefined
                }
              />
            ))}
          </ul>
          {state.guesses.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5">
              {state.guesses.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === latestGuessIndex
                      ? "w-4 bg-white/60"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showSolvedMessage && state.answer && (
        <DailySolvedReveal
          name={state.answer}
          failed={state.failed}
          guessCount={state.solved ? guessesUsed : undefined}
        />
      )}

      {canGuess && (
        <div
          className={`relative w-full max-w-lg ${showGuessBoard || showGuessCounter ? "mt-4" : "mt-8"}`}
        >
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitGuess(guess);
              }
            }}
            placeholder="Search for a player..."
            className="field-input disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
            disabled={inputDisabled}
            aria-label="Guess the daily player"
          />

          <PlayerSuggestionList
            suggestions={suggestions}
            hasMore={hasMore}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            onSelect={(name) => void submitGuess(name)}
            onLoadMore={loadMore}
            disabled={inputDisabled}
            variant="dropdown"
            showMeta={false}
          />

          {feedback && (
            <p className="mt-2 px-1 text-center font-spartan text-sm font-semibold text-red-400">
              {feedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
