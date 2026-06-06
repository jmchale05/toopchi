import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { TenableItem, TenableList } from "../../../types/tenable";
import { formatTenableItemValue } from "../../../lib/modes/tenable/formatValue";
import { NATION_REVEAL_COST } from "../../../lib/modes/tenable/gameRules";
import type { TenableValueFormat } from "../../../types/tenable";
import { NationFlag } from "../../NationFlag";
import { GhostButton } from "../../Layout";

function getSlotState(
  item: TenableItem,
  slots: Array<string | null>,
  revealAll: boolean,
) {
  const found = slots[item.rank - 1];
  const revealName = revealAll && !found ? item.answer : null;
  const displayName = found ?? revealName ?? null;
  return { found, revealName, displayName };
}

function HintIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2z" />
    </svg>
  );
}

export function NationRevealDialog({
  rank,
  onConfirm,
  onCancel,
}: {
  rank: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="dialog-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nation-reveal-title"
        className="dialog-panel relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
      >
        <h2
          id="nation-reveal-title"
          className="font-display text-xl text-white md:text-2xl"
        >
          Reveal nation?
        </h2>
        <p className="mt-2 font-spartan text-base text-white/60 md:text-sm">
          Take −{NATION_REVEAL_COST} to reveal the nation for rank #{rank}.
        </p>
        <div className="mt-6 flex gap-3">
          <GhostButton className="flex-1" onClick={onCancel}>
            Cancel
          </GhostButton>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#f5c542]/50 bg-[#f5c542]/15 px-4 py-2 font-spartan text-sm font-semibold tracking-wide text-[#f5c542] transition hover:border-[#f5c542]/70 hover:bg-[#f5c542]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c542]/40 active:scale-[0.98]"
          >
            Reveal
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function NationRevealControl({
  item,
  found,
  nationRevealed,
  revealAllNations,
  disabled,
  canAffordHint,
  onRequestReveal,
}: {
  item: TenableItem;
  found: boolean;
  nationRevealed: boolean;
  revealAllNations: boolean;
  disabled: boolean;
  canAffordHint: boolean;
  onRequestReveal?: (rank: number) => void;
}) {
  if (!item.nation) {
    return null;
  }

  const showNation = nationRevealed || revealAllNations;

  if (showNation && item.nation) {
    return <NationFlag nation={item.nation} size={24} />;
  }

  if (found || !onRequestReveal || !canAffordHint) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Hint: reveal nation for rank ${item.rank}`}
      onClick={() => onRequestReveal(item.rank)}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-[#f5c542]/10 hover:text-[#f5c542] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <HintIcon />
    </button>
  );
}

function BoardRow({
  item,
  slots,
  revealAll,
  highlightRank,
  highlightMode = "reveal",
  nationRevealed,
  revealAllNations,
  disabled,
  canAffordHint,
  valueFormat,
  onRequestReveal,
}: {
  item: TenableItem;
  slots: Array<string | null>;
  revealAll: boolean;
  highlightRank: number | null;
  highlightMode?: "reveal" | "duplicate";
  nationRevealed: boolean;
  revealAllNations: boolean;
  disabled: boolean;
  canAffordHint: boolean;
  valueFormat?: TenableValueFormat;
  onRequestReveal?: (rank: number) => void;
}) {
  const { found, revealName, displayName } = getSlotState(item, slots, revealAll);
  const isHighlighted = highlightRank === item.rank;
  const rowHighlightClass =
    isHighlighted && highlightMode === "duplicate"
      ? "tenable-duplicate-row"
      : isHighlighted
        ? "tenable-reveal-row"
        : null;

  return (
    <div
      data-reveal-rank={item.rank}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-150 md:gap-3.5 md:px-5 md:py-3 ${
        rowHighlightClass ??
        (found
            ? "border-[#f5c542]/55 bg-[#f5c542]/12"
            : revealName
              ? "border-white/20 bg-white/5"
              : "border-white/15 bg-white/[0.05]")
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-xl md:h-9 md:w-9 md:text-lg ${
          isHighlighted && highlightMode === "duplicate"
            ? "bg-amber-400 text-[#0a1628] shadow-[0_0_16px_rgba(251,191,36,0.55)]"
            : isHighlighted
            ? "bg-[#f5c542] text-[#0a1628] shadow-[0_0_16px_rgba(245,197,66,0.65)]"
            : found
              ? "bg-[#f5c542] text-[#0a1628]"
              : revealName
                ? "bg-white/15 text-white/60"
                : "bg-white/10 text-white/45"
        }`}
      >
        {item.rank}
      </span>
      <span
        className={`min-w-0 flex-1 truncate font-spartan text-lg font-medium leading-snug md:text-base ${
          found
            ? "text-white"
            : revealName
              ? "text-white/60"
              : "text-white/35"
        }`}
      >
        {displayName ? (
          <>
            {displayName}
            {item.value != null && (
              <span
                className={
                  found ? "text-white/55" : "text-white/40"
                }
              >
                {" "}
                {formatTenableItemValue(item.value, valueFormat)}
              </span>
            )}
          </>
        ) : (
          "—"
        )}
      </span>
      <NationRevealControl
        item={item}
        found={Boolean(found)}
        nationRevealed={nationRevealed}
        revealAllNations={revealAllNations}
        disabled={disabled}
        canAffordHint={canAffordHint}
        onRequestReveal={onRequestReveal}
      />
    </div>
  );
}

export function TopTenBoard({
  list,
  slots,
  revealAll = false,
  revealAllNations = false,
  highlightRank = null,
  highlightMode = "reveal",
  revealedNations,
  disabled = false,
  activePlayerScore,
  onRequestReveal,
}: {
  list: TenableList;
  slots: Array<string | null>;
  revealAll?: boolean;
  revealAllNations?: boolean;
  highlightRank?: number | null;
  highlightMode?: "reveal" | "duplicate";
  revealedNations?: boolean[];
  disabled?: boolean;
  activePlayerScore?: number;
  onRequestReveal?: (rank: number) => void;
}) {
  const sortedItems = [...list.items].sort((a, b) => a.rank - b.rank);
  const nationState = revealedNations ?? Array.from({ length: 10 }, () => false);
  const canAffordHint =
    activePlayerScore === undefined
      ? true
      : activePlayerScore >= NATION_REVEAL_COST;

  return (
    <div className="mx-auto w-full max-w-md space-y-2 px-4 md:max-w-lg md:space-y-2 md:px-6 lg:max-w-xl">
      {sortedItems.map((item) => (
        <BoardRow
          key={item.rank}
          item={item}
          slots={slots}
          revealAll={revealAll}
          highlightRank={highlightRank}
          highlightMode={highlightMode}
          nationRevealed={nationState[item.rank - 1]}
          revealAllNations={revealAllNations}
          disabled={disabled}
          canAffordHint={canAffordHint}
          valueFormat={list.valueFormat}
          onRequestReveal={onRequestReveal}
        />
      ))}
    </div>
  );
}
