import { useNavigate } from "react-router-dom";
import { DailyPlayerGame } from "../components/DailyPlayerGame";
import { Layout, TryTopOrderButton } from "../components/Layout";
import { START_GAME_PATH } from "../config/features";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Layout contentClassName="min-h-0 flex-1 flex-col overflow-hidden pb-0 pt-4 md:max-w-6xl md:overflow-visible md:pt-4 md:pb-12 lg:pt-6 lg:pb-16">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="hidden md:block">
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:mt-8 md:max-w-xl md:overflow-visible">
          <DailyPlayerGame />
        </div>

        <div className="shrink-0 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:mt-8 md:pb-0">
          <TryTopOrderButton
            className="md:w-auto md:min-w-[12.5rem]"
            onClick={() => navigate(START_GAME_PATH)}
          />
        </div>
      </div>
    </Layout>
  );
}
