pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false


    struct Airline {
        bool isRegistered;
        bool isFunded;
        uint256 funds;
    }

    uint256 registeredAirlineCount = 0;
    uint256 fundedAirlineCount = 0;
    mapping(address => Airline) private airlines;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor() {
        contractOwner = msg.sender;
        airlines[msg.sender] = Airline(true, false, 0);
        registeredAirlineCount = registeredAirlineCount.add(1);
        emit AirlineRegistration(msg.sender);
    }

    event AirlineRegistration(address airline);
    event AirlineFunding(address airline);

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAirlineIsRegistered(address airline) {
        require(airlines[airline].isRegistered, "Airline is not registered");
        _;
    }

    modifier requireAirlineIsNotRegistered(address airline) {
        require(!airlines[airline].isRegistered, "Airline is already registered");
        _;
    }

    modifier requireAirlineIsFunded(address airline) {
        require(airlines[airline].isFunded, "Airline is not funded");
        _;
    }

    modifier requireAirlineIsNotFunded(address airline) {
        require(!airlines[airline].isFunded, "Airline is already funded");
        _;
    }

    modifier requireHasEnoughFunds(uint256 desiredFunds) {
        require(msg.value >= desiredFunds, "Sender has insuficient funds");
        _;
    }



    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(address existingAirline, address newAirline) 
    external 
    requireIsOperational
    requireAirlineIsFunded(existingAirline)
    requireAirlineIsNotRegistered(newAirline)  {
        airlines[newAirline] = Airline(true, false, 0);
        registeredAirlineCount = registeredAirlineCount.add(1);
        emit AirlineRegistration(newAirline);
    }

    function fundAirline(address airline, uint256 amount) 
        external
        requireIsOperational
        requireAirlineIsRegistered(airline)
        returns(bool)
    {
        airlines[airline].isFunded = true;
        airlines[airline].funds = airlines[airline].funds.add(amount);
        fundedAirlineCount = fundedAirlineCount.add(1);
        // airline.transfer(amount);
        emit AirlineFunding(airline);
        return airlines[airline].isFunded;
    }

    function getRegisteredAirlineCount() public view requireIsOperational returns(uint256) {
        return registeredAirlineCount;
    }


    // Getter functions for App contract to access this modifiers

    function getAirlineIsRegistered(address airline) 
        external
        view
        requireIsOperational
        requireAirlineIsRegistered(airline)
        returns(bool)
    {
        return true;
    }

    function getAirlineIsFunded(address airline) 
        external
        view
        requireIsOperational
        requireAirlineIsFunded(airline)
        returns(bool)
    {
        return true;
    }

    function getAirlineRegisteredCount() external view requireIsOperational returns(uint256){
        return registeredAirlineCount;
    }

    function getAirlineFundedCount() external view requireIsOperational returns(uint256){
        return fundedAirlineCount;
    }

    function getAllAirlineInfo(address airline) external view requireIsOperational returns (Airline memory) {
         return airlines[airline];
    }




    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy() external payable {}

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees() external pure {}

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay() external pure {}

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable {
        
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    fallback() external payable {
        fund();
    }
}
