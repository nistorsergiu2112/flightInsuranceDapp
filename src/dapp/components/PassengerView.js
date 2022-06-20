import React from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default class PassengerView extends React.Component {
    state = {
        formFlightInsuranceFlightKey: '',
        formFlightInsuranceFlightAmount: 0,
        formFetchFlightAirline: '',
        formFetchFlightNumber: '',
        formFetchTimestamp: 0,
        flights: []
    };

    fetchRegisteredFlights = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const newFlights = await contract.getRegisteredFlights();
        this.setState({
            flights: newFlights
        })
    }

    purchaseFlightInsurance = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const { formFlightInsuranceFlightKey, formFlightInsuranceFlightAmount } = this.state;

        contract.purchaseFlightInsurance(formFlightInsuranceFlightKey, formFlightInsuranceFlightAmount);
    }

    checkFunds = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const { connectedAccount } = contract;

        contract.flightSuretyData.methods.availableCredit(connectedAccount).call().then(function(result){console.log(result)});
    }

    withdrawFunds = async (e) => {
        e.preventDefault();
        const { contract } = this.props;

        contract.withdrawFunds();
    }

    refreshFlightStatus = async (e) => {
        e.preventDefault()
        const { contract } = this.props;
        const { formFetchFlightAirline, formFetchFlightNumber, formFetchTimestamp } = this.state;

        contract.fetchFlightStatus(formFetchFlightAirline, formFetchFlightNumber, formFetchTimestamp);
    }

    handleBackClick = (e) => {
        e.preventDefault();
        const { modifyView } = this.props;

        modifyView('guest');
    }

    render() {
        const { flights } = this.state;

        return (
            <div>
                <Button variant="outline-dark" onClick={this.handleBackClick}>Go Back</Button>
                <Button variant="outline-dark" onClick={this.checkFunds}>Check funds for your account</Button>
                <Button variant="outline-dark" onClick={this.withdrawFunds}>Withdraw Your Insurance Money</Button>
                <h2>Passenger View</h2>
                <Button onClick={this.fetchRegisteredFlights}>Get Registered Flights</Button>
                <ListGroup as="ol" numbered>
                        {flights.length && flights.map((flight, index) =>
                            <ListGroup.Item key={index}>
                                Flight name: {flight.name} with airline address: {flight.airline} with key: {flight.flightKey} with number {flight.flightNumber} has status code {flight.statusCode} - last time updated {flight.updatedTimestamp}
                            </ListGroup.Item>
                        )}
                </ListGroup>
                <Form onSubmit={this.purchaseFlightInsurance}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="purchase-flight-insurance">Purchase Flight Insurance</Form.Label>
                        <Form.Control
                            type="text"
                            id="purchase-flight-insurance"
                            placeholder="Enter Flight Key"
                            aria-describedby="purchase-flight-insurance-key"
                            onChange={e => this.setState({ formFlightInsuranceFlightKey: e.target.value })}
                        />
                        <Form.Control
                            type="number"
                            max="1"
                            id="purchase-flight-insurance"
                            placeholder="Enter Amount in Eth ( Max 1 ETH )"
                            aria-describedby="purchase-flight-insurance-amount"
                            onChange={e => this.setState({ formFlightInsuranceFlightAmount: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Button variant="primary" type="submit">
                            Purchase
                        </Button>
                    </Form.Group>
                </Form>
                <Form onSubmit={this.refreshFlightStatus}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="fetch-flight-status">Fetch Flight Status</Form.Label>
                        <Form.Control
                            type="text"
                            id="fetch-flight-status"
                            placeholder="Enter Airline Address of the Flight"
                            aria-describedby="fetch-flight-status-airline"
                            onChange={e => this.setState({ formFetchFlightAirline: e.target.value })}
                        />
                        <Form.Control
                            type="text"
                            id="fetch-flight-status"
                            placeholder="Enter Flight Number"
                            aria-describedby="fetch-flight-status-flight"
                            onChange={e => this.setState({ formFetchFlightNumber: e.target.value })}
                        />
                        <Form.Control
                            type="number"
                            id="fetch-flight-status"
                            placeholder="Enter Flight Timestamp"
                            aria-describedby="fetch-flight-status-timestamp"
                            onChange={e => this.setState({ formFetchTimestamp: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Button variant="primary" type="submit">
                            Fetch Now
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}
