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
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

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
            .send({from: self.owner}
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
        .send({from: self.owner}
            ).then((receipt) => {
                console.log(receipt);
                if (callback) {
                    callback()
                };
            });
    }

    getAirlineInfo(airline, callback) {
        const self = this;
        console.log('get airline info from contract ---', airline);
        self.flightSuretyApp.methods
        .getAirlineInfoTest()
        .send({from: self.owner}
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
            {from: self.owner, value: web3.utils.toWei(amount, 'ether')}
            ).then((receipt) => {
                console.log(receipt);
                if (callback) {
                    callback()
                };
            });
    }

    registerFlight(flightNumber, callback) {
        const self = this;
        const timestamp = Date.now();
        self.flightSuretyApp.methods.registerFlight(flightNumber, timestamp)
            .send({from: this.account}).then((receipt) => {
                console.log(receipt);
                if (callback) {
                    callback()
                };
            });
    }

    async getRegisteredFlights() {
        const self = this;
        const registeredFlightsNumber = parseInt(await self.flightSuretyData.methods.getFlightRegisteredCount().call());
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
            .send({from: this.account, value: this.web3.utils.toWei(amount, 'ether')})
            .then((receipt) => {
                console.log(receipt);
                if (callback) {
                    callback()
                };
            });
    }

    checkBalance(callback) {
        const self = this;
        self.flightSuretyData.methods.availableCredit(this.account).call(callback);
    }

    getFlightInformation(flightKey) {
        const self = this;
        self.flightSuretyData.methods.flights(flightKey).call().then(console.log);
    }

    withdrawFunds(callback) {
        const self = this;
        self.flightSuretyApp.methods.withdrawInsuranceFunds().send({from: this.account}, callback);
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