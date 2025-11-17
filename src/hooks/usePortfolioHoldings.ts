import { useState, useCallback } from "react";
import { useDebouncedCallback } from "@mantine/hooks";
import { Holding } from "../components/portfolioItem/portfolioItem";
import { StockSearchResult } from "../hooks/useStockSearch";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom hook for managing portfolio holdings state and operations.
 * @returns Object containing portfolio holdings state and functions to manipulate it.
 */
export const usePortfolioHoldings = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);

  // Debounced backend update function
  const debouncedBackendUpdate = useDebouncedCallback(
    async (ticker: string, newShares: number, newCostBasis: number) => {
      try {
        const response = await fetch(`${backendUrl}/portfolio/${ticker}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            portfolioName: "My Portfolio",
            updates: {
              shares: newShares,
              costBasis: newCostBasis,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend update failed:", errorData);
        }
      } catch (error) {
        console.error(`Failed to update shares for ${ticker}:`, error);
      }
    },
    500 // 500ms delay
  );

  const removeFromHoldings = useCallback(async (ticker: string) => {
    setHoldings((prev) => prev.filter((item) => item.ticker !== ticker));
    try {
      await fetch(`${backendUrl}/portfolio/${ticker}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      throw new Error(`Failed to remove ${ticker} from Portfolio`);
    }
  }, []);

  const updateHolding = useCallback(
    (ticker: string, newShares: number, newCostBasis: number) => {
      setHoldings((prev) =>
        prev.map((item) => {
          if (item.ticker === ticker) {
            // For cash holdings, also update currentPrice to match costBasis
            if (item.type === "cash") {
              return {
                ...item,
                shares: newShares,
                costBasis: newCostBasis,
                currentPrice: newCostBasis, // Cash value equals current price
              };
            }
            return { ...item, shares: newShares, costBasis: newCostBasis };
          }
          return item;
        })
      );

      debouncedBackendUpdate(ticker, newShares, newCostBasis);
    },
    [debouncedBackendUpdate]
  );

  const addStockHolding = useCallback(
    (foundStock: StockSearchResult, shares: number, avgPricePaid: number) => {
      setHoldings((prev) => {
        // Check if stock holding already exists
        const existingStockIndex = prev.findIndex(
          (holding) =>
            holding.ticker === foundStock.ticker && holding.type === "stock"
        );

        if (existingStockIndex !== -1) {
          // Add to existing stock holding with weighted average cost basis
          const updatedHoldings = [...prev];
          const existingStock = updatedHoldings[existingStockIndex];

          const currentTotalValue =
            existingStock.shares * existingStock.costBasis;
          const newTotalValue = shares * avgPricePaid;
          const totalShares = existingStock.shares + shares;
          const weightedAvgCostBasis =
            (currentTotalValue + newTotalValue) / totalShares;

          updatedHoldings[existingStockIndex] = {
            ...existingStock,
            shares: totalShares,
            costBasis: weightedAvgCostBasis,
            currentPrice: foundStock.currentPrice, // Update current price
          };

          return updatedHoldings;
        } else {
          // Create new stock holding
          const newHolding: Holding = {
            ticker: foundStock.ticker,
            name: foundStock.name,
            shares,
            costBasis: avgPricePaid,
            currentPrice: foundStock.currentPrice,
            logo: foundStock.logo,
            type: "stock",
          };

          return [...prev, newHolding];
        }
      });
    },
    []
  );

  const addCashHolding = useCallback((cashAmount: number) => {
    setHoldings((prev) => {
      // Check if USD cash holding already exists
      const existingCashIndex = prev.findIndex(
        (holding) => holding.ticker === "USD" && holding.type === "cash"
      );

      if (existingCashIndex !== -1) {
        // Add to existing cash holding
        const updatedHoldings = [...prev];
        const existingCash = updatedHoldings[existingCashIndex];
        const newCashAmount = existingCash.costBasis + cashAmount;

        updatedHoldings[existingCashIndex] = {
          ...existingCash,
          costBasis: newCashAmount,
          currentPrice: newCashAmount,
        };

        return updatedHoldings;
      } else {
        // Create new cash holding
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

        return [...prev, cashHolding];
      }
    });
  }, []);

  return {
    holdings,
    setHoldings,
    removeFromHoldings,
    updateHolding,
    addStockHolding,
    addCashHolding,
  };
};
