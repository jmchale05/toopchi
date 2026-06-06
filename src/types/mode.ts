export type GameMode = "lineup" | "tenable";

export const GAME_MODES: Record<
  GameMode,
  { label: string; description: string; setupPath: string; gamePath: string }
> = {
  lineup: {
    label: "Guess the XI",
    description: "Guess who started in a real match.",
    setupPath: "/setup",
    gamePath: "/game",
  },
  tenable: {
    label: "Top Order",
    description: "Name entries from a ranked list.",
    setupPath: "/tenable/setup",
    gamePath: "/tenable/game",
  },
};
