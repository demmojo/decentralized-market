import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Divider, List } from 'semantic-ui-react';
import * as _ from 'lodash';

import StoreContract from '../contracts/Store.json';

class Shoppers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      balance: '',
      inventory: [],
      stores: [],
    };
  }

  componentDidMount() {
    this.getBalance();
    this.getStoreOwners();
  }

  getBalance() {
    if (_.has(this.props.web3, 'eth')) {
      this.props.web3.eth.getBalance(this.props.accounts[0], (error, result) => {
        if (error) {
          console.error(error);
          return;
        }

        const balance = this.props.web3.fromWei(result, 'ether').toString();
        this.setState({ balance });
      });
    }
  }

  getStoreOwners() {
    let storeOwners = [];

    this.props.instance.StoreOwnerAdded({}, { fromBlock: 0, toBlock: 'latest' })
      .get((error, logs) => {
        if (error) {
          console.error(error);
          return;
        }

        storeOwners = logs.map(log => log.args.addr);
        this.getAllStores(storeOwners);
      })
  }

  async getAllStores(storeOwners) {
    try {
      storeOwners.forEach(async (storeOwner, index) => {
        const storeList = await this.props.instance.getStores(storeOwner);
        this.setState(prevState => ({
          stores: [...prevState.stores, ...storeList],
        }));

        if (storeOwners.length === index + 1) {
          this.checkPurchaseEvents();
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  checkPurchaseEvents() {
    const contract = require('truffle-contract');
    const storeContract = contract(StoreContract);
    storeContract.setProvider(this.props.web3.currentProvider);

    this.state.stores.forEach(async (store) => {
      const instance = await storeContract.at(store);

      instance.ItemPurchased({ buyer: this.props.accounts[0] }, { fromBlock: 0, toBlock: 'latest' })
        .get((error, logs) => {
          if (error) {
            console.error(error);
          }

          logs.forEach(async (log) => {
            const itemDetails = await instance.items(log.args.id);

            const item = {
              id: log.args.id,
              name: itemDetails[0],
              quantity: log.args.quantity,
              storeAddress: log.address,
            };

            this.setState(prevState => ({
              inventory: [...prevState.inventory, item],
            }));
          })
        })
    })
  }

  displayInventory() {
    if (this.state.inventory.length === 0) {
      return;
    }

    return (
      <div>
        <h2>Items Purchased</h2>
        <List divided relaxed>
          {
            this.state.inventory.map((item, index) => (
              <List.Item key={index}>
                <List.Content floated='left'>
                  <List.Header>{item.name}</List.Header>
                  <List.Description>Amount: {item.quantity.toString()}</List.Description>
                </List.Content>
                <List.Content floated='right'>
                  <Link to={`/store/${item.storeAddress}`}>
                    <Button basic color='blue' size='small'>Go to Store</Button>
                  </Link>
                </List.Content>
              </List.Item>
            ))
          }
        </List>
      </div>
    )
  }

  render() {
    return(
      <div>
        <h1>Shopper Dashboard</h1>
        <h3>Remaining balance: {this.state.balance} ETH</h3>
        <Divider section />
        {this.displayInventory()}
      </div>
    )
  }
}

export default Shoppers;
