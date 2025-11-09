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

interface PortfolioMetric {
  label: string;
  value: number | string;
}

export default function PortfolioPageRefactored() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom hooks for state management
  const {
    holdings,
    setHoldings,
    removeFromHoldings,
    updateShares,
    updateCostBasis,
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // When sorting is active, we need to work with sortedHoldings and then update the original holdings
      if (sortField && sortDirection) {
        // If we're in a sorted state, we should clear the sort first to allow manual reordering
        setSortField(null);
        setSortDirection(null);

        // Then apply the drag operation to the original holdings
        setHoldings((items) => {
          const oldIndex = items.findIndex((item) => item.ticker === active.id);
          const newIndex = items.findIndex((item) => item.ticker === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else {
        // Normal drag operation when no sorting is active
        setHoldings((items) => {
          const oldIndex = items.findIndex((item) => item.ticker === active.id);
          const newIndex = items.findIndex((item) => item.ticker === over?.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }

      // TODO: Update backend with new order
    }
  };

  const handleStockHolding = (
    foundStock: any,
    shares: number,
    avgPricePaid: number
  ) => {
    addStockHolding(foundStock, shares, avgPricePaid);
  };

  const handleCashHolding = (cashAmount: number) => {
    addCashHolding(cashAmount);
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
            onUpdateShares={updateShares}
            onUpdateCostBasis={updateCostBasis}
          />
        </Grid.Col>
      </Grid>

      {/* Portfolio Pie Chart */}
      <PortfolioPieChart holdings={chartHoldings} />
    </Layout>
  );
}

// Keep the existing data fetching logic
const placeholderPortfolio: Holding[] = [
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    shares: 100,
    costBasis: 111.0,
    logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AMZN.png",
    currentPrice: 244.0,
    type: "stock",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    shares: 75,
    costBasis: 132.0,
    logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GOOGL.png",
    currentPrice: 281.0,
    type: "stock",
  },
  {
    ticker: "ASML",
    name: "ASML Holding N.V.",
    shares: 12,
    costBasis: 650.0,
    logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/ASML.AS.png",
    currentPrice: 720.0,
    type: "stock",
  },
  {
    ticker: "FICO",
    name: "Fair Isaac Corporation",
    shares: 4,
    costBasis: 1489.0,
    logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/FICO.png",
    currentPrice: 1615.0,
    type: "stock",
  },
];

const fetchUserPortfolioHoldings = async (): Promise<Holding[]> => {
  // TODO
  const res = new Promise((resolve) => {
    setTimeout(() => {
      resolve(placeholderPortfolio);
    }, 1000);
  });

  return res as Promise<Holding[]>;
};
