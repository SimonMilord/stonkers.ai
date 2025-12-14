import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Box, Title, Text } from "@mantine/core";
import { Holding } from "@components/portfolioItem/portfolioItem";
import "./portfolioPieChart.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface PortfolioPieChartProps {
  holdings: Holding[];
  title?: string;
}

interface ChartHolding {
  ticker: string;
  name: string;
  marketValue: number;
  percentage: number;
}

interface ChartConfig {
  data: any;
  options: any;
}

const CHART_COLORS = [
  "#3B82F6", // Blue
  "#FF9500", // Orange
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

const CHART_CONFIG = {
  CUTOUT_PERCENTAGE: "50%",
  BORDER_WIDTH: 2,
  HOVER_BORDER_WIDTH: 3,
  PADDING: 80,
  BORDER_COLOR: "#2D3748",
  FONT_SIZE: 12,
  LABEL_OFFSET: 10,
  DECIMAL_PLACES: 1,
} as const;

const TOOLTIP_CONFIG = {
  BACKGROUND_COLOR: "#1A202C",
  TITLE_COLOR: "#E2E8F0",
  BODY_COLOR: "#E2E8F0",
  BORDER_COLOR: "#4A5568",
  BORDER_WIDTH: 1,
} as const;

const calculateTotalPortfolioValue = (holdings: Holding[]): number => {
  return holdings.reduce(
    (acc, item) => acc + item.shares * item.currentPrice,
    0
  );
};

const processHoldingsData = (holdings: Holding[]): ChartHolding[] => {
  const totalValue = calculateTotalPortfolioValue(holdings);
  
  return holdings.map((holding) => {
    const marketValue = holding.shares * holding.currentPrice;
    const percentage = Number(((marketValue / totalValue) * 100).toFixed(CHART_CONFIG.DECIMAL_PLACES));
    
    return {
      ticker: holding.ticker,
      name: holding.name,
      marketValue,
      percentage,
    };
  });
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const useChartData = (holdings: Holding[]): ChartConfig => {
  return React.useMemo(() => {
    if (holdings.length === 0) {
      return { data: null, options: null };
    }

    const processedHoldings = processHoldingsData(holdings);
    
    const chartData = {
      labels: processedHoldings.map((holding) => holding.ticker),
      datasets: [
        {
          data: processedHoldings.map((holding) => holding.percentage),
          backgroundColor: CHART_COLORS.slice(0, holdings.length),
          borderColor: CHART_CONFIG.BORDER_COLOR,
          borderWidth: CHART_CONFIG.BORDER_WIDTH,
          hoverBorderWidth: CHART_CONFIG.HOVER_BORDER_WIDTH,
          cutout: CHART_CONFIG.CUTOUT_PERCENTAGE,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: CHART_CONFIG.PADDING,
      },
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          display: true,
          color: TOOLTIP_CONFIG.TITLE_COLOR,
          font: {
            weight: "bold" as const,
            size: CHART_CONFIG.FONT_SIZE,
          },
          anchor: "end" as const,
          align: "end" as const,
          offset: CHART_CONFIG.LABEL_OFFSET,
          formatter: (value: number, context: any) => {
            const ticker = processedHoldings[context.dataIndex].ticker;
            return `${ticker}\n${value}%`;
          },
          textAlign: "center" as const,
        },
        tooltip: {
          backgroundColor: TOOLTIP_CONFIG.BACKGROUND_COLOR,
          titleColor: TOOLTIP_CONFIG.TITLE_COLOR,
          bodyColor: TOOLTIP_CONFIG.BODY_COLOR,
          borderColor: TOOLTIP_CONFIG.BORDER_COLOR,
          borderWidth: TOOLTIP_CONFIG.BORDER_WIDTH,
          callbacks: {
            label: (context: any) => {
              const holding = processedHoldings[context.dataIndex];
              return [
                holding.name,
                `Market Value: ${formatCurrency(holding.marketValue)}`,
                `Weight: ${holding.percentage}%`,
              ];
            },
          },
        },
      },
    };

    return { data: chartData, options };
  }, [holdings]);
};

const EmptyState: React.FC = React.memo(() => (
  <Box mt="xl">
    <Text c="dimmed" ta="center" py="xl">
      No holdings to display in portfolio chart.
    </Text>
  </Box>
));

export default React.memo(function PortfolioPieChart({
  holdings,
  title,
}: PortfolioPieChartProps) {
  const { data: chartData, options } = useChartData(holdings);

  if (holdings.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box 
      mt="xl" 
      component="section" 
      aria-label={title ? `${title} chart` : "Portfolio distribution chart"}
    >
      {title && (
        <Title order={3} mb="md" ta="center" c="white">
          {title}
        </Title>
      )}
      <Box
        className="portfolio-pie-chart"
        role="img"
        aria-label={`Portfolio distribution showing ${holdings.length} holdings`}
      >
        <Doughnut data={chartData} options={options} />
      </Box>
    </Box>
  );
});
