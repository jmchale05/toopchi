import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { LINEUP_MODE_ENABLED } from "../config/features";
import { GAME_MODES, type GameMode } from "../types/mode";

const MODES: GameMode[] = LINEUP_MODE_ENABLED
  ? ["lineup", "tenable"]
  : ["tenable"];

const MODE_UI: Record<
  GameMode,
  { badge: string; hint: string; players: string }
> = {
  lineup: {
    badge: "XI",
    hint: "Tap a position on the pitch and name a starter.",
    players: "2+ players",
  },
  tenable: {
    badge: "10",
    hint: "Name someone on the list — ranks 1 to 10.",
    players: "2 players",
  },
};

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0 text-white/35 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#f5c542]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ModeCard({
  mode,
  onSelect,
}: {
  mode: GameMode;
  onSelect: () => void;
}) {
  const { label, description } = GAME_MODES[mode];
  const { badge, hint, players } = MODE_UI[mode];

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-200 hover:border-[#f5c542]/40 hover:bg-[#f5c542]/[0.07] active:scale-[0.99] md:p-6 lg:p-7"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#f5c542]/30 bg-[#f5c542]/10 font-display text-xl text-[#f5c542] md:h-14 md:w-14 md:text-2xl">
          {badge}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-spartan text-xl font-semibold text-white md:text-2xl lg:text-3xl">
              {label}
            </p>
            <ChevronIcon />
          </div>
          <p className="mt-1.5 text-sm leading-snug text-white/55 md:text-base">
            {description}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/40 md:text-[0.95rem]">
            {hint}
          </p>
          <span className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-spartan text-xs font-medium tracking-wide text-white/50">
            {players}
          </span>
        </div>
      </div>
    </button>
  );
}

export function ModeSelectPage() {
  const navigate = useNavigate();

  return (
    <Layout showBack backTo="/" contentClassName="md:max-w-4xl md:py-10 lg:max-w-5xl lg:py-14">
      <div className="flex flex-1 flex-col md:justify-center">
        <div className="mb-8 md:mb-10">
          <p className="font-spartan text-sm font-medium tracking-wide text-[#f5c542] md:text-base">
            Start a game
          </p>
          <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] text-white md:text-5xl lg:text-6xl">
            Choose mode
          </h1>
          <p className="mt-3 max-w-lg font-spartan text-base leading-relaxed text-white/55 md:text-lg">
            Same pass-and-play setup for both — pick the challenge you want
            first.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {MODES.map((mode) => (
            <ModeCard
              key={mode}
              mode={mode}
              onSelect={() => navigate(GAME_MODES[mode].setupPath)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
