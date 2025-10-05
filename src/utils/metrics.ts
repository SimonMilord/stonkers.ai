import { roundToDecimal } from "./functions";

/**
 * Get the Free Cash Flow per Share (FCF/Sh) growth over a specified period.
 * @param fcfPerShareArray - Array of FCF/Sh values. Ex: basicFinancialData?.series?.quarterly?.fcfPerShareTTM
 * @param period {number} - The number of years to calculate growth for.
 * @returns The FCF/Sh growth rate as a percentage.
 */
export const getFCFperShareGrowth = (fcfPerShareArray: any[], period: number): number | null => {
    const previousIndex: number = 4 * period;

    const latestFCFperShValue = fcfPerShareArray && fcfPerShareArray[0]?.v;
    const previousFCFperShValue =
      fcfPerShareArray && fcfPerShareArray[previousIndex]?.v;

    if (latestFCFperShValue > 0 && previousFCFperShValue > 0) {
      const fcfCagr =
        ((latestFCFperShValue / previousFCFperShValue) ** (1 / period) - 1) *
        100;
      return roundToDecimal(fcfCagr, 2);
    } else {
      return null;
    }
  };
