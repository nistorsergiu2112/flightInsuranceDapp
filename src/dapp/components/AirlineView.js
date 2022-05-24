import React from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

// DOM.elid('register-airline').addEventListener('click', () => {
//     let airline = DOM.elid('airline-address').value;
//     if (airline) {
//         contract.registerAirline(airline);
//     }
// });

// DOM.elid('fund-airline').addEventListener('click', () => {
//     let amount = DOM.elid('funding-amount').value;
//     contract.fundAirline(amount);
// });

// DOM.elid('register-flight').addEventListener('click', async() => {
//     let flightNumber = DOM.elid('flight-number').value;
//     let departureLocation = DOM.elid('departure-location').value;
//     let arrivalLocation = DOM.elid('arrival-location').value;
//     contract.registerFlight(flightNumber, departureLocation, arrivalLocation);
// });

export default class AirlineView extends React.Component {
    state = {
        formAirlineRegistration: "",
        formAirlineRegistrationName: "",
        formAirlineFund: "",
        formFlightName: "",
        formFlightNumber: "",
        modifyAirlineAddress: "",
        modifyAirlineName: "",
        airlineInfoAddress: "",
        test: ""
    }

    registerAirline = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const { formAirlineRegistration, formAirlineRegistrationName } = this.state;

        console.log('registerAirline');
        await contract.registerAirline(formAirlineRegistration, formAirlineRegistrationName);
    }

    fundAirline = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const { formAirlineFunding } = this.state;

        console.log('fundAirline');
        await contract.fundAirline(formAirlineFunding);
    }

    registerFlight = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const { formFlightName, formFlightNumber } = this.state;

        console.log('registerFlight');
        await contract.registerFlight(formFlightNumber);
    }

    modifyAirlineName = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const {modifyAirlineAddress, modifyAirlineName} = this.state;

        console.log('modifyAirlineName');

        await contract.modifyAirlineName(modifyAirlineAddress, modifyAirlineName)
    }

    getAirlineInfo = async (e) => {
        e.preventDefault();
        const { contract } = this.props;
        const {airlineInfoAddress} = this.state;

        contract.flightSuretyData.methods.airlines(airlineInfoAddress).call().then(function(result){console.log(result)})

        // console.log('getAirlineInfo', contract.flightSuretyData.airlines.call());

        // contract.getAirlineInfo(airlineInfoAddress, (res) => { console.log('airline info -> ', res); });
        // const test = await contract.getAirlineInfo(airlineInfoAddress);
        // console.log('teeeest', test);
    }

    render() {
        // const { registeredAirlines } = this.state;
        return (
            <div>
                <h1>This is the Airline View</h1>
                <Form>
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
                        <Button variant="primary" type="submit" onClick={async () => await this.registerAirline()}>
                            Submit Airline Registration
                        </Button>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="fund-airline">Fund Registered Airline</Form.Label>
                        <Form.Control
                            type="number"
                            id="fund-airline"
                            aria-describedby="airline-fund-amount"
                            onChange={e => this.setState({ formAirlineRegistration: e.target.value })}
                        />
                        <Form.Text id="airline-fund-amount" muted>
                            Type the amount of funds you wish to add in ether ( min 10 ETH)
                        </Form.Text>
                        <Button variant="primary" type="submit" onClick={async () => await this.fundAirline()}>
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
                <h2>The following airline have been registered</h2>
                {this.props.contract.airlines.map((airline, index) => <div key={index}>{airline}</div>)}
            </div>
        )
    }
}