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
import { modals } from "@mantine/modals";
import { formatCurrency } from "@utils/functions";
import "./portfolioItem.css";

export interface Holding {
  id?: string;
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
  totalPortfolioValue: number;
  onRemove: (ticker: string) => void;
  onUpdateHolding?: (ticker: string, shares: number, costBasis: number) => void;
}

interface CalculatedMetrics {
  gainLossPercent: string;
  gainLossDollar: string;
  rawGainLossDollar: number;
  totalValue: number;
  portfolioPercent: string;
}

const DRAGGING_OPACITY = 0.5;
const ARROW_INCREMENT = 1;
const DECIMAL_PLACES = 2;

const calculateGainLoss = (
  currentPrice: number,
  costBasis: number,
  shares: number,
  isCash: boolean
): { percent: string; dollar: string; raw: number } => {
  if (isCash) {
    return { percent: "0.00", dollar: "0.00", raw: 0 };
  }

  const percentChange = ((currentPrice - costBasis) / costBasis) * 100;
  const dollarChange = shares * (currentPrice - costBasis);

  return {
    percent: percentChange.toFixed(DECIMAL_PLACES),
    dollar: formatCurrency(Math.abs(dollarChange)),
    raw: dollarChange,
  };
};

const calculatePortfolioPercent = (
  value: number,
  totalPortfolioValue: number
): string => {
  return ((value / totalPortfolioValue) * 100).toFixed(DECIMAL_PLACES);
};

const getGainLossColor = (value: number, isCash: boolean): string => {
  if (isCash) return "gray";
  return value < 0 ? "red" : "green";
};

const useCalculatedMetrics = (
  stock: Holding,
  totalPortfolioValue: number
): CalculatedMetrics => {
  return React.useMemo(() => {
    const isCash = stock.type === "cash";
    const gainLoss = calculateGainLoss(
      stock.currentPrice,
      stock.costBasis,
      stock.shares,
      isCash
    );
    
    const totalValue = isCash 
      ? stock.costBasis 
      : stock.shares * stock.currentPrice;
    
    const portfolioPercent = calculatePortfolioPercent(totalValue, totalPortfolioValue);

    return {
      gainLossPercent: gainLoss.percent,
      gainLossDollar: gainLoss.dollar,
      rawGainLossDollar: gainLoss.raw,
      totalValue,
      portfolioPercent,
    };
  }, [stock, totalPortfolioValue]);
};

const useDragAndDrop = (ticker: string) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticker });

  const style = React.useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? DRAGGING_OPACITY : 1,
  }), [transform, transition, isDragging]);

  return { attributes, listeners, setNodeRef, style, isDragging };
};

const HoldingInfo: React.FC<{
  stock: Holding;
  isCash: boolean;
  onNavigate: () => void;
}> = React.memo(({ stock, isCash, onNavigate }) => (
  <Flex align="center">
    {stock.logo && (
      <Image
        mr={12}
        h={25}
        w={25}
        radius="md"
        src={stock.logo}
        fit="cover"
        alt={`${stock.name} logo`}
      />
    )}
    <Text
      onClick={onNavigate}
      className={isCash ? "" : "portfolio-item-name"}
      style={{ cursor: isCash ? "default" : "pointer" }}
      role={isCash ? "text" : "button"}
      tabIndex={isCash ? -1 : 0}
      onKeyDown={(e) => {
        if (!isCash && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onNavigate();
        }
      }}
    >
      {stock.name} ({stock.ticker})
    </Text>
  </Flex>
));

const EditableNumberInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}> = React.memo(({ value, onChange, disabled = false, label }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;

    event.preventDefault();
    const increment = event.key === "ArrowUp" ? ARROW_INCREMENT : -ARROW_INCREMENT;
    const newValue = Math.max(0, value + increment);
    onChange(newValue);
  };

  const handleChange = (inputValue: string | number) => {
    const numValue = typeof inputValue === "string" 
      ? parseFloat(inputValue) || 0 
      : inputValue;
    const newValue = Math.max(0, numValue);
    onChange(newValue);
  };

  if (disabled) {
    return <Text>-</Text>;
  }

  return (
    <NumberInput
      step={1}
      min={0}
      size="xs"
      value={value}
      hideControls
      className="portfolio-number-input"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      aria-label={label}
    />
  );
});

