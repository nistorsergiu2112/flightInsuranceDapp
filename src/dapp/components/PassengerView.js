import React from "react";
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default class PassengerView extends React.Component {
    state = {
        formFlightInsuranceFlightKey: '',
        formFlightInsuranceFlightAmount: 0,
        flights: []
    };

    componentDidMount = async () => {
        const { contract } = this.props;
        const flights = await contract.getRegisteredFlights();
        if (flights.length > 0) {
            this.setState({
                flights
            })
        }
    }

    purchaseFlightInsurance = async (e) => {
        e.preventDefault();
        const { contract, connectedAccount } = this.props;
        const { formFlightInsuranceFlightKey, formFlightInsuranceFlightAmount } = this.state;
        console.log('purchaseFlightInsurance');

        contract.purchaseFlightInsurance(formFlightInsuranceFlightKey, formFlightInsuranceFlightAmount);
    }

    checkFunds = async (e) => {
        e.preventDefault();
        const { contract, connectedAccount } = this.props;
        console.log('checkFunds');

        contract.flightSuretyData.methods.availableCredit(connectedAccount).call().then(function(result){console.log(result)});
    }

    withdrawFunds = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        console.log('withdrawFunds');

        contract.withdrawFunds();
    }

    render() {
        const { flights } = this.state;

        return (
            <div>
                <h1>This is the Passenger View</h1>
                <Card>
                    <Card.Header>List of registered flights</Card.Header>
                    <ListGroup variant="flush">
                        {flights.length > 0 && flights.map(flight => {
                            <ListGroup.Item>Flight name {flight.name} from {flight.airline} with number {flight.flightNumber}</ListGroup.Item>
                        })}
                    </ListGroup>
                </Card>
                <h2>Buy insurance for a flight</h2>
                <Form onSubmit={this.registerAirline}>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="purchase-flight-insurance">Purchase Flight Insurance</Form.Label>
                        <Form.Control
                            type="number"
                            id="purchase-flight-insurance"
                            aria-describedby="purchase-flight-insurance-name"
                            onChange={e => this.setState({ formFlightInsuranceFlightKey: e.target.value })}
                        />
                        <Form.Control
                            type="number"
                            max="1"
                            id="purchase-flight-insurance"
                            aria-describedby="purchase-flight-insurance-amount"
                            onChange={e => this.setState({ formFlightInsuranceFlightAmount: e.target.value })}
                        />
                        <Form.Text id="purchase-flight-insurance" muted>
                            Input the Flight key and amount you wish to be insured for in ETHER
                        </Form.Text>
                        <Button variant="primary" type="submit">
                            Submit Airline Registration
                        </Button>
                    </Form.Group>
                </Form>
                <Button onSubmit={this.checkFunds}>Check funds for your account</Button>
                <Button onSubmit={this.withdrawFunds}>Withdraw Your Insurance Money</Button>
            </div>
        )
    }
}
