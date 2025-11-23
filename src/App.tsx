import "@mantine/core/styles.css";
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import HomePage from "./pages/homePage";
import DetailsPage from "./pages/detailsPage";
import CalculatorPage from "./pages/calculatorPage";
import PortfolioPage from "./pages/portfolioPage";
import WatchlistPage from "./pages/watchlistPage";
import LoginPage from "./pages/loginPage";
import { StockProvider } from "./contexts/stockContext";
import { AuthProvider } from "./contexts/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import usePageTitle from "./hooks/usePageTitle";

export default function App() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <AuthProvider>
          <StockProvider>
            <Router>
              <AppContent />
            </Router>
          </StockProvider>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

// This component is inside the Router context
function AppContent() {
  usePageTitle(); // Now this works because it's inside Router

  return (
    <div className="App">
      <Switch>
        {/* Public routes */}
        <Route
          path="/"
          exact
          render={(routerProps) => <LoginPage {...routerProps} />}
        />
        <Route
          path="/login"
          exact
          render={(routerProps) => <LoginPage {...routerProps} />}
        />

        {/* OAuth success callback route */}
        <Route
          path="/auth/success"
          exact
          render={() => {
            // After successful OAuth, redirect to home
            window.location.href = "/home";
            return <div>Redirecting...</div>;
          }}
        />

        {/* Protected routes - require authentication */}
        <ProtectedRoute path="/home" exact>
          <HomePage />
        </ProtectedRoute>

        <ProtectedRoute path="/details/:id" exact>
          <DetailsPage />
        </ProtectedRoute>

        <ProtectedRoute path="/calculator" exact>
          <CalculatorPage />
        </ProtectedRoute>

        <ProtectedRoute path="/watchlist" exact>
          <WatchlistPage />
        </ProtectedRoute>

        <ProtectedRoute path="/portfolio" exact>
          <PortfolioPage />
        </ProtectedRoute>

        {/* Fallback - redirect to login for unauthenticated users */}
        <Route path="*" render={() => <LoginPage />} />
      </Switch>
    </div>
  );
}
