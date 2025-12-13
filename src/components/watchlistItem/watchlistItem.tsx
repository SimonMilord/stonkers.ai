import React, { useState, useCallback } from "react";
import { Table, ActionIcon, Text, Badge, Image, Flex } from "@mantine/core";
import { RiDeleteBin5Fill, RiMenuFill } from "react-icons/ri";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useHistory } from "react-router-dom";
import { modals } from "@mantine/modals";
import { formatCurrency } from "@utils/functions";
import "./watchListItem.css";

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

interface ChangeData {
  value: string;
  color: "green" | "red";
}

interface StockImageProps {
  ticker: string;
  name: string;
  onError: () => void;
}

interface StockPlaceholderProps {
  ticker: string;
}

const FINNHUB_IMG_URL = "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/" as const;

const MODAL_CONFIG = {
  TITLE: "Remove from Watchlist",
  LABELS: { confirm: "Remove", cancel: "Cancel" },
  CONFIRM_PROPS: { color: "red" as const },
  CENTERED: true,
  CLASS_NAMES: { content: "confirmation-modal" },
} as const;

const IMAGE_CONFIG = {
  HEIGHT: 25,
  WIDTH: 25,
  RADIUS: "md" as const,
  FIT: "cover" as const,
  MARGIN_RIGHT: 12,
} as const;

const DRAG_STYLES = {
  GRAB: "grab",
  GRABBING: "grabbing",
  DRAGGING_OPACITY: 0.5,
  DEFAULT_OPACITY: 1,
} as const;

const processTickerSymbol = (ticker: string): string => {
  return ticker.includes(".") ? ticker.split(".")[0] : ticker;
};

const formatChange = (changeValue: number): ChangeData => {
  const isPositive = changeValue >= 0;
  return {
    value: `${isPositive ? "+" : ""}${changeValue.toFixed(2)}`,
    color: isPositive ? "green" : "red",
  };
};

const getImageUrl = (ticker: string): string => {
  return `${FINNHUB_IMG_URL}${ticker}.png`;
};

const getPlaceholderText = (ticker: string): string => {
  return ticker.slice(0, 2).toUpperCase();
};

const useWatchlistItemDrag = (ticker: string) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticker });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? DRAG_STYLES.DRAGGING_OPACITY : DRAG_STYLES.DEFAULT_OPACITY,
  };

  const dragCursor = isDragging ? DRAG_STYLES.GRABBING : DRAG_STYLES.GRAB;

  return {
    attributes,
    listeners,
    setNodeRef,
    dragStyle,
    dragCursor,
  };
};

const useImageError = () => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  return {
    imageError,
    handleImageError,
  };
};

const useStockNavigation = () => {
  const history = useHistory();
  
  const navigateToDetails = useCallback((ticker: string) => {
    history.push(`/details/${ticker}`);
  }, [history]);
  
  return { navigateToDetails };
};

const useDeleteConfirmation = (stock: WatchlistItemData, onRemove: (symbol: string) => void) => {
  const processedTicker = processTickerSymbol(stock.ticker);
  
  const handleDeleteConfirmation = useCallback(() => {
    modals.openConfirmModal({
      title: MODAL_CONFIG.TITLE,
      children: (
        <Text size="sm" py="md">
          Are you sure you want to remove <strong>{processedTicker}</strong> (
          {stock.name}) from your watchlist?
        </Text>
      ),
      labels: MODAL_CONFIG.LABELS,
      confirmProps: MODAL_CONFIG.CONFIRM_PROPS,
      centered: MODAL_CONFIG.CENTERED,
      onConfirm: () => onRemove(stock.ticker),
      classNames: MODAL_CONFIG.CLASS_NAMES,
    });
  }, [processedTicker, stock.name, stock.ticker, onRemove]);
  
  return { handleDeleteConfirmation };
};

const StockImage: React.FC<StockImageProps> = React.memo(({ ticker, name, onError }) => (
  <Image
    src={getImageUrl(ticker)}
    alt={name}
    className="watchlist-item-logo"
    mr={IMAGE_CONFIG.MARGIN_RIGHT}
    h={IMAGE_CONFIG.HEIGHT}
    w={IMAGE_CONFIG.WIDTH}
    radius={IMAGE_CONFIG.RADIUS}
    fit={IMAGE_CONFIG.FIT}
    onError={onError}
  />
));

