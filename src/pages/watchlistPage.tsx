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
import { getBulkQuotes } from "../utils/requests";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

  const fetchUserWatchlist = async (): Promise<WatchlistItemData[]> => {
    const response = await fetch(`${backendUrl}/watchlist`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch watchlist");
    }

    const { data: watchlistItems } = await response.json();

    const arrayOfTickers = watchlistItems.map((item: any) => item.ticker);
    const { data: bulkQuotes } = await getBulkQuotes(arrayOfTickers);

    const mappedWatchlistItems: WatchlistItemData[] = watchlistItems.map(
      (item: any) => ({
        ticker: item.ticker,
        name: item.companyName,
        price: bulkQuotes[item.ticker]?.c || 0,
        changeDollar: bulkQuotes[item.ticker]?.d || 0,
        changePercent: bulkQuotes[item.ticker]?.dp || 0,
      })
    );
    return mappedWatchlistItems;
  };

  const removeFromWatchlist = async (ticker: string) => {
    setWatchlist((prev) => prev.filter((item) => item.ticker !== ticker));
    try {
      await fetch(`${backendUrl}/watchlist/${ticker}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = watchlist.findIndex((item) => item.ticker === active.id);
      const newIndex = watchlist.findIndex((item) => item.ticker === over?.id);
      const newOrder = arrayMove(watchlist, oldIndex, newIndex);

      // Update UI optimistically
      setWatchlist(newOrder);

      try {
        // Send the updated order to backend
        await fetch(`${backendUrl}/watchlist/move`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticker: active.id as string,
            newPosition: newIndex,
          }),
        });
      } catch (error) {
        console.error("Failed to update watchlist order:", error);
        // Revert the order on error
        setWatchlist(watchlist);
      }
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
