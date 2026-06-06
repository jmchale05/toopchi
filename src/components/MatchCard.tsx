import type { Match } from "../types/match";
import { formatMatchMeta, formatMatchScore, getMatchYear } from "../lib/formatMatchScore";
import { Card } from "./Layout";

export function MatchCard({ match }: { match: Match }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#f5c542]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#f5c542] md:text-sm">
          {match.competition} · {getMatchYear(match.date)}
        </span>
        <span className="text-xs text-white/50 md:text-sm">{match.date}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-right">
          <p className="text-sm text-white/60 md:text-base">{match.teamA.code}</p>
          <p className="text-lg font-semibold md:text-2xl">{match.teamA.name}</p>
        </div>
        <div className="rounded-2xl bg-black/30 px-4 py-2 font-spartan text-2xl font-semibold tabular-nums text-[#f5c542] md:px-6 md:py-3 md:text-4xl">
          {formatMatchScore(match.score)}
        </div>
        <div className="flex-1">
          <p className="text-sm text-white/60 md:text-base">{match.teamB.code}</p>
          <p className="text-lg font-semibold md:text-2xl">{match.teamB.name}</p>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-white/50 md:text-base">
        {formatMatchMeta(match)}
      </p>
    </Card>
  );
}
