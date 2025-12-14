import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Flex, Button, Tooltip, Loader } from "@mantine/core";
import Layout from "./layout";
import StockQuote from "@components/stockQuote/stockQuote";
import CompanyProfileCard from "@components/companyProfileCard/companyProfileCard";
import CompanyMetricsCard from "@components/companyMetricsCard/companyMetricsCard";
import GeneratedContentCard from "@components/generatedContentCard/generatedContentCard";
import CompanyNewsCard from "@components/companyNewsCard/companyNewsCard";
import {
  getEarningsCalendar,
  getEarningsSurprise,
  getCompanyNews,
  getRecommendationTrends,
  generateCompanyDescription,
  generateCompetitiveAdvantages,
  generateInvestmentRisks,
} from "@utils/requests";
import { useStockData } from "@hooks/useStockData";
import usePageTitle from "@hooks/usePageTitle";
import { RiAddLargeLine, RiSubtractLine } from "react-icons/ri";
import "./detailsPage.css";

// Types
interface StockDetails {
  quoteData?: any;
  companyProfileData?: any;
  basicFinancialsData?: any;
  reportedFinancialsData?: any;
  earningsCalendarData?: any;
  earningsSurpriseData?: any;
  companyNewsData?: any;
  recommendationTrendsData?: any;
}

interface AIContentState {
  investmentRisks: string | null;
  competitiveAdvantages: string | null;
  companyDescription: string | null;
  isGenerating: boolean;
}

interface WatchlistResponse {
  data: {
    inWatchlist: boolean;
  };
}

interface WatchlistRequest {
  ticker: string;
  companyName: string;
}

interface DetailPageParams {
  id: string;
}

// Constants
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const API_ENDPOINTS = {
  WATCHLIST_CHECK: (symbol: string) => `${BACKEND_URL}/watchlist/check/${symbol}`,
  WATCHLIST: `${BACKEND_URL}/watchlist`,
} as const;

const HTTP_CONFIG = {
  CREDENTIALS: "include" as const,
  HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

const BUTTON_CONFIG = {
  SIZE: "md" as const,
  COLORS: {
    ADD: "blue",
    REMOVE: "red",
  },
  VARIANT: "filled" as const,
} as const;

const TOOLTIP_MESSAGES = {
  ADD_TO_WATCHLIST: "Add to Watchlist",
  REMOVE_FROM_WATCHLIST: "Remove from Watchlist",
} as const;

const ERROR_MESSAGES = {
  FETCH_STOCK_DATA: "Error fetching stock data",
  CHECK_WATCHLIST: "Failed to check watchlist status",
  ADD_TO_WATCHLIST: "Failed to add stock to watchlist",
  REMOVE_FROM_WATCHLIST: "Error removing from watchlist",
  GENERATE_AI_CONTENT: "Error generating AI content",
  ALREADY_IN_WATCHLIST: "Stock is already in watchlist.",
} as const;

const HTTP_STATUS = {
  CONFLICT: 409,
} as const;

// Utility functions
const getSymbolFromParams = (id?: string, locationState?: any): string => {
  return id || locationState?.symbol || "";
};

const hasRequiredContent = (content: string | null): boolean => {
  return !!content?.trim();
};

const hasAllAIContent = (
  risks: string | null,
  advantages: string | null,
  description: string | null
): boolean => {
  return (
    hasRequiredContent(risks) &&
    hasRequiredContent(advantages) &&
    hasRequiredContent(description)
  );
};

const createWatchlistRequest = (profileData: any): WatchlistRequest => ({
  ticker: profileData.ticker,
  companyName: profileData.name,
});

const createInitialAIContentState = (): AIContentState => ({
  investmentRisks: null,
  competitiveAdvantages: null,
  companyDescription: null,
  isGenerating: false,
});

// Custom hooks
const useWatchlistStatus = () => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const checkWatchlistStatus = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.WATCHLIST_CHECK(symbol), {
        method: "GET",
        credentials: HTTP_CONFIG.CREDENTIALS,
      });

      if (!response.ok) {
        console.error(ERROR_MESSAGES.CHECK_WATCHLIST, response.status);
        setIsInWatchlist(false);
        return;
      }

      const data: WatchlistResponse = await response.json();
      setIsInWatchlist(data.data.inWatchlist === true);
    } catch (error) {
      console.error(ERROR_MESSAGES.CHECK_WATCHLIST, error);
      setIsInWatchlist(false);
    }
  }, []);

  const addToWatchlist = useCallback(async (profileData: any): Promise<void> => {
    if (isInWatchlist) return;

    try {
      const response = await fetch(API_ENDPOINTS.WATCHLIST, {
        method: "POST",
        credentials: HTTP_CONFIG.CREDENTIALS,
        headers: HTTP_CONFIG.HEADERS,
        body: JSON.stringify(createWatchlistRequest(profileData)),
      });

      if (!response.ok) {
        if (response.status === HTTP_STATUS.CONFLICT) {
          console.warn(ERROR_MESSAGES.ALREADY_IN_WATCHLIST);
          setIsInWatchlist(true);
          return;
        }
        throw new Error(ERROR_MESSAGES.ADD_TO_WATCHLIST);
      }

      await response.json();
      setIsInWatchlist(true);
    } catch (error) {
      console.error(ERROR_MESSAGES.ADD_TO_WATCHLIST, error);
    }
  }, [isInWatchlist]);

  const removeFromWatchlist = useCallback(async (): Promise<void> => {
    try {
      setIsInWatchlist(false);
      // TODO: Implement actual API call for removal
    } catch (error) {
      console.error(ERROR_MESSAGES.REMOVE_FROM_WATCHLIST, error);
    }
  }, []);

  return {
    isInWatchlist,
    checkWatchlistStatus,
    addToWatchlist,
    removeFromWatchlist,
  };
};

