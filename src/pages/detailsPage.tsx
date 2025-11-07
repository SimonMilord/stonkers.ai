import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./layout";
import StockQuote from "@components/stockQuote/stockQuote";
import { Flex, Grid, Button, Tooltip } from "@mantine/core";
import CompanyProfileCard from "@components/companyProfileCard/companyProfileCard";
import CompanyMetricsCard from "@components/companyMetricsCard/companyMetricsCard";
import GeneratedContentCard from "@components/generatedContentCard/generatedContentCard";
import CompanyNewsCard from "@components/companyNewsCard/companyNewsCard";
import "./detailsPage.css";
import {
  getQuote,
  getCompanyProfile,
  getEarningsCalendar,
  getEarningsSurprise,
  getCompanyNews,
  getRecommendationTrends,
  getBasicFinancials,
  getReportedFinancials,
  generateCompetitiveAdvantages,
  generateInvestmentRisks,
} from "@utils/requests";
import { useStockInfo } from "../contexts/stockContext";
import { roundToDecimal } from "@utils/functions";
import { getFCFperShareGrowth } from "@utils/metrics";
import { RiAddLargeLine, RiSubtractLine } from "react-icons/ri";

export default function DetailsPage() {
  const location = useLocation();
  const symbol = location?.state?.symbol || "";
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockDetails, setStockDetails] = useState({});
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [investmentRisks, setInvestmentRisks] = useState<string | null>(null);
  const [competitiveAdvantages, setCompetitiveAdvantages] = useState<
    string | null
  >(null);
  const { setCurrentStock } = useStockInfo();

  useEffect(() => {
    fetchStockData(symbol);
    checkIfInWatchlist(symbol);
  }, [symbol]);

  const checkIfInWatchlist = async (symbol: string) => {
    // TODO: Check if stock is already in watchlist
    // This would typically be an API call to check the user's watchlist
    setIsInWatchlist(false);
  };

  const handleAddToWatchlist = async () => {
    try {
      // TODO: Add API call to add stock to watchlist
      console.log(`Adding ${symbol} to watchlist`);
      setIsInWatchlist(true);
      // You can add a notification here
    } catch (error) {
      console.error("Error adding to watchlist:", error);
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
      // Fetch all data with graceful error handling
      const [
        quote,
        companyProfile,
        earningsCalendar,
        earningsSurprise,
        companyNews,
        recommendationTrends,
        basicFinancials,
        reportedFinancials,
      ] = await Promise.allSettled([
        getQuote(symbol),
        getCompanyProfile(symbol),
        getEarningsCalendar(symbol),
        getEarningsSurprise(symbol),
        getCompanyNews(symbol),
        getRecommendationTrends(symbol),
        getBasicFinancials(symbol),
        getReportedFinancials(symbol),
      ]);

      // Extract successful data, ignore failed requests
      const stockData: any = {};

      if (quote.status === "fulfilled") {
        stockData.quoteData = quote.value;
      }

      if (companyProfile.status === "fulfilled") {
        stockData.companyProfileData = companyProfile.value;
      }

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

      if (basicFinancials.status === "fulfilled") {
        stockData.basicFinancialsData = basicFinancials.value;
      }

      if (reportedFinancials.status === "fulfilled") {
        stockData.reportedFinancialsData = reportedFinancials.value;
      }

      setStockDetails(stockData);

      // Update stock context if we have basic data
      if (stockData.quoteData && stockData.companyProfileData) {
        setCurrentStock({
          logo: stockData.companyProfileData?.logo,
          name: stockData.companyProfileData?.name,
          ticker: stockData.companyProfileData?.ticker || symbol,
          currency: stockData.companyProfileData?.currency,
          price: stockData.quoteData?.c,
          change: stockData.quoteData?.d,
          changePercent: stockData.quoteData?.dp,
          epsTTM: stockData.basicFinancialsData?.metric?.epsTTM,
          peRatioTTM: stockData.basicFinancialsData?.metric?.peTTM,
          epsGrowthTTM: stockData.basicFinancialsData?.metric?.epsGrowthTTMYoy,
          fcfPerShareTTM:
            stockData.basicFinancialsData?.series?.quarterly
              ?.fcfPerShareTTM?.[0]?.v,
          fcfYieldTTM: roundToDecimal(
            (stockData.basicFinancialsData?.series?.quarterly
              ?.fcfPerShareTTM?.[0]?.v /
              stockData.quoteData?.c) *
              100,
            2
          ),
          fcfPerShareGrowthTTM: roundToDecimal(
            Number(
              getFCFperShareGrowth(
                stockData.basicFinancialsData?.series?.quarterly
                  ?.fcfPerShareTTM,
                1
              )
            ),
            2
          ),
        });
      }
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
