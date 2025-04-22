/**
 * Helper function that returns a number rounded to a given number of decimal places.
 * If no decimalPlaces are provided, it defaults to 2.
 * @param num Number to round
 * @param decimalPlaces Number of decimal places to round to
 */
export const roundToDecimal = (num: number, decimalPlaces: number): number => {
  if (isNaN(num) || num === undefined || num === null) {
    return null;
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

/**
 * Helper function that formats a string to display a specified string if the original string is empty or undefined.
 * @param str The string to validate
 * @param unit Optional unit to append to the string like "%", "$", etc.
 */
export const validateMetricsValue = (str: string | number, unit?: string) => {
  const notAvailable: string = "N/A";
  if (typeof str === "number") {
    str = str.toString();
  }

  console.log('str', str);
  if (str === undefined || str === null || str === "") {
    return notAvailable;
  } else {
    return unit === undefined ? `${str}` : `${str}${unit}`;
  }
}