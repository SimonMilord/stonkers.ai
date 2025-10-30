import React, { useState } from "react";
import { Box, TextInput, Loader, Text } from "@mantine/core";
import { useHistory, useLocation } from "react-router-dom";
import { useStockInfo } from "../../contexts/stockContext";
import { getQuote, getCompanyProfile, getBasicFinancials, getReportedFinancials } from "../../utils/requests";
import { roundToDecimal } from "../../utils/functions";
import { getFCFperShareGrowth } from "../../utils/metrics";

/**
 * SearchBox component that allows users to search for a stock symbol.
 * @param props variant: string - The variant of the search box. It can be "standalone" or "header".
 * @returns
 */
export default function SearchBox(props: { variant: string }) {
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const { setCurrentStock } = useStockInfo();

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const trimmedQuery = query.trim();
    if (event.key === "Enter" && trimmedQuery !== "") {
      setNoResultsFound(false);

      try {
        const queriedSymbol = await searchForSymbol(trimmedQuery);
        setSearchedQuery(trimmedQuery);
        // This check avoids the situation where a query like "amamaz" sends a request with a [object, object] value.
        if (queriedSymbol !== null) {
          // Check current location and navigate accordingly
          if (location.pathname === '/calculator') {
            // If on calculator page, fetch stock data and update context without navigation
            await fetchAndSetStockData(queriedSymbol);
          } else {
            // Default behavior - navigate to details page
            history.push(`/details/${queriedSymbol}`, { symbol: queriedSymbol });
          }
        } else {
          console.warn(
            `No symbol found for: ${trimmedQuery}. Please try again with a different symbol.`
          );
          setNoResultsFound(true);
        }
      } catch (error) {
        console.error(`Error searching for stock: ${trimmedQuery}`, error);
      }
      setQuery(trimmedQuery);
    }
  };

  /**
   * This function will search for a stock symbol using the Finnhub API and return the symbol.
   * @param symbol
   * @returns string
   */
  const searchForSymbol = async (symbol: string) => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_FINNHUB_API_URL;
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    const request = {
      method: "GET",
      headers: {
        "X-Finnhub-Token": apiKey,
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`${apiUrl}/search?q=${symbol}`, request);
    if (!response.ok) {
      throw new Error(
        "Unable complete network request for this symbol: " + query
      );
    }

    const data = await response.json();
    if (data?.count === 0) {
      console.warn(`No symbol found for: ${query}`);
      setLoading(false);
      return null;
    }

    const symbolFound: string = findSymbolInResults(data, symbol);
    setLoading(false);
    return symbolFound;
  };

  /**
   * The API returns an array of objects and the first one is not always the most relevant.
   * This function will return the first symbol that matches the query or the first symbol in the array if no match is found.
   * @param data
   * @returns string
   */
  const findSymbolInResults = (data: any, symbol: string): string => {
    try {
      const symbolToReturn = data.result.find((result: any) => {
        return result.symbol === symbol.toUpperCase();
      });
      return symbolToReturn.symbol;
    } catch (error) {
      return data.result[0];
    }
  };

  /**
   * Fetch stock data and update the stock context for calculator page
   * @param symbol
   */
  const fetchAndSetStockData = async (symbol: string) => {
    try {
      const [quote, companyProfile, basicFinancials, reportedFinancials] = await Promise.all([
        getQuote(symbol),
        getCompanyProfile(symbol),
        getBasicFinancials(symbol),
        getReportedFinancials(symbol)
      ]);

      setCurrentStock({
        logo: companyProfile?.logo,
        name: companyProfile?.name,
        ticker: companyProfile?.ticker || symbol,
        currency: companyProfile?.currency,
        price: quote?.c,
        change: quote?.d,
        changePercent: quote?.dp,
        // Use the same mapping as detailsPage for consistency
        epsTTM: basicFinancials?.metric?.epsTTM,
        peRatioTTM: basicFinancials?.metric?.peTTM,
        epsGrowthTTM: basicFinancials?.metric?.epsGrowthTTMYoy,
        fcfPerShareTTM: basicFinancials?.series?.quarterly?.fcfPerShareTTM?.[0]?.v,
        fcfYieldTTM: roundToDecimal(
          (basicFinancials?.series?.quarterly?.fcfPerShareTTM?.[0]?.v / quote?.c) * 100,
          2
        ),
        fcfPerShareGrowthTTM: roundToDecimal(
          Number(getFCFperShareGrowth(basicFinancials?.series?.quarterly?.fcfPerShareTTM, 1)),
          2
        ),
      });
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };  return (
    <Box className="searchbox__container">
      {props.variant === "standalone" && (
        <>
          <TextInput
            variant="unstyled"
            radius="xl"
            size="lg"
            placeholder="Search for a stock"
            aria-label="Search box"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
          {noResultsFound && (<Text style={{ color: "red" }}>No results found for: {searchedQuery} </Text>)}
          {loading && <Loader />}
        </>
      )}
      {props.variant === "header" && (
        <>
          <TextInput
            variant="filled"
            radius="xl"
            size="lg"
            placeholder="Search for a stock"
            aria-label="Search box"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
          {noResultsFound && (<Text style={{ color: "red" }}>No results found for: {searchedQuery} </Text>)}
          {loading && <Loader />}
        </>
      )}
    </Box>
  );
}
