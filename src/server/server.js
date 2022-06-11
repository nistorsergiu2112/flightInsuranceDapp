import "@babel/polyfill";
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


const config = Config['localhost'];
const web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
const flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
const accounts = web3.eth.getAccounts();
const oraclesNumber = 20;
let oracles = [];

// registering oracles
(async () => {
  const registrationFee = await flightSuretyApp.methods.REGISTRATION_FEE().call();
  const accts = await accounts;
  let orclsNumber = oraclesNumber;
  if (accts.length < oraclesNumber) {
    orclsNumber = accts.length;
  }

  for (var i = 0; i < orclsNumber; i++) {
    oracles.push(accts[i]);
    await flightSuretyApp.methods.registerOracle().send({
      from: accts[i],
      value: registrationFee,
      gas: 1000000
    });
  }
})();

async function submitOracleResponse(airline, flight, timestamp) {
  for (var i = 0; i < oracles.length; i++) {
    var statusCode = (Math.floor(Math.random() * Math.floor(4)) + 1) * 10 + 10;
    var indexes = await flightSuretyApp.methods.getMyIndexes().call({from: oracles[i]});
    for (var j = 0; j < indexes.length; j++) {
      try {
        await flightSuretyApp.methods.submitOracleResponse(
          indexes[j], airline, flight, timestamp, statusCode
        ).send({from: oracles[i], gas: 1000000});
      } catch(e) {
        console.log("EVENT - ",'ERROR SUBMITING ORACLE', e);
      }
    }
  }
}

async function listenEvents() {
   flightSuretyApp.events.FlightStatusInfo({}, (error, event) => {
    console.log("EVENT - ",error, event, "FLIGHT STATUS INFO");
  });

  flightSuretyApp.events.OracleReport({}, (error, event) => {
    console.log("EVENT - ",error, event, "ORACLE REPORT");
  });

  flightSuretyApp.events.OracleRequest({}, async (error, event)  => {
    console.log("EVENT - ",error, event, "ORACLE REQUEST");
    if (!error) {
      await submitOracleResponse(
        event.returnValues[1],
        event.returnValues[2],
        event.returnValues[3]
      );
    }
  });

  flightSuretyApp.events.OracleRegistered({}, (error, event) => {
    console.log("EVENT - ",error, event, "ORACLE REGISTERED");
  });
  
  flightSuretyData.events.AirlineRegistration({}, (error, event) => {
    console.log("EVENT - ",error, event, "AIRLINE REGISTRATION");
  });

  flightSuretyData.events.AirlineFunding({}, (error, event) => {
    console.log("EVENT - ",error, event, "AIRLINE FUNDING");
  });

  flightSuretyData.events.FlightRegistration({}, (error, event) => {
    console.log("EVENT - ",error, event, "FLIGHT REGISTRATION");
  });

  flightSuretyData.events.PassengerInsurance({}, (error, event) => {
    console.log("EVENT - ",error, event, "PASSENGER INSURANCE");
  });

  flightSuretyData.events.ProcessFlightStatus({}, (error, event) => {
    console.log("EVENT - ",error, event, "PROCESS FLIGHT STATUS");
  });

  flightSuretyData.events.PassengerCredited({}, (error, event) => {
    console.log("EVENT - ",error, event, "PASSENGER CREDITED");
  });

  flightSuretyData.events.PassengerPaid({}, (error, event) => {
    console.log("EVENT - ",error, event, "PASSENGER PAID");
  });

  flightSuretyData.events.AirlineModifyName({}, (error, event) => {
    console.log("EVENT - ",error, event, "MODIFY AIRLINE NAME");
  });
}

listenEvents();

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


