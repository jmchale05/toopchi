import type { Match } from "../types/match";
import { Card } from "./Layout";

export function LineupGrid({
  match,
  guessedA,
  guessedB,
}: {
  match: Match;
  guessedA: string[];
  guessedB: string[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TeamLineup
        teamName={match.teamA.name}
        lineup={match.lineupA}
        guessed={guessedA}
      />
      <TeamLineup
        teamName={match.teamB.name}
        lineup={match.lineupB}
        guessed={guessedB}
      />
    </div>
  );
}

function TeamLineup({
  teamName,
  lineup,
  guessed,
}: {
  teamName: string;
  lineup: string[];
  guessed: string[];
}) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/60 md:text-base">
        {teamName}
      </h3>
      <ul className="space-y-1.5 md:space-y-2">
        {lineup.map((player) => {
          const found = guessed.includes(player);
          return (
            <li
              key={player}
              className={`rounded-lg px-3 py-2 text-sm md:px-4 md:py-2.5 md:text-base ${
                found
                  ? "bg-[#f5c542]/15 font-semibold text-[#f5c542]"
                  : "bg-black/20 text-white/30"
              }`}
            >
              {found ? player : "???"}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-white/40 md:text-sm">
        {guessed.length}/11 found
      </p>
    </Card>
  );
}
