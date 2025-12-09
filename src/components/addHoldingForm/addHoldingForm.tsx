import React, { useState, useEffect } from "react";
import {
  Card,
  Stack,
  SegmentedControl,
  Group,
  TextInput,
  NumberInput,
  Button,
  Text,
  Box,
  Loader,
} from "@mantine/core";
import { useStockSearch } from "../../hooks/useStockSearch";
import {
  sanitizeStockSymbol,
  sanitizeNumericInput,
} from "../../utils/validation";

interface AddHoldingFormProps {
  onHoldingAdded: () => void;
  onStockHolding: (stock: any, shares: number, avgPrice: number) => void;
  onCashHolding: (amount: number) => void;
}

export default function AddHoldingForm({
  onHoldingAdded,
  onStockHolding,
  onCashHolding,
}: AddHoldingFormProps) {
  const [positionType, setPositionType] = useState<string>("Stock");
  const [searchTicker, setSearchTicker] = useState<string>("");
  const [shares, setShares] = useState<number | string>("");
  const [avgPricePaid, setAvgPricePaid] = useState<number | string>("");
  const [cashAmount, setCashAmount] = useState<number | string>("");

  const {
    searchLoading,
    foundStock,
    searchError,
    searchForStock,
    clearSearch,
  } = useStockSearch();

  // Debounced search effect
  useEffect(() => {
    if (!searchTicker.trim()) {
      clearSearch();
      return;
    }

    const timeoutId = setTimeout(() => {
      searchForStock(searchTicker);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTicker, searchForStock, clearSearch]);

  const handleTickerSearch = (value: string) => {
    // Only allow valid stock symbol characters while typing
    const sanitized = sanitizeStockSymbol(value);
    if (sanitized !== null || value.trim() === "") {
      setSearchTicker(value);
    }
  };

  const handleAddNewHolding = async () => {
    if (positionType === "Stock") {
      if (!foundStock || !shares || !avgPricePaid) {
        return;
      }

      const sanitizedShares = sanitizeNumericInput(shares);
      const sanitizedAvgPrice = sanitizeNumericInput(avgPricePaid);

      if (sanitizedShares === null || sanitizedShares <= 0) {
        return;
      }

      if (sanitizedAvgPrice === null || sanitizedAvgPrice <= 0) {
        return;
      }

      onStockHolding(foundStock, sanitizedShares, sanitizedAvgPrice);
    } else {
      // Handle cash position
      if (!cashAmount) {
        return;
      }

      const sanitizedCashAmount = sanitizeNumericInput(cashAmount);
      if (sanitizedCashAmount === null || sanitizedCashAmount <= 0) {
        return;
      }

      onCashHolding(sanitizedCashAmount);
    }
    resetNewHoldingForm();
  };

  const resetNewHoldingForm = () => {
    setSearchTicker("");
    setShares("");
    setAvgPricePaid("");
    setCashAmount("");
    clearSearch();
    onHoldingAdded();
  };

  return (
    <Card radius="md" p="lg">
      <Stack align="center">
        {/* Position Type Toggle */}
        <SegmentedControl
          value={positionType}
          onChange={setPositionType}
          color="gray"
          radius="md"
          className="portfolio-segmented-control"
          data={[
            { label: "Stock", value: "Stock" },
            { label: "Cash", value: "Cash" },
          ]}
        />
        {positionType === "Stock" ? (
          /* Stock Form */
          <Group justify="center" className="add-holding-form-group">
            <TextInput
              placeholder="Search stock ticker"
              value={searchTicker}
              radius="md"
              onChange={(event) =>
                handleTickerSearch(event.currentTarget.value)
              }
              rightSection={searchLoading && <Loader size="sm" />}
              className="portfolio-form-input"
            />
            <NumberInput
              placeholder="Shares"
              value={shares}
              onChange={setShares}
              min={0}
              decimalScale={4}
              hideControls
              className="portfolio-form-input"
              radius="md"
            />
            <NumberInput
              placeholder="Cost Basis"
              value={avgPricePaid}
              onChange={setAvgPricePaid}
              min={0}
              decimalScale={2}
              hideControls
              className="portfolio-form-input"
              radius="md"
            />
            <Button
              onClick={handleAddNewHolding}
              disabled={!foundStock || !shares || !avgPricePaid}
              radius="md"
              className={
                !foundStock || !shares || !avgPricePaid
                  ? "portfolio-button-disabled"
                  : ""
              }
            >
              Add New Holding
            </Button>
          </Group>
        ) : (
          /* Cash Form */
          <Group justify="center" className="add-holding-form-group">
            <NumberInput
              placeholder="USD Amount"
              value={cashAmount}
              onChange={setCashAmount}
              min={0}
              decimalScale={2}
              hideControls
              className="portfolio-form-input"
              radius="md"
            />
            <Button
              onClick={handleAddNewHolding}
              disabled={!cashAmount}
              radius="md"
              className={!cashAmount ? "portfolio-button-disabled" : ""}
            >
              Add New Holding
            </Button>
          </Group>
        )}
        {/* Error message container with fixed height */}
        <Box style={{ minHeight: "20px" }}>
          {searchError && (
            <Text size="sm" c="red" ta="center">
              {searchError}
            </Text>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
