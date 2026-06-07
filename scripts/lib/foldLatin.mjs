const LATIN_FOLDS = {
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

export function foldLatinLetters(value) {
  let result = "";
  for (const char of value) {
    result += LATIN_FOLDS[char] ?? char;
  }
  return result;
}

export function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

export function normalizeSearchText(value) {
  if (!value) return "";

  const folded = foldLatinLetters(
    String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  );

  return folded
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
