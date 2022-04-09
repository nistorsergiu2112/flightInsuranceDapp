pragma solidity ^0.8.3;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// FlightSuretyData interface
interface FlightSuretyData {
    function isOperational() external view returns (bool);
    function setOperatingStatus(bool mode) external;
    function registerAirline(address existingAirline, address newAirline) external;
    function registerFlight(bytes32 flightKey, uint256 timestamp, address airline, string memory flightNumber) external payable;
    function fundAirline(address airline, uint256 amount) external returns(bool); 
    function getRegisteredAirlineCount() external view returns(uint256);
    function getAirlineIsRegistered(address airline) external view returns(bool);
    function getAirlineIsFunded(address airline) external view returns(bool);
    function buy() external payable;
    function creditInsurees() external pure;
    function pay() external pure;
    function fund() external payable;
    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) external pure returns (bytes32);
}

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    FlightSuretyData flightSuretyData;

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;


    uint256 AIRLINE_REGISTRATION_FEE = 1 ether;
    uint256 AIRLINE_VOTING_MINIMUM = 4;
    uint256 PASSENGER_MAX_INSURANCE_PRICE = 1 ether;

    address private contractOwner; // Account used to deploy contract

    // Airline status for multi-party voting
    struct PendingAirline {
        bool isRegistered;
        bool isFunded;
    }

    mapping(address => address[]) public pendingAirlines;

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
        // Modify to call data contract's status
        require(true, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireHasSufficientFunds(uint256 amount) {
        require(msg.value >= amount, "Insufficient Funds");
        _;
    }
    
    modifier requireIsAirlineFunded(address airline) {
        require(flightSuretyData.getAirlineIsFunded(airline), "Airline is not funded.");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
     * @dev Contract constructor
     *
     */
    constructor(address _dataContract) {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(_dataContract);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public pure returns (bool) {
        return true; // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *
     */
    function registerAirline(address airlineAddress)
        external
        requireIsOperational
        requireIsAirlineFunded(msg.sender)
        returns (bool success, uint256 votes)
    {
        if (flightSuretyData.getRegisteredAirlineCount() <= AIRLINE_VOTING_MINIMUM) {
            flightSuretyData.registerAirline(msg.sender, airlineAddress);
            return(success, 0);
        } else {
            bool isDuplicate = false;
            for(uint c=0; c < pendingAirlines[airlineAddress].length; c++) {
                if (pendingAirlines[airlineAddress][c] == msg.sender) {
                    isDuplicate = true;
                    break;
                }
            }
            require(!isDuplicate, "Duplicate votes do not count!");
            pendingAirlines[airlineAddress].push(msg.sender);
            // escape condition if there are enough votes
            if (pendingAirlines[airlineAddress].length >= flightSuretyData.getRegisteredAirlineCount().div(2)) {
                flightSuretyData.registerAirline(msg.sender, airlineAddress);
                return(true, pendingAirlines[airlineAddress].length);
            }
            return(false, pendingAirlines[airlineAddress].length);
        }
    }


    function fundAirline() 
        external 
        payable 
        requireIsOperational
        requireHasSufficientFunds(AIRLINE_REGISTRATION_FEE)
        returns(bool)
    {
        if (flightSuretyData.getAirlineIsRegistered(msg.sender)) {
            // payable(address(uint160(address(flightSuretyData)))).transfer(AIRLINE_REGISTRATION_FEE);
            payable(msg.sender).transfer(AIRLINE_REGISTRATION_FEE);
            return flightSuretyData.fundAirline(msg.sender, AIRLINE_REGISTRATION_FEE);
        } else {
            return false;
        }
    }

    /**
     * @dev Register a future flight for insuring.
     *
     */
    function registerFlight(
        string calldata flightNumber,
        uint256 timestamp
    ) 
        external 
        requireIsOperational
        requireIsAirlineFunded(msg.sender) 
    {
        address registeringAirline = msg.sender;
        bytes32 flightKey = getFlightKey(registeringAirline, flightNumber, timestamp);
        flightSuretyData.registerFlight(flightKey, timestamp, registeringAirline, flightNumber);
    }

    /**
     * @dev Called after oracle has updated flight status
     *
     */
    function processFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    ) internal pure {}

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(
        address airline,
        string calldata flight,
        uint256 timestamp
    ) external {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(
            abi.encodePacked(index, airline, flight, timestamp)
        );
        oracleResponses[key].requester = msg.sender;
        oracleResponses[key].isOpen = true;

        emit OracleRequest(index, airline, flight, timestamp);
    }

    // region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;

    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester; // Account that requested status
        bool isOpen; // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses; // Mapping key is the status code reported
        // This lets us group responses and identify
        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 status
    );

    event OracleReport(
        address airline,
        string flight,
        uint256 timestamp,
        uint8 status
    );

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(
        uint8 index,
        address airline,
        string flight,
        uint256 timestamp
    );

    // Register an oracle with the contract
    function registerOracle() external payable {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({isRegistered: true, indexes: indexes});
    }

    function getMyIndexes() external view returns (uint8[3] memory) {
        require(
            oracles[msg.sender].isRegistered,
            "Not registered as an oracle"
        );

        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(
        uint8 index,
        address airline,
        string calldata flight,
        uint256 timestamp,
        uint8 statusCode
    ) external {
        require(
            (oracles[msg.sender].indexes[0] == index) ||
                (oracles[msg.sender].indexes[1] == index) ||
                (oracles[msg.sender].indexes[2] == index),
            "Index does not match oracle request"
        );

        bytes32 key = keccak256(
            abi.encodePacked(index, airline, flight, timestamp)
        );
        require(
            oracleResponses[key].isOpen,
            "Flight or timestamp do not match oracle request"
        );

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (
            oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES
        ) {
            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account)
        internal
        returns (uint8[3] memory)
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while (indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while ((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account) internal returns (uint8) {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(
            uint256(
                keccak256(
                    abi.encodePacked(blockhash(block.number - nonce++), account)
                )
            ) % maxValue
        );

        if (nonce > 250) {
            nonce = 0; // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

    // endregion
}