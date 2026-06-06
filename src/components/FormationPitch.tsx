import type { Match } from "../types/match";
import {
  resolveFormation,
  teamASlotPosition,
  teamBSlotPosition,
} from "../lib/formations";
import { PlayerHead, PlayerHeadLabel, resolveHeadImageUrl, resolveTeamSprite } from "./PlayerHead";

type SelectedSlot = { team: "A" | "B"; index: number };

type FormationPitchProps = {
  match: Match;
  slotA: Array<string | null>;
  slotB: Array<string | null>;
  selectedSlot?: SelectedSlot | null;
  onSelectSlot?: (team: "A" | "B", index: number) => void;
  revealLineups?: boolean;
  fullScreen?: boolean;
};

const SLOT_COUNT = 11;

export function FormationPitch({
  match,
  slotA,
  slotB,
  selectedSlot = null,
  onSelectSlot,
  revealLineups = false,
  fullScreen = false,
}: FormationPitchProps) {
  const interactive = Boolean(onSelectSlot);
  const formationA = resolveFormation(match.formationA);
  const formationB = resolveFormation(match.formationB);

  const shellClass = fullScreen
    ? "flex h-full min-h-0 flex-col bg-gradient-to-b from-[#1a5c34] via-[#1a4d2e] to-[#1a5c34]"
    : "overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#1a5c34] via-[#1a4d2e] to-[#1a5c34] shadow-inner";

  const pitchClass = fullScreen
    ? "relative min-h-0 flex-1 w-full"
    : "relative mx-auto aspect-[3/4] w-full max-w-md";

  return (
    <div className={shellClass}>
      {!fullScreen && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 md:text-sm">
          <span className="truncate">
            {match.teamB.name}{" "}
            <span className="text-white/40">{match.formationB ?? "4-2-3-1"}</span>
          </span>
          <span className="shrink-0 text-white/25">vs</span>
          <span className="truncate text-right">
            <span className="text-white/40">{match.formationA ?? "4-2-3-1"}</span>{" "}
            {match.teamA.name}
          </span>
        </div>
      )}

      <div className={pitchClass}>
        <PitchMarkings fullScreen={fullScreen} />

        {Array.from({ length: SLOT_COUNT }, (_, index) => {
          const aPos = teamASlotPosition(formationA[index]);
          const bPos = teamBSlotPosition(formationB[index]);
          const playerB = revealLineups ? match.lineupB[index] : slotB[index];
          const playerA = revealLineups ? match.lineupA[index] : slotA[index];

          return (
            <div key={`pair-${index}`}>
              <FormationNode
                team="B"
                index={index}
                x={bPos.x}
                y={bPos.y}
                playerName={playerB}
                imageUrl={resolveHeadImageUrl(match.playerImages, playerB)}
                sprite={resolveTeamSprite(match.teamB)}
                selected={
                  selectedSlot?.team === "B" && selectedSlot.index === index
                }
                interactive={interactive && !slotB[index] && !revealLineups}
                onSelect={onSelectSlot}
                fullScreen={fullScreen}
              />
              <FormationNode
                team="A"
                index={index}
                x={aPos.x}
                y={aPos.y}
                playerName={playerA}
                imageUrl={resolveHeadImageUrl(match.playerImages, playerA)}
                sprite={resolveTeamSprite(match.teamA)}
                selected={
                  selectedSlot?.team === "A" && selectedSlot.index === index
                }
                interactive={interactive && !slotA[index] && !revealLineups}
                onSelect={onSelectSlot}
                fullScreen={fullScreen}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PitchMarkings({ fullScreen }: { fullScreen: boolean }) {
  const inset = fullScreen ? "inset-2 md:inset-4" : "inset-3";
  return (
    <>
      <div className={`absolute ${inset} rounded-xl border border-white/25`} />
      <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 bg-white/25 md:left-4 md:right-4" />
      <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 md:h-24 md:w-24" />
      <div className="absolute bottom-2 left-1/2 h-14 w-28 -translate-x-1/2 rounded-t-lg border border-b-0 border-white/20 md:bottom-4 md:h-20 md:w-44" />
      <div className="absolute top-2 left-1/2 h-14 w-28 -translate-x-1/2 rounded-b-lg border border-t-0 border-white/20 md:top-4 md:h-20 md:w-44" />
    </>
  );
}

function FormationNode({
  team,
  index,
  x,
  y,
  playerName,
  imageUrl,
  sprite,
  selected,
  interactive,
  onSelect,
  fullScreen,
}: {
  team: "A" | "B";
  index: number;
  x: number;
  y: number;
  playerName: string | null;
  imageUrl?: string;
  sprite: { spriteUrl?: string };
  selected: boolean;
  interactive: boolean;
  onSelect?: (team: "A" | "B", index: number) => void;
  fullScreen: boolean;
}) {
  const filled = Boolean(playerName);
  const usesSprite = Boolean(sprite.spriteUrl);
  const widthClass = fullScreen ? "w-[4.5rem] md:w-[5.75rem]" : "w-[4.25rem] md:w-[5.25rem]";

  const content = (
    <>
      <PlayerHead
        name={playerName}
        imageUrl={imageUrl}
        spriteUrl={sprite.spriteUrl}
        size={fullScreen ? "md" : "sm"}
        empty={!filled}
        selected={selected}
        found={filled}
      />
      <PlayerHeadLabel
        name={playerName}
        showName={!imageUrl || usesSprite}
        found={filled}
      />
    </>
  );

  const className = usesSprite
    ? `absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center border-0 bg-transparent p-0 shadow-none transition ${widthClass} ${
        filled
          ? "z-10 scale-110"
          : selected
            ? "scale-105 drop-shadow-[0_0_10px_rgba(245,197,66,0.75)]"
            : interactive
              ? "hover:scale-105"
              : ""
      }`
    : `absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl border px-1 py-1.5 transition ${widthClass} ${
        filled
          ? "z-10 scale-105 border-[#f5c542] bg-[#f5c542]/20 shadow-[0_0_16px_rgba(245,197,66,0.45)]"
          : selected
            ? "border-[#f5c542] bg-[#f5c542]/15 shadow-[0_0_0_2px_rgba(245,197,66,0.35)]"
            : interactive
              ? "border-white/15 bg-black/20 hover:border-[#f5c542]/50 hover:bg-black/35"
              : "border-white/10 bg-black/15"
      }`;

  if (interactive && onSelect) {
    return (
      <button
        type="button"
        style={{ left: `${x}%`, top: `${y}%` }}
        className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]/70`}
        onClick={() => onSelect(team, index)}
      >
        {content}
      </button>
    );
  }

  return (
    <div style={{ left: `${x}%`, top: `${y}%` }} className={className}>
      {content}
    </div>
  );
}
