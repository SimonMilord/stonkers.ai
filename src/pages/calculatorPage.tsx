import React, { useState, useEffect } from "react";
import Layout from "./layout";
import StockQuote from "@components/stockQuote/stockQuote";
import { Center, Flex, Grid, Switch, Text } from "@mantine/core";
import CalculatorFormCard from "@components/calculatorFormCard/calculatorFormCard";
import CalculatorResultsCard from "@components/calculatorResultsCard/calculatorResultsCard";
import { useStockInfo } from "../contexts/stockContext";
import { roundToDecimal } from "@utils/functions";
import "./calculatorPage.css";

export type metrics = {
  [key: string]: number | undefined;
};

export type CalculatorMethod = {
  methodName: string;
  metrics?: metrics;
};

export type FormValues = {
  fcfPerShare: number;
  fcfGrowthRate: number;
  targetFcfYield: number;
  desiredReturn: number;
  eps: number;
  epsGrowthRate: number;
  targetPeRatio: number;
};

export type CalculationResults = {
  fairValue: number;
  currentPrice: number;
  targetPrice5yr: number;
  projectedCagr: number;
};

const defaultDesiredReturn = 15;

export default function CalculatorPage() {
  const [opened, setOpened] = useState(false);
  const [isEPSMethod, setIsEPSMethod] = useState(false);
  const { currentStock } = useStockInfo();

  // Initialize form values based on current stock data
  const [formValues, setFormValues] = useState<FormValues>({
    fcfPerShare: roundToDecimal(currentStock?.fcfPerShareTTM, 2) || 0,
    fcfGrowthRate: roundToDecimal(currentStock?.fcfPerShareGrowthTTM, 2) || 0,
    targetFcfYield: roundToDecimal(currentStock?.fcfYieldTTM, 2) || 0,
    desiredReturn: defaultDesiredReturn,
    eps: roundToDecimal(currentStock?.epsTTM, 2) || 0,
    epsGrowthRate: roundToDecimal(currentStock?.epsGrowthTTM, 2) || 0,
    targetPeRatio: roundToDecimal(currentStock?.peRatioTTM, 2) || 0,
  });

  const [calculationResults, setCalculationResults] =
    useState<CalculationResults>({
      fairValue: 0,
      currentPrice: currentStock?.price || 0,
      targetPrice5yr: 0,
      projectedCagr: 0,
    });

  useEffect(() => {
    if (currentStock) {
      setFormValues({
        fcfPerShare: roundToDecimal(currentStock.fcfPerShareTTM, 2) || 0,
        fcfGrowthRate:
          roundToDecimal(currentStock.fcfPerShareGrowthTTM, 2) || 0,
        targetFcfYield: roundToDecimal(currentStock.fcfYieldTTM, 2) || 0,
        desiredReturn: defaultDesiredReturn,
        eps: roundToDecimal(currentStock.epsTTM, 2) || 0,
        epsGrowthRate: roundToDecimal(currentStock.epsGrowthTTM, 2) || 0,
        targetPeRatio: roundToDecimal(currentStock.peRatioTTM, 2) || 0,
      });
    }
  }, [currentStock]);

  // Calculate returns whenever form values change
  useEffect(() => {
    calculateReturns();
  }, [formValues, isEPSMethod]);

  const handleInputChange = (field: string, value: number) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const calculateReturns = () => {
    const currentPrice = currentStock?.price || 0;
    let fairValue = 0;
    let targetPrice5yr = 0;
    let discountRate = 0;

    if (isEPSMethod) {
      // EPS-based calculation
      const { eps, epsGrowthRate, targetPeRatio, desiredReturn } = formValues;
      const epsYr5 = eps * (1 + epsGrowthRate / 100) ** 5;
      targetPrice5yr = epsYr5 * targetPeRatio;
      discountRate = desiredReturn;
    } else {
      // FCF-based calculation
      const { fcfPerShare, fcfGrowthRate, targetFcfYield, desiredReturn } =
        formValues;
      const futureFcf = fcfPerShare * (1 + fcfGrowthRate / 100) ** 5;
      targetPrice5yr = futureFcf / (targetFcfYield / 100);
      discountRate = desiredReturn;
    }
    fairValue = targetPrice5yr / (1 + discountRate / 100) ** 5;
    const projectedCagr =
      currentPrice > 0
        ? ((targetPrice5yr / currentPrice) ** (1 / 5) - 1) * 100
        : 0;

    setCalculationResults({
      fairValue: roundToDecimal(fairValue, 2),
      currentPrice: roundToDecimal(currentPrice, 2),
      targetPrice5yr: roundToDecimal(targetPrice5yr, 2),
      projectedCagr: roundToDecimal(projectedCagr, 2),
    });
  };

  const companyProfileData = {
    name: currentStock?.name,
    ticker: currentStock?.ticker,
    currency: currentStock?.currency,
    logo: currentStock?.logo,
  };

  const quoteData = {
    c: currentStock?.price,
    d: currentStock?.change,
    dp: currentStock?.changePercent,
  };

  const cashFlowMethodInfo: CalculatorMethod = {
    methodName: "Cash Flows",
    metrics: {
      fcfPerShareTTM: currentStock?.fcfPerShareTTM,
      fcfYieldTTM: currentStock?.fcfYieldTTM,
      fcfPerShareGrowthTTM: currentStock?.fcfPerShareGrowthTTM,
    },
  };

  const earningsMethodInfo: CalculatorMethod = {
    methodName: "Earnings",
    metrics: {
      epsTTM: currentStock?.epsTTM,
      peRatio: currentStock?.peRatioTTM,
      epsGrowthTTM: currentStock?.epsGrowthTTM,
    },
  };

  return (
    <Layout opened={opened} toggle={() => setOpened(!opened)}>
      {currentStock ? (
        <Center>
          <StockQuote
            quoteData={quoteData}
            companyProfileData={companyProfileData}
          />
        </Center>
      ) : (
        <Flex direction="column" align="center" mb="xl">
          <Text c="dimmed">
            No stock selected. Visit a stock details page first.
          </Text>
        </Flex>
      )}
      <Center mb={"lg"}>
        <Switch
          size="xl"
          onLabel="EPS"
          offLabel="FCF"
          checked={isEPSMethod}
          onChange={(event) => setIsEPSMethod(event.currentTarget.checked)}
        />
      </Center>
      <Grid className="calculatorPage">
        <Grid.Col span={6} className="calculator-grid-col">
          <CalculatorFormCard
            method={isEPSMethod ? earningsMethodInfo : cashFlowMethodInfo}
            formValues={formValues}
            onInputChange={handleInputChange}
          />
        </Grid.Col>
        <Grid.Col span={6} className="calculator-grid-col">
          <CalculatorResultsCard
            calculationResults={calculationResults}
            desiredReturn={formValues.desiredReturn}
          />
        </Grid.Col>
      </Grid>
    </Layout>
  );
}
