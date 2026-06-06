import { useNavigate } from "react-router-dom";
import { DailyPlayerGame } from "../components/DailyPlayerGame";
import { Layout, TryTopOrderButton } from "../components/Layout";
import { START_GAME_PATH } from "../config/features";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Layout contentClassName="min-h-0 flex-1 flex-col overflow-hidden pb-0 pt-4 md:max-w-6xl md:overflow-visible md:pt-4 md:pb-12 lg:pt-6 lg:pb-16">
      {/* Mobile: scrollable game + button locked to bottom */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <DailyPlayerGame />
        </div>
        <div className="shrink-0 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <TryTopOrderButton onClick={() => navigate(START_GAME_PATH)} />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden flex-1 md:flex md:flex-col md:justify-start">
        <div className="flex flex-col">
          <p className="font-spartan text-lg text-[#f5c542] lg:text-xl">
            Local football quiz
          </p>
          <h1 className="mt-3 max-w-xl font-display text-5xl uppercase leading-[0.95] text-white lg:text-6xl">
            Take turns.
            <br />
            Score points.
          </h1>
          <p className="mt-5 max-w-lg font-spartan text-base leading-relaxed text-white/60 lg:text-lg">
            Pass-and-play with a mate. Name entries from ranked lists in Top
            Order.
          </p>

          <div className="mt-8 max-w-xl">
            <DailyPlayerGame />
          </div>

          <div className="mt-8">
            <TryTopOrderButton
              className="w-auto min-w-[12.5rem]"
              onClick={() => navigate(START_GAME_PATH)}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
