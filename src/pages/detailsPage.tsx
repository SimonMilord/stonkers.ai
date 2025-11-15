import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import Layout from "./layout";
import StockQuote from "@components/stockQuote/stockQuote";
import { Flex, Grid, Button, Tooltip } from "@mantine/core";
import CompanyProfileCard from "@components/companyProfileCard/companyProfileCard";
import CompanyMetricsCard from "@components/companyMetricsCard/companyMetricsCard";
import GeneratedContentCard from "@components/generatedContentCard/generatedContentCard";
import CompanyNewsCard from "@components/companyNewsCard/companyNewsCard";
import "./detailsPage.css";
import {
  getEarningsCalendar,
  getEarningsSurprise,
  getCompanyNews,
  getRecommendationTrends,
  generateCompetitiveAdvantages,
  generateInvestmentRisks,
} from "@utils/requests";
import { useStockData } from "../hooks/useStockData";
import { RiAddLargeLine, RiSubtractLine } from "react-icons/ri";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function DetailsPage() {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const symbol = id || location?.state?.symbol || "";

  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockDetails, setStockDetails] = useState({});
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [investmentRisks, setInvestmentRisks] = useState<string | null>(null);
  const [competitiveAdvantages, setCompetitiveAdvantages] = useState<
    string | null
  >(null);
  const { fetchAndSetStockData } = useStockData();

  useEffect(() => {
    fetchStockData(symbol);
    checkIfInWatchlist(symbol);
  }, [symbol]);

  const checkIfInWatchlist = async (symbol: string) => {
    try {
      const response = await fetch(`${backendUrl}/watchlist/check/${symbol}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setIsInWatchlist(data.inWatchlist);
    } catch (error) {
      console.error("Error checking watchlist status:", error);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!isInWatchlist) {
      try {
        const response = await fetch(`${backendUrl}/watchlist`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticker: stockDetails.companyProfileData.ticker,
            companyName: stockDetails.companyProfileData.name,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add stock to watchlist");
        }

        await response.json();
        setIsInWatchlist(true);
        // You can add a notification here
      } catch (error) {
        console.error("Error adding to watchlist:", error);
      }
    }
  };

  const handleRemoveFromWatchlist = async () => {
    try {
      // TODO: Add API call to remove stock from watchlist
      console.log(`Removing ${symbol} from watchlist`);
      setIsInWatchlist(false);
      // You can add a notification here
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

  const fetchStockData = async (symbol: string) => {
    setLoading(true);

    try {
      // Use hook to fetch core stock data and update context
      const coreData = await fetchAndSetStockData(symbol);

      // Fetch additional data needed only for details page
      const [
        earningsCalendar,
        earningsSurprise,
        companyNews,
        recommendationTrends,
      ] = await Promise.allSettled([
        getEarningsCalendar(symbol),
        getEarningsSurprise(symbol),
        getCompanyNews(symbol),
        getRecommendationTrends(symbol),
      ]);

      // Combine core data from hook with additional details page data
      const stockData: any = {
        quoteData: coreData.quoteData,
        companyProfileData: coreData.profileData,
        basicFinancialsData: coreData.basicFinancialsData,
        reportedFinancialsData: coreData.reportedFinancialsData,
      };

      // Add additional data if successful
      if (earningsCalendar.status === "fulfilled") {
        stockData.earningsCalendarData = earningsCalendar.value;
      }

      if (earningsSurprise.status === "fulfilled") {
        stockData.earningsSurpriseData = earningsSurprise.value;
      }

      if (companyNews.status === "fulfilled") {
        stockData.companyNewsData = companyNews.value;
      }

      if (recommendationTrends.status === "fulfilled") {
        stockData.recommendationTrendsData = recommendationTrends.value;
      }

      setStockDetails(stockData);
    } catch (error) {
      console.error("Error fetching stock data: ", error);
    }
    setLoading(false);
  };

  // Fetch AI-generated content when company profile data is available
  useEffect(() => {
    const fetchAIContent = async () => {
      if (stockDetails.companyProfileData?.name) {
        const companyName = stockDetails.companyProfileData.name;

        // Fetch both analyses in parallel
        const [advantages, risks] = await Promise.all([
          generateCompetitiveAdvantages(companyName),
          generateInvestmentRisks(companyName),
        ]);

        setCompetitiveAdvantages(advantages);
        setInvestmentRisks(risks);
      }
    };

    fetchAIContent();
  }, [stockDetails.companyProfileData?.name]);

  return (
    <Layout loading={loading} opened={opened} toggle={() => setOpened(!opened)}>
      <>
        <Flex className="details-page-header">
          <div className="details-page-spacer"></div>
          <div className="details-page-quote-container">
            {stockDetails.quoteData && stockDetails.companyProfileData ? (
              <StockQuote
                quoteData={stockDetails.quoteData}
                companyProfileData={stockDetails.companyProfileData}
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <div className="details-page-button-container">
            {stockDetails.quoteData && stockDetails.companyProfileData && (
              <Tooltip
                label={`${
                  isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"
                }`}
              >
                <Button
                  variant={"light"}
                  color={isInWatchlist ? "red" : "blue"}
                  onClick={
                    isInWatchlist
                      ? handleRemoveFromWatchlist
                      : handleAddToWatchlist
                  }
                  size="md"
                >
                  {isInWatchlist ? <RiSubtractLine /> : <RiAddLargeLine />}
                </Button>
              </Tooltip>
            )}
          </div>
        </Flex>

        <Grid>
          <Grid.Col span={6}>
            <CompanyProfileCard profileData={stockDetails.companyProfileData} />
          </Grid.Col>
          <Grid.Col span={6}>
            <CompanyMetricsCard
              quoteData={stockDetails.quoteData}
              metricsData={stockDetails.basicFinancialsData}
              profileData={stockDetails.companyProfileData}
              reportedFinancialData={stockDetails.reportedFinancialsData}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <GeneratedContentCard
              title="Competitive Advantages"
              generatedContent={competitiveAdvantages || "Generating..."}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <GeneratedContentCard
              title="Investment Risks"
              generatedContent={investmentRisks || "Generating..."}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <CompanyNewsCard
              title={`Recent News`}
              newsData={stockDetails?.companyNewsData}
            />
          </Grid.Col>
        </Grid>
      </>
    </Layout>
  );
}
