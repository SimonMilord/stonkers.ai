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
import { modals } from "@mantine/modals";

export interface Holding {
  id?: string; // Unique identifier for each holding
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
  onUpdateHolding?: (ticker: string, shares: number, costBasis: number) => void;
  key?: string;
}

export default function PortfolioItem({
  stock,
  totalPortfolioValue,
  onRemove,
  onUpdateHolding,
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

  const isCash = stock.type === "cash";
  const computedGainLossPercent = isCash
    ? "0.00"
    : (
        ((stock.currentPrice - stock.costBasis) / stock.costBasis) *
        100
      ).toFixed(2);
  const rawGainLossDollar = isCash
    ? 0
    : stock.shares * (stock.currentPrice - stock.costBasis);
  const computedGainLossDollar = isCash
    ? "0.00"
    : formatCurrency(Math.abs(rawGainLossDollar));

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

    if (type === "shares" && onUpdateHolding) {
      onUpdateHolding(stock.ticker, newValue, stock.costBasis);
    } else if (type === "costBasis" && onUpdateHolding) {
      onUpdateHolding(stock.ticker, stock.shares, newValue);
    }
  };

  // Handle direct value changes
  const handleSharesChange = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
    const newShares = Math.max(0, numValue);

    if (onUpdateHolding) {
      onUpdateHolding(stock.ticker, newShares, stock.costBasis);
    }
  };

  const handleCostBasisChange = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
    const newCostBasis = Math.max(0, numValue);

    if (onUpdateHolding) {
      onUpdateHolding(stock.ticker, stock.shares, newCostBasis);
    }
  };
  const handleDeleteConfirmation = () => {
    modals.openConfirmModal({
      title: "Remove from Portfolio",
      children: (
        <Text size="sm" py="md">
          Are you sure you want to remove <strong>{stock.ticker}</strong> (
          {stock.name}) from your portfolio?
        </Text>
      ),
      labels: { confirm: "Remove", cancel: "Cancel" },
      confirmProps: { color: "red" },
      centered: true,
      onConfirm: () => onRemove(stock.ticker),
      classNames: {
        content: "confirmation-modal",
      },
    });
  };

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td className="portfolio-action-column">
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
      <Table.Td className="portfolio-holding-column">
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
      <Table.Td className="portfolio-data-column">
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
      <Table.Td className="portfolio-data-column">
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
      <Table.Td className="portfolio-data-column">
        <Text>{isCash ? "-" : `$${formatCurrency(stock.currentPrice)}`}</Text>
      </Table.Td>
      <Table.Td className="portfolio-data-column">
        <Text>
          $
          {formatCurrency(
            isCash ? stock.costBasis : stock.shares * stock.currentPrice
          )}
        </Text>
      </Table.Td>
      <Table.Td className="portfolio-data-column">
        <Text c={isCash ? "gray" : rawGainLossDollar < 0 ? "red" : "green"}>
          {isCash
            ? "-"
            : `${rawGainLossDollar < 0 ? "-" : ""}$${computedGainLossDollar}`}
        </Text>
      </Table.Td>
      <Table.Td className="portfolio-data-column">
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
      <Table.Td className="portfolio-data-column">
        <Text>
          {(
            ((stock.shares * stock.currentPrice) / totalPortfolioValue) *
            100
          ).toFixed(2)}
          %
        </Text>
      </Table.Td>
      <Table.Td className="portfolio-action-column">
        <ActionIcon
          radius="md"
          variant="subtle"
          color="red"
          onClick={handleDeleteConfirmation}
        >
          <RiDeleteBin5Fill />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
