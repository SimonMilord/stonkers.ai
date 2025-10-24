import React from "react";
import { Paper, Title, Divider, Table, Box } from "@mantine/core";
import {
  formatDollarAmount,
  validateMetricsValue,
  roundToDecimal,
} from "@utils/functions";
import { getFCFperShareGrowth } from "@utils/metrics";
import "../cardStyles.css";

type RowItem = {
  key: String;
  value: String;
};

export default function CompanyMetricsCard({
  metricsData,
  profileData,
  quoteData,
  reportedFinancialData,
}: {
  metricsData: any;
  profileData: any;
  quoteData: any;
  reportedFinancialData: any;
}) {
  const notAvailable: string = "N/A";
  const metrics: any = metricsData?.metric;
  const fcfPerShare: number =
    metricsData?.series?.quarterly?.fcfPerShareTTM[0].v;
  const stockPrice: number = quoteData?.c;
  const fcfPerShareArray = metricsData?.series?.quarterly?.fcfPerShareTTM;

  const getFCFYield = () => {
    const fcfYield = (fcfPerShare / stockPrice) * 100;
    return `${roundToDecimal(fcfYield, 2)}%` || notAvailable;
  };

  const getPriceToFCF = () => {
    return `${roundToDecimal(stockPrice / fcfPerShare, 2)}` || notAvailable;
  };

  const retrieveCashOnBalanceSheet = (): number => {
    const sharesOutstanding = profileData?.shareOutstanding;
    const cashPerShare = metrics?.cashPerSharePerShareAnnual;

    return roundToDecimal(cashPerShare * sharesOutstanding, 2) * 1000000;
  };

  const retrieveDebtOnBalanceSheet = (): number => {
    const longTermDebtConceptTarget = "us-gaap_LongTermDebtNoncurrent";
    const longTermDebtTargetLabel = "Long-term debt";

    const balanceSheetEntries = reportedFinancialData?.report?.bs;
    const longTermDebt = balanceSheetEntries?.find(
      (entry: any) =>
        entry?.concept === longTermDebtConceptTarget ||
        entry?.label === longTermDebtTargetLabel
    );

    return roundToDecimal(longTermDebt?.value, 2);
  };

  const companyValuationItems = [
    {
      key: "PE (TTM):",
      value: validateMetricsValue(`${roundToDecimal(metrics?.peTTM, 2)}`),
    },
    {
      key: "Forward PE:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.forwardPE, 2)}`),
    },
    {
      key: "P/S:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.psTTM, 2)}`),
    },
    {
      key: "P/B:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.pbAnnual, 2)}`),
    },
    { key: "P/FCF:", value: `${getPriceToFCF()}` },
    {
      key: `FCF Yield ($${roundToDecimal(fcfPerShare, 2)} / $${roundToDecimal(
        stockPrice,
        2
      )}):`,
      value: `${getFCFYield()}`,
    },
  ];

  const companyGrowthItems = [
    {
      key: "Rev growth TTM:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.revenueGrowthTTMYoy, 2)}`, "%"),
    },
    {
      key: "Rev growth 3Y:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.revenueGrowth3Y, 2)}`, "%"),
    },
    {
      key: "Rev growth 5Y:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.revenueGrowth5Y, 2)}`, "%"),
    },
    {
      key: "EPS growth TTM:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.epsGrowthTTMYoy, 2)}`, "%"),
    },
    {
      key: "EPS growth 3Y:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.epsGrowth3Y, 2)}`, "%"),
    },
    {
      key: "EPS growth 5Y:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.epsGrowth5Y, 2)}`, "%"),
    },
    { key: "FCF/Sh growth 3Y:", value: `${getFCFperShareGrowth(fcfPerShareArray, 3) ?? "--.--%"}` },
    { key: "FCF/Sh growth 5Y:", value: `${getFCFperShareGrowth(fcfPerShareArray, 5) ?? "--.--%"}` },
  ];

  const companyProfitabilityItems = [
    {
      key: "Gross margin TTM:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.grossMarginTTM, 2)}`, "%"),
    },
    {
      key: "Operating margin TTM:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.operatingMarginTTM, 2)}`, "%"),
    },
    {
      key: "Profit margin TTM:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.netProfitMarginTTM, 2)}`, "%"),
    },
    {
      key: "ROA:",
      value:validateMetricsValue(`${roundToDecimal(metrics?.roaTTM, 2)}`, "%"),
    },
    {
      key: "ROE:",
      value: validateMetricsValue(`${roundToDecimal(metrics?.roeTTM, 2)}`, "%"),
    },
    {
      key: "ROIC:",
      value: validateMetricsValue(
        `${roundToDecimal(metricsData?.series?.annual?.roic[0].v * 100, 2)}`,
        "%"
      ),
    },
    {
      key: "FCF margin:",
      value:
        `${roundToDecimal(
          metricsData?.series?.annual?.fcfMargin[0].v * 100,
          2
        )}%` || notAvailable,
    },
  ];

  const companyFinHealthItems = [
    {
      key: "Cash:",
      value: validateMetricsValue(
        formatDollarAmount(retrieveCashOnBalanceSheet())
      ),
    },
    {
      key: "LT Debt:",
      value: validateMetricsValue(
        formatDollarAmount(retrieveDebtOnBalanceSheet())
      ),
    },
    {
      key: "Net Cash position:",
      value: validateMetricsValue(
        formatDollarAmount(
          retrieveCashOnBalanceSheet() - retrieveDebtOnBalanceSheet()
        )
      ),
    },
    {
      key: "Div/sh:",
      value: validateMetricsValue(
        roundToDecimal(metrics?.dividendPerShareTTM, 2),
        "$"
      ),
    },
    {
      key: "Div yield:",
      value: validateMetricsValue(
        roundToDecimal(metrics?.currentDividendYieldTTM, 2),
        "%"
      ),
    },
    {
      key: "Payout ratio:",
      value: validateMetricsValue(
        roundToDecimal(metrics?.payoutRatioTTM, 2),
        "%"
      ),
    },
  ];

  const buildRows = (items: RowItem[]) => {
    return items.map((item, index) => (
      <Table.Tr key={index}>
        <Table.Td className="tableRow">{item.key}</Table.Td>
        <Table.Td className="tableRow tableRow__value">{item.value}</Table.Td>
      </Table.Tr>
    ));
  };

  return (
    <div>
      <Paper withBorder radius="md" p="lg">
        <Title order={3} mb="8">
          Company Metrics
        </Title>
        <Divider mb="lg" />
        <Table withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="tableHead">Valuation</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{buildRows(companyValuationItems)}</Table.Tbody>
        </Table>
        <Box mb="lg" />
        <Table withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="tableHead">Growth</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{buildRows(companyGrowthItems)}</Table.Tbody>
        </Table>
        <Box mb="lg" />
        <Table withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="tableHead">Profitability</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{buildRows(companyProfitabilityItems)}</Table.Tbody>
        </Table>
        <Box mb="lg" />
        <Table withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="tableHead">Financial Health</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{buildRows(companyFinHealthItems)}</Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}
