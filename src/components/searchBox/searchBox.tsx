import React, { useState, useRef, useEffect } from "react";
import { Box, TextInput, Loader, ActionIcon } from "@mantine/core";
import { useHistory, useLocation } from "react-router-dom";
import { RiCloseLine } from "react-icons/ri";
import { useStockData } from "@hooks/useStockData";
import { getStockSymbol, validateSymbolSupport } from "@utils/requests";
import { sanitizeStockSymbol } from "@utils/validation";
import "./searchBox.css";

interface SearchBoxProps {
  variant: "standalone" | "header";
}

interface SearchState {
  query: string;
  searchedQuery: string;
  loading: boolean;
  noResultsFound: boolean;
  validationError: string;
}

const VALIDATION_MESSAGES = {
  INVALID_FORMAT:
    "Invalid symbol format. Please enter a valid stock symbol (1-10 characters, letters and numbers only).",
  NOT_SUPPORTED: (symbol: string) =>
    `Symbol "${symbol}" is not supported. Please try a different US listed stock.`,
  SEARCH_ERROR: "An error occurred while searching. Please try again.",
  NO_RESULTS: (query: string) => `No results found for: ${query}`,
} as const;

const INITIAL_SEARCH_STATE: SearchState = {
  query: "",
  searchedQuery: "",
  loading: false,
  noResultsFound: false,
  validationError: "",
};

const INPUT_CONFIG = {
  SIZE: "lg" as const,
  RADIUS: "md" as const,
  PLACEHOLDER: "Search for a stock",
  ARIA_LABEL: "Search box",
  CLEAR_ICON_SIZE: 16,
} as const;

const getInputVariant = (
  variant: SearchBoxProps["variant"]
): "unstyled" | "filled" => {
  return variant === "standalone" ? "unstyled" : "filled";
};

const shouldShowDropdown = (
  noResultsFound: boolean,
  validationError: string
): boolean => {
  return noResultsFound || !!validationError;
};

const getDropdownMessage = (
  validationError: string,
  searchedQuery: string
): string => {
  return validationError || VALIDATION_MESSAGES.NO_RESULTS(searchedQuery);
};

const useSearchState = () => {
  const [state, setState] = useState<SearchState>(INITIAL_SEARCH_STATE);

  const updateState = (updates: Partial<SearchState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const clearSearch = () => {
    setState((prev) => ({
      ...prev,
      query: "",
      searchedQuery: "",
      noResultsFound: false,
      validationError: "",
    }));
  };

  return {
    ...state,
    updateState,
    clearSearch,
  };
};

const useClickOutside = (
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

const useStockSearch = () => {
  const { fetchAndSetStockData } = useStockData();
  const history = useHistory();
  const location = useLocation();

  const searchForSymbol = async (symbol: string): Promise<string | null> => {
    try {
      return await getStockSymbol(symbol);
    } catch (error) {
      throw error;
    }
  };

  const handleSymbolFound = async (symbol: string) => {
    if (location.pathname === "/calculator") {
      await fetchAndSetStockData(symbol);
    } else {
      const validation = await validateSymbolSupport(symbol);

      if (validation.isSupported) {
        history.push(`/details/${symbol}`, { symbol });
      } else {
        throw new Error(VALIDATION_MESSAGES.NOT_SUPPORTED(symbol));
      }
    }
  };
  return {
    searchForSymbol,
    handleSymbolFound,
  };
};

const SearchInput: React.FC<{
  variant: SearchBoxProps["variant"];
  query: string;
  loading: boolean;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}> = React.memo(
  ({ variant, query, loading, onInputChange, onKeyDown, onClearSearch }) => (
    <TextInput
      variant={getInputVariant(variant)}
      radius={INPUT_CONFIG.RADIUS}
      size={INPUT_CONFIG.SIZE}
      placeholder={INPUT_CONFIG.PLACEHOLDER}
      aria-label={INPUT_CONFIG.ARIA_LABEL}
      value={query}
      onChange={onInputChange}
      onKeyDown={onKeyDown}
      rightSection={
        loading ? (
          <Loader size="sm" aria-label="Searching..." />
        ) : query ? (
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={onClearSearch}
            className="searchbox__clear-btn"
            aria-label="Clear search"
          >
            <RiCloseLine size={INPUT_CONFIG.CLEAR_ICON_SIZE} />
          </ActionIcon>
        ) : null
      }
    />
  )
);

const DropdownMessage: React.FC<{
  validationError: string;
  searchedQuery: string;
}> = React.memo(({ validationError, searchedQuery }) => (
  <div className="searchbox__dropdown">
    <div className="searchbox__dropdown-item" role="alert" aria-live="polite">
      {getDropdownMessage(validationError, searchedQuery)}
    </div>
  </div>
));

export default React.memo(function SearchBox({ variant }: SearchBoxProps) {
  const {
    query,
    searchedQuery,
    loading,
    noResultsFound,
    validationError,
    updateState,
    clearSearch,
  } = useSearchState();

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const { searchForSymbol, handleSymbolFound } = useStockSearch();

  // Handle click outside to close dropdown
  useClickOutside(searchBoxRef, () => {
    updateState({ noResultsFound: false, validationError: "" });
  });

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.currentTarget.value;
      const sanitized = sanitizeStockSymbol(newValue);

      if (sanitized !== null || newValue.trim() === "") {
        updateState({ query: newValue });
      }

      if (newValue.trim() === "") {
        updateState({ noResultsFound: false, validationError: "" });
      }
    },
    [updateState]
  );

  const handleKeyDown = React.useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;

      const sanitizedQuery = sanitizeStockSymbol(query.trim());
      if (!sanitizedQuery) {
        updateState({ validationError: VALIDATION_MESSAGES.INVALID_FORMAT });
        return;
      }

      updateState({
        loading: true,
        noResultsFound: false,
        validationError: "",
        searchedQuery: sanitizedQuery,
      });

      try {
        const foundSymbol = await searchForSymbol(sanitizedQuery);

        if (!foundSymbol) {
          updateState({
            loading: false,
            noResultsFound: true,
          });
          console.warn(`No symbol found for: ${sanitizedQuery}`);
          return;
        }

        await handleSymbolFound(foundSymbol);
        updateState({
          loading: false,
          query: sanitizedQuery,
        });
      } catch (error) {
        console.error(`Error searching for stock: ${sanitizedQuery}`, error);
        updateState({
          loading: false,
          validationError:
            error instanceof Error
              ? error.message
              : VALIDATION_MESSAGES.SEARCH_ERROR,
        });
      }
    },
    [query, updateState, searchForSymbol, handleSymbolFound]
  );

  const showDropdown = shouldShowDropdown(noResultsFound, validationError);

  return (
    <Box
      className="searchbox__container"
      ref={searchBoxRef}
      component="section"
      aria-label={`Stock search - ${variant} variant`}
    >
      <div
        className={`searchbox__input-wrapper ${
          showDropdown ? "dropdown-open" : ""
        }`}
      >
        <SearchInput
          variant={variant}
          query={query}
          loading={loading}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClearSearch={clearSearch}
        />
        {showDropdown && (
          <DropdownMessage
            validationError={validationError}
            searchedQuery={searchedQuery}
          />
        )}
      </div>
    </Box>
  );
});
