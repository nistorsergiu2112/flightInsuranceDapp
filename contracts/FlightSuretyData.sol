pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";

contract FlightSuretyData {
    using Counters for Counters.Counter;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address public contractOwner;
    bool private operational = true;


    struct Airline {
        bool isRegistered;
        string name;
        bool isFunded;
        uint256 funds;
    }

    struct Flight {
        string name;
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
    Counters.Counter public registeredAirlineCount;
    Counters.Counter public fundedAirlineCount;
    Counters.Counter public insuranceClaimsCount;

    bytes32[] public registeredFlights;

    mapping(address => Airline) public airlines;
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
        registeredAirlineCount.increment();
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

    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;
    }

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


    function isOperational() public view returns (bool) {
        return operational;
    }

    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function getContractBalance() external view requireContractOwner returns(uint){
        uint balance = address(this).balance;
        return balance;
    }

    function modifyAirlineName(address airlineAddress, string calldata name) external requireAirlineIsRegistered(airlineAddress) {
        airlines[airlineAddress].name = name;
        emit AirlineModifyName(airlineAddress, name);
    }

    function registerAirline(address existingAirline, address newAirline, string calldata name) 
    external 
    requireIsOperational
    requireAirlineIsFunded(existingAirline)
    requireAirlineIsNotRegistered(newAirline)  {
        airlines[newAirline] = Airline(true, name, false, 0);
        registeredAirlineCount.increment();
        emit AirlineRegistration(newAirline);
    }

    function fundAirline(address airline, uint256 amount) 
        external
        requireIsOperational
        requireAirlineIsRegistered(airline)
        returns(bool)
    {
        airlines[airline].isFunded = true;
        airlines[airline].funds = airlines[airline].funds + amount;
        fundedAirlineCount.increment();
        emit AirlineFunding(airline);
        return true;
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
        emit PassengerInsurance(passenger, flightKey, amount);
    }

    function registerFlight(
        bytes32 flightKey,
        uint256 timestamp,
        address airline,
        string calldata flightNumber,
        string calldata flightName
    ) 
        external
        payable
        requireIsOperational
        requireAirlineIsFunded(airline)
    {
        flights[flightKey] = Flight(flightName, true, 0, timestamp, airline, flightNumber);
        registeredFlights.push(flightKey);
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
        flights[flightKey].statusCode = statusCode;
        if (statusCode == 20) {
            creditInsuredPassengers(flightKey);
        }
        emit ProcessFlightStatus(flightKey, statusCode);
    }

    function creditInsuredPassengers(bytes32 flightKey) internal requireIsOperational {
        for (uint256 i = 0; i < flightInsuranceClaims[flightKey].length; i++) {
            InsuranceClaim memory insuranceClaim = flightInsuranceClaims[flightKey][i];
            insuranceClaim.claimed = true;
            uint256 amount = (insuranceClaim.puchaseAmount * 150) / 100;
            availableCredit[insuranceClaim.passenger] = availableCredit[insuranceClaim.passenger] + amount;
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
        return registeredAirlineCount.current();
    }

    function getContractOwner() public view returns(address) {
        return contractOwner;
    }

    function getFlightIsRegistered(bytes32 flightKey) external view returns(bool) {
        return flights[flightKey].isRegistered;
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

    function getRegisteredFlightsCount() public view requireIsOperational returns(uint256) {
        return registeredFlights.length;
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

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    receive() external payable {}
    fallback() external payable {}
}