const useAIContent = () => {
  const [aiContent, setAIContent] = useState<AIContentState>(createInitialAIContentState);
  const currentCompanyRef = useRef<string | null>(null);

  const resetAIContent = useCallback(() => {
    setAIContent(createInitialAIContentState());
    currentCompanyRef.current = null;
  }, []);

  const generateAIContent = useCallback(async (companyName: string) => {
    if (!companyName || aiContent.isGenerating) return;
    
    // Skip if already generating for this company
    if (currentCompanyRef.current === companyName) return;
    
    // Skip if we already have all content for this company
    if (hasAllAIContent(
      aiContent.investmentRisks,
      aiContent.competitiveAdvantages,
      aiContent.companyDescription
    )) {
      return;
    }

    currentCompanyRef.current = companyName;
    setAIContent(prev => ({ ...prev, isGenerating: true }));

    try {
      const promises: Promise<string>[] = [];
      
      // Only fetch content that we don't have yet
      if (!hasRequiredContent(aiContent.competitiveAdvantages)) {
        promises.push(generateCompetitiveAdvantages(companyName));
      } else {
        promises.push(Promise.resolve(aiContent.competitiveAdvantages!));
      }

      if (!hasRequiredContent(aiContent.investmentRisks)) {
        promises.push(generateInvestmentRisks(companyName));
      } else {
        promises.push(Promise.resolve(aiContent.investmentRisks!));
      }

      if (!hasRequiredContent(aiContent.companyDescription)) {
        promises.push(generateCompanyDescription(companyName));
      } else {
        promises.push(Promise.resolve(aiContent.companyDescription!));
      }

      const [advantages, risks, description] = await Promise.all(promises);

      // Only update state if we're still looking at the same company
      if (currentCompanyRef.current === companyName) {
        setAIContent({
          competitiveAdvantages: advantages,
          investmentRisks: risks,
          companyDescription: description,
          isGenerating: false,
        });
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.GENERATE_AI_CONTENT, error);
      setAIContent(prev => ({ ...prev, isGenerating: false }));
    } finally {
      if (currentCompanyRef.current === companyName) {
        currentCompanyRef.current = null;
      }
    }
  }, [aiContent]);

  return {
    ...aiContent,
    resetAIContent,
    generateAIContent,
  };
};

const useStockDetails = () => {
  const [stockDetails, setStockDetails] = useState<StockDetails>({});
  const [loading, setLoading] = useState(false);
  const { fetchAndSetStockData } = useStockData();

  const fetchStockData = useCallback(async (symbol: string) => {
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
      const stockData: StockDetails = {
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
      console.error(ERROR_MESSAGES.FETCH_STOCK_DATA, error);
    } finally {
      setLoading(false);
    }
  }, [fetchAndSetStockData]);

  return {
    stockDetails,
    loading,
    fetchStockData,
  };
};

