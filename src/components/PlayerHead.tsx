import {
  getPlayerImageUrl,
  playerInitials,
  playerLastName,
} from "../lib/playerImages";

function PlayerProfileImage({
  src,
  size,
  alt,
  selected = false,
  found = false,
}: {
  src: string;
  size: "sm" | "md";
  alt: string;
  selected?: boolean;
  found?: boolean;
}) {
  const dim =
    size === "md" ? "h-11 w-11 md:h-14 md:w-14" : "h-9 w-9 md:h-11 md:w-11";

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`${dim} rounded-full border-2 object-cover object-top ${
        found
          ? "border-[#f5c542] shadow-[0_0_12px_rgba(245,197,66,0.85)]"
          : selected
            ? "border-[#f5c542]/70 shadow-[0_0_8px_rgba(245,197,66,0.5)]"
            : "border-white/25"
      } ${selected || found ? "brightness-110" : ""}`}
    />
  );
}

export function PlayerHead({
  name,
  imageUrl,
  spriteUrl,
  size = "md",
  empty = false,
  selected = false,
  found = false,
}: {
  name: string | null;
  imageUrl?: string;
  spriteUrl?: string;
  size?: "sm" | "md";
  empty?: boolean;
  selected?: boolean;
  found?: boolean;
}) {
  const dim =
    size === "md" ? "h-10 w-10 md:h-14 md:w-14" : "h-8 w-8 md:h-10 md:w-10";
  const textSize =
    size === "md" ? "text-xs md:text-sm" : "text-[10px] md:text-xs";

  if (spriteUrl) {
    return (
      <PlayerProfileImage
        src={spriteUrl}
        size={size}
        alt={name ?? "Player"}
        selected={selected}
        found={found}
      />
    );
  }

  if (empty || !name) {
    return (
      <div
        className={`${dim} flex items-center justify-center rounded-full border-2 border-dashed border-white/25 bg-black/30 ${textSize} font-bold text-white/35`}
      >
        ?
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${dim} rounded-full border-2 bg-black/40 object-cover object-top ${
          found
            ? "border-[#f5c542] shadow-[0_0_12px_rgba(245,197,66,0.8)]"
            : "border-white/30"
        }`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex items-center justify-center rounded-full border-2 ${textSize} font-bold ${
        found
          ? "border-[#f5c542] bg-[#f5c542]/20 text-[#f5c542] shadow-[0_0_12px_rgba(245,197,66,0.5)]"
          : "border-white/25 bg-gradient-to-b from-[#2a3f5f] to-[#1a2840] text-white/90"
      }`}
      title={name}
    >
      {playerInitials(name)}
    </div>
  );
}

export function PlayerHeadLabel({
  name,
  showName = true,
  found = false,
}: {
  name: string | null;
  showName?: boolean;
  found?: boolean;
}) {
  if (!showName || !name) {
    return null;
  }

  const label = playerLastName(name);

  if (found) {
    return (
      <span className="mt-1 flex max-w-[6.5rem] items-center justify-center gap-1 rounded-full border border-[#ffe082]/70 bg-[#f5c542] px-2.5 py-1 text-center text-[11px] font-bold leading-none text-[#0a1628] shadow-[0_2px_10px_rgba(245,197,66,0.55)] md:max-w-[7.5rem] md:text-xs">
        <span aria-hidden="true">✓</span>
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <span className="mt-1 max-w-[4.5rem] truncate text-center text-[10px] font-semibold leading-tight text-white/55 md:max-w-[5.5rem] md:text-xs">
      {label}
    </span>
  );
}

export function resolveHeadImageUrl(
  playerImages: Record<string, string> | undefined,
  playerName: string | null,
): string | undefined {
  if (!playerName) {
    return undefined;
  }
  return getPlayerImageUrl(playerImages, playerName);
}

export function resolveTeamSprite(team: {
  playerSprite?: string;
}): { spriteUrl?: string } {
  return {
    spriteUrl: team.playerSprite,
  };
}
