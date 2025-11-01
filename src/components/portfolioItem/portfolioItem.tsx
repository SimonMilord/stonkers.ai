import React from "react";
import {
  Table,
  ActionIcon,
  Text,
  Flex,
  Image,
  NumberInput,
} from "@mantine/core";
import { RiDeleteBin5Fill, RiMenuFill } from "react-icons/ri";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useHistory } from "react-router-dom";
import "./portfolioItem.css";

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
}

interface PortfolioItemProps {
  stock: Holding;
  totalPortfolioValue?: number;
  onRemove: (ticker: string) => void;
  key?: string;
}

export default function PortfolioItem({ stock, totalPortfolioValue, onRemove }: PortfolioItemProps) {
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

  const formatPrice = (price: number) => `${price.toFixed(2)}`;
  const computedGainLossPercent = (((stock.currentPrice - stock.costBasis) / stock.costBasis) * 100).toFixed(2);
  const computedGainLossDollar = formatPrice(stock.shares * (stock.currentPrice - stock.costBasis));

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
          {stock.logo && <Image mr={12} h={25} radius="md" src={stock?.logo} />}
          <Text
            onClick={() => history.push(`/details/${stock.ticker}`)}
            className="portfolio-item-name"
          >
            {stock.name} ({stock.ticker})
          </Text>
        </Flex>
      </Table.Td>
      <Table.Td>
        <NumberInput step={1} min={0} size="xs" value={stock.shares} />
      </Table.Td>
      <Table.Td>
        <NumberInput step={1} min={0} size="xs" value={stock.costBasis} />
      </Table.Td>
      <Table.Td>
        <Text>${formatPrice(stock.currentPrice)}</Text>
      </Table.Td>
      <Table.Td>
        <Text>${formatPrice(stock.shares * stock.currentPrice)}</Text>
      </Table.Td>
      <Table.Td>
        <Text c={Number(computedGainLossDollar) < 0 ? 'red' : 'green'}>{computedGainLossDollar}</Text>
      </Table.Td>
      <Table.Td>
        <Text c={Number(computedGainLossPercent) < 0 ? 'red' : 'green'}>{computedGainLossPercent}%</Text>
      </Table.Td>
      <Table.Td>
        <Text>{((stock.shares * stock.currentPrice) / totalPortfolioValue * 100).toFixed(2)}%</Text>
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
