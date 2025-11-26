import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Box, Title } from "@mantine/core";
import { Holding } from "@components/portfolioItem/portfolioItem";
import "./portfolioPieChart.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface PortfolioPieChartProps {
  holdings: Holding[];
  title?: string;
}

// Color palette for the pie chart
const chartColors = [
  "#3B82F6", // Blue (Amazon style)
  "#FF9500", // Orange (Google style)
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#84CC16", // Lime
  "#06B6D4", // Cyan
];

export default function PortfolioPieChart({
  holdings,
  title,
}: PortfolioPieChartProps) {
  const totalPortfolioValue = holdings.reduce(
    (acc, item) => acc + item.shares * item.currentPrice,
    0
  );

  // Prepare data for the chart
  const chartData = {
    labels: holdings.map((holding) => holding.ticker),
    datasets: [
      {
        data: holdings.map((holding) => {
          const marketValue = holding.shares * holding.currentPrice;
          return ((marketValue / totalPortfolioValue) * 100).toFixed(1);
        }),
        backgroundColor: chartColors.slice(0, holdings.length),
        borderColor: "#2D3748",
        borderWidth: 2,
        hoverBorderWidth: 3,
        cutout: "50%", // Makes it a donut chart
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 80, // Add padding for external labels
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        color: "#E2E8F0",
        font: {
          weight: "bold" as const,
          size: 12,
        },
        anchor: "end" as const,
        align: "end" as const,
        offset: 10,
        formatter: (value: number, context: any) => {
          const ticker = holdings[context.dataIndex].ticker;
          return `${ticker}\n${value}%`;
        },
        textAlign: "center" as const,
      },
      tooltip: {
        backgroundColor: "#1A202C",
        titleColor: "#E2E8F0",
        bodyColor: "#E2E8F0",
        borderColor: "#4A5568",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const holding = holdings[context.dataIndex];
            const marketValue = holding.shares * holding.currentPrice;
            const percentage = context.parsed;
            return [
              `${holding.name}`,
              `Market Value: $${marketValue.toLocaleString()}`,
              `Weight: ${percentage}%`,
            ];
          },
        },
      },
    },
  };

  if (holdings.length === 0) {
    return null;
  }

  return (
    <Box mt="xl">
      {title && (
        <Title order={3} mb="md" ta="center" c="white">
          {title}
        </Title>
      )}
      <Box
        className="portfolio-pie-chart"
        style={{
          height: `500px`,
          width: `600px`,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <Doughnut data={chartData} options={options} />
      </Box>
    </Box>
  );
}
