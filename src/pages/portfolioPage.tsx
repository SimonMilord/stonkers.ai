import React, { useState, useEffect, useMemo } from "react";
import Layout from "./layout";
import { Grid, Title, Box, Group, Loader, Center, Card } from "@mantine/core";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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
} from "../hooks/usePortfolioSorting";
import { usePortfolioHoldings } from "../hooks/usePortfolioHoldings";
import { getBulkQuotes } from "../utils/requests";

interface PortfolioMetric {
  label: string;
  value: number | string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function PortfolioPageRefactored() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom hooks for state management
  const {
    holdings,
    setHoldings,
    removeFromHoldings,
    updateHolding,
    addStockHolding,
    addCashHolding,
  } = usePortfolioHoldings();

  const {
    sortField,
    sortDirection,
    sortedHoldings,
    chartHoldings,
    handleSort,
    setSortField,
    setSortDirection,
  } = usePortfolioSorting(holdings);

  // Portfolio totals calculations
  const totalMarketValue = useMemo(
    () => calculateTotalMarketValue(holdings),
    [holdings]
  );
  const totalGainLoss = useMemo(
    () => calculateTotalGainLoss(holdings),
    [holdings]
  );
  const totalCashPosition = useMemo(
    () => calculateTotalCashPosition(holdings),
    [holdings]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchUserPortfolioHoldings();
        setHoldings(data);
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setHoldings]);

  const fetchUserPortfolioHoldings = async (): Promise<Holding[]> => {
    try {
      const response = await fetch(`${backendUrl}/portfolio`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio holdings");
      }
      const { data: portfolioHoldings } = await response.json();

      // Sort holdings by orderIndex to maintain user-defined order
      portfolioHoldings.sort((a: any, b: any) => {
        const orderA = a.orderIndex ?? 999; // Default high value for undefined orderIndex
        const orderB = b.orderIndex ?? 999;
        return orderA - orderB;
      });

      const stockTickers = portfolioHoldings
        .filter((holding: any) => holding.holdingType === "stock")
        .map((holding: any) => holding.ticker);

      const { data: bulkQuotes } = await getBulkQuotes(stockTickers);

      const mappedHoldings: Holding[] = portfolioHoldings.map(
        (holding: any) => {
          if (holding.holdingType === "cash") {
            return {
              ticker: "USD",
              name: "Cash",
              shares: 1,
              costBasis: parseFloat(holding.costBasis),
              currentPrice: parseFloat(holding.costBasis),
              logo: "https://flagcdn.com/w320/us.png",
              type: "cash",
              currency: "USD",
            };
          } else {
            return {
              ticker: holding.ticker,
              name: holding.companyName,
              shares: parseFloat(holding.shares),
              costBasis: parseFloat(holding.costBasis),
              currentPrice: bulkQuotes[holding.ticker]?.c || 0,
              logo: holding.logo,
              type: "stock",
            };
          }
        }
      );

      return mappedHoldings;
    } catch (error) {
      console.error("Error fetching portfolio holdings:", error);
      return [];
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      let reorderedHoldings;

      // When sorting is active, we need to work with sortedHoldings and then update the original holdings
      if (sortField && sortDirection) {
        // If we're in a sorted state, we should clear the sort first to allow manual reordering
        setSortField(null);
        setSortDirection(null);

        // Use the current sorted holdings as the base for reordering
        const currentSortedHoldings = sortedHoldings;
        const oldIndex = currentSortedHoldings.findIndex(
          (item) => item.ticker === active.id
        );
        const newIndex = currentSortedHoldings.findIndex(
          (item) => item.ticker === over?.id
        );

        reorderedHoldings = arrayMove(
          currentSortedHoldings,
          oldIndex,
          newIndex
        );
        setHoldings(reorderedHoldings);
      } else {
        // Normal drag operation when no sorting is active
        setHoldings((items) => {
          const oldIndex = items.findIndex((item) => item.ticker === active.id);
          const newIndex = items.findIndex((item) => item.ticker === over?.id);

          reorderedHoldings = arrayMove(items, oldIndex, newIndex);

          return reorderedHoldings;
        });
      }

      // Update backend with new order
      if (reorderedHoldings) {
        try {
          const newOrder = reorderedHoldings.map((item, index) => ({
            ticker: item.ticker,
            index: index,
          }));

          console.log("Sending order to backend:", newOrder);

          const response = await fetch(`${backendUrl}/portfolio/reorder`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              newOrder: reorderedHoldings.map((item) => ({
                ticker: item.ticker,
              })),
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update portfolio order");
          }
        } catch (error) {
          console.error("Failed to update portfolio order:", error);
        }
      }
    }
  };

  const handleStockHolding = async (
    foundStock: any,
    shares: number,
    avgPricePaid: number
  ) => {
    addStockHolding(foundStock, shares, avgPricePaid);
    try {
      const response = await fetch(`${backendUrl}/portfolio`, {
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
        const errorData = await response.json();
        console.error("Failed to add stock holding:", errorData);
        throw new Error(errorData.error || "Failed to add stock holding");
      }
      await response.json();
    } catch (error) {
      console.error("Error adding stock holding:", error);
    }
  };

  const handleCashHolding = async (cashAmount: number) => {
    addCashHolding(cashAmount);
    try {
      const response = await fetch(`${backendUrl}/portfolio`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          holdingType: "cash",
          companyName: "USD",
          costBasis: cashAmount,
          logo: "https://flagcdn.com/w320/us.png",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to add cash holding:", errorData);
        throw new Error(errorData.error || "Failed to add cash holding");
      }

      await response.json();
    } catch (error) {
      console.error("Error adding cash holding:", error);
    }
  };

  const portfolioMetrics: PortfolioMetric[] = [
    {
      label: "Total Market Value",
      value: totalMarketValue,
    },
    {
      label: "Gain/Loss",
      value: totalGainLoss,
    },
    {
      label: "Holdings",
      value: `${holdings.length.toFixed(0) - 1}`, // Exclude cash position from holdings count
    },
    {
      label: "Cash position",
      value: totalCashPosition,
    },
  ];

  if (loading) {
    return (
      <Layout opened={opened} toggle={() => setOpened(!opened)}>
        <Grid className="portfolioPage">
          <Grid.Col span={12}>
            <Center style={{ height: "80vh" }}>
              <Loader size="lg" />
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
            <Group grow>
              {portfolioMetrics.map((metric, index) => (
                <DataCard
                  key={index}
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
            totalMarketValue={totalMarketValue}
            totalGainLoss={totalGainLoss}
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
