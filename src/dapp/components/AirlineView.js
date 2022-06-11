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

        console.log('registerAirline');
        contract.registerAirline(formAirlineRegistration, formAirlineRegistrationName);
        contract.flightSuretyData.methods.registeredAirlineCount().call().then(function(result){console.log(result)})
    }

    fundAirline = async (e) => {
        e.preventDefault();
        const { contract, connectedAccount } = this.props;

        console.log('fundAirline');
        contract.fundAirline(10);
        contract.flightSuretyData.methods.airlines(connectedAccount).call().then(function(result){console.log(result)})
    }

    registerFlight = async (e) => {
        e.preventDefault();
        const { contract, connectedAccount } = this.props;
        const { formFlightName, formFlightNumber } = this.state;

        console.log('registerFlight');
        contract.registerFlight(formFlightNumber, formFlightName);
        contract.flightSuretyData.methods.airlines(connectedAccount).call().then(function(result){console.log(result)})
    }

    modifyAirlineName = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const {modifyAirlineAddress, modifyAirlineName} = this.state;

        console.log('modifyAirlineName');

        contract.modifyAirlineName(modifyAirlineAddress, modifyAirlineName)
        contract.flightSuretyData.methods.airlines(modifyAirlineAddress).call().then(function(result){console.log(result)})
    }

    getAirlineInfo = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const {airlineInfoAddress} = this.state;

        console.log('airlines', airlineInfoAddress);

        contract.flightSuretyData.methods.airlines(airlineInfoAddress).call().then(function(result){console.log(result)})
    }

    render() {
        // const { registeredAirlines } = this.state;
        const { connectedAccount, contract } = this.props;

        console.log('connectedAccount', connectedAccount);
        console.log('contract', contract);

        return (
            <div>
                <h1>This is the Airline View</h1>
                <Form onSubmit={this.registerAirline}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="register-airline">Register Airline</Form.Label>
                        <Form.Control
                            type="text"
                            id="register-airline"
                            aria-describedby="airline-register-address"
                            onChange={e => this.setState({ formAirlineRegistration: e.target.value })}
                        />
                        <Form.Control
                            type="text"
                            id="register-airline"
                            aria-describedby="airline-register-name"
                            onChange={e => this.setState({ formAirlineRegistrationName: e.target.value })}
                        />
                        <Form.Text id="airline-register-address" muted>
                            Add the address of the airline you want to Register
                        </Form.Text>
                        <Button variant="primary" type="submit">
                            Submit Airline Registration
                        </Button>
                    </Form.Group>
                </Form>
                <Form onSubmit={this.fundAirline}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="fund-airline">Fund Your Registered Airline</Form.Label>
                        <Form.Text id="airline-fund-amount" muted>
                            You need to have 10 eth in balance
                        </Form.Text>
                        <Button variant="primary" type="submit">
                            Submit Funding
                        </Button>
                    </Form.Group>
                </Form>
                <Form onSubmit={this.registerFlight}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="register-flight-name">Register Flight Name</Form.Label>
                        <Form.Control
                            type="text"
                            id="register-flight-name"
                            aria-describedby="register-flight-name"
                            onChange={e => this.setState({ formFlightName: e.target.value })}
                        />
                        <Form.Text id="flight-register-address" muted>
                            Add the address of the airline you want to Register
                        </Form.Text>
                        <Form.Label htmlFor="register-flight-number">Register Flight Number</Form.Label>
                        <Form.Control
                            type="text"
                            id="register-flight-number"
                            aria-describedby="register-flight-number"
                            onChange={e => this.setState({ formFlightNumber: e.target.value })}
                        />
                        <Button variant="primary" type="submit">
                            Submit Flight Registration
                        </Button>
                    </Form.Group>
                </Form>
                <Form onSubmit={this.modifyAirlineName}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="modify-airline-name">Modify Airline Address</Form.Label>
                        <Form.Control
                            type="text"
                            id="modify-airline-name"
                            aria-describedby="modify-airline-name"
                            onChange={e => this.setState({ modifyAirlineAddress: e.target.value })}
                        />
                        <Form.Text id="flight-register-address" muted>
                            Add the address of the airline you want to modify the name of
                        </Form.Text>
                        <Form.Label htmlFor="modify-airline-name">Modify Airline</Form.Label>
                        <Form.Control
                            type="text"
                            id="modify-airline-namer"
                            aria-describedby="modify-airline-name"
                            onChange={e => this.setState({ modifyAirlineName: e.target.value })}
                        />
                        <Form.Text id="flight-register-address" muted>
                            Add the name of the airline you want to modify the name into
                        </Form.Text>
                        <Button variant="primary" type="submit">
                            Submit Airline Name Modification
                        </Button>
                    </Form.Group>
                </Form>
                <Form onSubmit={this.getAirlineInfo}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="get-airline-info">Search for airline</Form.Label>
                        <Form.Control
                            type="text"
                            id="get-airline-info"
                            aria-describedby="get-airline-info"
                            onChange={e => this.setState({ airlineInfoAddress: e.target.value })}
                        />
                        <Form.Text id="get-airline-info" muted>
                            Add the address of the airline you want to retrieve info on
                        </Form.Text>
                        <Button variant="primary" type="submit">
                            Get Airline Info
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}