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
  const sign = amount < 0 ? "-" : "";
  const absAmount = Math.abs(amount);

  if (absAmount >= 1e12) {
    return `${sign}${(absAmount / 1e12).toFixed(2)}T`;
  } else if (absAmount >= 1e9) {
    return `${sign}${(absAmount / 1e9).toFixed(2)}B`;
  } else if (absAmount >= 1e6) {
    return `${sign}${(absAmount / 1e6).toFixed(2)}M`;
  } else {
    return `${sign}${absAmount}`;
  }
};

/**
 * Helper function that formats a string to display a specified string if the original string is empty or undefined.
 * @param str The string to validate
 * @param unit Optional unit to append to the string like "%", "$", etc.
 */
export const validateMetricsValue = (str: string | number | null, unit?: string) => {
  const notAvailable: string = "N/A";
  if (typeof str === "number") {
    str = str.toString();
  }

  if (str === undefined || str === null || str === "" || str === "null") {
    return notAvailable;
  } else {
    return unit === undefined ? `${str}` : `${str}${unit}`;
  }
}

/**
 * Formats a number as currency.
 * @param amount Number to format as currency
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
