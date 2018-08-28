const UserRoles = artifacts.require('UserRoles');
const Store = artifacts.require('Store');
const Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

contract('Store', (accounts) => {
  const max = accounts[1];
  const chris = accounts[2];
  const ali = accounts[3];
  const hannah = accounts[4];
  const itemName = 'Industrial gyro-chair';
  const itemCost = web3.toWei(1, 'ether');
  const quantityItem = 11;
  const storeName = 'Steampunk chairs';

  /** Shopper can purchase appropriate number of items successfully. */
  it('should purchase the item successfully.', async () => {
    const quantityPurchased = 7;
    const instance = await UserRoles.deployed();
    await instance.addStoreOwner(ali);
    await instance.addStore(storeName, { from: ali });
    const stores = await instance.getStores(ali);
    const storeInstance = await Store.at(stores[0]);
    await storeInstance.addItem(itemName, itemCost, quantityItem, { from: ali, to: storeInstance.address });
    await storeInstance.purchaseItem(0, quantityPurchased, { from: chris, to: storeInstance.address, value: quantityPurchased * itemCost });
    const item = await storeInstance.items(0);
    assert.isTrue(item[2].toNumber() === quantityItem - quantityPurchased, 'Correct item quantity has been purchased.');
  })
  
  /** Store owner should be able to add and remove a store successfully. */
  it('should add and remove a store successfully.', async () => {
    const instance = await UserRoles.deployed();
    await instance.addStoreOwner(max);
    await instance.addStore(storeName, { from: max });
    const stores = await instance.getStores(max);
    await instance.removeStore(stores[0], { from: max });
    const removedStore = await instance.getStores(max);
    assert.isTrue(stores.length > 0, 'Store has been added.');
    assert.isTrue(removedStore.length === 0, 'Store has been removed');
  })

  /** Store owner can withdraw funds from their store. */
  it('should withdraw funds successfully.', async () => {
    const quantityPurchased = 1;
    const instance = await UserRoles.deployed();
    await instance.addStoreOwner(hannah);
    await instance.addStore(storeName, { from: hannah });
    const stores = await instance.getStores(hannah);
    const storeInstance = await Store.at(stores[0]);
    await storeInstance.addItem(itemName, itemCost, quantityItem, { from: hannah, to: stores[0] });
    await storeInstance.purchaseItem(0, quantityPurchased, { from: chris, to: stores[0], value: quantityPurchased * itemCost });
    const storeBalance = web3.eth.getBalance(stores[0]);
    await storeInstance.withdrawFunds(storeBalance, { from: hannah, to: stores[0] });
    const previousStoreBalance = web3.fromWei(storeBalance, 'ether');
    const latestStoreBalance = web3.fromWei(web3.eth.getBalance(stores[0]), 'ether');

    assert.isTrue(previousStoreBalance > latestStoreBalance, 'Store balance has been withdrawn.');
  })
  
  /** Store owner can add and remove an item from their store successfully. */
  it('should add and remove items from the store successfully.', async () => {
    const instance = await UserRoles.deployed();
    await instance.addStoreOwner(max);
    await instance.addStore(storeName, { from: max });
    const stores = await instance.getStores(max);
    const storeInstance = await Store.at(stores[0]);
    await storeInstance.addItem(itemName, itemCost, quantityItem, { from: max, to: stores[0] });
    const itemAdded = await storeInstance.items(0);
    await storeInstance.removeItem(0, { from: max, to: stores[0] })
    const itemRemoved = await storeInstance.items(0);

    assert.isTrue(itemAdded[0] === itemName, 'potion was added');
    assert.isTrue(itemRemoved[0] === '', 'potion was removed')
  })

  /** Store owner can update the cost of an item in their store successfully.*/
  it('should update the cost of the item successfully.', async () => {
    const newCost = web3.toWei(14, 'ether');
    const instance = await UserRoles.deployed();
    await instance.addStoreOwner(chris);
    await instance.addStore(storeName, { from: chris });
    const stores = await instance.getStores(chris);
    const storeInstance = await Store.at(stores[0]);
    await storeInstance.addItem(itemName, itemCost, quantityItem, { from: chris, to: storeInstance.address });
    await storeInstance.updatePrice(0, newCost, { from: chris, to: storeInstance.address });

    const item = await storeInstance.items(0);
    const priceInEther = web3.fromWei(item[1], 'ether').toNumber();

    assert.isTrue(priceInEther === 14, 'changed price')
  })
})
