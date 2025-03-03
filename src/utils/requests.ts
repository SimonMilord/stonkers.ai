const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

/**
 * Fetch a stock quote using the Finnhub API for a given symbol.
 * @param symbol
 * @returns object
 */
export const getQuote = async (symbol: string) => {
  const request = buildFinnhubGetRequest({ symbol });

  const response = await fetch(`${apiUrl}/quote?symbol=${symbol}`, request);
  if (!response.ok) {
    throw new Error(
      "Unable complete network request to get the quote for this symbol: " +
        symbol
    );
  }

  return await response.json();
};

/**
 * Fetch a company profile using the Finnhub API for a given symbol.
 * @param symbol
 * @returns object
 */
export const getCompanyProfile = async (symbol: string) => {
  const request = buildFinnhubGetRequest({ symbol });

  const response = await fetch(
    `${apiUrl}/stock/profile2?symbol=${symbol}`,
    request
  );
  if (!response.ok) {
    throw new Error(
      "Unable complete network request to get the company profile for this symbol: " +
        symbol
    );
  }

  return await response.json();
};

/**
 * Fetch the earnings calendar using the Finnhub API for a given symbol.
 * @param symbol
 * @returns object
 */
export const getEarningsCalendar = async (symbol: string) => {
  const request = buildFinnhubGetRequest({ symbol });

  const response = await fetch(
    `${apiUrl}/calendar/earnings?symbol=${symbol}`,
    request
  );
  if (!response.ok) {
    throw new Error(
      "Unable complete network request to get the earnings calendar for this symbol: " +
        symbol
    );
  }

  return await response.json();
};

/**
 * Fetch the earnings surprise using the Finnhub API for a given symbol.
 * @param symbol
 * @returns object
 */
export const getEarningsSurprise  = async (symbol: string) => {
  const request = buildFinnhubGetRequest({ symbol });

  const response = await fetch(
    `${apiUrl}/stock/earnings?symbol=${symbol}`,
    request
  );
  if (!response.ok) {
    throw new Error(
      "Unable complete network request to get the earnings surprise for this symbol: " +
        symbol
    );
  }

  return await response.json();
};

/**
 * Fetch the company news for a given symbol using the Finnhub API.
 * @param symbol
 * @returns object
 */
export const getCompanyNews = async (symbol: string) => {
  const fromDate = "2025-01-01"; // TO CHANGE to a dynamic date
  const presentDate = new Date();
  const formattedPresentDate = presentDate.toISOString().split('T')[0];
  const request = buildFinnhubGetRequest({ symbol });

  const response = await fetch(
    `${apiUrl}/company-news?symbol=${symbol}&from=${fromDate}&to=${formattedPresentDate}`,
    request
  );
  if (!response.ok) {
    throw new Error(
      "Unable complete network request to get the company news for this symbol: " +
        symbol
    );
  }

  return await response.json();
};

/**
 * Fetch the recommendation trends for a given symbol using the Finnhub API.
 * @param symbol
 * @returns object
 */
export const getRecommendationTrends = async (symbol: string) => {
  const request = buildFinnhubGetRequest({ symbol });

  const response = await fetch(
    `${apiUrl}/stock/recommendation?symbol=${symbol}`,
    request
  );
  if (!response.ok) {
    throw new Error(
      "Unable complete network request to get the recommendation trends for this symbol: " +
        symbol
    );
  }

  return await response.json();
};

const buildFinnhubGetRequest = (params: object) => {
  return {
    method: "GET",
    headers: {
      "X-Finnhub-Token": apiKey,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify({
      ...params,
    }),
  };
};
