import { useCallback } from "react";
import { useStockInfo } from "../contexts/stockContext";
import {
  getQuote,
  getCompanyProfile,
  getBasicFinancials,
  getReportedFinancials,
} from "../utils/requests";
import { roundToDecimal } from "../utils/functions";
import { getFCFperShareGrowth } from "../utils/functions";

/**
 * Custom hook for fetching stock data and updating the stock context.
 * This eliminates code duplication between components that need to fetch and set stock data.
 */
export const useStockData = () => {
  const { setCurrentStock } = useStockInfo();

  /**
   * Fetches essential stock data and updates the stock context.
   * Used by both detailsPage and searchBox for consistent data handling.
   *
   * @param symbol - The stock symbol to fetch data for
   * @returns Promise that resolves when stock context is updated
   */
  const fetchAndSetStockData = useCallback(
    async (symbol: string) => {
      try {
        // Fetch core data needed for stock context
        const [quote, companyProfile, basicFinancials, reportedFinancials] =
          await Promise.allSettled([
            getQuote(symbol),
            getCompanyProfile(symbol),
            getBasicFinancials(symbol),
            getReportedFinancials(symbol),
          ]);

        // Extract data from settled promises, providing fallbacks for failed requests
        const quoteData = quote.status === "fulfilled" ? quote.value : null;
        const profileData =
          companyProfile.status === "fulfilled" ? companyProfile.value : null;
        const basicFinancialsData =
          basicFinancials.status === "fulfilled" ? basicFinancials.value : null;
        const reportedFinancialsData =
          reportedFinancials.status === "fulfilled"
            ? reportedFinancials.value
            : null;

        // Update stock context with consistent data mapping
        setCurrentStock({
          logo: profileData?.logo,
          name: profileData?.name,
          ticker: profileData?.ticker || symbol,
          currency: profileData?.currency,
          price: quoteData?.c,
          change: quoteData?.d,
          changePercent: quoteData?.dp,
          epsTTM: basicFinancialsData?.metric?.epsTTM,
          peRatioTTM: basicFinancialsData?.metric?.peTTM,
          epsGrowthTTM: basicFinancialsData?.metric?.epsGrowthTTMYoy,
          fcfPerShareTTM:
            basicFinancialsData?.series?.quarterly?.fcfPerShareTTM?.[0]?.v,
          fcfYieldTTM: roundToDecimal(
            (basicFinancialsData?.series?.quarterly?.fcfPerShareTTM?.[0]?.v /
              (quoteData?.c || 1)) *
              100,
            2,
          ),
          fcfPerShareGrowthTTM: roundToDecimal(
            Number(
              getFCFperShareGrowth(
                basicFinancialsData?.series?.quarterly?.fcfPerShareTTM,
                1,
              ),
            ),
            2,
          ),
        });

        return {
          quoteData,
          profileData,
          basicFinancialsData,
          reportedFinancialsData,
        };
      } catch (error) {
        console.error("Error fetching stock data:", error);
        // Set minimal stock data even if detailed data fails
        setCurrentStock({
          ticker: symbol,
          name: symbol,
          price: 0,
          change: 0,
          changePercent: 0,
        });
        throw error;
      }
    },
    [setCurrentStock],
  );

  return {
    fetchAndSetStockData,
  };
};
