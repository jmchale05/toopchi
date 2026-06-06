import { useEffect, useRef, useState } from "react";
import type { Match } from "../types/match";
import { formatMatchMeta, formatMatchScore } from "../lib/formatMatchScore";

type MatchSelectProps = {
  matches: Match[];
  value: string;
  onChange: (matchId: string) => void;
  showRandom?: boolean;
};

function MatchOptionContent({ match }: { match: Match | null }) {
  if (!match) {
    return (
      <>
        <span className="block text-base font-semibold text-white md:text-lg">Random match</span>
        <span className="mt-1 block text-sm leading-snug text-white/55 md:text-base">
          Surprise me with any iconic game
        </span>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm font-semibold text-white md:text-base">
        <span className="truncate text-left">{match.teamA.name}</span>
        <span className="shrink-0 rounded-md bg-[#f5c542]/15 px-2 py-0.5 font-spartan text-base font-semibold tabular-nums text-[#f5c542] md:text-lg">
          {formatMatchScore(match.score)}
        </span>
        <span className="truncate text-right">{match.teamB.name}</span>
      </div>
      <span className="mt-1 block text-sm leading-snug text-white/55 md:text-base">
        {formatMatchMeta(match)}
      </span>
    </>
  );
}

export function MatchSelect({
  matches,
  value,
  onChange,
  showRandom = true,
}: MatchSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected =
    value === "random"
      ? null
      : matches.find((match) => match.id === value) ?? null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function choose(matchId: string) {
    onChange(matchId);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="field-select flex w-full items-start justify-between gap-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <MatchOptionContent match={selected} />
        </span>
        <span
          className={`mt-1 shrink-0 text-[#f5c542] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-white/15 bg-[#0a1628] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
          {showRandom && (
            <li role="option" aria-selected={value === "random"}>
              <button
                type="button"
                onClick={() => choose("random")}
                className={`match-option ${value === "random" ? "match-option-active" : ""}`}
              >
                <MatchOptionContent match={null} />
              </button>
            </li>
          )}
          {matches.map((match) => (
            <li key={match.id} role="option" aria-selected={value === match.id}>
              <button
                type="button"
                onClick={() => choose(match.id)}
                className={`match-option ${value === match.id ? "match-option-active" : ""}`}
              >
                <MatchOptionContent match={match} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
