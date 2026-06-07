import { Navigate, useNavigate } from "react-router-dom";
import {
  Card,
  FixedBottomActions,
  Layout,
  PrimaryButton,
  SecondaryButton,
} from "../components/Layout";
import { TopTenBoard } from "../components/modes/tenable/TopTenBoard";
import { Scoreboard } from "../components/Scoreboard";
import { useSession } from "../context/SessionContext";
import { getWinners } from "../lib/modes/tenable/gameRules";
import { isTenableSession } from "../types/session";

export function TenableResultsPage() {
  const navigate = useNavigate();
  const { session, clearSession } = useSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (!isTenableSession(session)) {
    return <Navigate to="/results" replace />;
  }

  if (session.phase !== "finished") {
    return <Navigate to="/tenable/game" replace />;
  }

  const winners = getWinners(session.players);
  const winnerLabel =
    winners.length === 1
      ? winners[0].name
      : winners.map((player) => player.name).join(" & ");

  return (
    <Layout contentClassName="pb-0">
      <div className="space-y-5 pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:space-y-6">
        <div className="text-center">
          <p className="font-display text-base uppercase tracking-[0.3em] text-[#f5c542]">
            {session.endedEarly ? "Game ended" : "Final whistle"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-normal uppercase md:text-6xl">
            Results
          </h1>
          <p className="mt-2 text-base text-white/50">
            {session.list.title}
          </p>
          <p className="mt-3 font-display text-lg text-[#f5c542] md:text-2xl">
            {winners.length > 1 ? "Shared trophy: " : "Winner: "}
            {winnerLabel}
          </p>
        </div>

        <Scoreboard players={session.players} />

        <Card>
          <TopTenBoard
            list={session.list}
            slots={session.slots}
            revealedNations={session.revealedNations}
            revealAll
            revealAllNations
            fullWidth
          />
        </Card>
      </div>

      <FixedBottomActions>
        <PrimaryButton
          onClick={() => {
            clearSession();
            navigate("/tenable/setup");
          }}
        >
          Play again
        </PrimaryButton>
        <SecondaryButton
          onClick={() => {
            clearSession();
            navigate("/");
          }}
        >
          Home
        </SecondaryButton>
      </FixedBottomActions>
    </Layout>
  );
}
