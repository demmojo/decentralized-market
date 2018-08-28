import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Grid, Card, Form, Container, Divider, Input } from 'semantic-ui-react';
import * as _ from 'lodash';

import StoreContract from '../contracts/Store.json';

class StoreManager extends Component {
  defaultState = {
    address: '',
    balance: 0,
    instance: null,
    inputItem: '',
    inputPrice: '',
    inputQuantity: '',
    itemCounter: 0,
    items: [],
    itemsPrice: {},
    marketAddress: '',
    name: '',
    owner: '',
    triggerDelete: false,
    watchers: [],
    withdrawalInput: '',
  }

  constructor(props) {
    super(props);

    this.state = this.defaultState;

    this.addItem = this.addItem.bind(this);
    this.changeItemPrice = this.changeItemPrice.bind(this);
    this.removeStore = this.removeStore.bind(this);
    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handlePriceUpdate = this.handlePriceUpdate.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.withdrawFunds = this.withdrawFunds.bind(this);
  }

  componentDidMount() {
    if (_.has(this.props.web3, 'currentProvider')) {
      this.instantiateContract();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.web3 !== prevProps.web3
      || this.props.match.params.address !== prevProps.match.params.address
    ) {
      this.setState(this.defaultState);
      this.instantiateContract();
    }
  }

  componentWillUnmount() {
    this.state.watchers.forEach(watcher => watcher.stopWatching());
  }

  async instantiateContract() {
    try {
      const contract = require('truffle-contract');
      const store = contract(StoreContract);
      store.setProvider(this.props.web3.currentProvider);

      const instance = await store.at(this.props.match.params.address);

      this.setState({ instance });
      this.setWatchers();
      this.getDetails();
    } catch (e) {
      console.error(e);
    }
  }

  setWatchers() {
    const addItemEvents = this.state.instance.ItemAdded({}, { fromBlock: 0, toBlock: 'latest' });
    const removeItemEvents = this.state.instance.ItemRemoved({}, { fromBlock: 0, toBlock: 'latest' });
    this.setState({ watchers: [addItemEvents, removeItemEvents] });

    addItemEvents.watch((error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      this.getDetails();
    });

    removeItemEvents.watch((error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      this.getDetails();
    });
  }

  async getDetails() {
    try {
      if (this.props.accounts[0] !== await this.state.instance.owner()) {
        this.props.history.push('/');
        return;
      }

      const address = this.state.instance.address;
      const values = await this.state.instance.getProperties.call();
      this.setState({
        address,
        name: values[0],
        itemCounter: values[1].toNumber(),
        owner: values[2],
        marketAddress: values[3],
      })

      this.props.web3.eth.getBalance(this.state.address, (error, result) => {
        if (error) {
          console.error(error);
          return;
        }

        const balance = this.props.web3.fromWei(result.toString(), 'ether');

        this.setState({ balance })
      });

      this.getItems();
    } catch (e) {
      console.error(e);
    }
  }

  handleInputUpdate(event) {
    const name = event.target.name;
    this.setState({ [name]: event.target.value });
  }

  handlePriceUpdate(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState(prevState => ({
      itemsPrice: { ...prevState.itemsPrice, [name]: value },
    }));
  }

  amountSold(id) {
    return new Promise((resolve, reject) => {
      this.state.instance.ItemPurchased({ id }, { fromBlock: 0, toBlock: 'latest' })
        .get((error, logs) => {
          if (error) {
            console.error(error);
            return reject();
          }

          return resolve(logs);
        })
    })
  }

  async getItems() {
    try {
      let items = [];
      for (let i = 0; i < this.state.itemCounter; i++) {
        const values = await this.state.instance.items(i);

        if (!values[4]) {
          continue;
        }

        const purchases = await this.amountSold(values[3]);
        const sold = purchases
          .map(purchase => purchase.args.quantity.toNumber())
          .reduce((a, b) => a + b, 0);

        items.push({
          sold,
          name: values[0],
          price: values[1].toNumber(),
          quantity: values[2].toNumber(),
          id: values[3].toNumber(),
        });
      }

      this.setState({ items });
    } catch (e) {
      console.error(e);
    }
  }

