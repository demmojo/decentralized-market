import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { Button, Card, Divider, Input } from 'semantic-ui-react';
import * as _ from 'lodash';

class StoreOwnerPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stores: [],
      storeName: '',
      watchers: [],
    }

    this.addStore = this.addStore.bind(this);
    this.getExistingStores = this.getExistingStores.bind(this);
    this.handleStoreName = this.handleStoreName.bind(this);
  }

  componentDidMount() {
    this.getExistingStores();
    this.storeEvents();
  }

  componentWillUnmount() {
    this.state.watchers.forEach(watcher => watcher.stopWatching());
  }

  storeEvents() {
    const addStoreEvents = this.props.instance.StoreAdded({ owner: this.props.accounts[0] }, { fromBlock: 0, toBlock: 'latest' });
    const deleteStoreEvents = this.props.instance.StoreRemoved({ owner: this.props.accounts[0] }, { fromBlock: 0, toBlock: 'latest' });
    this.setState({ watchers: [addStoreEvents, deleteStoreEvents] });

    addStoreEvents.watch((error, result) => {
      if (error) {
        console.error(error);
      }

      this.getExistingStores();
    });

    deleteStoreEvents.watch((error, result) => {
      if (error) {
        console.error(error);
      }

      this.getExistingStores();
    });
  }

  handleStoreName(event) {
    this.setState({ storeName: event.target.value });
  }

  async addStore() {
    try {
      await this.props.instance.addStore(this.state.storeName, { from: this.props.accounts[0] });
    } catch(e) {
      console.error(e);
    } finally {
      this.setState({ storeName: '' });
    }
  }

  async getExistingStores() {
    const storeList = await this.props.instance.getStores(this.props.accounts[0]);
    let stores = [];

    storeList.forEach(async (store) => {
      const values = await this.props.instance.getStoreProperties(store);

      stores.push({
        address: store,
        name: values[0],
        owner: values[2],
        marketaddress: values[3],
      });

     this.setState({ stores });
    });
  }

  displayStores(stores) {
    if (_.isEmpty(stores)) {
      return <p>You either have no stores or the market has been paused.</p>;
    }

    return stores.map(store => {
      return (
        <Link to={`/manage/${store.address}`} key={store.address} style={{ paddingTop: '5px' }}>
          <Card fluid>
            <Card.Content>
              <Card.Header>{store.name}</Card.Header>
              <Card.Meta><span className='monospace'>{store.address}</span></Card.Meta>
            </Card.Content>
          </Card>
        </Link>
      )
    });
  }

  render() {
    return (
      <div>
        <h1>Store Owner Dashboard</h1>
        <div>
          <Input placeholder='Store Name' value={this.state.storeName} onChange={this.handleStoreName} />
          <Button basic color='blue' onClick={this.addStore}>Add Store</Button>
        </div>
        <Divider section />
        <h2>Manage your stores</h2>
        <Card.Group itemsPerRow={1}>
          {this.displayStores(this.state.stores)}
        </Card.Group>
      </div>
    )
  }
}

export default StoreOwnerPanel;
