import { useState } from "react";
import { getNationFlagUrl } from "../lib/nationFlags";

export function NationFlag({
  nation,
  size = 20,
  className = "",
}: {
  nation: string;
  size?: number;
  className?: string;
}) {
  const src = getNationFlagUrl(nation, size);
  const [hasImageError, setHasImageError] = useState(false);

  if (!src || hasImageError) {
    return (
      <span
        className={`font-spartan text-xs font-medium text-white/55 ${className}`}
        title={nation}
      >
        {nation}
      </span>
    );
  }

  const height = Math.round(size * 0.75);

  return (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden
        title={nation}
        width={size}
        height={height}
        loading="lazy"
        decoding="async"
        onError={() => setHasImageError(true)}
        className="nation-flag-pixel rounded-[2px] border border-white/10 bg-white/5 object-cover shadow-sm"
      />
      <span className="sr-only">{nation}</span>
    </span>
  );
}
