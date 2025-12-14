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
import { sanitizeNumericInput } from "../../utils/validation";
import React, { useMemo } from "react";
import { CalculatorMethod, FormValues } from "src/pages/calculatorPage";
import "./calculatorFormCard.css";

const TWO_DECIMALS = 2;
const MAX_PERCENTAGE = 100;
const DEFAULT_VALUE = 0;

// Define component types
interface MetricsSectionProps {
  children?: React.ReactNode;
}

interface MetricProps {
  label: string;
  value: number | null | undefined;
  suffix?: string;
}

interface FormInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
  min?: number;
  max?: number;
  isPercentage?: boolean;
}

const MetricsSection: React.FC<MetricsSectionProps> & {
  Header: React.FC<MetricsSectionProps>;
  Grid: React.FC<MetricsSectionProps>;
  Metric: React.FC<MetricProps>;
} = ({ children }) => (
  <Paper withBorder radius="md" p="lg" mb="lg">
    {children}
  </Paper>
);

MetricsSection.Header = ({ children }) => (
  <Center mb="md">
    <Title order={5}>{children}</Title>
  </Center>
);

MetricsSection.Grid = ({ children }) => (
  <>
    <Divider mb="lg" />
    <Group justify="space-between">{children}</Group>
  </>
);

MetricsSection.Metric = ({ label, value, suffix = "" }) => (
  <Stack gap="xs">
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text fw={500}>
      {value !== null && value !== undefined ? `${value}${suffix}` : "N/A"}
    </Text>
  </Stack>
);

const FormSection: React.FC<MetricsSectionProps> & {
  Input: React.FC<FormInputProps>;
} = ({ children }) => <Box className="calculator-form">{children}</Box>;

FormSection.Input = ({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
  isPercentage = false,
}) => (
  <NumberInput
    className="calculator-number-input"
    label={label}
    variant="filled"
    allowDecimal
    step={1}
    min={min}
    max={max}
    placeholder={placeholder}
    radius="md"
    value={value}
    onChange={(val) => onChange(val || DEFAULT_VALUE)}
    rightSection={isPercentage ? "%" : undefined}
  />
);

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

  // Memoize rounded metrics to avoid recalculation
  const roundedMetrics = useMemo(
    () => ({
      fcfPerShareTTM: roundToDecimal(metrics?.fcfPerShareTTM, TWO_DECIMALS),
      fcfYieldTTM: roundToDecimal(metrics?.fcfYieldTTM, TWO_DECIMALS),
      fcfPerShareGrowthTTM: roundToDecimal(
        metrics?.fcfPerShareGrowthTTM,
        TWO_DECIMALS
      ),
      epsTTM: roundToDecimal(metrics?.epsTTM, TWO_DECIMALS),
      peRatio: roundToDecimal(metrics?.peRatio, TWO_DECIMALS),
      epsGrowthTTM: roundToDecimal(metrics?.epsGrowthTTM, TWO_DECIMALS),
    }),
    [metrics]
  );

  // Enhanced input handler with validation
  const handleInputChange = (field: string, value: number | string) => {
    const sanitized = sanitizeNumericInput(value);
    if (sanitized !== null) {
      onInputChange(field, sanitized);
    }
  };

  // Create wrapped handlers for each field
  const createFieldHandler = (field: string) => (value: number) => handleInputChange(field, value);

  const isEarningsMethod = methodName === "Earnings";
  const isCashFlowMethod = methodName === "Cash Flows";

  return (
    <Paper withBorder radius="md" p="lg" className="calculator-form-card">
      <Title order={3} mb="8">
        Assumptions
      </Title>
      <Divider mb="lg" />
      <MetricsSection>
        <MetricsSection.Header>
          Current {methodName} data (TTM)
        </MetricsSection.Header>
        <MetricsSection.Grid>
          {isEarningsMethod ? (
            <>
              <MetricsSection.Metric
                label="EPS"
                value={roundedMetrics.epsTTM}
              />
              <MetricsSection.Metric
                label="PE ratio"
                value={roundedMetrics.peRatio}
              />
              <MetricsSection.Metric
                label="EPS growth"
                value={roundedMetrics.epsGrowthTTM}
                suffix="%"
              />
            </>
          ) : (
            <>
              <MetricsSection.Metric
                label="FCF/Share"
                value={roundedMetrics.fcfPerShareTTM}
              />
              <MetricsSection.Metric
                label="FCF Yield"
                value={roundedMetrics.fcfYieldTTM}
                suffix="%"
              />
              <MetricsSection.Metric
                label="FCF/Share growth"
                value={roundedMetrics.fcfPerShareGrowthTTM}
                suffix="%"
              />
            </>
          )}
        </MetricsSection.Grid>
      </MetricsSection>
      {isCashFlowMethod ? (
        <FormSection>
          <FormSection.Input
            label="FCF/Share (TTM)"
            value={formValues.fcfPerShare}
            onChange={createFieldHandler("fcfPerShare")}
            placeholder="Enter FCF/Share"
          />
          <FormSection.Input
            label="FCF/Share Growth rate (%)"
            value={formValues.fcfGrowthRate}
            onChange={createFieldHandler("fcfGrowthRate")}
            placeholder="Enter FCF/Share Growth rate"
            max={MAX_PERCENTAGE}
          />
          <FormSection.Input
            label="Target FCF Yield (%)"
            value={formValues.targetFcfYield}
            onChange={createFieldHandler("targetFcfYield")}
            placeholder="Enter FCF Yield"
            max={MAX_PERCENTAGE}
          />
          <FormSection.Input
            label="Desired Return (%)"
            value={formValues.desiredReturn}
            onChange={createFieldHandler("desiredReturn")}
            placeholder="Enter Desired Return"
          />
        </FormSection>
      ) : (
        <FormSection>
          <FormSection.Input
            label="EPS (TTM)"
            value={formValues.eps}
            onChange={(val) => handleInputChange("eps", val)}
            placeholder="Enter EPS value"
          />
          <FormSection.Input
            label="EPS Growth rate (%)"
            value={formValues.epsGrowthRate}
            onChange={(val) => handleInputChange("epsGrowthRate", val)}
            placeholder="Enter EPS growth rate"
            max={MAX_PERCENTAGE}
          />
          <FormSection.Input
            label="Target P/E multiple"
            value={formValues.targetPeRatio}
            onChange={(val) => handleInputChange("targetPeRatio", val)}
            placeholder="Enter target P/E ratio"
          />
          <FormSection.Input
            label="Desired Return (%)"
            value={formValues.desiredReturn}
            onChange={(val) => handleInputChange("desiredReturn", val)}
            placeholder="Enter desired return"
          />
        </FormSection>
      )}
    </Paper>
  );
}
