import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.account = null;
        this.airlines = [];
        this.passengers = [];
        this.connectedAccount = null;
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            this.account = accts[1];

            ethereum.request({ method: 'eth_requestAccounts' }).then(res=>this.connectedAccount = res[0]);

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       const self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    setOperatingStatus(mode, callback) {
        const self = this;
        self.flightSuretyApp.methods
            .setOperatingStatus(mode)
            .send({from:self.owner})
                .then(console.log);
    }

    registerAirline(airline, name, callback) {
        const self = this;
        self.flightSuretyApp.methods
            .registerAirline(airline, name)
            .send({from: self.connectedAccount}
                ).then((receipt) => {
                    console.log(receipt);
                    if (callback) {
                        callback()
                    };
                });
    }

    modifyAirlineName(airline, name, callback) {
        const self = this;
        self.flightSuretyApp.methods
        .modifyAirlineName(airline, name)
        .send({from: self.connectedAccount}
            ).then((receipt) => {
                console.log(receipt);
                if (callback) {
                    callback()
                };
            });
    }

    fundAirline(amount, callback) {
        const self = this;
        self.flightSuretyApp.methods.fundAirline().send(
            {from: self.connectedAccount, value: this.web3.utils.toBN(this.web3.utils.toWei("2", "ether"))}
            ).then((receipt) => {
                console.log(receipt);
                if (callback) {
                    callback()
                };
            });
    }

    registerFlight(flightNumber, name, callback) {
        const self = this;
        const timestamp = Math.floor(Date.now() / 1000);
        const providerAccount = self.connectedAccount || self.owner;
        self.flightSuretyApp.methods.registerFlight(flightNumber, timestamp, name)
            .send({from: providerAccount}).then((receipt) => {
                console.log(receipt);
                if (callback) {
                    callback()
                };
            });
    }

    async getRegisteredFlights() {
        const self = this;
        const registeredFlightsNumber = parseInt(await self.flightSuretyData.methods.getFlightRegisteredCount());
        self.flights = [];

        for (let i = 0; i < registeredFlightsNumber; i++) {
            const flightKey = await self.flightSuretyData.methods.registeredFlights(i).call();
            const flight = await self.flightSuretyData.methods.flights(flightKey).call();
            self.flights.push(flight)
        }
        return self.flights;
    }

    purchaseFlightInsurance(flightKey, amount) {
        const self = this;
        self.flightSuretyApp.methods.purchaseFlightInsurance(flightKey)
            .send({from: self.connectedAccount, value: this.web3.utils.toBN(this.web3.utils.toWei(amount, "ether"))})
            .then((receipt) => {
                console.log(receipt);
                if (callback) {
                    callback()
                };
            });
    }

    checkBalance(callback) {
        const self = this;
        self.flightSuretyData.methods.availableCredit(self.connectedAccount).call(callback);
    }

    getFlightInformation(flightKey) {
        const self = this;
        self.flightSuretyData.methods.flights(flightKey).call().then(console.log);
    }

    withdrawFunds(callback) {
        const self = this;
        self.flightSuretyApp.methods.withdrawInsuranceFunds().send({from: self.connectedAccount}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}