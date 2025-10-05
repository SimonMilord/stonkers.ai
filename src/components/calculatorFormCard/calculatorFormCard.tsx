import {
  Box,
  Center,
  Divider,
  Group,
  NumberInput,
  Paper,
  Stack,
  Title,
  Text,
} from "@mantine/core";
import { roundToDecimal } from "@utils/functions";
import React from "react";
import { CalculatorMethod, FormValues } from "src/pages/calculatorPage";
import "./calculatorFormCard.css";

export default function CalculatorFormCard({
  method,
  formValues,
  onInputChange,
}: {
  method: CalculatorMethod;
  formValues: FormValues;
  onInputChange: (field: string, value: number) => void;
}) {
  const { methodName, metrics } = method;
  const fcfPerShareTTM = roundToDecimal(metrics?.fcfPerShareTTM, 2);
  const fcfYieldTTM = roundToDecimal(metrics?.fcfYieldTTM, 2);
  const fcfPerShareGrowthTTM = roundToDecimal(metrics?.fcfPerShareGrowthTTM, 2);
  const epsTTM = roundToDecimal(metrics?.epsTTM, 2);
  const peRatio = roundToDecimal(metrics?.peRatio, 2);
  const epsGrowthTTM = roundToDecimal(metrics?.epsGrowthTTM, 2);



  return (
    <Paper withBorder radius="md" p="lg" className="calculator-form-card">
      <Title order={3} mb="8">
        Assumptions
      </Title>
      <Divider mb="lg" />
      <Paper withBorder radius="md" p="lg">
        <Center>
          <Title order={5} mb="8">
            Current {methodName} data (TTM)
          </Title>
        </Center>
        <Divider mb="lg" />
        {methodName === "Earnings" ? (
          <Group justify="space-between">
            <Stack>
              <Text>EPS</Text>
              <Text>{epsTTM ?? "N/A"}</Text>
            </Stack>
            <Stack>
              <Text>PE ratio</Text>
              <Text>{`${peRatio ?? "N/A"}`}</Text>
            </Stack>
            <Stack>
              <Text>EPS growth</Text>
              <Text>{`${epsGrowthTTM ?? "N/A"}`}</Text>
            </Stack>
          </Group>
        ) : (
          <Group justify="space-between">
            <Stack>
              <Text>FCF/Share</Text>
              <Text>{fcfPerShareTTM ?? "N/A"}</Text>
            </Stack>
            <Stack>
              <Text>FCF Yield</Text>
              <Text>{`${fcfYieldTTM ?? "N/A"}`}</Text>
            </Stack>
            <Stack>
              <Text>FCF/Share growth</Text>
              <Text>{`${fcfPerShareGrowthTTM ?? "N/A"}`}</Text>
            </Stack>
          </Group>
        )}
      </Paper>
      {methodName === "Cash Flows" ? (
        <Box className="calculator-form">
          <NumberInput
            label="FCF/Share (TTM)"
            variant="filled"
            allowDecimal
            placeholder="Enter FCF/Share"
            radius="md"
            value={formValues.fcfPerShare}
            onChange={(value) => onInputChange("fcfPerShare", value || 0)}
          />
                    <NumberInput
            label="FCF/Share Growth rate (%)"
            variant="filled"
            allowDecimal
            placeholder="Enter FCF/Share Growth rate"
            radius="md"
            value={formValues.fcfGrowthRate}
            onChange={(value) => onInputChange("fcfGrowthRate", value || 0)}
          />
          <NumberInput
            label="Target FCF Yield (%)"
            variant="filled"
            allowDecimal
            placeholder="Enter FCF Yield"
            radius="md"
            value={formValues.targetFcfYield}
            onChange={(value) => onInputChange("targetFcfYield", value || 0)}
          />
          <NumberInput
            label="Desired Return (%)"
            variant="filled"
            allowDecimal
            placeholder="Enter Desired Return"
            radius="md"
            value={formValues.desiredReturn}
            onChange={(value) => onInputChange("desiredReturn", value || 0)}
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
            value={formValues.eps}
            onChange={(value) => onInputChange("eps", value || 0)}
          />
          <NumberInput
            label="EPS Growth rate (%)"
            variant="filled"
            allowDecimal
            placeholder="Input placeholder"
            radius="md"
            value={formValues.epsGrowthRate}
            onChange={(value) => onInputChange("epsGrowthRate", value || 0)}
          />
          <NumberInput
            label="Target P/E multiple"
            variant="filled"
            allowDecimal
            placeholder="Input placeholder"
            radius="md"
            value={formValues.targetPeRatio}
            onChange={(value) => onInputChange("targetPeRatio", value || 0)}
          />
          <NumberInput
            label="Desired Return (%)"
            variant="filled"
            allowDecimal
            placeholder="Enter Desired Return"
            radius="md"
            value={formValues.desiredReturn}
            onChange={(value) => onInputChange("desiredReturn", value || 0)}
          />
        </Box>
      )}
    </Paper>
  );
}
