import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Layout, PrimaryButton } from "../components/Layout";
import { PlayerNameFields } from "../components/PlayerNameFields";
import { TenableListSelect } from "../components/modes/tenable/TenableListSelect";
import { useSession } from "../context/SessionContext";
import { getPlayerNamesValidationError } from "../lib/playerNames";
import { RANDOM_TENABLE_LIST_ID } from "../lib/selectableTenableLists";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

export function TenableSetupPage() {
  const navigate = useNavigate();
  const { selectableTenableLists, startTenableSession } = useSession();
  const [playerNames, setPlayerNames] = useState(["", ""]);
  const [listId, setListId] = useState<string>(RANDOM_TENABLE_LIST_ID);
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
    startTenableSession(validNames, listId);
    navigate("/tenable/game");
  }

  return (
    <Layout showBack backTo="/">
      <div className="space-y-6 md:space-y-8">
        <div className="hidden md:block">
          <h1 className="text-3xl font-black uppercase md:text-5xl">Top Order</h1>
          <p className="mt-2 text-white/60 md:text-lg">
            Add your group and pick a list to guess.
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
          <h2 className="mb-4 font-bold md:text-xl">List</h2>
          <TenableListSelect
            lists={selectableTenableLists}
            value={listId}
            onChange={setListId}
          />
        </Card>

        {error && (
          <p className="text-base font-semibold text-red-400">
            {error}
          </p>
        )}

        <PrimaryButton onClick={handleStart}>Start</PrimaryButton>
      </div>
    </Layout>
  );
}
