import CalculatorInfoSection from "@components/calculatorInfoSection/calculatorInfoSection";
import { Box, Divider, NumberInput, Paper, Title } from "@mantine/core";
import React, { useState } from "react";
import { CalculatorMethod } from "src/pages/calculatorPage";

type stockDCFData = {
  FCF: number;
  growthRate: number;
  targetYield: number;
  desiredReturn: number;
};

// const cashFlowMethodInfo: CalculatorMethod = {
//   methodName: "Cash Flows",
//   metrics: [
//     { label: "FCF/Share (TTM)", value: FCFperShareTTM },
//     { label: "FCF yield", value: FCFYieldTTM },
//   ],
// };

// const earningsMethodInfo: CalculatorMethod = {
//   methodName: "Earnings",
//   metrics: [
//     { label: "EPS (TTM)", value: EPSTTM },
//     { label: "P/E (TTM)", value: PEratioTTM },
//     { label: "EPS Growth", value: EPSGrowthTTM },
//   ],
// };

export default function CalculatorFormCard({
  method,
  stockDCFData
}: {
  method: CalculatorMethod;
  stockDCFData: stockDCFData;
}) {
  const { methodName, metrics } = method;
  return (
    <Paper withBorder radius="md" p="lg">
      <Title order={3} mb="8">
        Assumptions
      </Title>
      <Divider mb="lg" />
      <CalculatorInfoSection
        label={methodName}
        metrics={metrics}
      ></CalculatorInfoSection>
      {methodName === "Cash Flows" ? (
        <Box className="calculator-form">
          <NumberInput
            label="FCF/Share (TTM)"
            variant="filled"
            allowDecimal
            placeholder="Enter FCF/Share"
            radius="md"
          />
          <NumberInput
            label="FCF/Share Growth rate"
            variant="filled"
            allowDecimal
            placeholder="Enter FCF/Share Growth rate"
            radius="md"
          />
          <NumberInput
            label="Target FCF Yield"
            variant="filled"
            allowDecimal
            placeholder="Enter FCF Yield"
            radius="md"
          />
          <NumberInput
            label="Desired Return"
            variant="filled"
            allowDecimal
            placeholder="Enter Desired Return"
            radius="md"
          />
        </Box>
      ) : (
        <Box className="calculator-form">
          <NumberInput
            label="EPS (TTM)"
            variant="filled"
            allowDecimal
            placeholder="Input placeholder"
            radius="md"
          />
          <NumberInput
            label="EPS Growth rate"
            variant="filled"
            allowDecimal
            placeholder="Input placeholder"
            radius="md"
          />
          <NumberInput
            label="Target P/E multiple"
            variant="filled"
            allowDecimal
            placeholder="Input placeholder"
            radius="md"
          />
          <NumberInput
            label="Desired Return"
            variant="filled"
            allowDecimal
            placeholder="Enter Desired Return"
            radius="md"
          />
        </Box>
      )}
    </Paper>
  );
}
