const backendFinnhubUrl = `${import.meta.env.VITE_BACKEND_URL}/finnhub`;

// Standardized error handling helper
const handleApiResponse = async (
  response: Response,
  endpoint: string,
  symbol?: string
) => {
  if (!response.ok) {
    const baseMessage = symbol
      ? `Unable to complete network request for ${endpoint} with symbol: ${symbol}`
      : `Unable to complete network request for ${endpoint}`;

    if (response.status === 404) {
      throw new Error(
        `${endpoint} not found${symbol ? ` for symbol: ${symbol}` : ""} (404)`
      );
    }

    throw new Error(`${baseMessage}. Status: ${response.status}`);
  }

  return await response.json();
};

// ==== API Requests to Finnhub api routes =====
/**
 * Fetch the stock symbol for a given query.
 * @param symbol The stock symbol to search for.
 * @returns The stock symbol if found, otherwise null.
 */
export const getStockSymbol = async (
  symbol: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${backendFinnhubUrl}/search?q=${encodeURIComponent(symbol)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Return null for 404s instead of throwing - this means no symbol found
        return null;
      }
      throw new Error(
        `Unable to complete network request to search for symbol: ${symbol}. Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error searching for symbol ${symbol}:`, error);
    // Only throw for non-404 errors
    if (error instanceof Error && !error.message.includes("404")) {
      throw error;
    }
    return null;
  }
};

/**
 * Fetch the stock quote for a given symbol.
 * @param symbol The stock symbol to fetch the quote for.
 * @returns The stock quote data if found, otherwise null.
 */
export const getQuote = async (symbol: string) => {
  const response = await fetch(`${backendFinnhubUrl}/quote/${symbol}`);
  return await handleApiResponse(response, "stock quote", symbol);
};

/**
 * Fetch the company profile for a given symbol.
 * @param symbol The stock symbol to fetch the company profile for.
 * @returns The company profile data if found, otherwise null.
 */
export const getCompanyProfile = async (symbol: string) => {
  const response = await fetch(`${backendFinnhubUrl}/profile/${symbol}`);
  return await handleApiResponse(response, "company profile", symbol);
};

/**
 * Fetch the earnings calendar for a given symbol.
 * @param symbol The stock symbol to fetch the earnings calendar for.
 * @returns The earnings calendar data if found, otherwise null.
 */
export const getEarningsCalendar = async (symbol: string) => {
  const response = await fetch(
    `${backendFinnhubUrl}/earnings/calendar/${symbol}`
  );
  return await handleApiResponse(response, "earnings calendar", symbol);
};

/**
 * Fetch the earnings surprise for a given symbol.
 * @param symbol The stock symbol to fetch the earnings surprise for.
 * @returns The earnings surprise data if found, otherwise null.
 */
export const getEarningsSurprise = async (symbol: string) => {
  const response = await fetch(
    `${backendFinnhubUrl}/earnings/surprise/${symbol}`
  );
  return await handleApiResponse(response, "earnings surprise", symbol);
};

/**
 * Fetch the company news for a given symbol.
 * @param symbol The stock symbol to fetch the company news for.
 * @returns The company news data if found, otherwise null.
 */
export const getCompanyNews = async (symbol: string) => {
  const response = await fetch(`${backendFinnhubUrl}/news/${symbol}`);
  return await handleApiResponse(response, "company news", symbol);
};

/**
 * Fetch the recommendation trends for a given symbol.
 * @param symbol The stock symbol to fetch the recommendation trends for.
 * @returns The recommendation trends data if found, otherwise null.
 */
export const getRecommendationTrends = async (symbol: string) => {
  const response = await fetch(
    `${backendFinnhubUrl}/recommendations/${symbol}`
  );
  return await handleApiResponse(response, "recommendation trends", symbol);
};

/**
 * Fetch the basic financials for a given symbol.
 * @param symbol The stock symbol to fetch the basic financials for.
 * @returns The basic financials data if found, otherwise null.
 */
export const getBasicFinancials = async (symbol: string) => {
  const response = await fetch(`${backendFinnhubUrl}/metrics/${symbol}`);
  return await handleApiResponse(response, "basic financials", symbol);
};

/**
 * Fetch the reported financials for a given symbol.
 * @param symbol The stock symbol to fetch the reported financials for.
 * @returns The reported financials data if found, otherwise null.
 */
export const getReportedFinancials = async (symbol: string) => {
  const response = await fetch(`${backendFinnhubUrl}/financials/${symbol}`);
  const data = await handleApiResponse(response, "reported financials", symbol);
  return data?.data?.[0];
};

// ==== AI Request to inference service =====
export const generateCompanyDescription = async (companyName: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/ai/generate-company-description`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate company description");
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error generating company description:", error);
    return null;
  }
};

export const generateCompetitiveAdvantages = async (companyName: string) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/ai/generate-competitive-advantages-analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate competitive advantages analysis");
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error generating competitive advantages:", error);
    return null;
  }
};

export const generateInvestmentRisks = async (companyName: string) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/ai/generate-investment-risks-analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate investment risks analysis");
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error generating investment risks:", error);
    return null;
  }
};

// ==== Database Requests to our backend service =====
