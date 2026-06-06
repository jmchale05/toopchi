import { useState } from "react";
import {
  getTodayKey,
  loadDailyPlayerState,
  saveDailyPlayerState,
} from "../lib/dailyPlayer";
import { submitDailyGuess } from "../lib/dailyPlayerApi";
import type { DailyGuessEntry, DailyHint, DailyTemperatureLabel } from "../types/dailyPlayer";
import { Card } from "./Layout";

const TEMPERATURE_STYLES: Record<
  DailyTemperatureLabel,
  { text: string; bg: string; border: string }
> = {
  cold: {
    text: "text-sky-300",
    bg: "bg-sky-500/15",
    border: "border-sky-400/35",
  },
  cool: {
    text: "text-cyan-300",
    bg: "bg-cyan-500/15",
    border: "border-cyan-400/35",
  },
  warm: {
    text: "text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-400/35",
  },
  hot: {
    text: "text-orange-300",
    bg: "bg-orange-500/15",
    border: "border-orange-400/35",
  },
  correct: {
    text: "text-[#f5c542]",
    bg: "bg-[#f5c542]/15",
    border: "border-[#f5c542]/45",
  },
};

const TEMPERATURE_LABELS: Record<DailyTemperatureLabel, string> = {
  cold: "Cold",
  cool: "Cool",
  warm: "Warm",
  hot: "Hot",
  correct: "Correct",
};

function hintSymbol(match: DailyHint["match"]): string {
  switch (match) {
    case "yes":
      return "✓";
    case "partial":
      return "~";
    case "higher":
      return "↑";
    case "lower":
      return "↓";
    default:
      return "✕";
  }
}

function GuessRow({ entry }: { entry: DailyGuessEntry }) {
  const style = TEMPERATURE_STYLES[entry.label];

  return (
    <li
      className={`rounded-xl border px-3 py-2.5 ${style.bg} ${style.border}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-spartan text-base font-medium text-white md:text-sm">
          {entry.guess}
        </span>
        <span
          className={`shrink-0 font-spartan text-sm font-semibold uppercase tracking-wide md:text-xs ${style.text}`}
        >
          {TEMPERATURE_LABELS[entry.label]}
        </span>
      </div>

      {entry.hints && entry.hints.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.hints.map((hint) => (
            <span
              key={`${entry.guess}-${hint.label}`}
              className="rounded-md border border-white/10 bg-black/20 px-2 py-0.5 font-spartan text-xs text-white/70 md:text-[11px]"
            >
              {hint.label} {hintSymbol(hint.match)}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

export function DailyPlayerGame() {
  const dateKey = getTodayKey();
  const [state, setState] = useState(() => loadDailyPlayerState(dateKey));
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (state.solved || isSubmitting) return;

    const trimmed = guess.trim();
    if (!trimmed) {
      setFeedback("Type a player name first.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await submitDailyGuess(trimmed, dateKey);
      const entry: DailyGuessEntry = {
        guess: trimmed,
        temperature: result.temperature,
        label: result.label,
        hints: result.hints,
      };

      const nextState = {
        dateKey,
        solved: result.correct,
        guesses: [entry, ...state.guesses],
        answer: result.answer,
      };

      setState(nextState);
      saveDailyPlayerState(nextState);
      setGuess("");
    } catch {
      setFeedback("Could not check that guess. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#f5c542] md:text-[11px]">
        Daily player
      </p>
      <p className="mt-1 font-spartan text-base text-white/55 md:text-sm">
        Name a footballer — each guess shows how hot or cold you are. One
        puzzle per day.
      </p>

      {state.solved && state.answer ? (
        <div className="mt-4 space-y-1">
          <p className="font-spartan text-base font-semibold text-[#f5c542]">
            Solved — {state.answer}
          </p>
          <p className="font-spartan text-sm text-white/40 md:text-xs">
            {state.guesses.length} guess{state.guesses.length === 1 ? "" : "es"}.
            New player tomorrow.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder="Guess a player..."
            className="field-input disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
            disabled={isSubmitting}
            aria-label="Guess the daily player"
          />

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#f5c542]/50 bg-[#f5c542]/15 px-4 py-2.5 font-spartan text-base font-semibold tracking-wide text-[#f5c542] transition hover:border-[#f5c542]/70 hover:bg-[#f5c542]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            {isSubmitting ? "Checking..." : "Guess"}
          </button>

          {feedback && (
            <p className="font-spartan text-base font-semibold text-red-400 md:text-sm">
              {feedback}
            </p>
          )}
        </div>
      )}

      {state.guesses.length > 0 && (
        <ul className="mt-4 space-y-2">
          {state.guesses.map((entry, index) => (
            <GuessRow key={`${entry.guess}-${index}`} entry={entry} />
          ))}
        </ul>
      )}
    </Card>
  );
}
