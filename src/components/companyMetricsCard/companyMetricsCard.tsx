import React from "react";
import {roundToDecimal} from '@utils/functions';
import { Paper, Title, Divider, Table, Box } from "@mantine/core";
import { formatDollarAmount } from "@utils/functions";
import "../cardStyles.css";

type RowItem = {
  key: String;
  value: String;
}

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
  const metrics = metricsData?.metric;
  const fcfPerShare = metricsData?.series?.quarterly?.fcfPerShareTTM[0].v;
  const stockPrice = quoteData?.c;

  const getFCFYield = () => {
    const fcfYield = fcfPerShare / stockPrice * 100;
    return `${roundToDecimal(fcfYield, 2)}` || notAvailable;
  }

  const getPriceToFCF = () => {
    return `${roundToDecimal(stockPrice / fcfPerShare, 2)}` || notAvailable;
  }

  const getFCFperShareGrowth = (period: number): string => {
    const fcfPerShareArray = metricsData?.series?.quarterly?.fcfPerShareTTM;
    const previousIndex: number = 4 * period;

    const latestFCFperShValue = fcfPerShareArray && fcfPerShareArray[0]?.v;
    const previousFCFperShValue = fcfPerShareArray && fcfPerShareArray[previousIndex]?.v;

    if (latestFCFperShValue > 0 && previousFCFperShValue > 0) {
      const fcfCagr = ((latestFCFperShValue / previousFCFperShValue) ** (1 / period) - 1) * 100;
      return `${roundToDecimal(fcfCagr, 2)}%`;
    } else {
      return '--.--%';
    }
  }

  const retrieveCashOnBalanceSheet = (): number => {
    const sharesOutstanding = profileData?.shareOutstanding;
    const cashPerShare = metrics?.cashPerSharePerShareAnnual;

    return roundToDecimal(cashPerShare * sharesOutstanding, 2) * 1000000;
  }

  const retrieveDebtOnBalanceSheet = (): number => {
    const longTermDebtConceptTarget = 'us-gaap_LongTermDebtNoncurrent';
    const longTermDebtTargetLabel = 'Long-term debt';

    const balanceSheetEntries = reportedFinancialData?.report?.bs;
    const longTermDebt = balanceSheetEntries?.find((entry: any) => entry?.concept === longTermDebtConceptTarget || entry?.label === longTermDebtTargetLabel);

    return roundToDecimal(longTermDebt?.value, 2);
  }

  const companyValuationItems = [
    { key: "PE (TTM):", value: `${roundToDecimal(metrics?.peTTM, 2)}` || notAvailable },
    { key: "P/S:", value: `${roundToDecimal(metrics?.psTTM, 2)}` || notAvailable },
    { key: "P/B:", value: `${roundToDecimal(metrics?.pbAnnual, 2)}` || notAvailable },
    { key: "P/FCF:", value: `${getPriceToFCF()}` || notAvailable },
    { key: `FCF Yield ($${roundToDecimal(fcfPerShare, 2)} / $${roundToDecimal(stockPrice, 2)}):`, value: `${getFCFYield()}%` || notAvailable },
  ];

  const companyGrowthItems = [
    { key: "Rev growth TTM:", value: `${roundToDecimal(metrics?.revenueGrowthTTMYoy, 2)}%` || notAvailable },
    { key: "Rev growth 3Y:", value: `${roundToDecimal(metrics?.revenueGrowth3Y, 2)}%` || notAvailable },
    { key: "Rev growth 5Y:", value: `${roundToDecimal(metrics?.revenueGrowth5Y, 2)}%` || notAvailable },
    { key: "EPS growth TTM:", value: `${roundToDecimal(metrics?.epsGrowthTTMYoy, 2)}%` || notAvailable },
    { key: "EPS growth 3Y:", value: `${roundToDecimal(metrics?.epsGrowth3Y, 2)}%` || notAvailable },
    { key: "EPS growth 5Y:", value: `${roundToDecimal(metrics?.epsGrowth5Y, 2)}%` || notAvailable },
    { key: "FCF/Sh growth 3Y:", value: `${getFCFperShareGrowth(3)}` },
    { key: "FCF/Sh growth 5Y:", value: `${getFCFperShareGrowth(5)}` },
  ];

  const companyProfitabilityItems = [
    { key: "Gross margin TTM:", value: `${roundToDecimal(metrics?.grossMarginTTM, 2)}%` || notAvailable },
    { key: "Operating margin TTM:", value: `${roundToDecimal(metrics?.operatingMarginTTM, 2)}%` || notAvailable },
    { key: "Profit margin TTM:", value: `${roundToDecimal(metrics?.netProfitMarginTTM, 2)}%` || notAvailable },
    { key: "ROA:", value: `${roundToDecimal(metrics?.roaTTM, 2)}%` || notAvailable },
    { key: "ROE:", value: `${roundToDecimal(metrics?.roeTTM, 2)}%` || notAvailable },
    { key: "ROIC:", value: `${roundToDecimal(metricsData?.series?.annual?.roic[0].v * 100, 2)}%` || notAvailable },
    { key: "FCF margin:", value: `${roundToDecimal(metricsData?.series?.annual?.fcfMargin[0].v * 100, 2)}%` || notAvailable },
  ];

  const companyFinHealthItems = [
    { key: "Cash:", value: `${formatDollarAmount(retrieveCashOnBalanceSheet())}` || notAvailable },
    { key: "LT Debt:", value: `${formatDollarAmount(retrieveDebtOnBalanceSheet())}` || notAvailable }, // TODO: find a reliable source for this
    { key: "Net Cash position:", value: `${formatDollarAmount((retrieveCashOnBalanceSheet() - retrieveDebtOnBalanceSheet()))}` || notAvailable },
    { key: "Div/sh:", value: `${metrics?.dividendPerShareTTM === null ? notAvailable : roundToDecimal(metrics?.dividendPerShareTTM, 2)}$`},
    { key: "Div yield:", value: `${metrics?.currentDividendYieldTTM === null ? notAvailable : metrics?.currentDividendYieldTTM}%`},
    { key: "Payout ratio:", value: `${metrics?.payoutRatioTTM === null ? notAvailable : metrics?.payoutRatioTTM}%`},
  ];

  const buildRows = (items: RowItem[]) => {
    return items.map((item, index) => (
      <Table.Tr key={index}>
        <Table.Td className="tableRow">{item.key}</Table.Td>
        <Table.Td className="tableRow tableRow__value">{item.value}</Table.Td>
      </Table.Tr>
    ));
  }

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
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="tableHead">Growth</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{buildRows(companyGrowthItems)}</Table.Tbody>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="tableHead">Profitability</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{buildRows(companyProfitabilityItems)}</Table.Tbody>
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
