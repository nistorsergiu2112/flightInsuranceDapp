import React, { Component } from "react";
import Contract from './contract';
import AirlineView from "./components/airlineView";
import PassengerView from "./components/PassengerView";
import GuestView from "./components/GuestView";
import Button from 'react-bootstrap/Button';
import "./App.css";

class App extends Component {
  state = {
    view: "guest",
    flights: []
  };

  componentDidMount = async () => {
    try {
      const contract = new Contract('localhost', () => {});

      const flights = await contract.getRegisteredFlights();
      this.setState({ 
        web3: contract.web3, 
        accounts: contract.accounts,
        contractApp: contract.flightSuretyApp,
        contract,
        flights
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  viewComponent = () => {
    const { view, flights, contract } = this.state;

    if (view === "guest") {
      return <GuestView />;
    } else if (view === "airline") {
      return <AirlineView contract={contract} />;
    } else {
      return <PassengerView flights={flights} />;
    }
  }

  buttonClick = (setView) => {
    this.setState({
      view: setView
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    } else {
      return (
        <div className="App">
          <h1>Welcome to flight surety</h1>
          <Button variant="primary" size="lg" onClick={() => this.buttonClick("airline")}> Join as Airline</Button>
          <Button variant="primary" size="lg" onClick={() => this.buttonClick("passenger")}> Join as Passenger</Button>
          {this.viewComponent()}
        </div>
      );
    }
  }
}

export default App;
