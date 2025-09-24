import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./layout";
import DetailsPageContent from "./detailsPageContent";
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
  const location = useLocation();
  const symbol = location?.state?.symbol || "";
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockDetails, setStockDetails] = useState({});

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

      setStockDetails({
        quoteData: quote,
        companyProfileData: companyProfile,
        earningsCalendarData: earningsCalendar,
        earningsSurpriseData: earningsSurprise,
        companyNewsData: companyNews,
        recommendationTrendsData: recommendationTrends,
        basicFinancialsData: basicFinancials,
        reportedFinancialsData: reportedFinancials,
      });
    } catch (error) {
      console.error("Error fetching stock data: ", error);
    }
    setLoading(false);
  };

  return (
    <Layout loading={loading} opened={opened} toggle={() => setOpened(!opened)}>
      <DetailsPageContent stockData={stockDetails} />
    </Layout>
  );
}