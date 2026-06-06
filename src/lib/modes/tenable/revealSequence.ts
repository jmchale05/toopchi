export const REVEAL_STEP_MS = 500;
export const REVEAL_HOLD_MS = 450;
export const FAIL_FLASH_MS = 1800;
export const CORRECT_FLASH_MS = 2200;
export const SCROLL_INTO_VIEW_MS = 400;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Scroll the board into view before the rank highlight sequence runs. */
export async function scrollBoardIntoView(
  scrollContainer: HTMLElement | null,
  boardElement: HTMLElement | null,
): Promise<void> {
  if (!scrollContainer || !boardElement) {
    await delay(50);
    return;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const boardRect = boardElement.getBoundingClientRect();
  const boardHeight = boardElement.offsetHeight;
  const containerHeight = scrollContainer.clientHeight;
  const boardTopInContainer =
    scrollContainer.scrollTop + (boardRect.top - containerRect.top);
  const padding = 16;

  let targetScroll = boardTopInContainer - padding;

  if (boardHeight <= containerHeight - padding * 2) {
    targetScroll =
      boardTopInContainer - (containerHeight - boardHeight) / 2 + padding / 2;
  }

  scrollContainer.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: "smooth",
  });
  await delay(SCROLL_INTO_VIEW_MS);
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
