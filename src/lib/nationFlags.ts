export function normalizeNation(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const NATION_FLAG_CODES: Record<string, string> = {
  argentina: "ar",
  brazil: "br",
  england: "gb-eng",
  france: "fr",
  germany: "de",
  ghana: "gh",
  italy: "it",
  netherlands: "nl",
  norway: "no",
  poland: "pl",
  portugal: "pt",
  spain: "es",
  sweden: "se",
  ukraine: "ua",
  scotland: "gb-sct",
  wales: "gb-wls",
  "northern ireland": "gb-nir",
  ireland: "ie",
  belgium: "be",
  croatia: "hr",
  denmark: "dk",
  switzerland: "ch",
  austria: "at",
  "czech republic": "cz",
  czechia: "cz",
  serbia: "rs",
  turkey: "tr",
  usa: "us",
  "united states": "us",
  mexico: "mx",
  japan: "jp",
  "south korea": "kr",
  korea: "kr",
  morocco: "ma",
  senegal: "sn",
  nigeria: "ng",
  cameroon: "cm",
  "ivory coast": "ci",
  "cote d'ivoire": "ci",
  egypt: "eg",
  australia: "au",
  canada: "ca",
  colombia: "co",
  uruguay: "uy",
  chile: "cl",
  ecuador: "ec",
  paraguay: "py",
  peru: "pe",
  venezuela: "ve",
  hungary: "hu",
  romania: "ro",
  greece: "gr",
  finland: "fi",
  iceland: "is",
  slovenia: "si",
  slovakia: "sk",
  bosnia: "ba",
  "bosnia and herzegovina": "ba",
  montenegro: "me",
  albania: "al",
  georgia: "ge",
  russia: "ru",
  china: "cn",
  india: "in",
  "saudi arabia": "sa",
  qatar: "qa",
  iran: "ir",
  iraq: "iq",
  israel: "il",
  tunisia: "tn",
  algeria: "dz",
  "south africa": "za",
  angola: "ao",
  "costa rica": "cr",
  panama: "pa",
  jamaica: "jm",
  haiti: "ht",
};

export function getNationFlagCode(nation: string): string | null {
  const key = normalizeNation(nation);
  return NATION_FLAG_CODES[key] ?? null;
}

const FLAG_WIDTHS = [20, 40, 80, 160, 320, 640, 1280, 2560];

function getSupportedFlagWidth(width: number): number {
  return FLAG_WIDTHS.find((flagWidth) => flagWidth >= width) ?? 40;
}

export function getNationFlagUrl(nation: string, width = 20): string | null {
  const code = getNationFlagCode(nation);
  if (!code) return null;
  return `https://flagcdn.com/w${getSupportedFlagWidth(width)}/${code}.png`;
}
