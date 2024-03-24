/**
 *
 * @param kr - integer number
 * @returns - formatted price string using comma as decimal separator and
 * dots as thousand separator
 *
 * @public
 */
export const krToDecimalString = (kr: number): string => {
  const priceString = kr.toFixed(2).toString();
  const decimalPart = priceString.split('.')[1];
  const integerPart = priceString.split('.')[0].replace(/(.)(?=(\d{3})+$)/g, '$1.');

  return integerPart + ',' + decimalPart;
};
/**
 *
 * @param oere - integer number
 * @returns - formatted price string using comma as decimal separator and
 * dots as thousand separator
 *
 * @public
 */
export const oereToDecimalString = (oere: number): string => {
  return krToDecimalString(oere / 100);
};
