export type FormationSlot = {
  label: string;
  x: number;
  depth: number;
};

export type SlotPosition = {
  x: number;
  y: number;
};

export type FormationId = "4-2-3-1" | "4-3-1-2";

function buildFormation(
  rows: Array<{ depth: number; players: Array<{ label: string; x: number }> }>,
): FormationSlot[] {
  return rows.flatMap((row) =>
    row.players.map((player) => ({
      label: player.label,
      x: player.x,
      depth: row.depth,
    })),
  );
}

// 4-2-3-1: GK · 4 DEF · 2 CDM · LW/CAM/RW · ST
export const FORMATION_4231 = buildFormation([
  { depth: 0.04, players: [{ label: "GK", x: 50 }] },
  {
    depth: 0.3,
    players: [
      { label: "LB", x: 14 },
      { label: "CB", x: 38 },
      { label: "CB", x: 62 },
      { label: "RB", x: 86 },
    ],
  },
  {
    depth: 0.5,
    players: [
      { label: "CDM", x: 36 },
      { label: "CDM", x: 64 },
    ],
  },
  {
    depth: 0.72,
    players: [
      { label: "LW", x: 18 },
      { label: "CAM", x: 50 },
      { label: "RW", x: 82 },
    ],
  },
  { depth: 0.9, players: [{ label: "ST", x: 50 }] },
]);

// 4-3-1-2: GK · 4 DEF · 3 CM · CAM · 2 ST
export const FORMATION_4312 = buildFormation([
  { depth: 0.04, players: [{ label: "GK", x: 50 }] },
  {
    depth: 0.3,
    players: [
      { label: "LB", x: 14 },
      { label: "CB", x: 38 },
      { label: "CB", x: 62 },
      { label: "RB", x: 86 },
    ],
  },
  {
    depth: 0.5,
    players: [
      { label: "CM", x: 26 },
      { label: "CM", x: 50 },
      { label: "CM", x: 74 },
    ],
  },
  { depth: 0.68, players: [{ label: "CAM", x: 50 }] },
  {
    depth: 0.88,
    players: [
      { label: "ST", x: 38 },
      { label: "ST", x: 62 },
    ],
  },
]);

export const FORMATIONS: Record<FormationId, FormationSlot[]> = {
  "4-2-3-1": FORMATION_4231,
  "4-3-1-2": FORMATION_4312,
};

const DEFAULT_FORMATION: FormationId = "4-2-3-1";

export function resolveFormation(id: FormationId | undefined): FormationSlot[] {
  if (!id) {
    return FORMATIONS[DEFAULT_FORMATION];
  }
  return FORMATIONS[id] ?? FORMATIONS[DEFAULT_FORMATION];
}

const TEAM_A_GOAL_Y = 96;
const TEAM_B_GOAL_Y = 4;
const BAND = 42;

export function teamASlotPosition(slot: FormationSlot): SlotPosition {
  return {
    x: slot.x,
    y: TEAM_A_GOAL_Y - slot.depth * BAND,
  };
}

export function teamBSlotPosition(slot: FormationSlot): SlotPosition {
  return {
    x: 100 - slot.x,
    y: TEAM_B_GOAL_Y + slot.depth * BAND,
  };
}

export function slotLabel(
  formation: FormationSlot[],
  index: number,
): string {
  return formation[index]?.label ?? "";
}

export function createEmptySlots(): Array<string | null> {
  return Array.from({ length: 11 }, () => null);
}

export function isSlotFilled(
  slots: Array<string | null>,
  index: number,
): boolean {
  return slots[index] !== null;
}
