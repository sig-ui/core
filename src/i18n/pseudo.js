// @ts-check

/**
 * SigUI core i18n module for pseudo.
 * @module
 */
const ACCENTED_MAP = {
  a: "ä",
  b: "ƀ",
  c: "ç",
  d: "đ",
  e: "ë",
  f: "ƒ",
  g: "ĝ",
  h: "ĥ",
  i: "ï",
  j: "ĵ",
  k: "ķ",
  l: "ļ",
  m: "ḿ",
  n: "ñ",
  o: "ö",
  p: "ṕ",
  q: "ǫ",
  r: "ŕ",
  s: "ś",
  t: "ţ",
  u: "ü",
  v: "ṽ",
  w: "ŵ",
  x: "ẋ",
  y: "ý",
  z: "ž",
  A: "Ä",
  B: "Ɓ",
  C: "Ç",
  D: "Đ",
  E: "Ë",
  F: "Ƒ",
  G: "Ĝ",
  H: "Ĥ",
  I: "Ï",
  J: "Ĵ",
  K: "Ķ",
  L: "Ļ",
  M: "Ḿ",
  N: "Ñ",
  O: "Ö",
  P: "Ṕ",
  Q: "Ǫ",
  R: "Ŕ",
  S: "Ś",
  T: "Ţ",
  U: "Ü",
  V: "Ṽ",
  W: "Ŵ",
  X: "Ẋ",
  Y: "Ý",
  Z: "Ž"
};
const MIRROR_MAP = {
  a: "ɐ",
  b: "q",
  c: "ɔ",
  d: "p",
  e: "ǝ",
  f: "ɟ",
  g: "ƃ",
  h: "ɥ",
  i: "ı",
  j: "ɾ",
  k: "ʞ",
  l: "l",
  m: "ɯ",
  n: "u",
  o: "o",
  p: "d",
  q: "b",
  r: "ɹ",
  s: "s",
  t: "ʇ",
  u: "n",
  v: "ʌ",
  w: "ʍ",
  x: "x",
  y: "ʎ",
  z: "z",
  A: "∀",
  B: "၁2",
  C: "Ɔ",
  D: "ᗡ",
  E: "Ǝ",
  F: "Ⅎ",
  G: "⅁",
  H: "H",
  I: "I",
  J: "ſ",
  K: "⋊",
  L: "⅂",
  M: "W",
  N: "N",
  O: "O",
  P: "Ԁ",
  Q: "Ό",
  R: "ᴚ",
  S: "S",
  T: "⊥",
  U: "∩",
  V: "Λ",
  W: "M",
  X: "X",
  Y: "⅄",
  Z: "Z"
};
function accentedTransform(str) {
  return str.replace(/[a-zA-Z]/g, (ch) => ACCENTED_MAP[ch] ?? ch);
}
function expandedTransform(str, expansionRatio) {
  const expanded = str.replace(/[aeiouAEIOU]/g, (ch) => ch.repeat(3));
  const padLength = Math.ceil(str.length * expansionRatio) - (expanded.length - str.length);
  return `[${expanded}${"~".repeat(Math.max(0, padLength))}]`;
}
function mirroredTransform(str) {
  return str.replace(/[a-zA-Z]/g, (ch) => MIRROR_MAP[ch] ?? ch);
}
function bracketedTransform(str) {
  return `[${str}]`;
}
/**
 * pseudoLocalize.
 * @param {string} str
 * @param {PseudoLocalizationMode} mode
 * @param {Partial<PseudoLocalizeOptions>} options
 * @returns {string}
 */
export function pseudoLocalize(str, mode, options) {
  switch (mode) {
    case "accented":
      return accentedTransform(str);
    case "expanded":
      return expandedTransform(str, options?.expansionRatio ?? 0.4);
    case "mirrored":
      return mirroredTransform(str);
    case "bracketed":
      return bracketedTransform(str);
  }
}
