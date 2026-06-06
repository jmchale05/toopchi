import type { LineupSession } from "./match";
import type { TenableSession } from "./tenable";

export type Session = LineupSession | TenableSession;

export function isLineupSession(session: Session): session is LineupSession {
  return session.mode === "lineup";
}

export function isTenableSession(session: Session): session is TenableSession {
  return session.mode === "tenable";
}
