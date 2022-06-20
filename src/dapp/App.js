import React, { Component } from "react";
import Contract from './contract';
import AirlineView from "./components/airlineView";
import PassengerView from "./components/PassengerView";
import GuestView from "./components/GuestView";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import "../dapp/App.css";

class App extends Component {
  state = {
    view: "guest"
  };

  componentDidMount = async () => {
    try {
      const contract = new Contract('localhost', () => {});

      this.setState({ 
        web3: contract.web3, 
        accounts: contract.accounts,
        contractApp: contract.flightSuretyApp,
        contract
      });
    } catch (error) {
      console.error(error);
    }
  };

  viewComponent = () => {
    const { view, contract } = this.state;

    if (view === "guest") {
      return <GuestView />;
    } else if (view === "airline") {
      return <AirlineView contract={contract} modifyView={this.modifyView}/>;
    } else {
      return <PassengerView contract={contract} modifyView={this.modifyView}/>;
    }
  }

  modifyView = (setView) => {
    this.setState({
      view: setView
    })
  }

  render() {
    const { view } = this.state;
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    } else {
      return (
        <div className="App">
          <Container>
            {view === 'guest' ? (
              <>
                <h1>FlightBuddy</h1>
                <Button variant="outline-dark" size="lg" onClick={() => this.modifyView("airline")}> Join as Airline</Button>
                <Button variant="outline-dark" size="lg" onClick={() => this.modifyView("passenger")}> Join as Passenger</Button>
              </> 
              )
            : 
            this.viewComponent()}
          </Container>
        </div>
      );
    }
  }
}

export default App;
