import React from "react";
import { Table, Text, UnstyledButton, Box } from "@mantine/core";
import {
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiExpandUpDownLine,
} from "react-icons/ri";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import PortfolioItem, { Holding } from "../portfolioItem/portfolioItem";
import { SortField, SortDirection } from "../../hooks/usePortfolioSorting";
import { formatCurrency } from "../../utils/functions";

interface PortfolioTableProps {
  holdings: Holding[];
  sortField: SortField | null;
  sortDirection: SortDirection;
  totalMarketValue: number;
  totalGainLoss: number;
  onSort: (field: SortField) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onRemove: (ticker: string) => void;
  onUpdateHolding: (ticker: string, shares: number, costBasis: number) => void;
}

export default function PortfolioTable({
  holdings,
  sortField,
  sortDirection,
  totalMarketValue,
  totalGainLoss,
  onSort,
  onDragEnd,
  onRemove,
  onUpdateHolding,
}: PortfolioTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <RiExpandUpDownLine size={14} />;
    }
    if (sortDirection === "asc") {
      return <RiArrowUpSLine size={14} />;
    }
    if (sortDirection === "desc") {
      return <RiArrowDownSLine size={14} />;
    }
    return <RiExpandUpDownLine size={14} />;
  };

  const tableHeaders = [
    { field: "name" as SortField, label: "Holding" },
    { field: "shares" as SortField, label: "Shares" },
    { field: "costBasis" as SortField, label: "Cost Basis" },
    { field: "currentPrice" as SortField, label: "Current Price" },
    { field: "marketValue" as SortField, label: "Market Value" },
    { field: "gainLoss" as SortField, label: "Gain/Loss ($)" },
    { field: "gainLossPercent" as SortField, label: "Gain/Loss (%)" },
    { field: "weight" as SortField, label: "Weight" },
  ];

  return (
    <Box className="portfolio-table-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <Table borderColor="gray">
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>
              {tableHeaders.map((header) => (
                <Table.Th key={header.field}>
                  <UnstyledButton
                    onClick={() => onSort(header.field)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text fw={600}>{header.label}</Text>
                    {getSortIcon(header.field)}
                  </UnstyledButton>
                </Table.Th>
              ))}
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <SortableContext
            items={holdings.map((item) => item.ticker)}
            strategy={verticalListSortingStrategy}
            children={
              <Table.Tbody>
                {holdings.length > 0 ? (
                  holdings.map((stock) => (
                    <PortfolioItem
                      key={stock.ticker}
                      stock={stock}
                      totalPortfolioValue={totalMarketValue}
                      onRemove={onRemove}
                      onUpdateHolding={onUpdateHolding}
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
            }
          />
          {holdings.length > 0 && (
            <Table.Tfoot>
              <Table.Tr style={{ borderTop: "2px solid #4A5568" }}>
                <Table.Td></Table.Td>
                <Table.Td>
                  <Text fw={700} c="white">
                    Total
                  </Text>
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
                  <Text fw={600} c={totalGainLoss >= 0 ? "green" : "red"}>
                    ${formatCurrency(totalGainLoss)}
                  </Text>
                </Table.Td>
                <Table.Td></Table.Td>
                <Table.Td>
                  <Text fw={600} c="white">
                    100.00%
                  </Text>
                </Table.Td>
                <Table.Td></Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          )}
        </Table>
      </DndContext>
    </Box>
  );
}
