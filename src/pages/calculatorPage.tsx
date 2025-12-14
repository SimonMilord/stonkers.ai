import React, { useState, useEffect, useCallback } from "react";
import { Center, Flex, Grid, Switch, Text } from "@mantine/core";
import Layout from "./layout";
import StockQuote from "@components/stockQuote/stockQuote";
import CalculatorFormCard from "@components/calculatorFormCard/calculatorFormCard";
import CalculatorResultsCard from "@components/calculatorResultsCard/calculatorResultsCard";
import { useStockInfo } from "@contexts/stockContext";
import { safeRoundToDecimal } from "@utils/functions";
import {
  FormValues as CalculatorFormValues,
  CalculationResults as CalculatorResults,
  CalculationParams,
  DEFAULT_DESIRED_RETURN,
  DECIMAL_PLACES,
  PROJECTION_YEARS,
  calculateEPSMethod,
  calculateFCFMethod,
  calculateProjectedCAGR,
  performCalculation,
  createInitialFormValues,
} from "@utils/calculatorUtils";
import usePageTitle from "@hooks/usePageTitle";
import { CompanyProfileData, QuoteData } from "../types/financialApi";
import "./calculatorPage.css";

export interface Metrics {
  [key: string]: number | undefined;
}

export interface CalculatorMethod {
  methodName: string;
  metrics?: Metrics;
}

// Use imported types
export type FormValues = CalculatorFormValues;
export type CalculationResults = CalculatorResults;

const CALCULATION_METHODS = {
  EPS: "EPS",
  FCF: "FCF",
} as const;

const METHOD_INFO = {
  CASH_FLOWS: "Cash Flows",
  EARNINGS: "Earnings",
} as const;

const SWITCH_CONFIG = {
  SIZE: "xl" as const,
  ON_LABEL: CALCULATION_METHODS.EPS,
  OFF_LABEL: CALCULATION_METHODS.FCF,
} as const;

const GRID_CONFIG = {
  SPAN: { base: 12, md: 6 },
  CLASS_NAME: "calculator-grid-col",
} as const;

const MESSAGES = {
  NO_STOCK_SELECTED: "No stock selected. Search for a stock first.",
} as const;

const useCalculatorState = (currentStock: any) => {
  const [opened, setOpened] = useState(false);
  const [isEPSMethod, setIsEPSMethod] = useState(true);
  const [formValues, setFormValues] = useState<FormValues>(() => createInitialFormValues(currentStock));
  const [calculationResults, setCalculationResults] = useState<CalculationResults>({
    fairValue: 0,
    currentPrice: currentStock?.price || 0,
    targetPrice5yr: 0,
    projectedCagr: 0,
  });

  const toggleSidebar = useCallback(() => {
    setOpened(prev => !prev);
  }, []);

  const toggleCalculationMethod = useCallback((checked: boolean) => {
    setIsEPSMethod(checked);
  }, []);

  const handleInputChange = useCallback((field: string, value: number) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  return {
    opened,
    isEPSMethod,
    formValues,
    calculationResults,
    setFormValues,
    setCalculationResults,
    toggleSidebar,
    toggleCalculationMethod,
    handleInputChange,
  };
};

const useCalculatorData = (currentStock: any, isEPSMethod: boolean) => {
  const companyProfileData: CompanyProfileData = React.useMemo(() => ({
    name: currentStock?.name,
    ticker: currentStock?.ticker,
    currency: currentStock?.currency,
    logo: currentStock?.logo,
  }), [currentStock]);

  const quoteData: QuoteData = React.useMemo(() => ({
    c: currentStock?.price,
    d: currentStock?.change,
    dp: currentStock?.changePercent,
  }), [currentStock]);

  const cashFlowMethodInfo: CalculatorMethod = React.useMemo(() => ({
    methodName: METHOD_INFO.CASH_FLOWS,
    metrics: {
      fcfPerShareTTM: currentStock?.fcfPerShareTTM,
      fcfYieldTTM: currentStock?.fcfYieldTTM,
      fcfPerShareGrowthTTM: currentStock?.fcfPerShareGrowthTTM,
    },
  }), [currentStock]);

  const earningsMethodInfo: CalculatorMethod = React.useMemo(() => ({
    methodName: METHOD_INFO.EARNINGS,
    metrics: {
      epsTTM: currentStock?.epsTTM,
      peRatio: currentStock?.peRatioTTM,
      epsGrowthTTM: currentStock?.epsGrowthTTM,
    },
  }), [currentStock]);

  const activeMethod = isEPSMethod ? earningsMethodInfo : cashFlowMethodInfo;

  return {
    companyProfileData,
    quoteData,
    activeMethod,
    cashFlowMethodInfo,
    earningsMethodInfo,
  };
};

// Main component
export default React.memo(function CalculatorPage() {
  const { currentStock } = useStockInfo();
  usePageTitle();
  
  const {
    opened,
    isEPSMethod,
    formValues,
    calculationResults,
    setFormValues,
    setCalculationResults,
    toggleSidebar,
    toggleCalculationMethod,
    handleInputChange,
  } = useCalculatorState(currentStock);

  const {
    companyProfileData,
    quoteData,
    activeMethod,
  } = useCalculatorData(currentStock, isEPSMethod);

  // Update form values when stock changes
  useEffect(() => {
    if (currentStock) {
      const newFormValues = createInitialFormValues(currentStock);
      setFormValues(newFormValues);
    }
  }, [currentStock, setFormValues]);

  // Calculate results when inputs change
  useEffect(() => {
    if (currentStock) {
      const results = performCalculation({
        currentPrice: currentStock.price || 0,
        formValues,
        isEPSMethod,
      });
      setCalculationResults(results);
    }
  }, [currentStock, formValues, isEPSMethod, setCalculationResults]);

  const renderStockQuote = () => {
    if (!currentStock) {
      return (
        <Flex direction="column" align="center" mb="xl">
          <Text c="dimmed">{MESSAGES.NO_STOCK_SELECTED}</Text>
        </Flex>
      );
    }

    return (
      <Center>
        <StockQuote
          quoteData={quoteData}
          companyProfileData={companyProfileData}
        />
      </Center>
    );
  };

  const renderMethodSwitch = () => (
    <Center mb="lg">
      <Switch
        size={SWITCH_CONFIG.SIZE}
        onLabel={SWITCH_CONFIG.ON_LABEL}
        offLabel={SWITCH_CONFIG.OFF_LABEL}
        checked={isEPSMethod}
        onChange={(event) => toggleCalculationMethod(event.currentTarget.checked)}
        aria-label="Toggle between EPS and FCF calculation methods"
      />
    </Center>
  );

  const renderCalculatorGrid = () => (
    <Grid className="calculatorPage">
      <Grid.Col span={GRID_CONFIG.SPAN} className={GRID_CONFIG.CLASS_NAME}>
        <CalculatorFormCard
          method={activeMethod}
          formValues={formValues}
          onInputChange={handleInputChange}
        />
      </Grid.Col>
      <Grid.Col span={GRID_CONFIG.SPAN} className={GRID_CONFIG.CLASS_NAME}>
        <CalculatorResultsCard
          calculationResults={calculationResults}
          desiredReturn={formValues.desiredReturn}
        />
      </Grid.Col>
    </Grid>
  );

  return (
    <Layout opened={opened} toggle={toggleSidebar}>
      {renderStockQuote()}
      {renderMethodSwitch()}
      {renderCalculatorGrid()}
    </Layout>
  );
});