  async addItem() {
    try {
      const wei = this.props.web3.toWei(this.state.inputPrice, 'ether');
      await this.state.instance.addItem(
        this.state.inputItem,
        wei,
        this.state.inputQuantity,
        { from: this.props.accounts[0] }
      );
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        inputItem: '',
        inputPrice: '',
        inputQuantity: '',
      });
    }
  }

  async changeItemPrice(id) {
    try {
      const wei = this.props.web3.toWei(this.state.itemsPrice[id], 'ether');
      await this.state.instance.updatePrice(id, wei, { from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  async removeItem(id) {
    try {
      await this.state.instance.removeItem(id, { from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  async withdrawFunds(amount) {
    try {
      const wei = this.props.web3.toWei(amount, 'ether');
      await this.state.instance.withdrawFunds(wei, { from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  async removeStore() {
    try {
      await this.props.userRolesInstance.removeStore(this.state.address, { from: this.props.accounts[0]});
    } catch (e) {
      console.error(e);
    } finally {
      this.props.history.push('/');
    }
  }

  displayItems(items) {
    return items.map(item => {
      const price = this.props.web3.fromWei(item.price, 'ether');
      return (
        <Card key={item.id}>
          <Card.Content>
            <Card.Header>{item.name}</Card.Header>
            <Card.Meta>{price} ETH</Card.Meta>
            <Card.Description>Quantity: {item.quantity} | Sold: {item.sold}</Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Input fluid
              label={{ basic: true, content: 'ETH' }}
              labelPosition='right'
              name={item.id}
              onChange={this.handlePriceUpdate}
              placeholder='New Price'
              style={{ marginBottom: '10px' }}
            />
            <div className='ui two buttons'>
              <Button basic color='green' onClick={() => this.changeItemPrice(item.id)}>
                Update Price
              </Button>
              <Button basic color='orange' onClick={() => this.removeItem(item.id)}>
                Remove Product
              </Button>
            </div>
          </Card.Content>
        </Card>
      );
    })
  }

  render() {
    return (
      <Container>
        <div>
          <h1>Store Manager</h1>
          <Divider section />
          <div style={{ marginBottom: '10px' }}>
            <h3>Store Info</h3>
            <p><strong>Owner:</strong> <span className='monospace'>{this.state.owner}</span></p>
            <p><strong>Store Name:</strong> {this.state.name}</p>
            <p><strong>Store Address:</strong> <span className='monospace'>{this.state.address}</span></p>            
            <h4>Remaining balance: {this.state.balance} ETH</h4>
          </div>

          <Grid columns={2}>
            <Grid.Column>
              <Form>
                <Form.Field>
                  <Button basic color='green'
                    style={{ marginRight: '10px' }}
                    onClick={() => this.props.history.push(`/store/${this.state.address}`)}>
                    View Store
                  </Button>
                  <Button basic color='red' onClick={this.removeStore}>Remove Store</Button>
                </Form.Field>
                {
                  this.state.balance > 0
                    ? <Form.Field>
                        <Input
                          label={{ basic: true, content: 'ETH' }}
                          labelPosition='right'
                          name='withdrawalInput'
                          onChange={this.handleInputUpdate}
                          placeholder='Withdrawal Amount'
                        />
                        <Button basic
                          disabled={this.state.balance <= 0}
                          onClick={() => this.withdrawFunds(this.state.withdrawalInput)}>
                          Withdraw Funds
                        </Button>
                      </Form.Field>
                    : ''
                }

              </Form>
            </Grid.Column>
          </Grid>
        </div>
        <Divider section />
        <Grid columns={2}>
          <Grid.Column>
            <h3>Add Item</h3>
            <Form>
              <Form.Field>
                <Input placeholder='Item name' name='inputItem' value={this.state.inputItem} onChange={this.handleInputUpdate} />
              </Form.Field>
              <Form.Field>
                <Input
                  label={{ basic: true, content: 'ETH' }}
                  labelPosition='right'
                  name='inputPrice'
                  onChange={this.handleInputUpdate}
                  placeholder='Price'
                  value={this.state.inputPrice}
                />
              </Form.Field>
              <Form.Field>
                <Input placeholder='Quantity' name='inputQuantity' value={this.state.inputQuantity} onChange={this.handleInputUpdate} />
              </Form.Field>
              <Button basic color='green' onClick={this.addItem}>Add Item</Button>
            </Form>
          </Grid.Column>
        </Grid>
        <Divider section />
        <div>
          <h3>Inventory</h3>
          <Card.Group>
            {this.displayItems(this.state.items)}
          </Card.Group>
        </div>
      </Container>
    )
  }
}

export default withRouter(StoreManager);
