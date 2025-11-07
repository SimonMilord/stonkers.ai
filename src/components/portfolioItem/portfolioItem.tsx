import React from "react";
import {
  Table,
  ActionIcon,
  Text,
  Flex,
  Image,
  NumberInput,
} from "@mantine/core";
import { RiMenuFill, RiDeleteBin5Fill } from "react-icons/ri";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useHistory } from "react-router-dom";
import "./portfolioItem.css";
import { formatCurrency } from "../../utils/functions";

export interface Holding {
  name: string;
  ticker: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  logo?: string;
  exchange?: string;
  industry?: string;
  currency?: string;
  type?: "stock" | "cash";
}

interface PortfolioItemProps {
  stock: Holding;
  totalPortfolioValue?: number;
  onRemove: (ticker: string) => void;
  onUpdateShares?: (ticker: string, shares: number) => void;
  onUpdateCostBasis?: (ticker: string, costBasis: number) => void;
  key?: string;
}

export default function PortfolioItem({
  stock,
  totalPortfolioValue,
  onRemove,
  onUpdateShares,
  onUpdateCostBasis,
}: PortfolioItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stock.ticker });
  const history = useHistory();
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // const formatPrice = (price: number) => `${price.toFixed(2)}`;
  const computedGainLossPercent =
    stock.type === "cash"
      ? "0.00"
      : (
          ((stock.currentPrice - stock.costBasis) / stock.costBasis) *
          100
        ).toFixed(2);
  const computedGainLossDollar =
    stock.type === "cash"
      ? "0.00"
      : formatCurrency(stock.shares * (stock.currentPrice - stock.costBasis));
  const isCash = stock.type === "cash";

  // Handle keyboard events for arrow keys
  const handleKeyDown = (
    event: React.KeyboardEvent,
    type: "shares" | "costBasis",
    currentValue: number
  ) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

    event.preventDefault();
    const increment = event.key === "ArrowUp" ? 1 : -1;
    const newValue = Math.max(0, currentValue + increment);

    const updateFunction =
      type === "shares" ? onUpdateShares : onUpdateCostBasis;
    updateFunction?.(stock.ticker, newValue);
  };

  // Handle direct value changes
  const handleSharesChange = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
    if (onUpdateShares) {
      onUpdateShares(stock.ticker, Math.max(0, numValue));
    }
  };

  const handleCostBasisChange = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
    if (onUpdateCostBasis) {
      onUpdateCostBasis(stock.ticker, Math.max(0, numValue));
    }
  };

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td>
        <ActionIcon
          radius="md"
          variant="subtle"
          color="gray"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          {...attributes}
          {...listeners}
        >
          <RiMenuFill />
        </ActionIcon>
      </Table.Td>
      <Table.Td>
        <Flex align="center">
          {stock.logo && (
            <Image
              mr={12}
              h={25}
              w={25}
              radius="md"
              src={stock?.logo}
              fit="cover"
            />
          )}
          <Text
            onClick={() => !isCash && history.push(`/details/${stock.ticker}`)}
            className={isCash ? "" : "portfolio-item-name"}
            style={{ cursor: isCash ? "default" : "pointer" }}
          >
            {stock.name} ({stock.ticker})
          </Text>
        </Flex>
      </Table.Td>
      <Table.Td>
        {isCash ? (
          <Text>-</Text>
        ) : (
          <NumberInput
            step={1}
            min={0}
            size="xs"
            value={stock.shares}
            hideControls
            className="portfolio-number-input"
            onChange={handleSharesChange}
            onKeyDown={(e) => handleKeyDown(e, "shares", stock.shares)}
          />
        )}
      </Table.Td>
      <Table.Td>
        {isCash ? (
          <NumberInput
            step={1}
            min={0}
            size="xs"
            value={stock.costBasis}
            hideControls
            className="portfolio-number-input"
            onChange={handleCostBasisChange}
            onKeyDown={(e) => handleKeyDown(e, "costBasis", stock.costBasis)}
            leftSection="$"
          />
        ) : (
          <NumberInput
            step={1}
            min={0}
            size="xs"
            value={stock.costBasis}
            hideControls
            className="portfolio-number-input"
            onChange={handleCostBasisChange}
            onKeyDown={(e) => handleKeyDown(e, "costBasis", stock.costBasis)}
          />
        )}
      </Table.Td>
      <Table.Td>
        <Text>${formatCurrency(stock.currentPrice)}</Text>
      </Table.Td>
      <Table.Td>
        <Text>${formatCurrency(stock.shares * stock.currentPrice)}</Text>
      </Table.Td>
      <Table.Td>
        <Text
          c={
            isCash
              ? "gray"
              : Number(computedGainLossDollar) < 0
              ? "red"
              : "green"
          }
        >
          {isCash ? "-" : `$${computedGainLossDollar}`}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          c={
            isCash
              ? "gray"
              : Number(computedGainLossPercent) < 0
              ? "red"
              : "green"
          }
        >
          {isCash ? "-" : `${computedGainLossPercent}%`}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text>
          {(
            ((stock.shares * stock.currentPrice) / totalPortfolioValue) *
            100
          ).toFixed(2)}
          %
        </Text>
      </Table.Td>
      <Table.Td>
        <ActionIcon
          radius="md"
          variant="subtle"
          color="red"
          onClick={() => onRemove(stock.ticker)}
        >
          <RiDeleteBin5Fill />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
