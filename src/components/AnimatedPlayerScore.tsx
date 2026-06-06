import { useEffect, useRef, useState } from "react";

export type ScoreAnimation = {
  id: number;
  playerIndex: number;
  type: "gain" | "drain";
  amount: number;
  fromScore: number;
  toScore: number;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

type FloatKind = "gain" | "drain" | null;

export function AnimatedPlayerScore({
  score,
  playerIndex,
  animation = null,
  className = "",
}: {
  score: number;
  playerIndex: number;
  animation?: ScoreAnimation | null;
  className?: string;
}) {
  const [displayScore, setDisplayScore] = useState(score);
  const [floatKind, setFloatKind] = useState<FloatKind>(null);
  const [floatAmount, setFloatAmount] = useState(0);
  const [pulseKind, setPulseKind] = useState<FloatKind>(null);
  const lastAnimationId = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!isAnimatingRef.current) {
      setDisplayScore(score);
    }
  }, [score]);

  useEffect(() => {
    if (!animation || animation.playerIndex !== playerIndex) {
      return;
    }

    if (animation.id <= lastAnimationId.current) {
      return;
    }

    lastAnimationId.current = animation.id;
    isAnimatingRef.current = true;

    const { type, amount, fromScore, toScore } = animation;
    const from = fromScore;
    const to = toScore;

    setPulseKind(type);
    setFloatKind(type);
    setFloatAmount(amount);

    const floatTimer = window.setTimeout(() => setFloatKind(null), 850);
    const pulseTimer = window.setTimeout(() => setPulseKind(null), 700);
    const start = performance.now();
    const duration = 700;
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      setDisplayScore(Math.round(from + (to - from) * easeOutCubic(progress)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplayScore(to);
        isAnimatingRef.current = false;
      }
    }

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(floatTimer);
      window.clearTimeout(pulseTimer);
      isAnimatingRef.current = false;
    };
  }, [animation, playerIndex]);

  return (
    <span className={`relative inline-block tabular-nums ${className}`.trim()}>
      <span
        className={
          pulseKind === "gain"
            ? "score-gaining"
            : pulseKind === "drain"
              ? "score-draining"
              : undefined
        }
      >
        {displayScore}
      </span>
      {floatKind === "gain" && (
        <span className="score-gain-float font-spartan text-sm font-semibold md:text-base">
          +{floatAmount}
        </span>
      )}
      {floatKind === "drain" && (
        <span className="score-drain-float font-spartan text-sm font-semibold md:text-base">
          −{floatAmount}
        </span>
      )}
    </span>
  );
}
