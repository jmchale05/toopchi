import { useNavigate } from "react-router-dom";
import { DailyPlayerGame } from "../components/DailyPlayerGame";
import { Layout, PrimaryButton, SecondaryButton } from "../components/Layout";
import { START_GAME_PATH } from "../config/features";

function SmartDisplayIcon() {
  return (
    <span
      aria-hidden
      className="material-symbols-outlined shrink-0 text-[20px] md:text-[24px]"
    >
      smart_display
    </span>
  );
}

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Layout contentClassName="min-h-0 flex-1 overflow-hidden pb-0 pt-4 md:max-w-6xl md:overflow-visible md:pt-4 md:pb-12 lg:pt-6 lg:pb-16">
      <div className="min-h-0 flex-1 overflow-y-auto pb-36 md:hidden">
        <DailyPlayerGame />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-[#081220] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto w-full max-w-lg space-y-3">
          <PrimaryButton onClick={() => navigate(START_GAME_PATH)}>
            Top Order
          </PrimaryButton>
          <SecondaryButton
            className="gap-2.5"
            onClick={() => navigate("/premium")}
          >
            <SmartDisplayIcon />
            Watch Ad
          </SecondaryButton>
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

          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton
              className="w-auto min-w-[10.5rem]"
              onClick={() => navigate(START_GAME_PATH)}
            >
              Top Order
            </PrimaryButton>
            <SecondaryButton
              className="w-auto min-w-[10.5rem] gap-2.5"
              onClick={() => navigate("/premium")}
            >
              <SmartDisplayIcon />
              Watch Ad
            </SecondaryButton>
          </div>

        </div>
      </div>
    </Layout>
  );
}
