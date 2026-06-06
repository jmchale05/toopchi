export type PlayerRecord = {
  id: number | string;
  name: string;
  firstname: string | null;
  lastname: string | null;
  age: number | null;
  nationality: string | null;
  team: string;
  club?: string;
  league?: string | null;
  position?: string | null;
  retired?: boolean;
  searchName?: string;
  searchFirstname?: string;
  searchLastname?: string;
};

export type PlayerSearchResult = {
  player: PlayerRecord;
  score: number;
};
