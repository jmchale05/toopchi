const LETTERS_ONLY = /[^a-zA-Z]/g;

export function sanitizePlayerNameInput(value: string): string {
  return value.replace(LETTERS_ONLY, "");
}

export function getPlayerNamesValidationError(
  playerNames: string[],
  minPlayers: number,
): string | null {
  const validNames = playerNames.map((name) => name.trim()).filter(Boolean);

  if (validNames.length < minPlayers) {
    return `Add at least ${minPlayers} player names.`;
  }

  if (validNames.some((name) => !/^[a-zA-Z]+$/.test(name))) {
    return "Player names can only contain letters.";
  }

  const unique = new Set(validNames.map((name) => name.toLowerCase()));
  if (unique.size !== validNames.length) {
    return "Each player needs a unique name.";
  }

  return null;
}
