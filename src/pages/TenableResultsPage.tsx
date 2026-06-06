import { Navigate, useNavigate } from "react-router-dom";
import { Card, Layout, PrimaryButton, SecondaryButton } from "../components/Layout";
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
    <Layout>
      <div className="space-y-5 md:space-y-6">
        <div className="text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-[#f5c542] md:text-base">
            Final whistle
          </p>
          <h1 className="mt-2 font-display text-4xl font-normal uppercase md:text-6xl">
            Results
          </h1>
          <p className="mt-2 text-sm text-white/50 md:text-base">
            {session.list.title}
          </p>
          <p className="mt-3 font-display text-lg text-[#f5c542] md:text-2xl">
            {winners.length > 1 ? "Shared trophy: " : "Winner: "}
            {winnerLabel}
          </p>
        </div>

        <Scoreboard players={session.players} />
        <TopTenBoard
          list={session.list}
          slots={session.slots}
          revealedNations={session.revealedNations}
          revealAll
          revealAllNations
        />

        {session.guessLog.length > 0 && (
          <Card>
            <h2 className="mb-3 font-bold md:text-xl">Guess log</h2>
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm md:max-h-64 md:text-base">
              {session.guessLog.map((entry, index) => (
                <li
                  key={`${entry.playerName}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 md:px-4 md:py-3"
                >
                  <span>
                    {entry.playerName} — {entry.guess || "(skip)"}
                  </span>
                  <span
                    className={
                      entry.correct ? "text-[#f5c542]" : "text-white/40"
                    }
                  >
                    {entry.correct
                      ? entry.rank
                        ? `#${entry.rank} +100`
                        : "+100"
                      : "miss"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

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
      </div>
    </Layout>
  );
}
