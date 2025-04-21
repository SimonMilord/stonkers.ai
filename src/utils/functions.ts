/**
 * Helper function that returns a number rounded to a given number of decimal places.
 * If no decimalPlaces are provided, it defaults to 2.
 * @param num Number to round
 * @param decimalPlaces Number of decimal places to round to
 */
export const roundToDecimal = (num: number, decimalPlaces: number) => {
  if (isNaN(num)) {
    return num;
  }

  if (!decimalPlaces || decimalPlaces < 0) {
    decimalPlaces = 2;
  }
  return Number(num.toFixed(decimalPlaces));
}

/**
 * Helper function that formats a number into a dollar amount with appropriate suffixes (T, B, M).
 */
export const formatDollarAmount = (amount: number) => {
  if (amount >= 1e12) {
    return `${(amount / 1e12).toFixed(2)}T`;
  } else if (amount >= 1e9) {
    return `${(amount / 1e9).toFixed(2)}B`;
  } else if (amount >= 1e6) {
    return `${(amount / 1e6).toFixed(2)}M`;
  } else {
    return `${amount}`;
  }
};