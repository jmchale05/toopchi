import type { TenableList } from "../../../types/tenable";
import {
  featuredTenableLists,
  premierAssistLists,
  premierScorerLists,
  RANDOM_TENABLE_LIST_ID,
} from "../../../lib/selectableTenableLists";

const PREM_SCORERS_CATEGORY = "prem-scorers";
const PREM_ASSISTS_CATEGORY = "prem-assists";

type TenableListSelectProps = {
  lists: TenableList[];
  value: string;
  onChange: (listId: string) => void;
};

function getMainSelection(listId: string): string {
  if (listId === RANDOM_TENABLE_LIST_ID) {
    return RANDOM_TENABLE_LIST_ID;
  }
  if (listId.startsWith("prem-top-scorers-")) {
    return PREM_SCORERS_CATEGORY;
  }
  if (listId.startsWith("prem-top-assists-")) {
    return PREM_ASSISTS_CATEGORY;
  }
  return listId;
}

function isPremCategory(selection: string): boolean {
  return (
    selection === PREM_SCORERS_CATEGORY ||
    selection === PREM_ASSISTS_CATEGORY
  );
}

export function TenableListSelect({
  lists: _lists,
  value,
  onChange,
}: TenableListSelectProps) {
  const mainSelection = getMainSelection(value);
  const showSeasonPicker = isPremCategory(mainSelection);
  const seasonLists =
    mainSelection === PREM_SCORERS_CATEGORY
      ? premierScorerLists
      : premierAssistLists;

  function handleMainChange(next: string) {
    if (next === RANDOM_TENABLE_LIST_ID) {
      onChange(RANDOM_TENABLE_LIST_ID);
      return;
    }
    if (next === PREM_SCORERS_CATEGORY) {
      onChange(premierScorerLists[0]?.id ?? value);
      return;
    }
    if (next === PREM_ASSISTS_CATEGORY) {
      onChange(premierAssistLists[0]?.id ?? value);
      return;
    }
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block font-spartan text-sm tracking-wide text-white/70 md:text-base">
          Top Order list
        </label>
        <select
          value={mainSelection}
          onChange={(event) => handleMainChange(event.target.value)}
          className="field-select w-full"
        >
          <option value={RANDOM_TENABLE_LIST_ID}>Random</option>
          {featuredTenableLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.title}
            </option>
          ))}
          <option value={PREM_SCORERS_CATEGORY}>Prem Top Scorers</option>
          <option value={PREM_ASSISTS_CATEGORY}>Prem Top Assisters</option>
        </select>
      </div>

      {showSeasonPicker && (
        <div className="space-y-2">
          <label className="block font-spartan text-sm tracking-wide text-white/70 md:text-base">
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
