import React, { useState } from "react";
import { Box, TextInput, Loader, Text } from "@mantine/core";
import { useHistory, useLocation } from "react-router-dom";
import { useStockData } from "../../hooks/useStockData";
import { getStockSymbol, validateSymbolSupport } from "../../utils/requests";
import "./searchBox.css";

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
  const [validationError, setValidationError] = useState<string>("");
  const history = useHistory();
  const location = useLocation();
  const { fetchAndSetStockData } = useStockData();

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const trimmedQuery = query.trim();
    if (event.key === "Enter" && trimmedQuery !== "") {
      setNoResultsFound(false);
      setValidationError("");

      try {
        const queriedSymbol = await searchForSymbol(trimmedQuery);
        setSearchedQuery(trimmedQuery);

        if (queriedSymbol === null) {
          console.warn(
            `No symbol found for: ${trimmedQuery}. Please try again with a different symbol.`
          );
          setNoResultsFound(true);
        }
        // Check current location and handle accordingly
        if (location.pathname === "/calculator") {
          // If on calculator page, fetch stock data and update context without navigation
          await fetchAndSetStockData(queriedSymbol);
        } else {
          // For navigation to details page, validate symbol support first
          const validation = await validateSymbolSupport(queriedSymbol);

          if (validation.isSupported) {
            // Symbol is fully supported, proceed with navigation
            history.push(`/details/${queriedSymbol}`, {
              symbol: queriedSymbol,
            });
          } else {
            // Symbol is not fully supported, show error message
            setValidationError(
              `Symbol "${queriedSymbol}" is not supported. Please try a different US listed stock.`
            );
            console.warn("Symbol validation failed:", validation);
          }
        }
      } catch (error) {
        console.error(`Error searching for stock: ${trimmedQuery}`, error);
        setValidationError(
          "An error occurred while searching. Please try again."
        );
      }
      setQuery(trimmedQuery);
    }
  };

  /**
   * This function will search for a stock symbol using the Finnhub API and return the symbol.
   * @param symbol
   * @returns string | null
   */
  const searchForSymbol = async (symbol: string): Promise<string | null> => {
    setLoading(true);
    try {
      const symbolFound = await getStockSymbol(symbol);
      setLoading(false);
      return symbolFound;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return (
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
            rightSection={loading && <Loader size="sm" />}
          />
          {(noResultsFound || validationError) && (
            <Text className="searchbox__error">
              {validationError || `No results found for: ${searchedQuery}`}
            </Text>
          )}
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
            rightSection={loading && <Loader size="sm" />}
          />
          {(noResultsFound || validationError) && (
            <Text className="searchbox__error">
              {validationError || `No results found for: ${searchedQuery}`}
            </Text>
          )}
        </>
      )}
    </Box>
  );
}
