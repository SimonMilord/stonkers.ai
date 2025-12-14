import { Divider, Paper, Title, Text, Group, Stack, Box } from "@mantine/core";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { CalculationResults } from "src/pages/calculatorPage";
import { formatCurrency } from "../../utils/functions";
import "./calculatorResultsCard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const PROJECTION_YEARS = 5;
const CHART_COLORS = {
  primary: "#228BE6",
  primaryHover: "#339AF0",
  positive: "var(--mantine-color-green-6)",
  negative: "var(--mantine-color-red-6)",
  background: "rgba(34, 197, 94, 0.1)",
  gridLines: "rgba(255, 255, 255, 0.1)",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  tooltipBg: "rgba(0, 0, 0, 0.8)",
} as const;

interface MetricDisplayProps {
  label: string;
  value: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  align?: "left" | "center";
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  size = "lg",
  color,
  align = "left",
}) => (
  <Stack gap="xs" align="flex-start">
    <Text size="sm" c="dimmed" ta={align}>
      {label}
    </Text>
    <Text size={size} fw={size === "xl" ? 700 : 600} c={color} ta={align}>
      {value}
    </Text>
  </Stack>
);

export default function CalculatorResultsCard({
  calculationResults,
  desiredReturn,
}: {
  calculationResults: CalculationResults;
  desiredReturn: number;
}) {
  const { fairValue, currentPrice, targetPrice5yr, projectedCagr } =
    calculationResults;

  const returnColor =
    projectedCagr >= 0 ? CHART_COLORS.positive : CHART_COLORS.negative;
  const returnPrefix = projectedCagr > 0 ? "+" : "";
  const formattedReturn = `${returnPrefix}${projectedCagr}%`;

  const { years, projectionData } = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: PROJECTION_YEARS + 1 },
      (_, i) => currentYear + i
    );
    const growthRate = projectedCagr / 100;

    const projectionData = years.map((_, index) => {
      if (index === 0) return currentPrice;
      return currentPrice * Math.pow(1 + growthRate, index);
    });

    return { years, projectionData };
  }, [currentPrice, projectedCagr]);

  const formattedValues = React.useMemo(
    () => ({
      fairValue: formatCurrency(fairValue),
      currentPrice: formatCurrency(currentPrice),
      targetPrice5yr: formatCurrency(targetPrice5yr),
      desiredReturnPrice: formatCurrency(fairValue),
    }),
    [fairValue, currentPrice, targetPrice5yr]
  );

  const chartData = React.useMemo(
    () => ({
      labels: years,
      datasets: [
        {
          label: "Stock Price Projection",
          data: projectionData,
          borderColor: CHART_COLORS.primary,
          backgroundColor: CHART_COLORS.background,
          borderWidth: 3,
          pointBackgroundColor: CHART_COLORS.primary,
          pointBorderColor: CHART_COLORS.primary,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
        },
      ],
    }),
    [years, projectionData]
  );

  const chartOptions: ChartOptions<"line"> = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: {
          backgroundColor: CHART_COLORS.tooltipBg,
          titleColor: "white",
          bodyColor: "white",
          borderColor: CHART_COLORS.primary,
          borderWidth: 1,
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y),
          },
        },
      },
      scales: {
        x: {
          grid: { color: CHART_COLORS.gridLines },
          ticks: { color: CHART_COLORS.textSecondary },
        },
        y: {
          grid: { color: CHART_COLORS.gridLines },
          ticks: {
            color: CHART_COLORS.textSecondary,
            callback: (value) => formatCurrency(Number(value)),
          },
        },
      },
      elements: {
        point: { hoverBackgroundColor: CHART_COLORS.primaryHover },
      },
    }),
    []
  );

  return (
    <Paper withBorder radius="md" p="lg" className="calculator-results-card">
      <Title order={3} mb="8">
        5-Year Projection
      </Title>
      <Divider mb="lg" />

      <Box p="md" mb="lg" className="calculation-results-box">
        <Text size="lg" fw={600} mb="md" ta="center">
          Calculation Results
        </Text>
        <Group justify="space-between">
          <MetricDisplay
            label="Return from today's price"
            value={formattedReturn}
            size="xl"
            color={returnColor}
            align="center"
          />
          <MetricDisplay
            label={`Entry Price for ${desiredReturn}% Return`}
            value={formattedValues.desiredReturnPrice}
            size="xl"
            align="center"
          />
        </Group>
      </Box>
      <Box className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </Box>

      <Group justify="space-between" mt="md">
        <MetricDisplay label="Fair Value" value={formattedValues.fairValue} />
        <MetricDisplay
          label="Current Price"
          value={formattedValues.currentPrice}
        />
        <MetricDisplay
          label="5-Year Target"
          value={formattedValues.targetPrice5yr}
        />
      </Group>
    </Paper>
  );
}
