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
import PortfolioItem, { Holding } from "@components/portfolioItem/portfolioItem";
import { SortField, SortDirection } from "@hooks/usePortfolioSorting";
import { formatCurrency } from "@utils/functions";
import "./portfolioTable.css";

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

interface TableHeader {
  field: SortField;
  label: string;
}

// Constants
const ICON_SIZE = 14;
const TOTAL_WEIGHT = "100.00%";
const EMPTY_MESSAGE = "No stocks in your portfolio. Add some to get started!";
const COLUMN_SPAN = 10;

const TABLE_HEADERS: TableHeader[] = [
  { field: "name" as SortField, label: "Holding" },
  { field: "shares" as SortField, label: "Shares" },
  { field: "costBasis" as SortField, label: "Cost Basis" },
  { field: "currentPrice" as SortField, label: "Current Price" },
  { field: "marketValue" as SortField, label: "Market Value" },
  { field: "gainLoss" as SortField, label: "Gain/Loss ($)" },
  { field: "gainLossPercent" as SortField, label: "Gain/Loss (%)" },
  { field: "weight" as SortField, label: "Weight" },
];

const getSortIcon = (field: SortField, sortField: SortField | null, sortDirection: SortDirection) => {
  if (sortField !== field) {
    return <RiExpandUpDownLine size={ICON_SIZE} />;
  }
  if (sortDirection === "asc") {
    return <RiArrowUpSLine size={ICON_SIZE} />;
  }
  if (sortDirection === "desc") {
    return <RiArrowDownSLine size={ICON_SIZE} />;
  }
  return <RiExpandUpDownLine size={ICON_SIZE} />;
};

const getGainLossColor = (value: number): string => {
  return value >= 0 ? "green" : "red";
};

const useDndSensors = () => {
  return useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
};

const SortableHeader: React.FC<{
  header: TableHeader;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}> = React.memo(({ header, sortField, sortDirection, onSort }) => (
  <Table.Th key={header.field}>
    <UnstyledButton
      onClick={() => onSort(header.field)}
      className="portfolio-table-header-button"
      aria-label={`Sort by ${header.label}`}
    >
      <Text fw={600}>{header.label}</Text>
      {getSortIcon(header.field, sortField, sortDirection)}
    </UnstyledButton>
  </Table.Th>
));

const EmptyTableRow: React.FC = React.memo(() => (
  <Table.Tr>
    <Table.Td colSpan={COLUMN_SPAN}>
      <Text ta="center" c="dimmed">
        {EMPTY_MESSAGE}
      </Text>
    </Table.Td>
  </Table.Tr>
));

const TotalRow: React.FC<{
  totalMarketValue: number;
  totalGainLoss: number;
}> = React.memo(({ totalMarketValue, totalGainLoss }) => (
  <Table.Tr className="portfolio-table-total-row">
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
      <Text fw={600} c={getGainLossColor(totalGainLoss)}>
        ${formatCurrency(totalGainLoss)}
      </Text>
    </Table.Td>
    <Table.Td></Table.Td>
    <Table.Td>
      <Text fw={600} c="white">
        {TOTAL_WEIGHT}
      </Text>
    </Table.Td>
    <Table.Td></Table.Td>
  </Table.Tr>
));

export default React.memo(function PortfolioTable({
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
  const sensors = useDndSensors();
  const sortableItems = React.useMemo(
    () => holdings.map((item) => item.ticker),
    [holdings]
  );
  const hasHoldings = holdings.length > 0;

  return (
    <Box 
      className="portfolio-table-container"
      component="section"
      aria-label="Portfolio holdings table"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <Table borderColor="gray">
          <Table.Thead>
            <Table.Tr>
              <Table.Th aria-label="Drag handle column"></Table.Th>
              {TABLE_HEADERS.map((header) => (
                <SortableHeader
                  key={header.field}
                  header={header}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              ))}
              <Table.Th aria-label="Actions column"></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <SortableContext
              items={sortableItems}
              strategy={verticalListSortingStrategy} children={undefined}            >
              {hasHoldings ? (
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
                <EmptyTableRow />
              )}
            </SortableContext>
          </Table.Tbody>
          {hasHoldings && (
            <Table.Tfoot>
              <TotalRow
                totalMarketValue={totalMarketValue}
                totalGainLoss={totalGainLoss}
              />
            </Table.Tfoot>
          )}
        </Table>
      </DndContext>
    </Box>
  );
});
