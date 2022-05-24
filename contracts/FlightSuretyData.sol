pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address public contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false


    struct Airline {
        bool isRegistered;
        string name;
        bool isFunded;
        uint256 funds;
    }

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
        string flightNumber;
    }

    struct InsuranceClaim {
        address passenger;
        uint256 puchaseAmount;
        bool claimed;
    }

    // counters
    uint256 registeredAirlineCount = 0;
    uint256 registeredFlightsCount = 0;
    uint256 fundedAirlineCount = 0;
    uint256 insuranceClaimsCount = 0;

    bytes32[] public registeredFlights;

    mapping(address => Airline) private airlines;
    mapping(bytes32 => Flight) public flights;
    mapping(bytes32 => InsuranceClaim[]) public flightInsuranceClaims;
    mapping(address => uint256) public availableCredit;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor(address firstAirline) payable {
        contractOwner = msg.sender;
        airlines[firstAirline] = Airline(true, 'owner airline',false, 0);
        registeredAirlineCount = registeredAirlineCount.add(1);
    }

    event AirlineRegistration(address airline);
    event AirlineFunding(address airline);
    event FlightRegistration(bytes32 flightKey);
    event PassengerInsurance(address passenger, bytes32 flightKey, uint256 amount);
    event ProcessFlightStatus(bytes32 flightKey, uint8 statusCode);
    event PassengerCredited(bytes32 flightKey, address passenger, uint256 amount);
    event PassengerPaid(address passenger, uint256 amount);
    event AirlineModifyName(address airline, string name);

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

    modifier requireFlightIsRegistered(bytes32 flightKey) {
        require(flights[flightKey].isRegistered, "Flight is not registered");
        _;
    }
    
    modifier requireFlightIsNotRegistered(bytes32 flightKey) {
        require(!flights[flightKey].isRegistered, "Flight is registered");
        _;
    }

    modifier requireInsureeHasAvailableCredits(address insuree) {
        require(availableCredit[insuree] > 0, "Passenger has not recieved any insurance money");
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

    // HELPER FUNCTIONS FOR DEVELOPMENT ONLY

    function getContractBalance() external view requireContractOwner returns(uint){
        uint balance = address(this).balance;
        return balance;
    }

    function modifyAirlineName(address airlineAddress, string calldata name) external requireContractOwner requireAirlineIsRegistered(airlineAddress) {
        airlines[airlineAddress].name = name;
    }

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(address existingAirline, address newAirline, string calldata name) 
    external 
    requireIsOperational
    requireAirlineIsFunded(existingAirline)
    requireAirlineIsNotRegistered(newAirline)  {
        airlines[newAirline] = Airline(true, name, false, 0);
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

    function purchaseFlightInsurance(
        address passenger,
        bytes32 flightKey,
        uint256 amount
    )
        external
        payable
        requireIsOperational
        requireFlightIsRegistered(flightKey)
    {
        flightInsuranceClaims[flightKey].push(InsuranceClaim(passenger, amount, false));
        insuranceClaimsCount = insuranceClaimsCount.add(1);
        emit PassengerInsurance(passenger, flightKey, amount);
    }

    function registerFlight(
        bytes32 flightKey,
        uint256 timestamp,
        address airline,
        string memory flightNumber
    ) 
        external
        payable
        requireIsOperational
        requireAirlineIsFunded(airline)
        requireFlightIsNotRegistered(flightKey)
    {
        flights[flightKey] = Flight(true, 0, timestamp, airline, flightNumber);
        registeredFlights.push(flightKey);
        registeredFlightsCount = registeredFlightsCount.add(1);
        emit FlightRegistration(flightKey);
    }

    function processFlightStatus(
        address airline,
        string calldata flight,
        uint256 timestamp,
        uint8 statusCode
    )
        external
        requireIsOperational
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        if (flights[flightKey].statusCode == 0) {
            flights[flightKey].statusCode = statusCode;
            if (statusCode == 20) {
                creditInsuredPassengers(flightKey);
            }
        }
        emit ProcessFlightStatus(flightKey, statusCode);
    }

    function creditInsuredPassengers(bytes32 flightKey) internal requireIsOperational {
        for (uint256 i = 0; i < flightInsuranceClaims[flightKey].length; i++) {
            InsuranceClaim memory insuranceClaim = flightInsuranceClaims[flightKey][i];
            insuranceClaim.claimed = true;
            uint256 amount = insuranceClaim.puchaseAmount.mul(150).div(100);
            availableCredit[insuranceClaim.passenger] = availableCredit[insuranceClaim.passenger].add(amount);
            emit PassengerCredited(flightKey, insuranceClaim.passenger, amount);
        }
    }

    function emitCreditsToInsuree(
        address insuree
    ) 
        external 
        payable 
        requireIsOperational 
        requireInsureeHasAvailableCredits(insuree)
    {
        uint256 amount = availableCredit[insuree];
        require(address(this).balance >= amount, "Contract has insufficient funds");
        availableCredit[insuree] = 0;
        payable(insuree).transfer(amount);
        emit PassengerPaid(insuree, amount);
    }

    // Getter functions for App contract to access this modifiers

    function getRegisteredAirlineCount() public view requireIsOperational returns(uint256) {
        return registeredAirlineCount;
    }

    function getContractOwner() public view returns(address) {
        return contractOwner;
    }

    function getFlightIsRegistered(bytes32 flightKey) external view returns(bool) {
        return flights[flightKey].isRegistered;
    }

    function getFlightRegisteredCount() external view returns(uint256) {
        return registeredFlightsCount;
    }

    function getAirlineIsRegistered(address airline) 
        external
        view
        returns(bool)
    {
        return airlines[airline].isRegistered;
    }

    function getAirlineIsFunded(address airline) 
        external
        view
        returns(bool)
    {
        return airlines[airline].isFunded;
    }

    function getAirlineRegisteredCount() external view requireIsOperational returns(uint256){
        return registeredAirlineCount;
    }

    function getAirlineFundedCount() external view requireIsOperational returns(uint256){
        return fundedAirlineCount;
    }

    function isPassengerInsuredForFlight(bytes32 flightKey, address passenger) external view returns(bool) {
        InsuranceClaim[] memory insuranceClaims = flightInsuranceClaims[flightKey];
        for (uint256 i = 0; i < insuranceClaims.length; i++) {
            if (insuranceClaims[i].passenger == passenger) {
                return true;
            }
        }
        return false;
    }




    // /**
    //  * @dev Buy insurance for a flight
    //  *
    //  */
    // function buy() external payable {}

    // /**
    //  *  @dev Credits payouts to insurees
    //  */
    // function creditInsurees() external pure {}

    // /**
    //  *  @dev Transfers eligible payout funds to insuree
    //  *
    //  */
    // function pay() external pure {}

    // /**
    //  * @dev Initial funding for the insurance. Unless there are too many delayed flights
    //  *      resulting in insurance payouts, the contract should be self-sustaining
    //  *
    //  */
    // function fund() public payable {
        
    // }

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
    fallback() external payable {}
}
