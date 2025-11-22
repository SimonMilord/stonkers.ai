import React from "react";
import { Table, ActionIcon, Text, Badge, Image, Flex } from "@mantine/core";
import { RiDeleteBin5Fill, RiMenuFill } from "react-icons/ri";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useHistory } from "react-router-dom";
import { modals } from "@mantine/modals";
import "./watchListItem.css";
import { formatCurrency } from "@utils/functions";

const finnhubImgUrl =
  "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/";

export interface WatchlistItemData {
  ticker: string;
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
  } = useSortable({ id: stock.ticker });
  const history = useHistory();
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatChange = (changeValue: number) => {
    const isPositive = changeValue >= 0;
    return {
      value: `${isPositive ? "+" : ""}${changeValue.toFixed(2)}`,
      color: isPositive ? "green" : "red",
    };
  };

  const changePercentData = formatChange(stock.changePercent);
  const changeDollarData = formatChange(stock.changeDollar);

  const handleDeleteConfirmation = () => {
    modals.openConfirmModal({
      title: "Remove from Watchlist",
      children: (
        <Text size="sm" py="md">
          Are you sure you want to remove <strong>{stock.ticker}</strong> (
          {stock.name}) from your watchlist?
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
        <Flex>
          <Image
            src={`${finnhubImgUrl}${stock.ticker}.png`}
            alt={stock.ticker}
            className="watchlist-item-logo"
            mr={12}
            h={25}
            w={25}
            radius="md"
            fit="cover"
          />
          <Text
            onClick={() => history.push(`/details/${stock.ticker}`)}
            className="watchlist-item-name"
          >
            {stock.name} ({stock.ticker})
          </Text>
        </Flex>
      </Table.Td>
      <Table.Td>
        <Text>${formatCurrency(stock.price)}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={changeDollarData.color} variant="light" size="sm">
          {changeDollarData.value}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={changePercentData.color} variant="light" size="sm">
          {changePercentData.value}%
        </Badge>
      </Table.Td>
      <Table.Td>
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
