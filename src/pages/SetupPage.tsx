import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Layout, PrimaryButton } from "../components/Layout";
import { MatchSelect } from "../components/MatchSelect";
import { PlayerNameFields } from "../components/PlayerNameFields";
import { useSession } from "../context/SessionContext";
import { getPlayerNamesValidationError } from "../lib/playerNames";
import { DEFAULT_MATCH_ID } from "../lib/selectableMatches";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

export function SetupPage() {
  const navigate = useNavigate();
  const { selectableMatches, startSession } = useSession();
  const [playerNames, setPlayerNames] = useState(["", ""]);
  const [matchId, setMatchId] = useState<string>(DEFAULT_MATCH_ID);
  const [error, setError] = useState<string | null>(null);

  function updateName(index: number, value: string) {
    setPlayerNames((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function addPlayer() {
    if (playerNames.length >= MAX_PLAYERS) {
      return;
    }
    setPlayerNames((current) => [...current, ""]);
  }

  function removePlayer(index: number) {
    if (playerNames.length <= MIN_PLAYERS) {
      return;
    }
    setPlayerNames((current) => current.filter((_, i) => i !== index));
  }

  function handleStart() {
    const validationError = getPlayerNamesValidationError(playerNames, MIN_PLAYERS);
    if (validationError) {
      setError(validationError);
      return;
    }

    const validNames = playerNames.map((name) => name.trim()).filter(Boolean);
    startSession(validNames, matchId);
    navigate("/game");
  }

  return (
    <Layout showBack backTo="/start">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-3xl font-black uppercase md:text-5xl">Setup</h1>
          <p className="mt-2 text-white/60 md:text-lg">
            Add your group and pick a match to guess.
          </p>
        </div>

        <PlayerNameFields
          playerNames={playerNames}
          minPlayers={MIN_PLAYERS}
          maxPlayers={MAX_PLAYERS}
          onUpdateName={updateName}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
        />

        <Card>
          <h2 className="mb-4 font-bold md:text-xl">Match</h2>
          <MatchSelect
            matches={selectableMatches}
            value={matchId}
            onChange={setMatchId}
            showRandom={false}
          />
        </Card>

        {error && <p className="text-sm font-semibold text-red-400 md:text-base">{error}</p>}

        <PrimaryButton onClick={handleStart}>Kick off</PrimaryButton>
      </div>
    </Layout>
  );
}
