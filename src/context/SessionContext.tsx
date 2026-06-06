import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import matchesData from "../data/matches.json";
import { createSession } from "../lib/gameRules";
import {
  DEFAULT_MATCH_ID,
  findMatchById,
  selectableMatches,
} from "../lib/selectableMatches";
import { createTenableSession } from "../lib/modes/tenable/gameRules";
import {
  DEFAULT_TENABLE_LIST_ID,
  findTenableListById,
  selectableTenableLists,
} from "../lib/selectableTenableLists";
import type { Match } from "../types/match";
import type { Session } from "../types/session";
import type { TenableList } from "../types/tenable";

const matches = matchesData as unknown as Match[];

type SessionContextValue = {
  session: Session | null;
  matches: Match[];
  selectableMatches: Match[];
  selectableTenableLists: TenableList[];
  startSession: (playerNames: string[], matchId: string | "random") => void;
  startTenableSession: (playerNames: string[], listId: string | "random") => void;
  updateSession: (updater: (current: Session) => Session) => void;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      matches,
      selectableMatches,
      selectableTenableLists,
      startSession(playerNames, matchId) {
        const match =
          matchId === "random"
            ? selectableMatches[
                Math.floor(Math.random() * selectableMatches.length)
              ]
            : findMatchById(matchId) ??
              findMatchById(DEFAULT_MATCH_ID) ??
              selectableMatches[0];
        setSession(createSession(match, playerNames));
      },
      startTenableSession(playerNames, listId) {
        const list =
          listId === "random"
            ? selectableTenableLists[
                Math.floor(Math.random() * selectableTenableLists.length)
              ]
            : findTenableListById(listId) ??
              findTenableListById(DEFAULT_TENABLE_LIST_ID) ??
              selectableTenableLists[0];
        setSession(createTenableSession(list, playerNames));
      },
      updateSession(updater) {
        setSession((current) => (current ? updater(current) : current));
      },
      clearSession() {
        setSession(null);
      },
    }),
    [session],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
