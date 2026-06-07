import type { TenableList } from "../../../types/tenable";
import {
  ASSIST_LEAGUES,
  defaultLeagueForCategory,
  defaultListIdForCategory,
  getCategoryFromListId,
  getLeagueFromListId,
  PREMIER_LEAGUE_ID,
  getAssistListsForLeague,
  getScorerListsForLeague,
  resolveListId,
  SCORER_LEAGUES,
  SPECIALTY_CATEGORIES,
  TOP_ASSISTS_CATEGORY,
  TOP_SCORERS_CATEGORY,
  type TenableListCategory,
} from "../../../lib/tenableListCategories";
import { RANDOM_TENABLE_LIST_ID } from "../../../lib/selectableTenableLists";

type TenableListSelectProps = {
  lists: TenableList[];
  value: string;
  onChange: (listId: string) => void;
};

function isCustomisableCategory(category: TenableListCategory): boolean {
  return category === TOP_SCORERS_CATEGORY || category === TOP_ASSISTS_CATEGORY;
}

export function TenableListSelect({
  lists: _lists,
  value,
  onChange,
}: TenableListSelectProps) {
  const category = getCategoryFromListId(value);
  const leagueId = getLeagueFromListId(value) ?? defaultLeagueForCategory(category);
  const showCustomise = isCustomisableCategory(category);

  const leagueOptions =
    category === TOP_SCORERS_CATEGORY
      ? SCORER_LEAGUES
      : category === TOP_ASSISTS_CATEGORY
        ? ASSIST_LEAGUES
        : [];

  const seasonLists =
    category === TOP_SCORERS_CATEGORY
      ? getScorerListsForLeague(leagueId)
      : category === TOP_ASSISTS_CATEGORY
        ? getAssistListsForLeague(leagueId)
        : [];

  const showSeasonPicker = showCustomise && seasonLists.length > 0;

  function handleCategoryChange(nextCategory: TenableListCategory) {
    onChange(defaultListIdForCategory(nextCategory));
  }

  function handleLeagueChange(nextLeagueId: string) {
    const listsForLeague =
      category === TOP_SCORERS_CATEGORY
        ? getScorerListsForLeague(nextLeagueId)
        : getAssistListsForLeague(nextLeagueId);

    const currentSeasonStillValid = listsForLeague?.some((list) => list.id === value);
    onChange(
      resolveListId(
        category,
        nextLeagueId,
        currentSeasonStillValid ? value : (listsForLeague?.[0]?.id ?? null),
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block font-spartan text-base tracking-wide text-white/70">
          Category
        </label>
        <select
          value={category}
          onChange={(event) =>
            handleCategoryChange(event.target.value as TenableListCategory)
          }
          className="field-select w-full"
        >
          <option value={RANDOM_TENABLE_LIST_ID}>Random</option>
          <option value={TOP_SCORERS_CATEGORY}>Top Scorers</option>
          <option value={TOP_ASSISTS_CATEGORY}>Top Assisters</option>
          {SPECIALTY_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {showCustomise && (
        <div className="space-y-2">
          <label className="block font-spartan text-base tracking-wide text-white/70">
            League
          </label>
          <select
            value={leagueId ?? PREMIER_LEAGUE_ID}
            onChange={(event) => handleLeagueChange(event.target.value)}
            className="field-select w-full"
          >
            {leagueOptions.map((league) => (
              <option key={league.id} value={league.id}>
                {league.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {showSeasonPicker && (
        <div className="space-y-2">
          <label className="block font-spartan text-base tracking-wide text-white/70">
            Season
          </label>
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="field-select w-full"
          >
            {seasonLists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.season ?? list.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
