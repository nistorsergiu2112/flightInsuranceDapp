
const Test = require('../config/testConfig.js');
const Web3 = require('web3');

contract('Flight Surety Tests', async (accounts) => {
    let config;
    let web3;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
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

    it('Contract owner is registered as an airline when contract is deployed', async () => {
        let airlinesCount = await config.flightSuretyData.getAirlineRegisteredCount.call(); 
        let isAirline = await config.flightSuretyData.getAirlineIsRegistered(accounts[0]); 
        assert.equal(isAirline, true, "First airline should be registired at contract deploy.");
        assert.equal(airlinesCount, 1, "Airlines count should be one after contract deploy.");
      });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {

        const firstAirline = accounts[0];
        const newAirline = accounts[1];

        // const airlineInfo0 = await config.flightSuretyData.getAllAirlineInfo(firstAirline);

        // console.log('info0', airlineInfo0);

        // await config.flightSuretyApp.fundAirline({from: firstAirline, value: web3.utils.toWei('10', 'ether')});

        // const airlineInfo0After = await config.flightSuretyData.getAllAirlineInfo(firstAirline);

        // console.log('info1', airlineInfo0After);



        // ACT
        try {
            await config.flightSuretyApp.fundAirline({value: web3.utils.toWei('10', 'ether')})(firstAirline);
            await config.flightSuretyApp.registerAirline(newAirline, { from: firstAirline });
        }
        catch (e) {
            // console.log('babababababa', e);
        }
        const airlineInfo0 = await config.flightSuretyData.getAllAirlineInfo(firstAirline); 
        console.log('teeest', airlineInfo0);
        let result = await config.flightSuretyData.getAirlineIsRegistered.call(newAirline);

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

    });


});
