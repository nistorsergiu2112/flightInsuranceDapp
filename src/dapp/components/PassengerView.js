import React from "react";

export default class PassengerView extends React.Component{
    state = {};

    showRegisteredFlights = () => {
        const { flights } = this.props;

        console.log('flights', flights);
        return flights.map((flight) => <div>{JSON.stringify(flight)}</div>)
    }

    render() {
        return(
            <div>
                <h1>This is the Passenger View</h1>
                <h2>Check the following available flights</h2>
                {this.showRegisteredFlights()}
                <h2>Buy insurance</h2>
            </div>
        )
    }
}
