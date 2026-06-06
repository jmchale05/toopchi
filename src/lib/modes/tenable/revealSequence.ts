export const REVEAL_STEP_MS = 500;
export const REVEAL_HOLD_MS = 450;
export const FAIL_FLASH_MS = 1800;
export const CORRECT_FLASH_MS = 2200;
export const ALREADY_GUESSED_FLASH_MS = 1400;
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

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/** Keep the actively highlighted row inside the scroll container. */
export function scrollRevealRankIntoView(
  scrollContainer: HTMLElement | null,
  rank: number,
): void {
  if (!scrollContainer) return;

  const row = scrollContainer.querySelector<HTMLElement>(
    `[data-reveal-rank="${rank}"]`,
  );
  if (!row) return;

  const padding = 12;
  const containerRect = scrollContainer.getBoundingClientRect();
  const rowRect = row.getBoundingClientRect();
  const rowTop = scrollContainer.scrollTop + (rowRect.top - containerRect.top);
  const rowBottom = rowTop + row.offsetHeight;
  const visibleTop = scrollContainer.scrollTop;
  const visibleBottom = visibleTop + scrollContainer.clientHeight;

  let targetScroll = scrollContainer.scrollTop;

  if (rowTop < visibleTop + padding) {
    targetScroll = rowTop - padding;
  } else if (rowBottom > visibleBottom - padding) {
    targetScroll = rowBottom - scrollContainer.clientHeight + padding;
  } else {
    return;
  }

  scrollContainer.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: "smooth",
  });
}

export async function runRankReveal(
  lastRank: number,
  onRank: (rank: number) => void,
  signal?: { cancelled: boolean },
  scrollContainer?: HTMLElement | null,
): Promise<void> {
  for (let rank = 1; rank <= lastRank; rank++) {
    if (signal?.cancelled) return;
    onRank(rank);
    if (scrollContainer) {
      await waitForPaint();
      if (signal?.cancelled) return;
      scrollRevealRankIntoView(scrollContainer, rank);
    }
    await delay(REVEAL_STEP_MS);
  }
  if (!signal?.cancelled) {
    await delay(REVEAL_HOLD_MS);
  }
}
