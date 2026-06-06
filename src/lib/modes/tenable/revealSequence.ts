export const REVEAL_STEP_MS = 500;
export const REVEAL_HOLD_MS = 450;
export const FAIL_FLASH_MS = 1800;
export const CORRECT_FLASH_MS = 2200;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function runRankReveal(
  lastRank: number,
  onRank: (rank: number) => void,
  signal?: { cancelled: boolean },
): Promise<void> {
  for (let rank = 1; rank <= lastRank; rank++) {
    if (signal?.cancelled) return;
    onRank(rank);
    await delay(REVEAL_STEP_MS);
  }
  if (!signal?.cancelled) {
    await delay(REVEAL_HOLD_MS);
  }
}
