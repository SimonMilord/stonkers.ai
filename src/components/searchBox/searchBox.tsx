import React, { useState } from "react";
import { Box, TextInput, Loader } from "@mantine/core";
import { useHistory } from "react-router-dom";

/**
 * SearchBox component that allows users to search for a stock symbol.
 * @param props variant: string
 * @returns
 */
export default function SearchBox(props: { variant: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && query !== "") {
      try {
        const queriedSymbol = await searchForSymbol(query);
        if (queriedSymbol !== null) {
          history.push(`/details/${queriedSymbol}`, { symbol: queriedSymbol });
        }
      } catch (error) {
        console.error(`Error searching for stock: ${query}`, error);
      }
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

    const symbolFound = findSymbolInResults(data);

    setLoading(false);
    return symbolFound;
  };

  /**
   * The API returns an array of objects and the first one is not always the most relevant.
   * This function will return the first symbol that matches the query or the first symbol in the array if no match is found.
   * @param data
   * @returns string
   */
  const findSymbolInResults = (data: any) => {
    try {
      const symbolToReturn = data.result.find((result: any) => {
        return result.symbol === query.toUpperCase();
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
          {loading && <Loader />}
        </>
      )}
    </Box>
  );
}
