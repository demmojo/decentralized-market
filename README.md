
# A decentralized online market on Ethereum
This is my final project submission for the ConsenSys Academy's 2018 Developer Program. In this project, I developed a decentralized market on the Ethereum platform where users can open stores, add items to the stores, just shop and more! 

The market has four types of participants:

1. `Market Owner`: The market owner is the address that deploys the UserRoles contract and is essentially a super-administrator. Also has the ability to emergency stop the market. 
2. `Administrators`: The owner can add and remove administrators as well as store owners using their Ethereum addresses. Administrators can add store owners or other administrators but can only remove store owners.
3. `Store owners`: Store owners can add or remove stores and items. Their balance is stored in the store contract until withdrawn or destroyed.  
4. `Shoppers`: They can browse items and stores and place orders in Ether.

# Setup guide

You will need to install the following if not already installed previously:
* npm
* node
* ganache-cli
* truffle

To install `truffle` and `ganache-cli` run the following commands if npm is installed:

```
npm install -g truffle
npm install -g ganache-cli
```
### Set up a blockchain locally
After installing `ganache-cli` run the following command in your terminal:
```
ganache-cli
```
This will initiate your blockchain locally and will provide you with an hd wallet with a mnemonic seed phrase. We will use this seed phrase to import the wallet to metamask.

### Setting up the project

First, please clone this repository and enter the directory.
```
git clone https://github.com/demmojo/decentralized-market
```
```
cd ./decentralized-market
```
Now, open your terminal and enter the following command to install the local packages for the project's front-end:
```
npm install
```
Please make sure you have ganache-clie running before beginning the next step.

Next, use `truffle` to compile and migrate the smart contracts to your local blockchain. 

```
truffle compile
```
```
truffle migrate
```

You can now launch the front-end using the following command:
```
npm start
```

### Metamask configuration

Copy the mnemonic seed phrase from `ganache-cli` and import to `metamask` using the 'Restore from seed phrase' option. After entering a password you will need to connect to the locally run blockchain. Change the network setting to `localhost:8545`. You should now be able to access the account addresses on your locally run blockchain. 

# Testing the smart contracts

Before testing, make sure `ganache-cli` is running.

To run the tests please enter the following command: 
```
truffle test
```

# Deploying on the Rinkeby network

The UserRoles smart contract was deployed to the Rinkeby network and the hash of the transaction is: 0x2f480d971c91c0171408d7e05cd1cbdf08cbe028

You can find more details [here](https://rinkeby.etherscan.io/address/0x2f480d971c91c0171408d7e05cd1cbdf08cbe028).



