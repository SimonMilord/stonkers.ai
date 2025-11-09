import { useState, useCallback } from "react";
import { Holding } from "../components/portfolioItem/portfolioItem";
import { StockSearchResult } from "../hooks/useStockSearch";

/**
 * Custom hook for managing portfolio holdings state and operations.
 * @returns Object containing portfolio holdings state and functions to manipulate it.
 */
export const usePortfolioHoldings = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);

  const removeFromHoldings = useCallback((ticker: string) => {
    setHoldings((prev) => prev.filter((item) => item.ticker !== ticker));
    // TODO: Update backend accordingly
  }, []);

  const updateShares = useCallback((ticker: string, newShares: number) => {
    setHoldings((prev) =>
      prev.map((item) =>
        item.ticker === ticker ? { ...item, shares: newShares } : item
      )
    );
    // TODO: Update backend accordingly
  }, []);

  const updateCostBasis = useCallback(
    (ticker: string, newCostBasis: number) => {
      setHoldings((prev) =>
        prev.map((item) => {
          if (item.ticker === ticker) {
            // For cash positions, also update currentPrice to match costBasis
            if (item.type === "cash") {
              return {
                ...item,
                costBasis: newCostBasis,
                currentPrice: newCostBasis,
              };
            }
            return { ...item, costBasis: newCostBasis };
          }
          return item;
        })
      );
      // TODO: Update backend accordingly
    },
    []
  );

  const addStockHolding = useCallback(
    (foundStock: StockSearchResult, shares: number, avgPricePaid: number) => {
      const newHolding: Holding = {
        ticker: foundStock.ticker,
        name: foundStock.name,
        shares,
        costBasis: avgPricePaid,
        currentPrice: foundStock.currentPrice,
        logo: foundStock.logo,
        type: "stock",
      };

      setHoldings((prev) => [...prev, newHolding]);
    },
    []
  );

  const addCashHolding = useCallback((cashAmount: number) => {
    const cashHolding: Holding = {
      ticker: "USD",
      name: "Cash",
      shares: 1, // For cash, we use 1 share
      costBasis: cashAmount,
      currentPrice: cashAmount, // Cash value equals current price
      logo: "https://flagcdn.com/w320/us.png",
      type: "cash",
      currency: "USD",
    };

    setHoldings((prev) => [...prev, cashHolding]);
  }, []);

  return {
    holdings,
    setHoldings,
    removeFromHoldings,
    updateShares,
    updateCostBasis,
    addStockHolding,
    addCashHolding,
  };
};
