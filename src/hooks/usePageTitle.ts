import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "Login - Stonkers.ai",
      "/login": "Login - Stonkers.ai",
      "/home": "Stonkers.ai - Stock Analysis Platform",
      "/calculator": "Calculator - Stonkers.ai",
      "/watchlist": "Watchlist - Stonkers.ai",
      "/portfolio": "Portfolio - Stonkers.ai",
    };

    // Handle dynamic routes
    if (location.pathname.startsWith("/details/")) {
      const symbol = location.pathname.split("/")[2];
      document.title = `${symbol.toUpperCase()} - Stock Details - Stonkers.ai`;
    } else {
      // Use static route titles
      document.title = routeTitles[location.pathname] || "Stonkers.ai";
    }
  }, [location.pathname]);
};

export default usePageTitle;
