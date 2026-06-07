/** Letters that do not decompose under NFD but should match plain ASCII typing. */
const LATIN_FOLDS: Record<string, string> = {
  æ: "ae",
  Æ: "ae",
  œ: "oe",
  Œ: "oe",
  ø: "o",
  Ø: "o",
  ß: "ss",
  đ: "d",
  Đ: "d",
  ł: "l",
  Ł: "l",
  þ: "th",
  Þ: "th",
  ð: "d",
  Ð: "d",
};

export function foldLatinLetters(value: string): string {
  let result = "";
  for (const char of value) {
    result += LATIN_FOLDS[char] ?? char;
  }
  return result;
}

export function decodeHtmlEntities(value: string): string {
  return String(value ?? "")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

export function normalizeSearchText(value: string): string {
  if (!value) return "";

  const folded = foldLatinLetters(
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  );

  return folded
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
