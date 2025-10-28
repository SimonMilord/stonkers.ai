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
      const [
        quote,
        companyProfile,
        earningsCalendar,
        earningsSurprise,
        companyNews,
        recommendationTrends,
        basicFinancials,
        reportedFinancials,
      ] = await Promise.all([
        getQuote(symbol),
        getCompanyProfile(symbol),
        getEarningsCalendar(symbol),
        getEarningsSurprise(symbol),
        getCompanyNews(symbol),
        getRecommendationTrends(symbol),
        getBasicFinancials(symbol),
        getReportedFinancials(symbol),
      ]);

      const stockData = {
        quoteData: quote,
        companyProfileData: companyProfile,
        earningsCalendarData: earningsCalendar,
        earningsSurpriseData: earningsSurprise,
        companyNewsData: companyNews,
        recommendationTrendsData: recommendationTrends,
        basicFinancialsData: basicFinancials,
        reportedFinancialsData: reportedFinancials,
      };

      setStockDetails(stockData);
      setCurrentStock({
        logo: companyProfile?.logo,
        name: companyProfile?.name,
        ticker: companyProfile?.ticker || symbol,
        currency: companyProfile?.currency,
        price: quote?.c,
        change: quote?.d,
        changePercent: quote?.dp,
        epsTTM: basicFinancials?.metric?.epsTTM,
        peRatioTTM: basicFinancials?.metric?.peTTM,
        epsGrowthTTM: basicFinancials?.metric?.epsGrowthTTMYoy,
        fcfPerShareTTM: basicFinancials?.series?.quarterly?.fcfPerShareTTM[0].v,
        fcfYieldTTM: roundToDecimal(
          (basicFinancials?.series?.quarterly?.fcfPerShareTTM[0].v / quote?.c) *
            100,
          2
        ),
        fcfPerShareGrowthTTM: roundToDecimal(Number(getFCFperShareGrowth(basicFinancials?.series?.quarterly?.fcfPerShareTTM, 1)), 2),
      });
    } catch (error) {
      console.error("Error fetching stock data: ", error);
    }
    setLoading(false);
  };

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
              <Tooltip label={`${isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}`}>
                <Button
                  variant={"light"}
                  color={isInWatchlist ? "red" : "blue"}
                  onClick={isInWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
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
              generatedContent="TODO: ADD GENERATED CONTENT HERE"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <GeneratedContentCard
              title="Investment Risks"
              generatedContent="TODO: ADD GENERATED CONTENT HERE"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <CompanyNewsCard title={`Recent News`} newsData={stockDetails?.companyNewsData} />
          </Grid.Col>
        </Grid>
      </>
    </Layout>
  );
}
