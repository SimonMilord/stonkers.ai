import React, { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "./layout";
import { Grid, Title, Box, Group, Loader, Center, Card, Button, Text } from "@mantine/core";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { notifications } from "@mantine/notifications";
import { Holding } from "@components/portfolioItem/portfolioItem";
import PortfolioPieChart from "@components/portfolioPieChart/portfolioPieChart";
import DataCard from "@components/dataCard/dataCard";
import AddHoldingForm from "@components/addHoldingForm/addHoldingForm";
import PortfolioTable from "@components/portfolioTable/portfolioTable";
import "./portfolioPage.css";
import {
  usePortfolioSorting,
  calculateTotalMarketValue,
  calculateTotalGainLoss,
  calculateTotalCashPosition,
} from "@hooks/usePortfolioSorting";
import { usePortfolioHoldings } from "@hooks/usePortfolioHoldings";
import { getBulkQuotes, getQuote } from "../utils/requests";

const DEFAULT_ORDER_INDEX = 999;
const CASH_LOGO_URL = "https://flagcdn.com/w320/us.png";
const CASH_CURRENCY = "USD";
const CASH_TICKER = "USD";
const CASH_NAME = "Cash";

interface PortfolioMetric {
  label: string;
  value: number | string;
}

interface PortfolioHoldingResponse {
  data: Array<{
    holdingType: 'stock' | 'cash';
    ticker?: string;
    companyName: string;
    shares?: string;
    costBasis: string;
    logo?: string;
    orderIndex?: number;
  }>;
}

interface BulkQuoteResponse {
  data: Record<string, { c: number }>;
}

const API_CONFIG = {
  baseUrl: import.meta.env.VITE_BACKEND_URL,
  endpoints: {
    portfolio: '/portfolio',
    portfolioReorder: '/portfolio/reorder',
  },
  defaultQuotePrice: 0,
} as const;

/**
 * Custom hook for fetching and managing portfolio data
 */
const usePortfolioData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    holdings,
    setHoldings,
    removeFromHoldings,
    updateHolding,
    addStockHolding,
    addCashHolding,
  } = usePortfolioHoldings();

  const fetchUserPortfolioHoldings = useCallback(async (): Promise<Holding[]> => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.portfolio}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio holdings: ${response.status}`);
      }
      
      const portfolioResponse: PortfolioHoldingResponse = await response.json();
      const { data: portfolioHoldings } = portfolioResponse;

      // Return early if portfolio is empty
      if (!portfolioHoldings?.length) {
        return [];
      }

      // Sort holdings by orderIndex to maintain user-defined order
      const sortedHoldings = portfolioHoldings.sort((a, b) => {
        const orderA = a.orderIndex ?? DEFAULT_ORDER_INDEX;
        const orderB = b.orderIndex ?? DEFAULT_ORDER_INDEX;
        return orderA - orderB;
      });

      const stockTickers = sortedHoldings
        .filter(holding => holding.holdingType === "stock" && holding.ticker)
        .map(holding => holding.ticker!);

      // Fetch stock quotes with improved error handling
      const bulkQuotes = await fetchStockQuotes(stockTickers);

      return sortedHoldings.map(holding => {
        if (holding.holdingType === "cash") {
          const cashAmount = parseFloat(holding.costBasis);
          return {
            ticker: CASH_TICKER,
            name: CASH_NAME,
            shares: 1,
            costBasis: cashAmount,
            currentPrice: cashAmount,
            logo: CASH_LOGO_URL,
            type: "cash" as const,
            currency: CASH_CURRENCY,
          };
        } else {
          return {
            ticker: holding.ticker!,
            name: holding.companyName,
            shares: parseFloat(holding.shares || "0"),
            costBasis: parseFloat(holding.costBasis),
            currentPrice: bulkQuotes[holding.ticker!] || API_CONFIG.defaultQuotePrice,
            logo: holding.logo,
            type: "stock" as const,
          };
        }
      });
    } catch (error) {
      console.error("Error fetching portfolio holdings:", error);
      throw error;
    }
  }, []);

  const fetchStockQuotes = useCallback(async (tickers: string[]): Promise<Record<string, number>> => {
    if (!tickers.length) return {};

    try {
      const bulkResponse: BulkQuoteResponse = await getBulkQuotes(tickers);
      return Object.fromEntries(
        Object.entries(bulkResponse.data).map(([ticker, quote]) => [ticker, quote.c])
      );
    } catch (error) {
      console.warn("Bulk quotes not available, fetching individual quotes:", error);
      
      // Fallback: fetch quotes individually
      const quotes: Record<string, number> = {};
      await Promise.allSettled(
        tickers.map(async ticker => {
          try {
            const quote = await getQuote(ticker);
            quotes[ticker] = quote.c;
          } catch (quoteError) {
            console.error(`Failed to fetch quote for ${ticker}:`, quoteError);
            quotes[ticker] = API_CONFIG.defaultQuotePrice;
          }
        })
      );
      return quotes;
    }
  }, []);

  const loadPortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchUserPortfolioHoldings();
      setHoldings(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch portfolio";
      setError(errorMessage);
      console.error("Failed to fetch portfolio:", error);
      
      notifications.show({
        title: "Error",
        message: "Failed to load portfolio data. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchUserPortfolioHoldings, setHoldings]);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  return {
    holdings,
    loading,
    error,
    removeFromHoldings,
    updateHolding,
    addStockHolding,
    addCashHolding,
    refetch: loadPortfolioData,
  };
};

export default function PortfolioPageRefactored() {
  const [opened, setOpened] = useState(false);

  // Custom hooks for state management
  const {
    holdings,
    loading,
    error,
    removeFromHoldings,
    updateHolding,
    addStockHolding,
    addCashHolding,
    refetch,
  } = usePortfolioData();

  const {
    sortField,
    sortDirection,
    sortedHoldings,
    chartHoldings,
    handleSort,
    setSortField,
    setSortDirection,
  } = usePortfolioSorting(holdings);

  // Portfolio totals calculations - memoized for performance
  const portfolioMetrics = useMemo(() => {
    const totalMarketValue = calculateTotalMarketValue(holdings);
    const totalGainLoss = calculateTotalGainLoss(holdings);
    const totalCashPosition = calculateTotalCashPosition(holdings);
    const holdingsCount = holdings.filter(h => h.type !== 'cash').length;
    
    return {
      totalMarketValue,
      totalGainLoss,
      totalCashPosition,
      holdingsCount,
    };
  }, [holdings]);

  // Improved drag and drop handling with better error handling
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    try {
      let reorderedHoldings: Holding[];

      // When sorting is active, clear sort first to allow manual reordering
      if (sortField && sortDirection) {
        setSortField(null);
        setSortDirection(null);

        const oldIndex = sortedHoldings.findIndex(item => item.ticker === active.id);
        const newIndex = sortedHoldings.findIndex(item => item.ticker === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return;
        
        reorderedHoldings = arrayMove(sortedHoldings, oldIndex, newIndex);
      } else {
        // Normal drag operation when no sorting is active
        const oldIndex = holdings.findIndex(item => item.ticker === active.id);
        const newIndex = holdings.findIndex(item => item.ticker === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return;
        
        reorderedHoldings = arrayMove(holdings, oldIndex, newIndex);
      }

      // Optimistically update UI first
      // setHoldings(reorderedHoldings);

      // Update backend with new order
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.portfolioReorder}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newOrder: reorderedHoldings.map(item => ({
            ticker: item.ticker,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update portfolio order: ${response.status}`);
      }
      
      // Only update state after successful backend update
      // setHoldings(reorderedHoldings);
    } catch (error) {
      console.error("Failed to update portfolio order:", error);
      notifications.show({
        title: "Error",
        message: "Failed to reorder portfolio. Please try again.",
        color: "red",
      });
      
      // Optionally revert the optimistic update
      // refetch();
    }
  }, [holdings, sortedHoldings, sortField, sortDirection, setSortField, setSortDirection]);
  // Improved handlers with better validation and error handling
  const handleStockHolding = useCallback(async (
    foundStock: { ticker: string; name: string; logo?: string },
    shares: number,
    avgPricePaid: number
  ) => {
    if (!foundStock.ticker || shares <= 0 || avgPricePaid <= 0) {
      notifications.show({
        title: "Invalid Input",
        message: "Please provide valid stock information, shares, and price.",
        color: "red",
      });
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.portfolio}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          holdingType: "stock",
          ticker: foundStock.ticker,
          companyName: foundStock.name,
          shares,
          costBasis: avgPricePaid,
          logo: foundStock.logo,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to add stock holding: ${response.status}`);
      }
      
      // Only add to local state after successful backend operation
      addStockHolding(foundStock, shares, avgPricePaid);
      
      notifications.show({
        title: "Success",
        message: `Added ${foundStock.ticker} to your portfolio`,
        color: "green",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add stock holding";
      console.error("Error adding stock holding:", error);
      
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  }, [addStockHolding]);

  const handleCashHolding = useCallback(async (cashAmount: number) => {
    if (cashAmount <= 0) {
      notifications.show({
        title: "Invalid Amount",
        message: "Please enter a valid cash amount greater than zero.",
        color: "red",
      });
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.portfolio}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          holdingType: "cash",
          companyName: CASH_CURRENCY,
          costBasis: cashAmount,
          logo: CASH_LOGO_URL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to add cash holding: ${response.status}`);
      }

      // Only add to local state after successful backend operation
      addCashHolding(cashAmount);
      
      notifications.show({
        title: "Success",
        message: "Added cash to your portfolio",
        color: "green",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add cash holding";
      console.error("Error adding cash holding:", error);
      
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  }, [addCashHolding]);

  // Generate portfolio metrics array from calculated values
  const portfolioMetricsArray: PortfolioMetric[] = useMemo(() => [
    {
      label: "Total Market Value",
      value: portfolioMetrics.totalMarketValue,
    },
    {
      label: "Gain/Loss",
      value: portfolioMetrics.totalGainLoss,
    },
    {
      label: "Holdings",
      value: portfolioMetrics.holdingsCount.toString(),
    },
    {
      label: "Cash position",
      value: portfolioMetrics.totalCashPosition,
    },
  ], [portfolioMetrics]);

  // Enhanced loading state with better UX
  if (loading) {
    return (
      <Layout opened={opened} toggle={() => setOpened(!opened)}>
        <Grid className="portfolioPage">
          <Grid.Col span={12}>
            <Center className="portfolio-loading-container">
              <div className="portfolio-loading-content">
                <Loader size="lg" />
                <Title order={4} color="dimmed">Loading your portfolio...</Title>
              </div>
            </Center>
          </Grid.Col>
        </Grid>
      </Layout>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <Layout opened={opened} toggle={() => setOpened(!opened)}>
        <Grid className="portfolioPage">
          <Grid.Col span={12}>
            <Center className="portfolio-error-container">
              <div className="portfolio-error-content">
                <Title order={4} color="red">Failed to load portfolio</Title>
                <Text color="dimmed">{error}</Text>
                <Button onClick={refetch} variant="light">
                  Try Again
                </Button>
              </div>
            </Center>
          </Grid.Col>
        </Grid>
      </Layout>
    );
  }

  return (
    <Layout opened={opened} toggle={() => setOpened(!opened)}>
      <Grid className="portfolioPage">
        <Grid.Col span={12}>
          <Box justify="space-between" mb="md">
            <Title order={2}>Portfolio</Title>
          </Box>

          {/* Portfolio Metrics */}
          <Card radius="md" p="lg" mb="lg">
            <Group grow className="portfolio-metrics-group">
              {portfolioMetricsArray.map((metric, index) => (
                <DataCard
                  key={`${metric.label}-${index}`}
                  label={metric.label}
                  data={metric.value}
                />
              ))}
            </Group>
          </Card>

          {/* Add New Holding Form */}
          <AddHoldingForm
            onHoldingAdded={() => {}}
            onStockHolding={handleStockHolding}
            onCashHolding={handleCashHolding}
          />

          {/* Portfolio Table */}
          <PortfolioTable
            holdings={sortedHoldings}
            sortField={sortField}
            sortDirection={sortDirection}
            totalMarketValue={portfolioMetrics.totalMarketValue}
            totalGainLoss={portfolioMetrics.totalGainLoss}
            onSort={handleSort}
            onDragEnd={handleDragEnd}
            onRemove={removeFromHoldings}
            onUpdateHolding={updateHolding}
          />
        </Grid.Col>
      </Grid>

      {/* Portfolio Pie Chart */}
      <PortfolioPieChart holdings={chartHoldings} />
    </Layout>
  );
}
