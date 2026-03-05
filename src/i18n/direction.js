// @ts-check

/**
 * SigUI core i18n module for direction.
 * @module
 */
export const RTL_LOCALES = [
  "ar",
  "fa",
  "ur",
  "he",
  "yi",
  "ps",
  "sd"
];
/**
 * isRTLLocale.
 * @param {string} locale
 * @returns {boolean}
 */
export function isRTLLocale(locale) {
  const primary = locale.split("-")[0].toLowerCase();
  return RTL_LOCALES.includes(primary);
}
/**
 * getLocaleDirection.
 * @param {string} locale
 * @returns {TextDirection}
 */
export function getLocaleDirection(locale) {
  return isRTLLocale(locale) ? "rtl" : "ltr";
}
