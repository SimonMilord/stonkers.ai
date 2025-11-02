import React, { useState, useEffect, useMemo } from "react";
import Layout from "./layout";
import {
  Grid,
  Title,
  Table,
  Text,
  Box,
  Group,
  Loader,
  Center,
  UnstyledButton,
} from "@mantine/core";
import { RiArrowUpSLine, RiArrowDownSLine, RiExpandUpDownLine } from "react-icons/ri";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PortfolioItem, { Holding } from "@components/portfolioItem/portfolioItem";
import PortfolioPieChart from "@components/portfolioPieChart/portfolioPieChart";

type SortField = 'name' | 'shares' | 'costBasis' | 'currentPrice' | 'marketValue' | 'gainLoss' | 'gainLossPercent' | 'weight';
type SortDirection = 'asc' | 'desc' | null;

// Sorting utility functions
const getSortValue = (holding: Holding, field: SortField, totalPortfolioValue: number) => {
  const valueMap = {
    name: holding.name.toLowerCase(),
    shares: holding.shares,
    costBasis: holding.costBasis,
    currentPrice: holding.currentPrice,
    marketValue: holding.shares * holding.currentPrice,
    gainLoss: holding.shares * (holding.currentPrice - holding.costBasis),
    gainLossPercent: ((holding.currentPrice - holding.costBasis) / holding.costBasis) * 100,
    weight: (holding.shares * holding.currentPrice) / totalPortfolioValue * 100,
  };
  return valueMap[field];
};

