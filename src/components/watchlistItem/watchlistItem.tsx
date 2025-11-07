import React from "react";
import { Table, ActionIcon, Text, Badge } from "@mantine/core";
import { RiDeleteBin5Fill, RiMenuFill } from "react-icons/ri";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useHistory } from "react-router-dom";
import "./watchListItem.css";
import { formatCurrency } from "@utils/functions";

export interface WatchlistItemData {
  symbol: string;
  name: string;
  price: number;
  changeDollar: number;
  changePercent: number;
}

interface WatchlistItemProps {
  stock: WatchlistItemData;
  onRemove: (symbol: string) => void;
  key?: string;
}

export default function WatchlistItem({ stock, onRemove }: WatchlistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stock.symbol });
  const history = useHistory();
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatChange = (changeValue: number) => {
    const isPositive = changeValue >= 0;
    return {
      value: `${isPositive ? "+" : ""}${changeValue.toFixed(2)}%`,
      color: isPositive ? "green" : "red",
    };
  };

  const changePercentData = formatChange(stock.changePercent);
  const changeDollarData = formatChange(stock.changeDollar);

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
        <Text fw={500}>{stock.symbol}</Text>
      </Table.Td>
      <Table.Td>
        <Text
          onClick={() => history.push(`/details/${stock.symbol}`)}
          className="watchlist-item-name"
        >
          {stock.name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text>{formatCurrency(stock.price)}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={changeDollarData.color} variant="light" size="sm">
          {changeDollarData.value}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={changePercentData.color} variant="light" size="sm">
          {changePercentData.value}
        </Badge>
      </Table.Td>
      <Table.Td>
        <ActionIcon
          radius="md"
          variant="subtle"
          color="red"
          onClick={() => onRemove(stock.symbol)}
        >
          <RiDeleteBin5Fill />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
