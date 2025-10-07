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

export default function CalculatorResultsCard({
  calculationResults,
  desiredReturn,
}: {
  calculationResults: CalculationResults;
  desiredReturn: number;
}) {
  const { fairValue, currentPrice, targetPrice5yr, projectedCagr } = calculationResults;
  const upsideColor = projectedCagr >= 0 ? "green" : "red";

  // Generate 5-year projection data
  const generateProjectionData = () => {
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear,
      currentYear + 1,
      currentYear + 2,
      currentYear + 3,
      currentYear + 4,
      currentYear + 5,
    ];
    const growthRate = projectedCagr / 100 / 5; // Distribute the total upside over 5 years

    const projectionData = years.map((_, index) => {
      if (index === 0) return currentPrice;
      return currentPrice * Math.pow(1 + growthRate, index);
    });

    return { years, projectionData };
  };

  const { years, projectionData } = generateProjectionData();

  const chartData = {
    labels: years,
    datasets: [
      {
        label: "Stock Price Projection",
        data: projectionData,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "rgb(34, 197, 94)",
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: function (value) {
            return "$" + value;
          },
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: "rgb(34, 197, 94)",
      },
    },
  };

  return (
    <Paper withBorder radius="md" p="lg" className="calculator-results-card">
      <Title order={3} mb="8">
        5-Year Projection
      </Title>
      <Divider mb="lg" />

      <Box
        p="md"
        mb="lg"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Text size="lg" fw={600} mb="md" ta="center">
          Calculation Results
        </Text>
        <Group justify="space-between">
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Return from today's price
            </Text>
            <Text size="xl" fw={700} c={upsideColor}>
              {projectedCagr > 0 ? "+" : ""}
              {projectedCagr}%
            </Text>
          </Stack>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Entry Price for ${desiredReturn}% Return
            </Text>
            <Text size="xl" fw={700}>
              ${calculationResults.fairValue}
            </Text>
          </Stack>
        </Group>
      </Box>
      <Box
        className="chart-container"
        style={{ height: "300px", marginBottom: "16px" }}
      >
        <Line data={chartData} options={chartOptions} />
      </Box>

      <Group justify="space-between" mt="md">
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Fair Value
          </Text>
          <Text size="lg" fw={600}>
            ${fairValue}
          </Text>
        </Stack>
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Current Price
          </Text>
          <Text size="lg">${currentPrice}</Text>
        </Stack>
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            5-Year Target
          </Text>
          <Text size="lg" fw={600}>
            ${targetPrice5yr}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