const StockPlaceholder: React.FC<StockPlaceholderProps> = React.memo(({ ticker }) => (
  <div className="watchlist-item-logo-placeholder">
    {getPlaceholderText(ticker)}
  </div>
));

const StockInfo: React.FC<{
  stock: WatchlistItemData;
  processedTicker: string;
  imageError: boolean;
  onImageError: () => void;
  onNavigate: (ticker: string) => void;
}> = React.memo(({ stock, processedTicker, imageError, onImageError, onNavigate }) => (
  <Flex>
    {!imageError ? (
      <StockImage 
        ticker={stock.ticker} 
        name={stock.name} 
        onError={onImageError} 
      />
    ) : (
      <StockPlaceholder ticker={processedTicker} />
    )}
    <Text
      onClick={() => onNavigate(processedTicker)}
      className="watchlist-item-name"
    >
      {stock.name} ({processedTicker})
    </Text>
  </Flex>
));

const PriceDisplay: React.FC<{ price: number }> = React.memo(({ price }) => (
  <Text>${formatCurrency(price)}</Text>
));

const ChangeDisplay: React.FC<{ 
  changeData: ChangeData; 
  isPercentage?: boolean;
  className?: string;
}> = React.memo(({ changeData, isPercentage = false, className }) => (
  <Badge 
    color={changeData.color} 
    variant="light" 
    size="sm"
    className={className}
  >
    {changeData.value}{isPercentage ? "%" : ""}
  </Badge>
));

const DragHandle: React.FC<{
  cursor: string;
  attributes: any;
  listeners: any;
}> = React.memo(({ cursor, attributes, listeners }) => (
  <ActionIcon
    radius="md"
    variant="subtle"
    color="gray"
    style={{ cursor }}
    {...attributes}
    {...listeners}
    aria-label="Drag to reorder"
  >
    <RiMenuFill />
  </ActionIcon>
));

const DeleteButton: React.FC<{
  onDelete: () => void;
}> = React.memo(({ onDelete }) => (
  <ActionIcon
    radius="md"
    variant="subtle"
    color="red"
    onClick={onDelete}
    aria-label="Remove from watchlist"
  >
    <RiDeleteBin5Fill />
  </ActionIcon>
));

export default React.memo(function WatchlistItem({ stock, onRemove }: WatchlistItemProps) {
  const processedTicker = React.useMemo(() => processTickerSymbol(stock.ticker), [stock.ticker]);
  
  const { imageError, handleImageError } = useImageError();
  const { navigateToDetails } = useStockNavigation();
  const { handleDeleteConfirmation } = useDeleteConfirmation(stock, onRemove);
  const {
    attributes,
    listeners,
    setNodeRef,
    dragStyle,
    dragCursor,
  } = useWatchlistItemDrag(stock.ticker);

  // Memoize change calculations
  const changePercentData = React.useMemo(() => formatChange(stock.changePercent), [stock.changePercent]);
  const changeDollarData = React.useMemo(() => formatChange(stock.changeDollar), [stock.changeDollar]);

  return (
    <Table.Tr 
      ref={setNodeRef} 
      style={dragStyle}
      role="row"
      aria-label={`Watchlist item for ${stock.name}`}
    >
      <Table.Td>
        <DragHandle
          cursor={dragCursor}
          attributes={attributes}
          listeners={listeners}
        />
      </Table.Td>
      <Table.Td>
        <StockInfo
          stock={stock}
          processedTicker={processedTicker}
          imageError={imageError}
          onImageError={handleImageError}
          onNavigate={navigateToDetails}
        />
      </Table.Td>
      <Table.Td>
        <PriceDisplay price={stock.price} />
      </Table.Td>
      <Table.Td>
        <ChangeDisplay 
          changeData={changeDollarData} 
          className="hide-on-mobile"
        />
      </Table.Td>
      <Table.Td>
        <ChangeDisplay 
          changeData={changePercentData} 
          isPercentage
        />
      </Table.Td>
      <Table.Td>
        <DeleteButton onDelete={handleDeleteConfirmation} />
      </Table.Td>
    </Table.Tr>
  );
});
