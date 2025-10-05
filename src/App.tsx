import "@mantine/core/styles.css";
import "./App.css";
import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import HomePage from "./pages/homePage";
import DetailsPage from "./pages/detailsPage";
import CalculatorPage from "./pages/calculatorPage";
import PortfolioPage from "./pages/portfolioPage";
import WatchlistPage from "./pages/watchlistPage";
import { StockProvider } from "./contexts/stockContext";

export default class App extends Component {

  render() {
    return (
      <MantineProvider>
        <StockProvider>
          <Router>
            <div className="App">
              <Switch>
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
                  render={(routerProps) => <CalculatorPage {...routerProps} />}
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
      </MantineProvider>
    );
  }
}
