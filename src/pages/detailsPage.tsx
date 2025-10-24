import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./layout";
import StockQuote from "@components/stockQuote/stockQuote";
import { Flex, Grid } from "@mantine/core";
import CompanyProfileCard from "@components/companyProfileCard/companyProfileCard";
import CompanyMetricsCard from "@components/companyMetricsCard/companyMetricsCard";
import GeneratedContentCard from "@components/generatedContentCard/generatedContentCard";
import CompanyNewsCard from "@components/companyNewsCard/companyNewsCard";
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

export default function DetailsPage() {
  const location = useLocation();
  const symbol = location?.state?.symbol || "";
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockDetails, setStockDetails] = useState({});
  const { setCurrentStock } = useStockInfo();

  useEffect(() => {
    fetchStockData(symbol);
  }, [symbol]);

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
        <Flex justify="center" mb="lg">
          {stockDetails.quoteData && stockDetails.companyProfileData ? (
            <StockQuote
              quoteData={stockDetails.quoteData}
              companyProfileData={stockDetails.companyProfileData}
            />
          ) : (
            <p>Loading...</p>
          )}
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