const GainLossDisplay: React.FC<{
  value: string;
  rawValue: number;
  isCash: boolean;
  prefix?: string;
  suffix?: string;
}> = React.memo(({ value, rawValue, isCash, prefix = "", suffix = "" }) => {
  const color = getGainLossColor(rawValue, isCash);
  const displayValue = isCash ? "-" : `${rawValue < 0 ? "-" : ""}${prefix}${value}${suffix}`;

  return (
    <Text c={color}>
      {displayValue}
    </Text>
  );
});

export default React.memo(function PortfolioItem({
  stock,
  totalPortfolioValue,
  onRemove,
  onUpdateHolding,
}: PortfolioItemProps) {
  const history = useHistory();
  const isCash = stock.type === "cash";
  
  const { attributes, listeners, setNodeRef, style, isDragging } = useDragAndDrop(stock.ticker);
  const metrics = useCalculatedMetrics(stock, totalPortfolioValue);

  const handleNavigateToDetails = React.useCallback(() => {
    if (!isCash) {
      history.push(`/details/${stock.ticker}`);
    }
  }, [isCash, history, stock.ticker]);

  const handleSharesChange = React.useCallback((newShares: number) => {
    onUpdateHolding?.(stock.ticker, newShares, stock.costBasis);
  }, [onUpdateHolding, stock.ticker, stock.costBasis]);

  const handleCostBasisChange = React.useCallback((newCostBasis: number) => {
    onUpdateHolding?.(stock.ticker, stock.shares, newCostBasis);
  }, [onUpdateHolding, stock.ticker, stock.shares]);

  const handleDeleteConfirmation = React.useCallback(() => {
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
  }, [onRemove, stock.ticker, stock.name]);

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      {/* Drag Handle */}
      <Table.Td className="portfolio-action-column">
        <ActionIcon
          radius="md"
          variant="subtle"
          color="gray"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          aria-label={`Drag to reorder ${stock.name}`}
          {...attributes}
          {...listeners}
        >
          <RiMenuFill />
        </ActionIcon>
      </Table.Td>

      {/* Holding Name */}
      <Table.Td className="portfolio-holding-column">
        <HoldingInfo
          stock={stock}
          isCash={isCash}
          onNavigate={handleNavigateToDetails}
        />
      </Table.Td>

      {/* Shares */}
      <Table.Td className="portfolio-data-column">
        <EditableNumberInput
          value={stock.shares}
          onChange={handleSharesChange}
          disabled={isCash}
          label={`Number of shares for ${stock.name}`}
        />
      </Table.Td>

      {/* Cost Basis */}
      <Table.Td className="portfolio-data-column">
        <EditableNumberInput
          value={stock.costBasis}
          onChange={handleCostBasisChange}
          label={`Cost basis for ${stock.name}`}
        />
      </Table.Td>

      {/* Current Price */}
      <Table.Td className="portfolio-data-column">
        <Text>{isCash ? "-" : `$${formatCurrency(stock.currentPrice)}`}</Text>
      </Table.Td>

      {/* Total Value */}
      <Table.Td className="portfolio-data-column">
        <Text>${formatCurrency(metrics.totalValue)}</Text>
      </Table.Td>

      {/* Gain/Loss Dollar */}
      <Table.Td className="portfolio-data-column">
        <GainLossDisplay
          value={metrics.gainLossDollar}
          rawValue={metrics.rawGainLossDollar}
          isCash={isCash}
          prefix="$"
        />
      </Table.Td>

      {/* Gain/Loss Percent */}
      <Table.Td className="portfolio-data-column">
        <GainLossDisplay
          value={metrics.gainLossPercent}
          rawValue={metrics.rawGainLossDollar}
          isCash={isCash}
          suffix="%"
        />
      </Table.Td>

      {/* Portfolio Percent */}
      <Table.Td className="portfolio-data-column">
        <Text>{metrics.portfolioPercent}%</Text>
      </Table.Td>

      {/* Delete Button */}
      <Table.Td className="portfolio-action-column">
        <ActionIcon
          radius="md"
          variant="subtle"
          color="red"
          onClick={handleDeleteConfirmation}
          aria-label={`Remove ${stock.name} from portfolio`}
        >
          <RiDeleteBin5Fill />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
});
