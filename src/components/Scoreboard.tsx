import type { Player } from "../types/match";
import { Card } from "./Layout";

export function Scoreboard({ players }: { players: Player[] }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/60 md:text-base">
        Scoreboard
      </h3>
      <ul className="space-y-2 md:space-y-3">
        {sorted.map((player) => (
          <li
            key={player.name}
            className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 md:px-4 md:py-3"
          >
            <span className="font-semibold md:text-lg">{player.name}</span>
            <span className="font-spartan text-xl font-semibold tabular-nums text-[#f5c542] md:text-3xl">{player.score}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