const sortHoldings = (holdings: Holding[], field: SortField, direction: SortDirection) => {
  if (!field || !direction) return holdings;

  const totalPortfolioValue = calculateTotalMarketValue(holdings);

  return [...holdings].sort((a, b) => {
    const aValue = getSortValue(a, field, totalPortfolioValue);
    const bValue = getSortValue(b, field, totalPortfolioValue);

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Portfolio calculation functions
const calculateTotalMarketValue = (holdings: Holding[]): number => {
  return holdings.reduce((acc, item) => acc + item.shares * item.currentPrice, 0);
};

const calculateTotalGainLoss = (holdings: Holding[]): number => {
  return holdings.reduce((acc, item) => acc + item.shares * (item.currentPrice - item.costBasis), 0);
};

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default function PortfolioPage() {
  const [opened, setOpened] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField | null>('weight');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Same field clicked, cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      // New field clicked, start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <RiExpandUpDownLine size={14} />;
    }
    if (sortDirection === 'asc') {
      return <RiArrowUpSLine size={14} />;
    }
    if (sortDirection === 'desc') {
      return <RiArrowDownSLine size={14} />;
    }
    return <RiExpandUpDownLine size={14} />;
  };

  const sortedHoldings = useMemo(() => {
    return sortHoldings(holdings, sortField, sortDirection);
  }, [holdings, sortField, sortDirection]);

  // Chart always shows holdings sorted by weight (descending) regardless of table sorting
  const chartHoldings = useMemo(() => {
    return sortHoldings(holdings, 'weight', 'desc');
  }, [holdings]);

  // Portfolio totals calculations
  const totalMarketValue = useMemo(() => calculateTotalMarketValue(holdings), [holdings]);
  const totalGainLoss = useMemo(() => calculateTotalGainLoss(holdings), [holdings]);

  const removeFromHoldings = (ticker: string) => {
    setHoldings((prev) => prev.filter((item) => item.ticker !== ticker));
    // TODO: Update backend accordingly
  };

  const updateShares = (ticker: string, newShares: number) => {
    setHoldings((prev) =>
      prev.map((item) =>
        item.ticker === ticker ? { ...item, shares: newShares } : item
      )
    );
    // TODO: Update backend accordingly
  };

  const updateCostBasis = (ticker: string, newCostBasis: number) => {
    setHoldings((prev) =>
      prev.map((item) =>
        item.ticker === ticker ? { ...item, costBasis: newCostBasis } : item
      )
    );
    // TODO: Update backend accordingly
  };

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
          <Group justify="space-between" mb="md">
            <Title order={2}>Portfolio</Title>
          </Group>
          <Box>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table borderColor='gray'>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th>
                      <UnstyledButton onClick={() => handleSort('name')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text fw={600}>Holding</Text>
                        {getSortIcon('name')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton onClick={() => handleSort('shares')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text fw={600}>Shares</Text>
                        {getSortIcon('shares')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton onClick={() => handleSort('costBasis')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text fw={600}>Cost Basis</Text>
                        {getSortIcon('costBasis')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton onClick={() => handleSort('currentPrice')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text fw={600}>Current Price</Text>
                        {getSortIcon('currentPrice')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton onClick={() => handleSort('marketValue')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text fw={600}>Market Value</Text>
                        {getSortIcon('marketValue')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton onClick={() => handleSort('gainLoss')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text fw={600}>Gain/Loss ($)</Text>
                        {getSortIcon('gainLoss')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton onClick={() => handleSort('gainLossPercent')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text fw={600}>Gain/Loss (%)</Text>
                        {getSortIcon('gainLossPercent')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th>
                      <UnstyledButton onClick={() => handleSort('weight')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Text fw={600}>Weight</Text>
                        {getSortIcon('weight')}
                      </UnstyledButton>
                    </Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <SortableContext
                  items={sortedHoldings.map((item) => item.ticker)}
                  strategy={verticalListSortingStrategy} children={undefined}                >
                  <Table.Tbody>
                    {sortedHoldings.length > 0 ? (
                      sortedHoldings.map((stock) => (
                        <PortfolioItem
                          key={stock.ticker}
                          stock={stock}
                          totalPortfolioValue={totalMarketValue}
                          onRemove={removeFromHoldings}
                          onUpdateShares={updateShares}
                          onUpdateCostBasis={updateCostBasis}
                        />
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={10}>
                          <Text ta="center" c="dimmed">
                            No stocks in your portfolio. Add some to get started!
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                  {holdings.length > 0 && (
                    <Table.Tfoot>
                      <Table.Tr style={{ borderTop: '2px solid #4A5568' }}>
                        <Table.Td></Table.Td>
                        <Table.Td>
                          <Text fw={700} c="white">Total</Text>
                        </Table.Td>
                        <Table.Td></Table.Td>
                        <Table.Td></Table.Td>
                        <Table.Td></Table.Td>
                        <Table.Td>
                          <Text fw={600} c="white">
                            ${formatCurrency(totalMarketValue)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={600} c={totalGainLoss >= 0 ? 'green' : 'red'}>
                            ${formatCurrency(totalGainLoss)}
                          </Text>
                        </Table.Td>
                        <Table.Td></Table.Td>
                        <Table.Td>
                          <Text fw={600} c="white">100.00%</Text>
                        </Table.Td>
                        <Table.Td></Table.Td>
                      </Table.Tr>
                    </Table.Tfoot>
                  )}
                </SortableContext>
              </Table>
            </DndContext>
          </Box>

          {/* Portfolio Pie Chart */}
          <PortfolioPieChart holdings={chartHoldings} title="Portfolio Allocation" />
        </Grid.Col>
      </Grid>
    </Layout>
  );
}

const placeholderPortfolio: Holding[] = [
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    shares: 100,
    costBasis: 111.0,
    logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AMZN.png",
    currentPrice: 244.0,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    shares: 75,
    costBasis: 132.0,
    logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GOOGL.png",
    currentPrice: 281.0,
  },
  {
    ticker: "ASML",
    name: "ASML Holding N.V.",
    shares: 12,
    costBasis: 650.0,
    logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/ASML.AS.png",
    currentPrice: 720.0,
  },
  {
    ticker: "FICO",
    name: "Fair Isaac Corporation",
    shares: 4,
    costBasis: 1489.0,
    logo: "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/FICO.png",
    currentPrice: 1615.0,
  },
];

const fetchUserPortfolioHoldings = async (): Promise<Holding[]> => {
  // TODO
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/holdings`,
  //   {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //   }
  // );
  const res = new Promise((resolve) => {
    setTimeout(() => {
      resolve(placeholderPortfolio);
    }, 1000);
  });

  return res as Promise<Holding[]>;
};
