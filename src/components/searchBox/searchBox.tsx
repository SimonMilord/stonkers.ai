import React, { useState, useRef, useEffect } from "react";
import { Box, TextInput, Loader, ActionIcon } from "@mantine/core";
import { useHistory, useLocation } from "react-router-dom";
import { useStockData } from "../../hooks/useStockData";
import { getStockSymbol, validateSymbolSupport } from "../../utils/requests";
import { RiCloseLine } from "react-icons/ri";
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
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const location = useLocation();
  const { fetchAndSetStockData } = useStockData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setNoResultsFound(false);
        setValidationError("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearSearch = () => {
    setQuery("");
    setSearchedQuery("");
    setNoResultsFound(false);
    setValidationError("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;
    setQuery(newValue);
    
    // Close dropdown if input is cleared
    if (newValue.trim() === "") {
      setNoResultsFound(false);
      setValidationError("");
    }
  };

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
        if (location.pathname === "/calculator" && !!queriedSymbol) {
          // If on calculator page, fetch stock data and update context without navigation
          await fetchAndSetStockData(queriedSymbol);
        } else {
          // For navigation to details page, validate symbol support first
          const validation = await validateSymbolSupport(queriedSymbol);

          if (validation.isSupported && !!queriedSymbol) {
            // Symbol is fully supported, proceed with navigation
            history.push(`/details/${queriedSymbol}`, {
              symbol: queriedSymbol,
            });
          } else {
            // Symbol is not fully supported, show error message
            setValidationError(
              `Symbol "${trimmedQuery}" is not supported. Please try a different US listed stock.`
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
    <Box className="searchbox__container" ref={searchBoxRef}>
      {props.variant === "standalone" && (
        <>
          <div
            className={`searchbox__input-wrapper ${
              noResultsFound || validationError ? "dropdown-open" : ""
            }`}
          >
            <TextInput
              variant="unstyled"
              radius="md"
              size="lg"
              placeholder="Search for a stock"
              aria-label="Search box"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rightSection={
                loading ? (
                  <Loader size="sm" />
                ) : query ? (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={clearSearch}
                    className="searchbox__clear-btn"
                  >
                    <RiCloseLine size={16} />
                  </ActionIcon>
                ) : null
              }
            />
            {(noResultsFound || validationError) && (
              <div className="searchbox__dropdown">
                <div className="searchbox__dropdown-item">
                  {validationError || `No results found for: ${searchedQuery}`}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {props.variant === "header" && (
        <>
          <div
            className={`searchbox__input-wrapper ${
              noResultsFound || validationError ? "dropdown-open" : ""
            }`}
          >
            <TextInput
              variant="filled"
              radius="md"
              size="lg"
              placeholder="Search for a stock"
              aria-label="Search box"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rightSection={
                loading ? (
                  <Loader size="sm" />
                ) : query ? (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={clearSearch}
                    className="searchbox__clear-btn"
                  >
                    <RiCloseLine size={16} />
                  </ActionIcon>
                ) : null
              }
            />
            {(noResultsFound || validationError) && (
              <div className="searchbox__dropdown">
                <div className="searchbox__dropdown-item">
                  {validationError || `No results found for: ${searchedQuery}`}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Box>
  );
}
