# FlightSurety

Flight Insurance App made using Solidity, Truffle Suite, OpenZeppeling and ReactJs on the Front-end

## Contract Instructions

- You can join as an Airline or Passenger
- In order to paritcipate in the contract as an Airline you need to submit a funding of 10 Ether
- Once you are funded, you can register other airlines and register flights.
- As a Passanger you can purchase flight insurance of maximum of 1 ETH and, once Oracles update the status of your flight ( by requesting a flight fetch from front-end ), you will be rewarded with 150% of your initial investment if the flight got delayed with status code 20.

## Install

You need to following versions in order to run this app:
`Truffle v5.5.3 (core: 5.5.3)
Ganache v7.0.1
Solidity - ^0.8.3 (solc-js)
Node v16.14.0
Web3.js v1.5.3`

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder
