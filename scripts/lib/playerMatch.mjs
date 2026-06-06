export function normalizeName(value) {
  if (!value) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lastToken(value) {
  const parts = normalizeName(value).split(" ").filter(Boolean);
  return parts.at(-1) ?? "";
}

const RETIRED_TEAM_PATTERN =
  /^(retired|career break|without club|free agent|no team)$/i;

export function resolveClub(team) {
  const trimmed = String(team ?? "").trim();
  if (!trimmed || RETIRED_TEAM_PATTERN.test(trimmed)) {
    return { club: "Retired", retired: true, team: "Retired" };
  }
  return { club: trimmed, retired: false, team: trimmed };
}

export function buildSearchFields(player) {
  const name = String(player.name ?? "").trim();
  const firstname = String(player.firstname ?? "").trim();
  const lastname = String(player.lastname ?? "").trim();

  return {
    searchName: normalizeName(name),
    searchFirstname: normalizeName(firstname),
    searchLastname: normalizeName(lastname),
  };
}

export function buildPlayerDoc(player) {
  const name = String(player.name ?? "").trim();
  const firstname = String(player.firstname ?? "").trim();
  const lastname = String(player.lastname ?? "").trim();
  const resolved = resolveClub(player.team ?? player.club);
  const club = player.club ?? resolved.club;
  const retired = player.retired ?? resolved.retired;
  const team = player.team ?? resolved.team;

  return {
    id: player.id,
    name,
    firstname: firstname || null,
    lastname: lastname || null,
    age: player.age ?? null,
    nationality: player.nationality ?? null,
    team,
    club,
    retired,
    source: player.source ?? "players-json",
    sourcePlayerId: player.sourcePlayerId ?? null,
    ...buildSearchFields({ name, firstname, lastname }),
  };
}

export function findPlayerInCatalog(answer, nation, players) {
  const normalizedAnswer = normalizeName(answer);
  const exact = players.filter(
    (player) =>
      normalizeName(player.name) === normalizedAnswer ||
      normalizeName(`${player.firstname ?? ""} ${player.lastname ?? ""}`) ===
        normalizedAnswer,
  );
  if (exact.length === 1) return exact[0];

  const answerLast = lastToken(answer);
  let candidates = players.filter((player) => {
    const playerLast = lastToken(player.lastname);
    const lastnameParts = normalizeName(player.lastname).split(" ");
    return playerLast === answerLast || lastnameParts.includes(answerLast);
  });

  if (nation) {
    const byNation = candidates.filter(
      (player) => normalizeName(player.nationality) === normalizeName(nation),
    );
    if (byNation.length === 1) return byNation[0];
    if (byNation.length > 1) candidates = byNation;
  }

  if (candidates.length === 1) return candidates[0];
  return null;
}

export function slugify(value) {
  return normalizeName(value).replace(/\s+/g, "-");
}
