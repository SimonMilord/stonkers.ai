import React, { useState, useEffect } from "react";
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
} from "@mantine/core";
import WatchlistItem, {
  WatchlistItemData,
} from "../components/watchlistItem/watchlistItem";
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

export default function WatchlistPage() {
  const [opened, setOpened] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItemData[]>([]);
  const [loading, setLoading] = useState(true);

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
        const data = await fetchUserWatchlist();
        setWatchlist(data);
      } catch (error) {
        console.error("Failed to fetch watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const removeFromWatchlist = (ticker: string) => {
    setWatchlist((prev) => prev.filter((item) => item.ticker !== ticker));
    // TODO: Update backend accordingly
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWatchlist((items) => {
        const oldIndex = items.findIndex((item) => item.ticker === active.id);
        const newIndex = items.findIndex((item) => item.ticker === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // TODO: Update backend with new order
        // updateWatchlistOrder(newOrder.map(item => item.ticker));

        return newOrder;
      });
    }
  };

  if (loading) {
    return (
      <Layout opened={opened} toggle={() => setOpened(!opened)}>
        <Grid className="watchlistPage">
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
      <Grid className="watchlistPage">
        <Grid.Col span={12}>
          <Group justify="space-between" mb="md">
            <Title order={2}>Watchlist</Title>
          </Group>
          <Box>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table borderColor="gray">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th>Symbol</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Change ($)</Table.Th>
                    <Table.Th>Change (%)</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <SortableContext
                    items={watchlist.map((item) => item.ticker)}
                    strategy={verticalListSortingStrategy}
                    children={
                      watchlist.length > 0 ? (
                        watchlist.map((stock) => (
                          <WatchlistItem
                            key={stock.ticker}
                            stock={stock}
                            onRemove={removeFromWatchlist}
                          />
                        ))
                      ) : (
                        <Table.Tr>
                          <Table.Td colSpan={7}>
                            <Text ta="center" c="dimmed">
                              No stocks in your watchlist. Add some to get
                              started!
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )
                    }
                  />
                </Table.Tbody>
              </Table>
            </DndContext>
          </Box>
        </Grid.Col>
      </Grid>
    </Layout>
  );
}

const placeholderWatchlist: WatchlistItemData[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 266.24,
    changeDollar: 2.94,
    changePercent: 1.35,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 262.12,
    changeDollar: -15.2,
    changePercent: -0.53,
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    price: 222.21,
    changeDollar: 10.1,
    changePercent: 0.29,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    price: 510.95,
    changeDollar: 3.0,
    changePercent: 1.01,
  },
];

const fetchUserWatchlist = async (): Promise<WatchlistItemData[]> => {
  // TODO: Fetch watchlist from backend for the logged-in user
  const res = new Promise((resolve) => {
    setTimeout(() => {
      resolve(placeholderWatchlist);
    }, 1000);
  });

  return res as Promise<WatchlistItemData[]>;
};
