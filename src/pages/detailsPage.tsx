import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Layout from "./layout";
import StockQuote from "@components/stockQuote/stockQuote";
import { Flex, Button, Tooltip, Loader } from "@mantine/core";
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
  generateCompanyDescription,
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
  const [companyDescription, setCompanyDescription] = useState<string | null>(
    null,
  );
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const currentCompanyRef = useRef<string | null>(null); // Track current company to prevent race conditions
  const { fetchAndSetStockData } = useStockData();

  useEffect(() => {
    // Clear previous AI content when switching stocks
    setInvestmentRisks(null);
    setCompetitiveAdvantages(null);
    setCompanyDescription(null);
    setIsGeneratingContent(false);
    currentCompanyRef.current = null; // Reset the current company ref

    setIsInWatchlist(false);
    fetchStockData(symbol);
    checkIfInWatchlist(symbol);
  }, [symbol]);

  const checkIfInWatchlist = async (symbol: string) => {
    try {
      const response = await fetch(`${backendUrl}/watchlist/check/${symbol}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to check watchlist status:", response.status);
        setIsInWatchlist(false);
        return;
      }

      const data = await response.json();
      setIsInWatchlist(data.data.inWatchlist === true);
    } catch (error) {
      console.error("Error checking watchlist status:", error);
      setIsInWatchlist(false);
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
          if (response.status === 409) {
            console.warn("Stock is already in watchlist.");
            setIsInWatchlist(true);
            return;
          }
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
      setIsInWatchlist(false);
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
      if (stockDetails.companyProfileData?.name && !isGeneratingContent) {
        const companyName = stockDetails.companyProfileData.name;

        // Skip if we're already generating content for this company
        if (currentCompanyRef.current === companyName) {
          return;
        }

        // Skip if we already have content for this company (check if all exist and are not empty)
        if (
          investmentRisks?.trim() &&
          competitiveAdvantages?.trim() &&
          companyDescription?.trim()
        ) {
          return;
        }

        currentCompanyRef.current = companyName;
        setIsGeneratingContent(true);

        try {
          // Only fetch content that we don't have yet
          const promises = [];

          if (!competitiveAdvantages?.trim()) {
            promises.push(generateCompetitiveAdvantages(companyName));
          } else {
            promises.push(Promise.resolve(competitiveAdvantages));
          }

          if (!investmentRisks?.trim()) {
            promises.push(generateInvestmentRisks(companyName));
          } else {
            promises.push(Promise.resolve(investmentRisks));
          }

          if (!companyDescription?.trim()) {
            promises.push(generateCompanyDescription(companyName));
          } else {
            promises.push(Promise.resolve(companyDescription));
          }

          const [advantages, risks, description] = await Promise.all(promises);

          // Only update state if we're still looking at the same company
          if (currentCompanyRef.current === companyName) {
            setCompetitiveAdvantages(advantages);
            setInvestmentRisks(risks);
            setCompanyDescription(description);
          }
        } catch (error) {
          console.error("Error generating AI content:", error);
        } finally {
          setIsGeneratingContent(false);
          // Clear the ref if we're still processing the same company
          if (currentCompanyRef.current === companyName) {
            currentCompanyRef.current = null;
          }
        }
      }
    };

    fetchAIContent();
  }, [stockDetails.companyProfileData?.name]); // Remove isGeneratingContent and content dependencies to prevent loops

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
              <Loader />
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
                  variant={"filled"}
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

        <Flex
          mih={50}
          gap="md"
          justify="flex-start"
          align="flex-start"
          direction="row"
          wrap="wrap"
        >
          <div className="card-container">
            <CompanyProfileCard
              profileData={stockDetails.companyProfileData}
              companyDescription={companyDescription}
              isGeneratingDescription={
                isGeneratingContent && !companyDescription
              }
            />
          </div>
          <div className="card-container">
            <CompanyMetricsCard
              quoteData={stockDetails.quoteData}
              metricsData={stockDetails.basicFinancialsData}
              profileData={stockDetails.companyProfileData}
              reportedFinancialData={stockDetails.reportedFinancialsData}
            />
          </div>
          <div className="card-container">
            <GeneratedContentCard
              title="Competitive Advantages"
              generatedContent={competitiveAdvantages}
              isLoading={isGeneratingContent && !competitiveAdvantages}
            />
          </div>
          <div className="card-container">
            <GeneratedContentCard
              title="Investment Risks"
              generatedContent={investmentRisks}
              isLoading={isGeneratingContent && !investmentRisks}
            />
          </div>
          <div className="card-container">
            <CompanyNewsCard
              title={`Recent News`}
              newsData={stockDetails?.companyNewsData}
            />
          </div>
        </Flex>
      </>
    </Layout>
  );
}
