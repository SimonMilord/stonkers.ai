# Financial Data Fetching Optimization Suggestions

## Current Inefficiencies

### Problem 1: Too Many Individual API Calls

- **Current**: 10+ separate API calls per stock details page
- **Impact**: Slower page loads, increased server load, poor user experience

### Problem 2: Sequential Data Dependencies

- AI content waits for company profile data
- No caching between page navigations
- Redundant calls when navigating back to same stock

## Recommended Solutions

### 1. Bulk Data Endpoint (Backend Change)

```typescript
// Create a single endpoint that fetches all stock data
export const getStockDetails = async (symbol: string) => {
  const response = await fetch(`${backendFinnhubUrl}/stock/${symbol}/complete`);
  return await handleApiResponse(response, "complete stock data", symbol);
};
```

### 2. Optimized Details Page Data Fetcher

```typescript
// hooks/useStockDetails.ts
export const useStockDetails = (symbol: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Single bulk call instead of 8 individual calls
        const allData = await getStockDetails(symbol);

        // Immediately start AI content generation (don't wait)
        const aiPromises = Promise.allSettled([
          generateCompetitiveAdvantages(allData.profile.name),
          generateInvestmentRisks(allData.profile.name),
        ]);

        setData({ ...allData, aiLoading: true });

        // Update AI content when ready
        const [advantages, risks] = await aiPromises;
        setData((prev) => ({
          ...prev,
          competitiveAdvantages:
            advantages.status === "fulfilled" ? advantages.value : null,
          investmentRisks: risks.status === "fulfilled" ? risks.value : null,
          aiLoading: false,
        }));
      } catch (error) {
        console.error("Error fetching stock details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [symbol]);

  return { data, loading };
};
```

### 3. Add Caching Layer

```typescript
// utils/cache.ts
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const stockCache = new Map();

export const getCachedStockData = (symbol: string) => {
  const cached = stockCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedStockData = (symbol: string, data: any) => {
  stockCache.set(symbol, {
    data,
    timestamp: Date.now(),
  });
};
```

### 4. Progressive Loading Strategy

```typescript
// Load critical data first, then enhance with additional data
export const useProgressiveStockData = (symbol: string) => {
  const [coreData, setCoreData] = useState(null);
  const [enhancedData, setEnhancedData] = useState(null);

  useEffect(() => {
    // Phase 1: Load essential data for immediate display
    const loadCoreData = async () => {
      const core = await Promise.allSettled([
        getQuote(symbol),
        getCompanyProfile(symbol),
      ]);
      setCoreData(processCore(core));
    };

    // Phase 2: Load secondary data in background
    const loadEnhancedData = async () => {
      const enhanced = await Promise.allSettled([
        getBasicFinancials(symbol),
        getCompanyNews(symbol),
        getEarningsCalendar(symbol),
      ]);
      setEnhancedData(processEnhanced(enhanced));
    };

    loadCoreData();
    loadEnhancedData(); // Runs in parallel
  }, [symbol]);

  return { coreData, enhancedData };
};
```

### 5. Improved Error Handling & Retries

```typescript
// utils/apiWithRetry.ts
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<Response> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (i === retries)
        throw new Error(`Request failed after ${retries} retries`);
    } catch (error) {
      if (i === retries) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
  throw new Error("Unexpected error in fetchWithRetry");
};
```

## Performance Impact Estimates

### Before Optimization:

- **Page Load Time**: 3-5 seconds
- **API Calls**: 10+ per page
- **Data Transfer**: ~150KB
- **User Experience**: Multiple loading states

### After Optimization:

- **Page Load Time**: 1-2 seconds
- **API Calls**: 2-3 per page (1 bulk + 1-2 AI)
- **Data Transfer**: ~100KB (compressed bulk response)
- **User Experience**: Single loading state, progressive enhancement

## Implementation Priority

1. **High**: Create bulk data endpoint (backend)
2. **High**: Implement caching layer
3. **Medium**: Add progressive loading
4. **Low**: Add retry logic

## Quick Wins (Frontend Only)

1. **Move AI generation to start immediately** (don't wait for useEffect)
2. **Add loading states for individual sections** instead of page-wide loading
3. **Implement component-level caching** using React Query or SWR
4. **Add skeleton loading** for better perceived performance
