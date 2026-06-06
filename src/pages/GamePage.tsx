import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FormationPitch } from "../components/FormationPitch";
import { GameHud } from "../components/GameHud";
import { SkipTurnButton } from "../components/SkipTurnButton";
import {
  DesktopGameSidebar,
  SlotGuessPanel,
} from "../components/SlotGuessPanel";
import { useSession } from "../context/SessionContext";
import {
  applyCorrectGuess,
  applyWrongGuess,
  POINTS_PER_GUESS,
} from "../lib/gameRules";
import { playerLastName } from "../lib/playerImages";
import { resolvePlayerName } from "../lib/nameMatch";
import { isLineupSession } from "../types/session";

type SelectedSlot = { team: "A" | "B"; index: number };

export function GamePage() {
  const { session, updateSession } = useSession();
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correctFlash, setCorrectFlash] = useState<string | null>(null);

  useEffect(() => {
    if (session?.phase === "finished") return;
    setError(null);
    setSelectedSlot(null);
  }, [session?.activePlayerIndex, session?.phase]);

  useEffect(() => {
    if (!correctFlash) return;
    const id = window.setTimeout(() => setCorrectFlash(null), 2200);
    return () => window.clearTimeout(id);
  }, [correctFlash]);

  if (!session) return <Navigate to="/setup" replace />;
  if (!isLineupSession(session)) return <Navigate to="/tenable/game" replace />;
  if (session.phase === "finished") return <Navigate to="/results" replace />;

  const lineupSession = session;
  const activePlayer = lineupSession.players[lineupSession.activePlayerIndex];
  const slotA = lineupSession.slotA ?? Array.from({ length: 11 }, () => null);
  const slotB = lineupSession.slotB ?? Array.from({ length: 11 }, () => null);
  function handleSelectSlot(team: "A" | "B", index: number) {
    if (team === "A" ? slotA[index] : slotB[index]) return;
    setError(null);
    setSelectedSlot({ team, index });
  }

  function handleGuess(guess: string) {
    if (!selectedSlot) return;
    const { team, index } = selectedSlot;
    const alreadyGuessed =
      team === "A" ? lineupSession.guessedA : lineupSession.guessedB;
    const result = resolvePlayerName(lineupSession.match, team, guess, alreadyGuessed);

    if (!result.ok) {
      const messages = {
        empty: "Type a player name first.",
        unknown: "Not in that starting XI.",
        duplicate: "Already found!",
        ambiguous: "Be more specific — use full name.",
      };
      setError(messages[result.reason]);
      if (result.reason === "unknown" || result.reason === "ambiguous") {
        updateSession((s) => isLineupSession(s) ? applyWrongGuess(s, team, guess) : s);
        setSelectedSlot(null);
      }
      return;
    }

    setError(null);
    setSelectedSlot(null);
    setCorrectFlash(result.canonical);
    updateSession((s) =>
      isLineupSession(s)
        ? applyCorrectGuess(s, team, result.canonical, guess, index)
        : s,
    );
  }

  function handleSkipTurn() {
    setError(null);
    setSelectedSlot(null);
    updateSession((s) => isLineupSession(s) ? applyWrongGuess(s, "A", "") : s);
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-navy-dark md:flex-row">

      {/* ── Mobile HUD (hidden on desktop) ─────────────────────── */}
      <div className="shrink-0 md:hidden">
        <GameHud
          match={lineupSession.match}
          players={lineupSession.players}
          activePlayer={activePlayer}
        />
      </div>

      {/* ── Pitch area ─────────────────────────────────────────── */}
      <div
        className={`relative min-h-0 flex-1 md:flex md:items-center md:justify-center md:bg-navy-dark md:p-6 lg:p-10 ${
          !selectedSlot ? "pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-6 lg:pb-10" : ""
        }`}
      >
        {/* On desktop: constrain pitch to portrait aspect ratio */}
        <div className="h-full w-full md:h-full md:max-h-full md:max-w-lg md:overflow-hidden md:rounded-3xl md:border md:border-white/15 md:shadow-[0_0_60px_rgba(0,0,0,0.5)] lg:max-w-xl">
          <FormationPitch
            match={lineupSession.match}
            slotA={slotA}
            slotB={slotB}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            fullScreen
          />
        </div>

        {/* Correct flash */}
        {correctFlash && (
          <div className="pointer-events-none absolute inset-x-0 top-[4.5rem] z-30 flex justify-center px-4 md:top-6">
            <div className="correct-flash rounded-2xl border border-[#ffe082]/60 bg-[#0a1628]/95 px-6 py-4 text-center shadow-[0_12px_40px_rgba(245,197,66,0.4)] backdrop-blur-sm">
              <p className="font-display text-sm uppercase tracking-[0.2em] text-[#f5c542]">
                Correct
              </p>
              <p className="mt-1 font-display text-3xl text-white md:text-4xl">
                {playerLastName(correctFlash)}
              </p>
              <p className="mt-1 font-spartan text-lg font-semibold text-[#f5c542]">
                +{POINTS_PER_GUESS}
              </p>
            </div>
          </div>
        )}

        {/* Skip bar — mobile only */}
        {!selectedSlot && (
          <div className="game-skip-bar md:hidden">
            <SkipTurnButton onClick={handleSkipTurn} />
          </div>
        )}
      </div>

      {/* ── Desktop sidebar (hidden on mobile) ─────────────────── */}
      <div className="hidden md:flex">
        <DesktopGameSidebar
          match={lineupSession.match}
          players={lineupSession.players}
          activePlayer={activePlayer}
          selectedSlot={selectedSlot}
          error={error}
          onSubmit={handleGuess}
          onDeselect={() => { setError(null); setSelectedSlot(null); }}
          onSkip={handleSkipTurn}
        />
      </div>

      {/* ── Mobile bottom sheet ─────────────────────────────────── */}
      {selectedSlot && (
        <>
          <button
            type="button"
            aria-label="Close guess panel"
            className="bottom-sheet-backdrop fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => { setError(null); setSelectedSlot(null); }}
          />
          <div
            key={`${selectedSlot.team}-${selectedSlot.index}`}
            className="bottom-sheet fixed inset-x-0 bottom-0 z-50 md:hidden"
          >
            <SlotGuessPanel
              match={lineupSession.match}
              selectedSlot={selectedSlot}
              onSubmit={handleGuess}
              onCancel={() => { setError(null); setSelectedSlot(null); }}
              error={error}
            />
          </div>
        </>
      )}
    </div>
  );
}
