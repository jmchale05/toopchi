import { sanitizePlayerNameInput } from "../lib/playerNames";
import { Card } from "./Layout";

type PlayerNameFieldsProps = {
  playerNames: string[];
  minPlayers: number;
  maxPlayers: number;
  onUpdateName: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
};

export function PlayerNameFields({
  playerNames,
  minPlayers,
  maxPlayers,
  onUpdateName,
  onAddPlayer,
  onRemovePlayer,
}: PlayerNameFieldsProps) {
  return (
    <Card>
      <h2 className="font-bold md:text-xl">Players</h2>
      <p className="mt-1 font-spartan text-base text-white/50 md:text-sm">
        Letters only. Player names are required.
      </p>

      <div className="mt-4 space-y-4 md:space-y-5">
        {playerNames.map((name, index) => {
          const isRequired = index < minPlayers;
          return (
            <div key={index}>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1 font-spartan text-base text-white/70 md:text-sm">
                  Player {index + 1}
                  {isRequired && (
                    <>
                      <span className="text-[#f5c542]" aria-hidden>
                        *
                      </span>
                      <span className="sr-only">(required)</span>
                    </>
                  )}
                </span>
                <div className="flex gap-2 md:gap-3">
                  <input
                    value={name}
                    onChange={(event) =>
                      onUpdateName(index, sanitizePlayerNameInput(event.target.value))
                    }
                    placeholder={`Enter name`}
                    className="field-input flex-1"
                    required={isRequired}
                    aria-required={isRequired}
                  />
                  {playerNames.length > minPlayers && (
                    <button
                      type="button"
                      onClick={() => onRemovePlayer(index)}
                      className="btn-icon"
                      aria-label={`Remove player ${index + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {playerNames.length < maxPlayers && (
        <button
          type="button"
          onClick={onAddPlayer}
          className="btn-link mt-3 text-[#f5c542]"
        >
          + Add player
        </button>
      )}
    </Card>
  );
}
