import type { Player } from "../../../types/match";
import type { TenableList } from "../../../types/tenable";
import {
  AnimatedPlayerScore,
  type ScoreAnimation,
} from "../../AnimatedPlayerScore";
import { GameExitButton } from "../../GameExitButton";

export function TenableHud({
  list,
  players,
  activePlayer,
  activePlayerIndex,
  scoreAnimation = null,
}: {
  list: TenableList;
  players: Player[];
  activePlayer: Player;
  activePlayerIndex: number;
  scoreAnimation?: ScoreAnimation | null;
}) {
  const playerScores = players.map((player, index) => ({ player, index }));

  return (
    <div className="shrink-0 border-b border-white/10 bg-[#0a1628] pt-[env(safe-area-inset-top)]">
      <div className="relative px-3 pt-2.5 pb-2">
        <div className="absolute inset-y-0 right-3 z-10 flex items-center">
          <GameExitButton />
        </div>
        <div className="px-10 pb-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/35 md:text-[11px]">
            {list.title}
          </p>
          {list.subtitle && (
            <p className="mt-0.5 text-xs font-medium normal-case tracking-wide text-white/30 md:text-[10px]">
              {list.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-baseline justify-center">
          <span className="font-display text-3xl text-[#f5c542] md:text-3xl">
            {activePlayer.name}
          </span>
        </div>
      </div>

      <div className="flex items-stretch divide-x divide-white/10 border-t border-white/10">
        {playerScores.map(({ player, index }) => {
          const isActive = index === activePlayerIndex;
          return (
            <div
              key={`player-${index}`}
              className={`flex min-w-0 flex-1 flex-col items-center py-2 px-1 ${
                isActive ? "bg-[#f5c542]/10" : ""
              }`}
            >
              <span
                className={`truncate text-sm font-semibold md:text-xs ${
                  isActive ? "text-[#f5c542]" : "text-white/50"
                }`}
              >
                {player.name}
              </span>
              <AnimatedPlayerScore
                playerIndex={index}
                score={player.score}
                animation={scoreAnimation}
                className={`font-display text-2xl leading-tight md:text-2xl ${
                  isActive ? "text-white" : "text-white/70"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
