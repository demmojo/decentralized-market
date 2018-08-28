pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./Store.sol";

/** @title User tasks. */ 
contract UserRoles is Ownable {
    bool public stop = false;

    mapping (address => Store[]) public stores;
    mapping (address => bool) public storeOwners;
    mapping (address => bool) public administrators;    
    
    event StoreOwnerAdded(address indexed addr);
    event StoreOwnerRemoved(address indexed addr);
    event AdministratorAdded(address indexed addr);
    event AdministratorRemoved(address indexed addr);
    event StoreAdded(address indexed owner, string name);
    event StoreRemoved(address indexed addr, address indexed owner);

    /** @dev Exception thrown if function called by a non-Administrator. */
    modifier onlyMarketOwner() {
        require(owner == msg.sender, "You must be the Market owner to conduct this task.");
        _;
    }

    /** @dev Exception thrown if function called while market is paused. */
    modifier pauseMarket() {
        require(stop == false, "Market has been paused.");
        _;
    }

    /** @dev Exception thrown if the function is not called by the real owner of a specific store. */
    modifier onlySpecificStoreOwner(address _address) {        
        bool specificOwner = false;
        for (uint i = 0; i < stores[msg.sender].length; i++) {
            if (address(stores[msg.sender][i]) == _address) {
                specificOwner = true;
                break;
            }
        }
        require(specificOwner, "You must be the owner of this store to conduct this task.");
        _;
    }

    /** @dev Exception thrown if function called by a non-Administrator. */
    modifier onlyAdministrator() {
        require(administrators[msg.sender] == true, "You must be an Administrator to conduct this task.");
        _;
    }

    /** @dev Exception thrown if the function is not called by a store owner. */
    modifier onlyStoreOwner() {
        require(storeOwners[msg.sender] == true, "You must be a store owner to conduct this task.");
        _;
    }

    constructor() public {
        owner = msg.sender;
        administrators[msg.sender] = true;
        emit AdministratorAdded(msg.sender);
    }

    /** @dev List of all the stores in the market.
       * @param _addr Ethereum address.
       */
    function getStores(address _addr) public view pauseMarket() returns (Store[]) {
        return stores[_addr];
    }

    /** @dev Market owner can pause the market. */
    function setPause() public onlyMarketOwner() {
        stop = !stop;
    }

    /** @dev Retrieves a specific store's properties.
      * @param _store Address of the store.
      */
    function getStoreProperties(Store _store) public view returns (string, uint, address, address) {
        return _store.getProperties();
    }
    
    /** @dev Add a store owner using their address.
      * @param _address Ethereum address.
      */
    function addStoreOwner(address _address) public onlyAdministrator() pauseMarket() {
        storeOwners[_address] = true;
        emit StoreOwnerAdded(_address);
    }

    /** @dev Remove a store owner using their address. 
      * @notice All the stores owned by this storeowner will be removed and the balance returned.
      * @param _address Ethereum address.
      */
    function removeStoreOwner(address _address) public onlyAdministrator() pauseMarket() {
        storeOwners[_address] = false;
        Store[] memory StoresOwnedByRemovedStoreOwner = stores[_address];
        for (uint i = 0; i < StoresOwnedByRemovedStoreOwner.length; i++) {
            Store(StoresOwnedByRemovedStoreOwner[i]).removeStore();
            emit StoreRemoved(StoresOwnedByRemovedStoreOwner[i], _address);
        }
        emit StoreOwnerRemoved(_address);
    }

    /** @dev Add an administrator using their address. 
      * @param _address Ethereum address.
      */
    function addAdministrator(address _address) public onlyAdministrator() {
        administrators[_address] = true;
        emit AdministratorAdded(_address);
    }

    /** @dev Remove an administrator using their address. 
      * @param _address Ethereum address.
      */
    function removeAdministrator(address _address) public onlyMarketOwner() pauseMarket() {        
        administrators[_address] = false;
        emit AdministratorRemoved(_address);
    }
    
    /** @dev A store is added and the list of stores associated with an address is updated.
      * @param _name Name of the store.
      */
    function addStore(string _name) public onlyStoreOwner() pauseMarket() returns (Store storeAddress) {
        Store store = new Store(address(this), msg.sender, _name);
        Store[] memory oldStoresList = stores[msg.sender];
        Store[] memory newStoreList = new Store[](oldStoresList.length + 1);
        for (uint i = 0; i < oldStoresList.length; i++) {
            newStoreList[i] = oldStoresList[i];
        }
        newStoreList[newStoreList.length - 1] = store;
        stores[msg.sender] = newStoreList;
        emit StoreAdded(msg.sender, _name);
        return store;
    }

    /** @dev A store is removed and the list of stores associated with an address is updated.
      * @param _address Ethereum address of the Store's contract.
      */

    function removeStore(address _address) public pauseMarket() onlySpecificStoreOwner(_address) {       
        uint i = 0;
        Store(_address).removeStore(); 
        Store[] memory oldStoreList = stores[msg.sender];
        Store[] memory updatedStoreList = new Store[](oldStoreList.length - 1);   

        for (uint j = 0; j < oldStoreList.length; j++) {
            if (address(oldStoreList[i]) != _address) {
                updatedStoreList[i] = oldStoreList[i];
                i += 1;
            }
        }
        stores[msg.sender] = updatedStoreList;
        emit StoreRemoved(msg.sender, _address);
    }

}
