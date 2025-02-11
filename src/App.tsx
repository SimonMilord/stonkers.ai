import '@mantine/core/styles.css';
import "./App.css";
import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { MantineProvider } from '@mantine/core';
import HomePage from "./pages/homePage";
import DetailsPage from "./pages/detailsPage";

export default class App extends Component {
  state = {
    searchedQuote: "",
  };

  render() {
    return (
      <MantineProvider>
        <>
          <Router>
            <div className="App">
              <Switch>
                <Route path='/' exact render={(routerProps) => <HomePage {...routerProps} />} />
                <Route path='/details:id' exact render={(routerProps) => <DetailsPage {...routerProps} />} />
                <Route path='*' exact render={(routerProps) => <HomePage {...routerProps} />} />
              </Switch>
            </div>
          </Router>
        </>
      </MantineProvider>
    );
  }
}