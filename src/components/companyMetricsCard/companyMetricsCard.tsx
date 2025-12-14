import React from "react";
import { Paper, Title, Divider, Table, Box } from "@mantine/core";
import {
  formatDollarAmount,
  validateMetricsValue,
  roundToDecimal,
  getFCFperShareGrowth,
} from "@utils/functions";
import "../cardStyles.css";

interface MetricRow {
  key: string;
  value: string;
}

interface MetricsCardProps {
  metricsData: any;
  profileData: any;
  quoteData: any;
  reportedFinancialData: any;
}

interface CalculatedData {
  fcfPerShare: number;
  stockPrice: number;
  fcfPerShareArray: any[];
  metrics: any;
  cashOnBalance: number;
  debtOnBalance: number;
}

const NOT_AVAILABLE = "N/A";
const DECIMAL_PLACES = 2;
const LONG_TERM_DEBT_CONCEPT = "us-gaap_LongTermDebtNoncurrent";
const LONG_TERM_DEBT_LABEL = "Long-term debt";

const safeDivision = (numerator: number, denominator: number, decimals: number = DECIMAL_PLACES): string => {
  if (!numerator || !denominator || denominator === 0) return NOT_AVAILABLE;
  return roundToDecimal(numerator / denominator, decimals).toString();
};

const formatPercentage = (value: number, decimals: number = DECIMAL_PLACES): string => {
  if (value == null || isNaN(value)) return NOT_AVAILABLE;
  return `${roundToDecimal(value, decimals)}%`;
};

// Data calculation hooks
const useCalculatedData = (
  metricsData: any,
  profileData: any,
  quoteData: any,
  reportedFinancialData: any
): CalculatedData => {
  return React.useMemo(() => {
    const metrics = metricsData?.metric;
    const fcfPerShare = metricsData?.series?.quarterly?.fcfPerShareTTM?.[0]?.v || 0;
    const stockPrice = quoteData?.c || 0;
    const fcfPerShareArray = metricsData?.series?.quarterly?.fcfPerShareTTM || [];

    // Calculate cash on balance sheet
    const sharesOutstanding = profileData?.shareOutstanding || 0;
    const cashPerShare = metrics?.cashPerSharePerShareAnnual || 0;
    const cashOnBalance = roundToDecimal(cashPerShare * sharesOutstanding, DECIMAL_PLACES) * 1000000;

    // Calculate debt on balance sheet
    const balanceSheetEntries = reportedFinancialData?.report?.bs || [];
    const longTermDebt = balanceSheetEntries.find(
      (entry: any) =>
        entry?.concept === LONG_TERM_DEBT_CONCEPT ||
        entry?.label === LONG_TERM_DEBT_LABEL
    );
    const debtOnBalance = roundToDecimal(longTermDebt?.value, DECIMAL_PLACES) || 0;

    return {
      fcfPerShare,
      stockPrice,
      fcfPerShareArray,
      metrics,
      cashOnBalance,
      debtOnBalance,
    };
  }, [metricsData, profileData, quoteData, reportedFinancialData]);
};

const useMetricCalculations = (data: CalculatedData) => {
  return React.useMemo(() => {
    const { fcfPerShare, stockPrice, cashOnBalance, debtOnBalance } = data;

    const fcfYield = fcfPerShare && stockPrice 
      ? formatPercentage((fcfPerShare / stockPrice) * 100)
      : NOT_AVAILABLE;

    const priceToFCF = safeDivision(stockPrice, fcfPerShare);

    const netCashPosition = cashOnBalance - debtOnBalance;

    return {
      fcfYield,
      priceToFCF,
      netCashPosition,
    };
  }, [data]);
};

const useValuationMetrics = (data: CalculatedData, calculations: any): MetricRow[] => {
  return React.useMemo(() => {
    const { metrics, fcfPerShare, stockPrice } = data;
    const { fcfYield, priceToFCF } = calculations;

    return [
      {
        key: "PE (TTM):",
        value: validateMetricsValue(roundToDecimal(metrics?.peTTM, DECIMAL_PLACES)?.toString()),
      },
      {
        key: "Forward PE:",
        value: validateMetricsValue(roundToDecimal(metrics?.forwardPE, DECIMAL_PLACES)?.toString()),
      },
      {
        key: "P/S:",
        value: validateMetricsValue(roundToDecimal(metrics?.psTTM, DECIMAL_PLACES)?.toString()),
      },
      {
        key: "P/B:",
        value: validateMetricsValue(roundToDecimal(metrics?.pbAnnual, DECIMAL_PLACES)?.toString()),
      },
      {
        key: "P/FCF:",
        value: priceToFCF,
      },
      {
        key: `FCF Yield ($${roundToDecimal(fcfPerShare, DECIMAL_PLACES)} / $${roundToDecimal(stockPrice, DECIMAL_PLACES)}):`,
        value: fcfYield,
      },
    ];
  }, [data, calculations]);
};

