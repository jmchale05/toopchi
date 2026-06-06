import type { PlayerRecord } from "../types/player";
import type {
  DailyAgeMatch,
  DailyFieldMatch,
  DailyGuessFeedback,
  DailyPlayer,
  DailyPlayerProfile,
} from "../types/dailyPlayer";
import { compareNation } from "./dailyNationMatch";
import { getDailyPlayer } from "./dailyPlayer";
import { lookupPlayersByNames } from "./localPlayerSearch";

function normalizeField(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizePosition(value: string | null | undefined): string | null {
  const field = normalizeField(value);
  if (!field) return null;

  const lower = field.toLowerCase();
  if (lower === "attacker" || lower === "forward" || lower === "striker") {
    return "forward";
  }
  if (lower === "midfielder" || lower === "midfield") {
    return "midfielder";
  }
  if (lower === "defender" || lower === "defence") {
    return "defender";
  }
  if (lower === "goalkeeper" || lower === "keeper") {
    return "goalkeeper";
  }

  return lower;
}

function resolveNation(
  player: PlayerRecord | DailyPlayer,
): string | null {
  if ("nationality" in player && player.nationality) {
    return normalizeField(player.nationality);
  }

  return null;
}

function resolveTeam(player: PlayerRecord | DailyPlayer): string | null {
  if ("team" in player && player.team) {
    return normalizeField(player.team);
  }

  if ("club" in player && player.club) {
    return normalizeField(player.club);
  }

  return null;
}

export function compareAge(
  guessAge: number | null,
  answerAge: number | null,
): DailyAgeMatch {
  if (guessAge == null || answerAge == null) {
    return "unknown";
  }

  if (guessAge === answerAge) {
    return "correct";
  }

  if (Math.abs(guessAge - answerAge) <= 5) {
    return guessAge > answerAge ? "close-lower" : "close-higher";
  }

  return guessAge > answerAge ? "lower" : "higher";
}

export function compareField(
  guessValue: string | null,
  answerValue: string | null,
  normalize?: (value: string | null) => string | null,
): DailyFieldMatch {
  const left = normalize ? normalize(guessValue) : normalizeField(guessValue);
  const right = normalize
    ? normalize(answerValue)
    : normalizeField(answerValue);

  if (!left || !right) {
    return "unknown";
  }

  return left === right ? "correct" : "miss";
}

function toProfile(player: PlayerRecord | DailyPlayer): DailyPlayerProfile {
  return {
    age: player.age ?? null,
    position: normalizeField(player.position),
    league: normalizeField(player.league),
    team: resolveTeam(player),
    nation: resolveNation(player),
  };
}

export async function resolveAnswerProfile(
  daily: DailyPlayer = getDailyPlayer(),
): Promise<DailyPlayerProfile> {
  if (
    daily.age != null ||
    daily.position ||
    daily.league ||
    daily.nationality ||
    daily.team
  ) {
    return {
      age: daily.age ?? null,
      position: normalizeField(daily.position),
      league: normalizeField(daily.league),
      team: normalizeField(daily.team),
      nation: normalizeField(daily.nationality),
    };
  }

  const [match] = await lookupPlayersByNames([daily.answer]);
  return match
    ? toProfile(match.player)
    : { age: null, position: null, league: null, team: null, nation: null };
}

export async function resolveGuessProfile(
  guess: string,
): Promise<DailyPlayerProfile & { name: string }> {
  const [match] = await lookupPlayersByNames([guess]);
  if (!match) {
    return {
      name: guess,
      age: null,
      position: null,
      league: null,
      team: null,
      nation: null,
    };
  }

  return {
    name: match.player.name,
    ...toProfile(match.player),
  };
}

export async function buildDailyGuessFeedback(
  guess: string,
  daily: DailyPlayer = getDailyPlayer(),
): Promise<DailyGuessFeedback> {
  const [guessProfile, answerProfile] = await Promise.all([
    resolveGuessProfile(guess),
    resolveAnswerProfile(daily),
  ]);

  const correct =
    normalizeField(guessProfile.name) === normalizeField(daily.answer) ||
    normalizeField(guess) === normalizeField(daily.answer);

  return {
    guess: guessProfile.name,
    correct,
    age: guessProfile.age,
    position: guessProfile.position,
    league: guessProfile.league,
    nation: guessProfile.nation,
    ageMatch: compareAge(guessProfile.age, answerProfile.age),
    positionMatch: compareField(
      guessProfile.position,
      answerProfile.position,
      normalizePosition,
    ),
    leagueMatch: compareField(guessProfile.league, answerProfile.league),
    nationMatch: compareNation(guessProfile.nation, answerProfile.nation),
  };
}
