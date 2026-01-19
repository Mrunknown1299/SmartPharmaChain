// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract PharmaceuticalSupplyChain {
    enum Status { Manufactured, Distributed, Retailed, Sold }
    
    struct Drug {
        string name;
        string manufacturer;
        uint256 manufactureDate;
        uint256 expiryDate;
        Status status;
        address manufacturer_id;
        address distributor_id;
        address retailer_id;
        address consumer_id;
        bool isTemperatureCompliant;
        int256 minTemp;
        int256 maxTemp;
    }
    
    mapping(string => Drug) public drugs;
    mapping(address => bool) public manufacturers;
    mapping(address => bool) public distributors;
    mapping(address => bool) public retailers;

    // Removed constants in favor of dynamic per-batch limits
    // int256 public constant MIN_TEMP = 2; 
    // int256 public constant MAX_TEMP = 8;
    
    address public owner;
    
    event DrugManufactured(string batchId, string name, uint256 manufactureDate, uint256 expiryDate);
    event DrugDistributed(string batchId, address distributor);
    event DrugRetailed(string batchId, address retailer);
    event DrugSold(string batchId, address consumer);
    event TemperatureViolation(string batchId, int256 temperature, address reportedBy);
    

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyManufacturer() {
        require(manufacturers[msg.sender], "Only registered manufacturers can call this function");
        _;
    }

    modifier onlyDistributor() {
        require(distributors[msg.sender], "Only registered distributors can call this function");
        _;
    }

    modifier onlyRetailer() {
        require(retailers[msg.sender], "Only registered retailers can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Register stakeholders
    function registerManufacturer(address _manufacturer) public onlyOwner {
        manufacturers[_manufacturer] = true;
    }

    function registerDistributor(address _distributor) public onlyOwner {
        distributors[_distributor] = true;
    }

    function registerRetailer(address _retailer) public onlyOwner {
        retailers[_retailer] = true;
    }

    // Manufacture drug
    function manufactureDrug(
        string memory _batchId,
        string memory _name,
        string memory _manufacturer,
        uint256 _expiryDate,
        int256 _minTemp,
        int256 _maxTemp
    ) public onlyManufacturer {
        require(bytes(drugs[_batchId].name).length == 0, "Drug with this batch ID already exists");

        drugs[_batchId] = Drug({
            name: _name,
            manufacturer: _manufacturer,
            manufactureDate: block.timestamp,
            expiryDate: _expiryDate,
            status: Status.Manufactured,
            manufacturer_id: msg.sender,
            distributor_id: address(0),
            retailer_id: address(0),
            consumer_id: address(0),
            isTemperatureCompliant: true,
            minTemp: _minTemp,
            maxTemp: _maxTemp
        });

        emit DrugManufactured(_batchId, _name, block.timestamp, _expiryDate);
    }

    // Distribute drug
    function distributeDrug(string memory _batchId) public onlyDistributor {
        require(bytes(drugs[_batchId].name).length > 0, "Drug does not exist");
        require(drugs[_batchId].status == Status.Manufactured, "Drug is not in manufactured state");

        drugs[_batchId].status = Status.Distributed;
        drugs[_batchId].distributor_id = msg.sender;

        emit DrugDistributed(_batchId, msg.sender);
    }

    // Retail drug
    function retailDrug(string memory _batchId) public onlyRetailer {
        require(bytes(drugs[_batchId].name).length > 0, "Drug does not exist");
        require(drugs[_batchId].status == Status.Distributed, "Drug is not in distributed state");

        drugs[_batchId].status = Status.Retailed;
        drugs[_batchId].retailer_id = msg.sender;

        emit DrugRetailed(_batchId, msg.sender);
    }

    // Sell drug to consumer
    function sellDrug(string memory _batchId, address _consumer) public onlyRetailer {
        require(bytes(drugs[_batchId].name).length > 0, "Drug does not exist");
        require(drugs[_batchId].status == Status.Retailed, "Drug is not in retailed state");
        require(drugs[_batchId].retailer_id == msg.sender, "Only the retailer who has the drug can sell it");

        drugs[_batchId].status = Status.Sold;
        drugs[_batchId].consumer_id = _consumer;

        emit DrugSold(_batchId, _consumer);
    }

    // Log temperature
    function logTemperature(string memory _batchId, int256 _temperature) public {
        require(bytes(drugs[_batchId].name).length > 0, "Drug does not exist");
        
        Drug storage drug = drugs[_batchId];
        
        if (_temperature < drug.minTemp || _temperature > drug.maxTemp) {
            drug.isTemperatureCompliant = false;
            emit TemperatureViolation(_batchId, _temperature, msg.sender);
        }
    }

    // Get drug details
    function getDrugDetails(string memory _batchId) public view returns (
        string memory name,
        string memory manufacturer,
        uint256 manufactureDate,
        uint256 expiryDate,
        Status status,
        address manufacturer_id,
        address distributor_id,
        address retailer_id,
        address consumer_id,
        bool isTemperatureCompliant,
        int256 minTemp,
        int256 maxTemp
    ) {
        Drug memory drug = drugs[_batchId];
        return (
            drug.name,
            drug.manufacturer,
            drug.manufactureDate,
            drug.expiryDate,
            drug.status,
            drug.manufacturer_id,
            drug.distributor_id,
            drug.retailer_id,
            drug.consumer_id,
            drug.isTemperatureCompliant,
            drug.minTemp,
            drug.maxTemp
        );
    }

    // Verify drug authenticity
    function verifyDrug(string memory _batchId) public view returns (bool) {
        return bytes(drugs[_batchId].name).length > 0;
    }

    // Check if drug is expired
    function isDrugExpired(string memory _batchId) public view returns (bool) {
        require(bytes(drugs[_batchId].name).length > 0, "Drug does not exist");
        return block.timestamp > drugs[_batchId].expiryDate;
    }
}