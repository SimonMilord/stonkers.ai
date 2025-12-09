import { useState, useMemo } from "react";
import { Holding } from "../components/portfolioItem/portfolioItem";

export type SortField =
  | "name"
  | "shares"
  | "costBasis"
  | "currentPrice"
  | "marketValue"
  | "gainLoss"
  | "gainLossPercent"
  | "weight";

export type SortDirection = "asc" | "desc" | null;

// Portfolio calculation functions
export const calculateTotalMarketValue = (holdings: Holding[]): number => {
  return holdings.reduce(
    (acc, item) => acc + item.shares * item.currentPrice,
    0,
  );
};

export const calculateTotalGainLoss = (holdings: Holding[]): number => {
  return holdings.reduce(
    (acc, item) => acc + item.shares * (item.currentPrice - item.costBasis),
    0,
  );
};

export const calculateTotalCashPosition = (holdings: Holding[]): number => {
  return holdings
    .filter((holding) => holding.type === "cash")
    .reduce((acc, item) => acc + item.shares * item.currentPrice, 0);
};

// Sorting utility functions
const getSortValue = (
  holding: Holding,
  field: SortField,
  totalPortfolioValue: number,
) => {
  const valueMap = {
    name: holding.name.toLowerCase(),
    shares: holding.shares,
    costBasis: holding.costBasis,
    currentPrice: holding.currentPrice,
    marketValue: holding.shares * holding.currentPrice,
    gainLoss: holding.shares * (holding.currentPrice - holding.costBasis),
    gainLossPercent:
      ((holding.currentPrice - holding.costBasis) / holding.costBasis) * 100,
    weight:
      ((holding.shares * holding.currentPrice) / totalPortfolioValue) * 100,
  };
  return valueMap[field];
};

const sortHoldings = (
  holdings: Holding[],
  field: SortField | null,
  direction: SortDirection,
) => {
  if (!field || !direction) return holdings;

  const totalPortfolioValue = calculateTotalMarketValue(holdings);

  return [...holdings].sort((a, b) => {
    const aValue = getSortValue(a, field, totalPortfolioValue);
    const bValue = getSortValue(b, field, totalPortfolioValue);

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Custom hook for sorting portfolio holdings.
 * @param holdings - Array of portfolio holdings
 * @returns Object containing sorting state and functions.
 */
export const usePortfolioSorting = (holdings: Holding[]) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Same field clicked, cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      // New field clicked, start with ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedHoldings = useMemo(() => {
    return sortHoldings(holdings, sortField, sortDirection);
  }, [holdings, sortField, sortDirection]);

  // Chart always shows holdings sorted by weight (descending) regardless of table sorting
  const chartHoldings = useMemo(() => {
    return sortHoldings(holdings, "weight", "desc");
  }, [holdings]);

  return {
    sortField,
    sortDirection,
    sortedHoldings,
    chartHoldings,
    handleSort,
    setSortField,
    setSortDirection,
  };
};
