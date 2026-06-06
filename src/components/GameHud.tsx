import type { Match, Player } from "../types/match";
import { GameExitButton } from "./GameExitButton";

export function GameHud({
  match,
  players,
  activePlayer,
}: {
  match: Match;
  players: Player[];
  activePlayer: Player;
}) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="shrink-0 border-b border-white/10 bg-[#0a1628] pt-[env(safe-area-inset-top)]">
      <div className="relative px-3 pt-2.5 pb-2">
        <div className="absolute inset-y-0 right-3 z-10 flex items-center">
          <GameExitButton />
        </div>
        {/* Match label */}
        <div className="flex items-center justify-center gap-2 px-10 pb-1 text-[11px] font-semibold uppercase tracking-widest text-white/35">
          <span>{match.teamB.name}</span>
          <span className="text-white/20">vs</span>
          <span>{match.teamA.name}</span>
        </div>

        <div className="flex items-baseline justify-center">
          <span className="font-display text-2xl text-[#f5c542] md:text-3xl">
            {activePlayer.name}
          </span>
        </div>
      </div>

      {/* Scores row */}
      <div className="flex items-stretch divide-x divide-white/10 border-t border-white/10">
        {sorted.map((player) => {
          const isActive = player.name === activePlayer.name;
          return (
            <div
              key={player.name}
              className={`flex min-w-0 flex-1 flex-col items-center py-2 px-1 transition-colors ${
                isActive ? "bg-[#f5c542]/10" : ""
              }`}
            >
              <span
                className={`truncate text-[11px] font-semibold md:text-xs ${
                  isActive ? "text-[#f5c542]" : "text-white/50"
                }`}
              >
                {player.name}
              </span>
              <span
                className={`font-display text-xl tabular-nums leading-tight md:text-2xl ${
                  isActive ? "text-white" : "text-white/70"
                }`}
              >
                {player.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
