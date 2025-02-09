import "./App.scss";
import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HomePage from "./pages/homepage";
import DetailsPage from "./pages/detailsPage";

export default class App extends Component {
  state = {
    searchedQuote: "",
  };

  render() {
    return (
      <>
        <Router>
          <div className="App">
            <Switch>
              <Route path='/'>
                <HomePage />
              </Route>
              <Route path='/details/:id'>
                <DetailsPage />
              </Route>
              <Route path='*'>
                <HomePage />
              </Route>
            </Switch>
          </div>
        </Router>
      </>
    );
  }
}