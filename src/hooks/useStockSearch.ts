import { useState, useCallback } from "react";
import { getQuote, getCompanyProfile, getStockSymbol } from "../utils/requests";

export interface StockSearchResult {
  ticker: string;
  name: string;
  currentPrice: number;
  logo: string;
}

/**
 * Handles searching for stocks by their ticker symbol.
 * @returns Custom hook for searching stocks by symbol.
 */
export const useStockSearch = () => {
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundStock, setFoundStock] = useState<StockSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string>("");

  const searchForStock = useCallback(async (symbol: string) => {
    if (!symbol.trim()) {
      setFoundStock(null);
      setSearchError("");
      return;
    }

    setSearchLoading(true);
    setSearchError("");

    try {
      // Use the backend search function
      const symbolFound = await getStockSymbol(symbol);

      if (symbolFound) {
        try {
          // Fetch additional stock data with individual error handling
          const [quote, companyProfile] = await Promise.allSettled([
            getQuote(symbolFound),
            getCompanyProfile(symbolFound),
          ]);

          // Extract data from settled promises, providing fallbacks for failed requests
          const quoteData = quote.status === "fulfilled" ? quote.value : null;
          const profileData =
            companyProfile.status === "fulfilled" ? companyProfile.value : null;

          setFoundStock({
            ticker: symbolFound,
            name: profileData?.name || `${symbolFound} Company`,
            currentPrice: quoteData?.c || 0,
            logo: profileData?.logo || "",
          });
          setSearchError("");
        } catch (dataError) {
          // If we can't get quote/profile data, still show the found symbol but with limited info
          console.warn("Error fetching additional stock data:", dataError);
          setFoundStock({
            ticker: symbolFound,
            name: `${symbolFound} Company`,
            currentPrice: 0,
            logo: "",
          });
          setSearchError(""); // Clear any previous errors since we found the symbol
        }
      } else {
        setFoundStock(null);
        setSearchError(`No stock found with ticker "${symbol.toUpperCase()}"`);
      }
    } catch (error: any) {
      console.error("Error searching for stock:", error);
      setFoundStock(null);

      // Handle different types of errors more gracefully
      if (error.message && error.message.includes("404")) {
        setSearchError(`Stock "${symbol.toUpperCase()}" not found.`);
      } else if (error.message && error.message.includes("network")) {
        setSearchError(
          `Network error. Please check your connection and try again.`
        );
      } else {
        setSearchError(
          `Error searching for "${symbol.toUpperCase()}". Please try again.`
        );
      }
    }

    setSearchLoading(false);
  }, []);

  const clearSearch = useCallback(() => {
    setFoundStock(null);
    setSearchError("");
  }, []);

  return {
    searchLoading,
    foundStock,
    searchError,
    searchForStock,
    clearSearch,
  };
};