const useGrowthMetrics = (data: CalculatedData): MetricRow[] => {
  return React.useMemo(() => {
    const { metrics, fcfPerShareArray } = data;

    return [
      {
        key: "Rev growth TTM:",
        value: validateMetricsValue(roundToDecimal(metrics?.revenueGrowthTTMYoy, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "Rev growth 3Y:",
        value: validateMetricsValue(roundToDecimal(metrics?.revenueGrowth3Y, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "Rev growth 5Y:",
        value: validateMetricsValue(roundToDecimal(metrics?.revenueGrowth5Y, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "EPS growth TTM:",
        value: validateMetricsValue(roundToDecimal(metrics?.epsGrowthTTMYoy, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "EPS growth 3Y:",
        value: validateMetricsValue(roundToDecimal(metrics?.epsGrowth3Y, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "EPS growth 5Y:",
        value: validateMetricsValue(roundToDecimal(metrics?.epsGrowth5Y, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "FCF/Sh growth 3Y:",
        value: `${getFCFperShareGrowth(fcfPerShareArray, 3) ?? "--.--"}%`,
      },
      {
        key: "FCF/Sh growth 5Y:",
        value: `${getFCFperShareGrowth(fcfPerShareArray, 5) ?? "--.--"}%`,
      },
    ];
  }, [data]);
};

const useProfitabilityMetrics = (data: CalculatedData, metricsData: any): MetricRow[] => {
  return React.useMemo(() => {
    const { metrics } = data;

    return [
      {
        key: "Gross margin TTM:",
        value: validateMetricsValue(roundToDecimal(metrics?.grossMarginTTM, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "Operating margin TTM:",
        value: validateMetricsValue(roundToDecimal(metrics?.operatingMarginTTM, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "Profit margin TTM:",
        value: validateMetricsValue(roundToDecimal(metrics?.netProfitMarginTTM, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "ROA:",
        value: validateMetricsValue(roundToDecimal(metrics?.roaTTM, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "ROE:",
        value: validateMetricsValue(roundToDecimal(metrics?.roeTTM, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "ROIC:",
        value: validateMetricsValue(
          roundToDecimal(metricsData?.series?.annual?.roic?.[0]?.v * 100, DECIMAL_PLACES)?.toString(),
          "%"
        ),
      },
      {
        key: "FCF margin:",
        value: formatPercentage(metricsData?.series?.annual?.fcfMargin?.[0]?.v * 100),
      },
    ];
  }, [data, metricsData]);
};

const useFinancialHealthMetrics = (data: CalculatedData, calculations: any): MetricRow[] => {
  return React.useMemo(() => {
    const { metrics, cashOnBalance, debtOnBalance } = data;
    const { netCashPosition } = calculations;

    return [
      {
        key: "Cash:",
        value: validateMetricsValue(formatDollarAmount(cashOnBalance)),
      },
      {
        key: "LT Debt:",
        value: validateMetricsValue(formatDollarAmount(debtOnBalance)),
      },
      {
        key: "Net Cash position:",
        value: validateMetricsValue(formatDollarAmount(netCashPosition)),
      },
      {
        key: "Div/sh:",
        value: validateMetricsValue(roundToDecimal(metrics?.dividendPerShareTTM, DECIMAL_PLACES)?.toString(), "$"),
      },
      {
        key: "Div yield:",
        value: validateMetricsValue(roundToDecimal(metrics?.currentDividendYieldTTM, DECIMAL_PLACES)?.toString(), "%"),
      },
      {
        key: "Payout ratio:",
        value: validateMetricsValue(roundToDecimal(metrics?.payoutRatioTTM, DECIMAL_PLACES)?.toString(), "%"),
      },
    ];
  }, [data, calculations]);
};

const MetricsTable: React.FC<{ title: string; rows: MetricRow[] }> = ({ title, rows }) => (
  <>
    <Table withRowBorders={false}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th className="tableHead">{title}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((item, index) => (
          <Table.Tr key={index}>
            <Table.Td className="tableRow">{item.key}</Table.Td>
            <Table.Td className="tableRow tableRow__value">{item.value}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
    <Box mb="lg" />
  </>
);

export default function CompanyMetricsCard({
  metricsData,
  profileData,
  quoteData,
  reportedFinancialData,
}: MetricsCardProps) {
  const calculatedData = useCalculatedData(metricsData, profileData, quoteData, reportedFinancialData);
  const calculations = useMetricCalculations(calculatedData);
  
  const valuationMetrics = useValuationMetrics(calculatedData, calculations);
  const growthMetrics = useGrowthMetrics(calculatedData);
  const profitabilityMetrics = useProfitabilityMetrics(calculatedData, metricsData);
  const financialHealthMetrics = useFinancialHealthMetrics(calculatedData, calculations);

  return (
    <Paper withBorder radius="md" p="lg">
      <Title order={3} mb="8">
        Company Metrics
      </Title>
      <Divider mb="lg" />
      
      <MetricsTable title="Valuation" rows={valuationMetrics} />
      <MetricsTable title="Growth" rows={growthMetrics} />
      <MetricsTable title="Profitability" rows={profitabilityMetrics} />
      <MetricsTable title="Financial Health" rows={financialHealthMetrics} />
    </Paper>
  );
}
