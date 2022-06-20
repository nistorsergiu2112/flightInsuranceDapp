import React from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default class AirlineView extends React.Component {
    state = {
        formAirlineRegistration: "",
        formAirlineRegistrationName: "",
        formFlightName: "",
        formFlightNumber: "",
        modifyAirlineAddress: "",
        modifyAirlineName: "",
        airlineInfoAddress: "",
        airlinesFetched: [],
        test: ""
    }

    registerAirline = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const { formAirlineRegistration, formAirlineRegistrationName } = this.state;

        contract.registerAirline(formAirlineRegistration, formAirlineRegistrationName);
    }

    fundAirline = async (e) => {
        e.preventDefault();
        const { contract } = this.props;

        contract.fundAirline();
    }

    registerFlight = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const { connectedAccount } = contract;
        const { formFlightName, formFlightNumber } = this.state;

        contract.registerFlight(formFlightNumber, formFlightName);
    }

    // modifyAirlineName = async (e) => {
    //     e.preventDefault();
    //     const { contract } = this.props;
    //     const {modifyAirlineAddress, modifyAirlineName} = this.state;


    //     contract.modifyAirlineName(modifyAirlineAddress, modifyAirlineName)
    // }

    // getAirlineInfo = async (e) => {
    //     e.preventDefault();
    //     const { contract } = this.props;
    //     const {airlineInfoAddress} = this.state;

    //     contract.flightSuretyData.methods.airlines(airlineInfoAddress).call().then(function(result){console.log(result)})
    // }

    handleBackClick = (e) => {
        e.preventDefault();
        const { modifyView } = this.props;

        modifyView('guest');
    }

    render() {
        return (
            <div>
                <Button variant="outline-dark" onClick={this.handleBackClick}>Go Back</Button>
                <Button variant="outline-dark" onClick={this.fundAirline}>Fund Airline for 10 ETH</Button>
                <h2>Airline View</h2>
                <Form onSubmit={this.registerAirline}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="register-airline">Airline Registration</Form.Label>
                        <Form.Control
                            type="text"
                            id="register-airline"
                            placeholder="Enter Airline Address"
                            aria-describedby="airline-register-address"
                            onChange={e => this.setState({ formAirlineRegistration: e.target.value })}
                        />
                        <Form.Control
                            type="text"
                            id="register-airline"
                            placeholder="Enter Airline Name"
                            aria-describedby="airline-register-name"
                            onChange={e => this.setState({ formAirlineRegistrationName: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Button variant="primary" type="submit">
                            Submit Airline Registration
                        </Button>
                    </Form.Group>
                </Form>
                <Form onSubmit={this.registerFlight}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="register-flight-name">Flight Registration</Form.Label>
                        <Form.Control
                            type="text"
                            id="register-flight-name"
                            placeholder="Enter Flight Name"
                            aria-describedby="register-flight-name"
                            onChange={e => this.setState({ formFlightName: e.target.value })}
                        />
                        <Form.Control
                            type="text"
                            id="register-flight-number"
                            placeholder="Enter Flight Number"
                            aria-describedby="register-flight-number"
                            onChange={e => this.setState({ formFlightNumber: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Button variant="primary" type="submit">
                            Submit Flight Registration
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}