pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./UserRoles.sol";

/** @title Store related tasks. */
contract Store is Ownable {
    UserRoles userRolesContract;
    uint public itemCounter;   
    address marketAddress;
    string public name;
    mapping(uint => Item) public items;

    event FundsWithdrawn(address indexed addr, uint amount);
    event ItemAdded(string name, uint price, uint quantity, uint indexed id);
    event ItemRemoved(uint indexed id);
    event ItemPurchased(uint indexed id, address indexed buyer, uint quantity);
    event PriceUpdated(uint indexed id, uint oldPrice, uint newPrice);  
    event StoreRemoved(address indexed addr, address indexed owner);

    /** @dev Exception is thrown if the item is unavailable. */
    modifier itemAvailable(uint _id) {
        require(items[_id].available == true, "Item is unavailable.");
        _;
    }

    /** @dev Exception thrown if function called while market is paused. */
    modifier pauseMarket() {
        bool stop = getPauseState();
        require(stop == false, "Market has been paused.");
        _;
    }

    /** @dev Exception is thrown if quantity requested exceeds store's stock. */
    modifier sufficientQuantity(uint _quantity, uint _id) {
        require(_quantity <= items[_id].quantity, "Exceeds available quantity.");
        _;
    }

    /** @dev Exception is thrown if the buyer has insufficient balance. */
    modifier sufficientBalance(uint _id) {
        require(msg.value >= items[_id].price, "Insufficient balance.");  
        _;
    }

    /** @dev Exception is thrown if not the store owner. */
    modifier onlyStoreOwner() {
        require(marketAddress == msg.sender, "You must be the store owner to conduct this task.");
        _;
    }

    struct Item {
        string name;
        uint price;
        uint quantity;
        uint id;     
        bool available;                          
    }

    constructor(address _marketAdress, address _owner, string _name) public {
        itemCounter = 0;
        marketAddress = _marketAdress;
        owner = _owner;
        name = _name;        
    }

    /** @dev Retrieves market pause state. */
    function getPauseState() public returns (bool) {
        userRolesContract = UserRoles(marketAddress);
        return userRolesContract.stop();
    }

    /** @dev Removes the store and the balance remaining is returned.
      */
    function removeStore() external onlyStoreOwner() pauseMarket() {     
        emit StoreRemoved(address(this), owner);
        selfdestruct(owner);
    }

    /** @dev Update item's price.
      * @param _id Item's id number.
      * @param _price Item's updated price.
      */
    function updatePrice(uint _id, uint _price) public itemAvailable(_id) pauseMarket() onlyOwner {
        items[_id].price = _price;
        emit PriceUpdated(_id, _price, items[_id].price);
    }
    
    /** @dev Purchase item.
      * @param _quantity Quantity to be purchased. 
      * @param _id Item's id number.
      */
    function purchaseItem(uint _id, uint _quantity)
        public
        payable
        sufficientBalance(_id)
        sufficientQuantity(_quantity, _id)
        itemAvailable(_id) 
        pauseMarket()
    {      
        items[_id].quantity = items[_id].quantity - _quantity;
        emit ItemPurchased(_id, msg.sender, _quantity);
    }

    /** @dev An item is added and it's name, quantity and price is assigned.
      * @param _name Item's name.
      * @param _quantity Item's quantity.
      * @param _price Item's price.
      */
    function addItem(string _name, uint _price, uint _quantity) public pauseMarket() onlyOwner {       
        require(_price > 0, "Item needs a price.");
        require(_quantity > 0, "Add more items.");

        items[itemCounter] = Item(_name, _price, _quantity, itemCounter, true);
        itemCounter += 1;
        emit ItemAdded(_name, _price, _quantity, itemCounter);
    }

    function getProperties() public view returns (string, uint, address, address) {
        return (name, itemCounter, owner, marketAddress);
    }

    /** @dev An item is removed from the store. 
      * @param _id Item's ID
      */
    function removeItem(uint _id) public itemAvailable(_id) pauseMarket() onlyOwner {        
        delete items[_id];
        emit ItemRemoved(_id);
    }

    /** @dev Funds are transferred to the store owner's address. 
      * @param _amount Amount to be transferred.
      */
    function withdrawFunds(uint _amount) public onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance.");
        emit FundsWithdrawn(owner, _amount);
        owner.transfer(_amount);
    }
}
