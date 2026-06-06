import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  TenableDesktopSidebar,
  TenableMobileSearchBar,
} from "../components/modes/tenable/TenableGuessPanel";
import { TenableHud } from "../components/modes/tenable/TenableHud";
import {
  NationRevealDialog,
  TopTenBoard,
} from "../components/modes/tenable/TopTenBoard";
import { useSession } from "../context/SessionContext";
import {
  applyTenableCorrectGuess,
  applyTenableWrongGuess,
  NATION_REVEAL_COST,
  POINTS_PER_TENABLE_GUESS,
  tryApplyNationReveal,
} from "../lib/modes/tenable/gameRules";
import { resolveTenableGuess } from "../lib/modes/tenable/nameMatch";
import {
  CORRECT_FLASH_MS,
  delay,
  FAIL_FLASH_MS,
  runRankReveal,
  scrollBoardIntoView,
} from "../lib/modes/tenable/revealSequence";
import { playerLastName } from "../lib/playerImages";
import type { ScoreAnimation } from "../components/AnimatedPlayerScore";
import { isTenableSession } from "../types/session";

export function TenableGamePage() {
  const { session, updateSession } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [revealRank, setRevealRank] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [failFlash, setFailFlash] = useState(false);
  const [correctFlash, setCorrectFlash] = useState<{
    name: string;
    rank: number;
  } | null>(null);
  const [scoreAnimation, setScoreAnimation] = useState<ScoreAnimation | null>(null);
  const [pendingNationReveal, setPendingNationReveal] = useState<{
    rank: number;
    payerIndex: number;
  } | null>(null);
  const scoreAnimationId = useRef(0);
  const revealSignal = useRef({ cancelled: false });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const nationDialogOpen = pendingNationReveal !== null;

  async function prepareBoardForReveal(): Promise<void> {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    await delay(150);
    if (revealSignal.current.cancelled) return;
    await scrollBoardIntoView(scrollContainerRef.current, boardRef.current);
    if (revealSignal.current.cancelled) return;
  }

  function triggerScoreAnimation(
    playerIndex: number,
    type: ScoreAnimation["type"],
    amount: number,
    fromScore: number,
    toScore: number,
  ) {
    scoreAnimationId.current += 1;
    setScoreAnimation({
      id: scoreAnimationId.current,
      playerIndex,
      type,
      amount,
      fromScore,
      toScore,
    });
  }

  useEffect(() => {
    if (isRevealing) return;
    revealSignal.current.cancelled = true;
    revealSignal.current = { cancelled: false };
    setRevealRank(null);
    setFailFlash(false);
    setCorrectFlash(null);
    setError(null);
  }, [session?.activePlayerIndex, session?.phase, isRevealing]);

  useEffect(() => {
    return () => {
      revealSignal.current.cancelled = true;
    };
  }, []);

  if (!session) return <Navigate to="/tenable/setup" replace />;
  if (!isTenableSession(session)) return <Navigate to="/game" replace />;
  if (session.phase === "finished") return <Navigate to="/tenable/results" replace />;

  const tenableSession = session;
  const activePlayer = tenableSession.players[tenableSession.activePlayerIndex];
  const alreadyFound = tenableSession.slots.filter(Boolean) as string[];
  const foundCount = alreadyFound.length;

  async function playFailReveal(guess: string) {
    setError(null);
    setIsRevealing(true);
    await prepareBoardForReveal();
    if (revealSignal.current.cancelled) return;
    await runRankReveal(10, setRevealRank, revealSignal.current);
    if (revealSignal.current.cancelled) return;

    setRevealRank(null);
    setFailFlash(true);
    await delay(FAIL_FLASH_MS);
    if (revealSignal.current.cancelled) return;

    setFailFlash(false);
    updateSession((s) =>
      isTenableSession(s) ? applyTenableWrongGuess(s, guess) : s,
    );
    setIsRevealing(false);
  }

  async function playSuccessReveal(
    guess: string,
    answer: string,
    rank: number,
    scorerIndex: number,
  ) {
    setError(null);
    setIsRevealing(true);
    await prepareBoardForReveal();
    if (revealSignal.current.cancelled) return;
    await runRankReveal(rank, setRevealRank, revealSignal.current);
    if (revealSignal.current.cancelled) return;

    setRevealRank(null);
    setCorrectFlash({ name: answer, rank });
    await delay(CORRECT_FLASH_MS);
    if (revealSignal.current.cancelled) return;

    setCorrectFlash(null);
    updateSession((s) =>
      isTenableSession(s)
        ? applyTenableCorrectGuess(s, answer, guess, rank)
        : s,
    );
    const scorer = tenableSession.players[scorerIndex];
    if (scorer) {
      triggerScoreAnimation(
        scorerIndex,
        "gain",
        POINTS_PER_TENABLE_GUESS,
        scorer.score,
        scorer.score + POINTS_PER_TENABLE_GUESS,
      );
    }
    setIsRevealing(false);
  }

  function handleGuess(guess: string) {
    if (isRevealing) return;

    const result = resolveTenableGuess(tenableSession.list, guess, alreadyFound);

    if (!result.ok) {
      const messages = {
        empty: "Type a name first.",
        unknown: "Not on this list.",
        duplicate: "Already found!",
        ambiguous: "Be more specific — use full name.",
      };

      if (result.reason === "unknown" || result.reason === "ambiguous") {
        void playFailReveal(guess);
        return;
      }

      setError(messages[result.reason]);
      return;
    }

    void playSuccessReveal(
      guess,
      result.answer,
      result.rank,
      tenableSession.activePlayerIndex,
    );
  }

  function handleNationHintRequest(rank: number) {
    if (isRevealing || nationDialogOpen) return;
    setPendingNationReveal({
      rank,
      payerIndex: tenableSession.activePlayerIndex,
    });
  }

  function handleNationHintConfirm() {
    if (!pendingNationReveal || isRevealing) return;

    const { rank, payerIndex } = pendingNationReveal;
    const result = tryApplyNationReveal(tenableSession, rank, payerIndex);

    updateSession((s) => {
      if (!isTenableSession(s)) return s;
      return s === tenableSession
        ? result.session
        : tryApplyNationReveal(s, rank, payerIndex).session;
    });

    if (result.applied && result.payerIndex !== null) {
      triggerScoreAnimation(
        result.payerIndex,
        "drain",
        NATION_REVEAL_COST,
        result.fromScore ?? 0,
        result.toScore ?? 0,
      );
    }

    setPendingNationReveal(null);
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-navy-dark md:flex-row">
      <div className="shrink-0 md:hidden">
        <TenableHud
          list={tenableSession.list}
          players={tenableSession.players}
          activePlayer={activePlayer}
          activePlayerIndex={tenableSession.activePlayerIndex}
          scoreAnimation={scoreAnimation}
        />
      </div>

      <div
        ref={scrollContainerRef}
        className="relative min-h-0 flex-1 overflow-y-auto"
      >
        <div
          ref={boardRef}
          className="py-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:py-8 md:pb-8 md:flex md:min-h-full md:items-center md:justify-center"
        >
          <TopTenBoard
            list={tenableSession.list}
            slots={tenableSession.slots}
            revealedNations={
              tenableSession.revealedNations ?? Array.from({ length: 10 }, () => false)
            }
            highlightRank={revealRank}
            disabled={isRevealing || nationDialogOpen}
            activePlayerScore={activePlayer.score}
            onRequestReveal={handleNationHintRequest}
          />
        </div>

      </div>

      {correctFlash && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6 backdrop-blur-[2px]">
          <div className="correct-flash-popup flex flex-col items-center text-center">
            <p className="font-display text-5xl uppercase leading-none text-[#f5c542] drop-shadow-[0_0_40px_rgba(245,197,66,0.55)] md:text-7xl">
              Correct!
            </p>
            <p className="mt-3 font-spartan text-4xl font-semibold text-white md:text-5xl">
              +{POINTS_PER_TENABLE_GUESS}
            </p>
            <p className="mt-4 font-spartan text-base text-white/60 md:text-lg">
              {playerLastName(correctFlash.name)} · #{correctFlash.rank}
            </p>
          </div>
        </div>
      )}

      {failFlash && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6 backdrop-blur-[2px]">
          <div className="fail-flash flex flex-col items-center text-center">
            <span
              className="font-display text-[7rem] leading-none text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.55)] md:text-[9rem]"
              aria-hidden
            >
              ✕
            </span>
            <p className="mt-2 font-spartan text-2xl font-semibold uppercase tracking-wide text-red-400 md:text-3xl">
              Wrong
            </p>
          </div>
        </div>
      )}

      {pendingNationReveal && (
        <NationRevealDialog
          rank={pendingNationReveal.rank}
          onConfirm={handleNationHintConfirm}
          onCancel={() => setPendingNationReveal(null)}
        />
      )}

      <TenableMobileSearchBar
        list={tenableSession.list}
        onSubmit={handleGuess}
        error={error}
        disabled={isRevealing || nationDialogOpen}
      />

      <div className="hidden md:flex">
        <TenableDesktopSidebar
          list={tenableSession.list}
          players={tenableSession.players}
          activePlayer={activePlayer}
          activePlayerIndex={tenableSession.activePlayerIndex}
          foundCount={foundCount}
          error={error}
          onSubmit={handleGuess}
          disabled={isRevealing || nationDialogOpen}
          scoreAnimation={scoreAnimation}
        />
      </div>
    </div>
  );
}
