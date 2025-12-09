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
};

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
export const validateMetricsValue = (
  str: string | number | null,
  unit?: string,
) => {
  const notAvailable: string = "N/A";
  if (typeof str === "number") {
    str = str.toString();
  }

  if (str === undefined || str === null || str === "" || str === "null") {
    return notAvailable;
  } else {
    return unit === undefined ? `${str}` : `${str}${unit}`;
  }
};

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

/**
 * Get the Free Cash Flow per Share (FCF/Sh) growth over a specified period.
 * @param fcfPerShareArray - Array of FCF/Sh values. Ex: basicFinancialData?.series?.quarterly?.fcfPerShareTTM
 * @param period {number} - The number of years to calculate growth for.
 * @returns The FCF/Sh growth rate as a percentage.
 */
export const getFCFperShareGrowth = (
  fcfPerShareArray: any[],
  period: number,
): number | null => {
  const previousIndex: number = 4 * period;

  const latestFCFperShValue = fcfPerShareArray && fcfPerShareArray[0]?.v;
  const previousFCFperShValue =
    fcfPerShareArray && fcfPerShareArray[previousIndex]?.v;

  if (latestFCFperShValue > 0 && previousFCFperShValue > 0) {
    const fcfCagr =
      ((latestFCFperShValue / previousFCFperShValue) ** (1 / period) - 1) * 100;
    return roundToDecimal(fcfCagr, 2);
  } else {
    return null;
  }
};

/**
 * Formats a UNIX timestamp to DD-MM-YYYY format
 * @param timestamp UNIX timestamp
 * @returns Formatted date string in DD-MM-YYYY format
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000)
    .toISOString()
    .split("T")[0]
    .split("-")
    .reverse()
    .join("-");
};
