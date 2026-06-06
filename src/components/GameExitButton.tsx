import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { finishGame } from "../lib/gameRules";
import { finishTenableSession } from "../lib/modes/tenable/gameRules";
import { isLineupSession, isTenableSession } from "../types/session";
import { GhostButton } from "./Layout";

function LogOutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function GameExitButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const { session, clearSession, updateSession } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!confirmOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setConfirmOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen]);

  const exitMessage =
    session && isTenableSession(session)
      ? "You'll go to results and see the answers you missed."
      : session && isLineupSession(session)
        ? "You'll go to results and see the lineups you missed."
        : "Your progress will be lost.";

  function handleConfirmExit() {
    if (!session) {
      clearSession();
      navigate("/");
      setConfirmOpen(false);
      return;
    }

    if (isTenableSession(session)) {
      updateSession((current) =>
        isTenableSession(current) ? finishTenableSession(current) : current,
      );
      navigate("/tenable/results");
    } else if (isLineupSession(session)) {
      updateSession((current) =>
        isLineupSession(current) ? finishGame(current) : current,
      );
      navigate("/results");
    } else {
      clearSession();
      navigate("/");
    }
    setConfirmOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label="Exit game"
        className={`flex h-9 w-9 shrink-0 items-center justify-center p-0 text-red-500 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 active:scale-95 ${className}`.trim()}
      >
        <LogOutIcon />
      </button>

      {confirmOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <button
              type="button"
              aria-label="Close dialog"
              className="dialog-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-game-title"
              className="dialog-panel relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            >
              <h2
                id="exit-game-title"
                className="font-display text-xl text-white md:text-2xl"
              >
                Exit game?
              </h2>
              <p className="mt-2 font-spartan text-sm text-white/60 md:text-base">
                {exitMessage}
              </p>
              <div className="mt-6 flex gap-3">
                <GhostButton
                  className="flex-1"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </GhostButton>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-red-500/50 bg-red-500/15 px-4 py-2 font-spartan text-sm font-semibold tracking-wide text-red-400 transition hover:border-red-400/60 hover:bg-red-500/25 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 active:scale-[0.98] md:text-base"
                >
                  Exit game
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
