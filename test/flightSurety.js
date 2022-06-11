
const Test = require('../config/testConfig.js');
const BigNumber = require('big-number');
const Web3 = require('web3');

contract('Flight Surety Tests', async (accounts) => {
    let config;
    let web3;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {

        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        }
        catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        }
        catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try {
            await config.flightSurety.setTestingMode(true);
        }
        catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });

    // it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    //     let newAirline = accounts[2];

    //     // ACT
    //     try {
    //         await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
    //     }
    //     catch (e) {
    //     }
    //     let result = await config.flightSuretyData.getAirlineIsRegistered.call(newAirline);

    //     // ASSERT
    //     assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

    // });

    // it('(airline) can fund itself using fundAirline()', async () => {
    //     // ARRANGE
    //     let amount = web3.utils.toWei('1', 'ether');
    //     let result = false;
    
    //     // ACT
    //     try {
    //         result = await config.flightSuretyApp.fundAirline.call({from: config.firstAirline, value: amount});
    //     }
    //     catch(e) {
    //         console.log(e);
    //     }
        
    //     // ASSERT
    //     assert.equal(result, true, "Airline is not funded.");
    // });

    // it('(flight) an Airline can register a flight', async () => {
    //     // ACT
    //     try {
    //         await config.flightSuretyApp.fundAirline({from: config.firstAirline, value: web3.utils.toWei('1', 'ether')});
    //         await config.flightSuretyApp.registerFlight('1', '10 september', { from: config.firstAirline });
    //     }
    //     catch (e) {
    //     }
    
    //     let result = await config.flightSuretyData.getFlightRegisteredCount.call();

    //     // ASSERT
    //     assert.notEqual(BigNumber(result), 0, "Airline is not registering flights correctly");
    // });

    // it('getting airline info', async () => {
    //     // ACT
    //     try {
    //         const testtt = await debug(config.flightSuretyApp.getAirlineInfo.call("0xf17f52151EbEF6C7334FAD080c5704D77216b732"));
    //     }
    //     catch (e) {
    //     }

    //     console.log('test', testtt);

    //     // ASSERT
    //     assert.notEqual(testtt, undefined, "test succeded because there is info");
    // });


});
