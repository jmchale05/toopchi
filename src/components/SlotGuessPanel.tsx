import { useEffect, useMemo, useState } from "react";
import type { Match, Player } from "../types/match";
import { resolveFormation, slotLabel } from "../lib/formations";
import { getSquadSuggestions } from "../lib/nameMatch";
import { GameExitButton } from "./GameExitButton";
import { GhostButton, PrimaryButton } from "./Layout";

type SelectedSlot = { team: "A" | "B"; index: number };

// ── Shared guess form ────────────────────────────────────────────────────────

export function GuessForm({
  match,
  selectedSlot,
  onSubmit,
  error,
}: {
  match: Match;
  selectedSlot: SelectedSlot;
  onSubmit: (guess: string) => void;
  error: string | null;
}) {
  const [guess, setGuess] = useState("");
  const teamName =
    selectedSlot.team === "A" ? match.teamA.name : match.teamB.name;
  const formation =
    selectedSlot.team === "A"
      ? resolveFormation(match.formationA)
      : resolveFormation(match.formationB);
  const positionLabel = slotLabel(formation, selectedSlot.index);

  useEffect(() => {
    setGuess("");
  }, [selectedSlot.team, selectedSlot.index]);

  const suggestions = useMemo(
    () => getSquadSuggestions(match, guess),
    [match, guess],
  );

  function submit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setGuess("");
  }

  return (
    <div>
      <p className="text-sm text-white/60 md:text-base">
        Guess <span className="font-semibold text-white">{teamName}</span>{" — "}
        <span className="text-[#f5c542]">{positionLabel}</span>
      </p>

      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); submit(guess); }
        }}
        placeholder="Type player name..."
        className="field-input mt-3"
        autoComplete="off"
        autoFocus
      />

      {suggestions.length > 0 && (
        <ul className="mt-3 overflow-hidden rounded-xl border border-white/10 divide-y divide-white/10">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => submit(name)}
                className="w-full px-4 py-3 text-left text-sm transition hover:bg-white/10 md:py-3.5 md:text-base"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-400 md:text-base">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <PrimaryButton onClick={() => submit(guess)}>Submit</PrimaryButton>
      </div>
    </div>
  );
}

// ── Mobile bottom sheet ──────────────────────────────────────────────────────

export function SlotGuessPanel({
  match,
  selectedSlot,
  onSubmit,
  onCancel,
  error,
}: {
  match: Match;
  selectedSlot: SelectedSlot;
  onSubmit: (guess: string) => void;
  onCancel: () => void;
  error: string | null;
}) {
  return (
    <div className="pointer-events-auto max-h-[50dvh] overflow-y-auto rounded-t-3xl border-t border-white/15 bg-[#0a1628]/95 px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
      <GuessForm
        match={match}
        selectedSlot={selectedSlot}
        onSubmit={onSubmit}
        error={error}
      />
      <div className="mt-3 pb-1">
        <GhostButton className="font-semibold text-white/60" onClick={onCancel}>
          Back to pitch
        </GhostButton>
      </div>
    </div>
  );
}

// ── Desktop sidebar ──────────────────────────────────────────────────────────

export function DesktopGameSidebar({
  match,
  players,
  activePlayer,
  selectedSlot,
  error,
  onSubmit,
  onDeselect,
  onSkip,
}: {
  match: Match;
  players: Player[];
  activePlayer: Player;
  selectedSlot: SelectedSlot | null;
  error: string | null;
  onSubmit: (guess: string) => void;
  onDeselect: () => void;
  onSkip: () => void;
}) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  // key forces GuessForm to remount (and autofocus) when slot changes
  const formKey = selectedSlot
    ? `${selectedSlot.team}-${selectedSlot.index}`
    : "none";

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-white/10 bg-[#0a1628] lg:w-96">
      {/* Match + turn */}
      <div className="relative border-b border-white/10 px-6 py-5 pr-14">
        <div className="absolute inset-y-0 right-4 z-10 flex items-center">
          <GameExitButton />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/35">
          {match.teamB.name} vs {match.teamA.name}
        </p>
        <div className="mt-1.5">
          <span className="font-display text-3xl text-[#f5c542] lg:text-4xl">
            {activePlayer.name}
          </span>
        </div>
      </div>

      {/* Scores */}
      <div className="flex divide-x divide-white/10 border-b border-white/10">
        {sorted.map((player) => {
          const isActive = player.name === activePlayer.name;
          return (
            <div
              key={player.name}
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
              <span
                className={`font-display text-2xl tabular-nums leading-tight lg:text-3xl ${
                  isActive ? "text-white" : "text-white/70"
                }`}
              >
                {player.score}
              </span>
            </div>
          );
        })}
      </div>

      {/* Guess area */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedSlot ? (
          <div key={formKey}>
            <GuessForm
              match={match}
              selectedSlot={selectedSlot}
              onSubmit={onSubmit}
              error={error}
            />
            <div className="mt-3">
              <GhostButton
                className="font-semibold text-white/60"
                onClick={onDeselect}
              >
                Back to pitch
              </GhostButton>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-white/40 md:text-base">
            Tap a player on the pitch to guess.
          </p>
        )}
      </div>

      {/* Skip */}
      <div className="border-t border-white/10 p-4">
        <button type="button" className="btn-skip" onClick={onSkip}>
          Skip turn
        </button>
      </div>
    </div>
  );
}
