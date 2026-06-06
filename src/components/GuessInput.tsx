import { useMemo, useState } from "react";
import type { Match } from "../types/match";
import { getSquadSuggestions } from "../lib/nameMatch";
import { Card, GhostButton } from "./Layout";

export function GuessInput({
  match,
  selectedTeam,
  onTeamChange,
  onSubmit,
  error,
}: {
  match: Match;
  selectedTeam: "A" | "B";
  onTeamChange: (team: "A" | "B") => void;
  onSubmit: (team: "A" | "B", guess: string) => void;
  error: string | null;
}) {
  const [guess, setGuess] = useState("");
  const suggestions = useMemo(
    () => getSquadSuggestions(match, guess),
    [match, guess],
  );

  function handleSubmit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onSubmit(selectedTeam, trimmed);
    setGuess("");
  }

  return (
    <Card>
      <p className="mb-3 text-sm font-bold uppercase tracking-wider text-white/60 md:text-base">
        Your guess
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2 md:gap-3">
        <TeamButton
          label={match.teamA.name}
          active={selectedTeam === "A"}
          onClick={() => onTeamChange("A")}
        />
        <TeamButton
          label={match.teamB.name}
          active={selectedTeam === "B"}
          onClick={() => onTeamChange("B")}
        />
      </div>

      <input
        value={guess}
        onChange={(event) => setGuess(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit(guess);
          }
        }}
        placeholder="Type a player name..."
        className="field-input"
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-white/10">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => handleSubmit(name)}
                className="w-full px-4 py-2 text-left text-sm transition hover:bg-white/10 md:px-5 md:py-3 md:text-base"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-3 text-sm font-semibold text-red-400 md:text-base">{error}</p>}

      <GhostButton className="mt-4 font-bold text-white" onClick={() => handleSubmit(guess)}>
        Submit guess
      </GhostButton>
    </Card>
  );
}

function TeamButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "btn-team-active" : "btn-team-idle"}
    >
      {label}
    </button>
  );
}
