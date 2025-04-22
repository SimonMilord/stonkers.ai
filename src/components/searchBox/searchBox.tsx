import React, { useState } from "react";
import { Box, TextInput, Loader, Text } from "@mantine/core";
import { useHistory } from "react-router-dom";

/**
 * SearchBox component that allows users to search for a stock symbol.
 * @param props variant: string
 * @returns
 */
export default function SearchBox(props: { variant: string }) {
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const history = useHistory();

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
          history.push(`/details/${queriedSymbol}`, { symbol: queriedSymbol });
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
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
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
