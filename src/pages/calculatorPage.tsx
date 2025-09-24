import React, { useState } from "react";
import Layout from "./layout";
import StockQuote from "@components/stockQuote/stockQuote";
import SearchBox from "@components/searchBox/searchBox";
import { Button, Center, Grid, Switch } from "@mantine/core";
import CalculatorFormCard from "@components/calculatorFormCard/calculatorFormCard";
import CalculatorResultsCard from "@components/calculatorResultsCard/calculatorResultsCard";

const FCFperShareTTM = "2.5"; // Placeholder value, replace with actual data
const FCFYieldTTM = "3.59%"; // Placeholder value, replace with actual data
const EPSTTM = "12.25"; // Placeholder value, replace with actual data
const PEratioTTM = "23.25"; // Placeholder value, replace with actual data
const EPSGrowthTTM = "12.3%"; // Placeholder value, replace with actual data

export type metric = {
  label: string;
  value: string;
};

export type CalculatorMethod = {
  methodName: string;
  metrics?: metric[];
};

const cashFlowMethodInfo: CalculatorMethod = {
  methodName: "Cash Flows",
  metrics: [
    { label: "FCF/Share (TTM)", value: FCFperShareTTM },
    { label: "FCF yield", value: FCFYieldTTM },
  ],
};

const earningsMethodInfo: CalculatorMethod = {
  methodName: "Earnings",
  metrics: [
    { label: "EPS (TTM)", value: EPSTTM },
    { label: "P/E (TTM)", value: PEratioTTM },
    { label: "EPS Growth", value: EPSGrowthTTM },
  ],
};

export default function CalculatorPage() {
  const [opened, setOpened] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [isEPSMethod, setIsEPSMethod] = useState(false);

  return (
    <Layout opened={opened} toggle={() => setOpened(!opened)}>
      {/* <SearchBox variant="standalone" setQuoteData={setQuoteData} /> */}
      {/* <StockQuote quoteData={quoteData} companyProfileData={undefined} /> */}
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
        <Grid.Col span={6}>
          <CalculatorFormCard
            method={isEPSMethod ? earningsMethodInfo : cashFlowMethodInfo}
            stockDCFData={isEPSMethod ? earningsMethodInfo.metrics : cashFlowMethodInfo.metrics}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <CalculatorResultsCard />
        </Grid.Col>
      </Grid>
    </Layout>
  );
}
