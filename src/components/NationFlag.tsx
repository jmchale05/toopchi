import { memo, useEffect, useState } from "react";
import { getNationFlagUrl, preloadNationFlag } from "../lib/nationFlags";

export const NationFlag = memo(function NationFlag({
  nation,
  size = 20,
  className = "",
  compact = false,
}: {
  nation: string;
  size?: number;
  className?: string;
  /** Hide text fallback — for tight rows like search dropdowns. */
  compact?: boolean;
}) {
  const src = getNationFlagUrl(nation, size);
  const [hasImageError, setHasImageError] = useState(false);
  const height = Math.round(size * 0.75);

  useEffect(() => {
    if (!src) return;
    preloadNationFlag(nation);
  }, [nation, src]);

  if (!src || hasImageError) {
    if (compact) {
      return (
        <span
          className={`inline-block shrink-0 rounded-[2px] border border-white/10 bg-white/5 ${className}`}
          style={{ width: size, height }}
          title={nation}
          aria-hidden
        />
      );
    }

    return (
      <span
        className={`font-spartan text-xs font-medium text-white/55 ${className}`}
        title={nation}
      >
        {nation}
      </span>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden
        title={nation}
        width={size}
        height={height}
        loading={compact ? "eager" : "lazy"}
        decoding="async"
        onError={() => setHasImageError(true)}
        className="nation-flag-pixel rounded-[2px] border border-white/10 bg-white/5 object-cover shadow-sm"
      />
      <span className="sr-only">{nation}</span>
    </span>
  );
});
