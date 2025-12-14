import { safeRoundToDecimal } from "./functions";

export interface FormValues {
  fcfPerShare: number;
  fcfGrowthRate: number;
  targetFcfYield: number;
  desiredReturn: number;
  eps: number;
  epsGrowthRate: number;
  targetPeRatio: number;
}

export interface CalculationResults {
  fairValue: number;
  currentPrice: number;
  targetPrice5yr: number;
  projectedCagr: number;
}

export interface CalculationParams {
  currentPrice: number;
  formValues: FormValues;
  isEPSMethod: boolean;
}

export const DEFAULT_DESIRED_RETURN = 15;
export const DECIMAL_PLACES = 2;
export const PROJECTION_YEARS = 5;

/**
 * Calculates stock valuation using the EPS (Earnings Per Share) method.
 * @param eps Current earnings per share
 * @param epsGrowthRate Expected annual EPS growth rate (percentage)
 * @param targetPeRatio Target price-to-earnings ratio
 * @param desiredReturn Desired annual return (percentage)
 * @returns Object containing target price and discount rate
 */
export const calculateEPSMethod = (
  eps: number,
  epsGrowthRate: number,
  targetPeRatio: number,
  desiredReturn: number
) => {
  const epsYr5 = eps * Math.pow(1 + epsGrowthRate / 100, PROJECTION_YEARS);
  const targetPrice5yr = epsYr5 * targetPeRatio;
  return { targetPrice5yr, discountRate: desiredReturn };
};

/**
 * Calculates stock valuation using the FCF (Free Cash Flow) method.
 * @param fcfPerShare Current free cash flow per share
 * @param fcfGrowthRate Expected annual FCF growth rate (percentage)
 * @param targetFcfYield Target free cash flow yield (percentage)
 * @param desiredReturn Desired annual return (percentage)
 * @returns Object containing target price and discount rate
 */
export const calculateFCFMethod = (
  fcfPerShare: number,
  fcfGrowthRate: number,
  targetFcfYield: number,
  desiredReturn: number
) => {
  const futureFcf = fcfPerShare * Math.pow(1 + fcfGrowthRate / 100, PROJECTION_YEARS);
  const targetPrice5yr = futureFcf / (targetFcfYield / 100);
  return { targetPrice5yr, discountRate: desiredReturn };
};

/**
 * Calculates the projected Compound Annual Growth Rate (CAGR).
 * @param targetPrice5yr Target price in 5 years
 * @param currentPrice Current stock price
 * @returns Projected CAGR as a percentage
 */
export const calculateProjectedCAGR = (targetPrice5yr: number, currentPrice: number): number => {
  if (currentPrice <= 0) return 0;
  return (Math.pow(targetPrice5yr / currentPrice, 1 / PROJECTION_YEARS) - 1) * 100;
};

/**
 * Performs the complete stock valuation calculation.
 * @param params Calculation parameters including current price, form values, and method
 * @returns Complete calculation results with fair value, target price, and projected CAGR
 */
export const performCalculation = ({ currentPrice, formValues, isEPSMethod }: CalculationParams): CalculationResults => {
  let calculation;
  
  if (isEPSMethod) {
    calculation = calculateEPSMethod(
      formValues.eps,
      formValues.epsGrowthRate,
      formValues.targetPeRatio,
      formValues.desiredReturn
    );
  } else {
    calculation = calculateFCFMethod(
      formValues.fcfPerShare,
      formValues.fcfGrowthRate,
      formValues.targetFcfYield,
      formValues.desiredReturn
    );
  }

  const { targetPrice5yr, discountRate } = calculation;
  const fairValue = targetPrice5yr / Math.pow(1 + discountRate / 100, PROJECTION_YEARS);
  const projectedCagr = calculateProjectedCAGR(targetPrice5yr, currentPrice);

  return {
    fairValue: safeRoundToDecimal(fairValue, DECIMAL_PLACES),
    currentPrice: safeRoundToDecimal(currentPrice, DECIMAL_PLACES),
    targetPrice5yr: safeRoundToDecimal(targetPrice5yr, DECIMAL_PLACES),
    projectedCagr: safeRoundToDecimal(projectedCagr, DECIMAL_PLACES),
  };
};

/**
 * Creates initial form values based on current stock data.
 * @param currentStock Stock data object
 * @returns FormValues object with initialized values
 */
export const createInitialFormValues = (currentStock: any): FormValues => ({
  fcfPerShare: safeRoundToDecimal(currentStock?.fcfPerShareTTM, DECIMAL_PLACES),
  fcfGrowthRate: safeRoundToDecimal(currentStock?.fcfPerShareGrowthTTM, DECIMAL_PLACES),
  targetFcfYield: safeRoundToDecimal(currentStock?.fcfYieldTTM, DECIMAL_PLACES),
  desiredReturn: DEFAULT_DESIRED_RETURN,
  eps: safeRoundToDecimal(currentStock?.epsTTM, DECIMAL_PLACES),
  epsGrowthRate: safeRoundToDecimal(currentStock?.epsGrowthTTM, DECIMAL_PLACES),
  targetPeRatio: safeRoundToDecimal(currentStock?.peRatioTTM, DECIMAL_PLACES),
});
