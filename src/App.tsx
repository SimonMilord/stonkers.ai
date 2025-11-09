import "@mantine/core/styles.css";
import "./App.css";
import React, { Component, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import HomePage from "./pages/homePage";
import DetailsPage from "./pages/detailsPage";
import CalculatorPage from "./pages/calculatorPage";
import PortfolioPage from "./pages/portfolioPage";
import WatchlistPage from "./pages/watchlistPage";
import LoginPage from "./pages/loginPage";
import { StockProvider } from "./contexts/stockContext";

export default class App extends Component {
  render() {
    return (
      <MantineProvider>
        <ModalsProvider>
          <StockProvider>
            <Router>
              <AutoTitleManager />
              <div className="App">
                <Switch>
                  <Route
                    path="/login"
                    exact
                    render={(routerProps) => <LoginPage {...routerProps} />}
                  />
                  <Route
                    path="/"
                    exact
                    render={(routerProps) => <HomePage {...routerProps} />}
                  />
                  <Route
                    path="/details/:id"
                    exact
                    render={(routerProps) => <DetailsPage {...routerProps} />}
                  />
                  <Route
                    path="/calculator"
                    exact
                    render={(routerProps) => (
                      <CalculatorPage {...routerProps} />
                    )}
                  />
                  <Route
                    path="/watchlist"
                    exact
                    render={(routerProps) => <WatchlistPage {...routerProps} />}
                  />
                  <Route
                    path="/portfolio"
                    exact
                    render={(routerProps) => <PortfolioPage {...routerProps} />}
                  />
                  <Route
                    path="*"
                    exact
                    render={(routerProps) => <HomePage {...routerProps} />}
                  />
                </Switch>
              </div>
            </Router>
          </StockProvider>
        </ModalsProvider>
      </MantineProvider>
    );
  }
}

// Auto title manager that requires no changes to individual pages
function AutoTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "Stonkers.ai - Stock Analysis Platform",
      "/login": "Login - Stonkers.ai",
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

  return null;
}