export default React.memo(function DetailsPage() {
  const location = useLocation();
  const { id } = useParams<DetailPageParams>();
  const symbol = getSymbolFromParams(id, location?.state);
  
  const [opened, setOpened] = useState(false);
  
  const { stockDetails, loading, fetchStockData } = useStockDetails();
  const {
    isInWatchlist,
    checkWatchlistStatus,
    addToWatchlist,
    removeFromWatchlist,
  } = useWatchlistStatus();
  const {
    investmentRisks,
    competitiveAdvantages,
    companyDescription,
    isGenerating: isGeneratingContent,
    resetAIContent,
    generateAIContent,
  } = useAIContent();
  
  usePageTitle();

  const toggleSidebar = useCallback(() => {
    setOpened(prev => !prev);
  }, []);

  const handleAddToWatchlist = useCallback(() => {
    if (stockDetails.companyProfileData) {
      addToWatchlist(stockDetails.companyProfileData);
    }
  }, [addToWatchlist, stockDetails.companyProfileData]);

  const handleRemoveFromWatchlist = useCallback(() => {
    removeFromWatchlist();
  }, [removeFromWatchlist]);

  // Effect for symbol changes
  useEffect(() => {
    resetAIContent();
    fetchStockData(symbol);
    checkWatchlistStatus(symbol);
  }, [symbol, resetAIContent, fetchStockData, checkWatchlistStatus]);

  // Effect for AI content generation
  useEffect(() => {
    if (stockDetails.companyProfileData?.name) {
      generateAIContent(stockDetails.companyProfileData.name);
    }
  }, [stockDetails.companyProfileData?.name, generateAIContent]);

  const renderWatchlistButton = () => {
    if (!stockDetails.quoteData || !stockDetails.companyProfileData) {
      return null;
    }

    return (
      <Tooltip
        label={
          isInWatchlist
            ? TOOLTIP_MESSAGES.REMOVE_FROM_WATCHLIST
            : TOOLTIP_MESSAGES.ADD_TO_WATCHLIST
        }
      >
        <Button
          variant={BUTTON_CONFIG.VARIANT}
          color={isInWatchlist ? BUTTON_CONFIG.COLORS.REMOVE : BUTTON_CONFIG.COLORS.ADD}
          onClick={isInWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
          size={BUTTON_CONFIG.SIZE}
          aria-label={
            isInWatchlist
              ? TOOLTIP_MESSAGES.REMOVE_FROM_WATCHLIST
              : TOOLTIP_MESSAGES.ADD_TO_WATCHLIST
          }
        >
          {isInWatchlist ? <RiSubtractLine /> : <RiAddLargeLine />}
        </Button>
      </Tooltip>
    );
  };

  const renderStockQuote = () => {
    if (!stockDetails.quoteData || !stockDetails.companyProfileData) {
      return <Loader aria-label="Loading stock data" />;
    }

    return (
      <StockQuote
        quoteData={stockDetails.quoteData}
        companyProfileData={stockDetails.companyProfileData}
      />
    );
  };

  return (
    <Layout loading={loading} opened={opened} toggle={toggleSidebar}>
      <Flex className="details-page-header">
        <div className="details-page-spacer" />
        <div className="details-page-quote-container">
          {renderStockQuote()}
        </div>
        <div className="details-page-button-container">
          {renderWatchlistButton()}
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
              isGeneratingContent && !hasRequiredContent(companyDescription)
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
            isLoading={isGeneratingContent && !hasRequiredContent(competitiveAdvantages)}
          />
        </div>
        <div className="card-container">
          <GeneratedContentCard
            title="Investment Risks"
            generatedContent={investmentRisks}
            isLoading={isGeneratingContent && !hasRequiredContent(investmentRisks)}
          />
        </div>
        <div className="card-container">
          <CompanyNewsCard
            title="Recent News"
            newsData={stockDetails?.companyNewsData}
          />
        </div>
      </Flex>
    </Layout>
  );
});
