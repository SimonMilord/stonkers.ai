import React, { useState, useEffect } from "react";
import DetailsPageContent from "./detailsPageContent";
import { Link, useLocation } from "react-router-dom";
import { AppShell, Flex, rem, Loader, Center, Box } from "@mantine/core";
import "./detailsPage.css";
import SearchBox from "@components/searchBox/searchBox";
import { useHeadroom } from "@mantine/hooks";
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

export default function DetailsPage() {
  const pinned = useHeadroom({ fixedAt: 120 });
  const location = useLocation();
  const symbol = location?.state?.symbol || "";

  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({});
  const [companyProfileData, setCompanyProfileData] = useState({});
  const [earningsCalendarData, setEarningsCalendarData] = useState({});
  const [earningsSurpriseData, setEarningsSurpriseData] = useState({});
  const [companyNewsData, setCompanyNewsData] = useState({});
  const [recommendationTrendsData, setRecommendationTrendsData] = useState({});
  const [basicFinancialsData, setBasicFinancialsData] = useState({});
  const [reportedFinancialsData, setReportedFinancialsData] = useState({});

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

      setQuoteData(quote);
      setCompanyProfileData(companyProfile);
      setEarningsCalendarData(earningsCalendar);
      setEarningsSurpriseData(earningsSurprise);
      setCompanyNewsData(companyNews);
      setRecommendationTrendsData(recommendationTrends);
      setBasicFinancialsData(basicFinancials);
      setReportedFinancialsData(reportedFinancials);
    } catch (error) {
      console.error("Error fetching stock data: ", error);
    }
    setLoading(false);
  };

  const stockDetails = {
    quoteData,
    companyProfileData,
    earningsCalendarData,
    earningsSurpriseData,
    companyNewsData,
    recommendationTrendsData,
    basicFinancialsData,
    reportedFinancialsData,
  };

  return (
    <AppShell
      className="details-page"
      header={{ collapsed: !pinned, offset: false }}
      main={{ width: "100vw", padding: "md" }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center" justify="space-between">
          <Link to="/" className="home-link">
            Stonkers.ai
          </Link>
          <Flex justify="center" className="header__searchbox-wrapper">
            <SearchBox variant="header" />
            {loading ? (
              <Center>
                <Box ml="md">
                  <Loader size={24} />
                </Box>
              </Center>
            ) : (
              <></>
            )}
          </Flex>
        </Flex>
      </AppShell.Header>
      <AppShell.Main pt={`calc(${rem(60)} + var(--mantine-spacing-md))`}>
        <DetailsPageContent stockData={stockDetails} />
      </AppShell.Main>
    </AppShell>
  );
}
