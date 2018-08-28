import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import * as _ from 'lodash';

class ListStores extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storeOwners: [],
      stores: [],
      watchers: [],
    }

    this.getAllStores = this.getAllStores.bind(this);
    this.getEvents = this.getEvents.bind(this);
  }

  componentDidMount() {
    if (_.isEmpty(this.state.storeOwners) && _.has(this.props.instance, 'allEvents')) {
      this.getEvents();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.instance !== prevProps.instance) {
      this.getEvents();
    }
  }

  componentWillUnmount() {
    this.state.watchers.forEach(watcher => watcher.stopWatching());
  }

  getEvents() {
    let blockNumber = 0;

    this.props.web3.eth.getBlockNumber((error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      blockNumber = result;
    });

    const addStoreOwnerEvents = this.props.instance.StoreOwnerAdded({}, { fromBlock: 0, toBlock: 'latest' });
    const addStoreEvents = this.props.instance.StoreAdded({}, { fromBlock: 0, toBlock: 'latest' });

    addStoreOwnerEvents.get((error, logs) => {
      if (error) {
        console.error(error);
        return;
      }

      const storeOwners = logs.map(log => log.args.addr);
      this.setState({ storeOwners });
      this.getAllStores();
    });

    addStoreEvents.watch((error, log) => {
      if (error) {
        console.error(error);
        return;
      }

      if (blockNumber < log.blockNumber) {
        this.setState({ stores: [] });
        this.getAllStores();
      }
    })

    this.setState({ watchers: [addStoreEvents] });
  }

  async getAllStores() {
    try {
      this.state.storeOwners.forEach(async (storeOwner) => {
        const stores = await this.props.instance.getStores(storeOwner);

        stores.forEach(async (store) => {
          const values = await this.props.instance.getStoreProperties(store);
          const newStore = {
            address: store,
            name: values[0],
            owner: values[2],
            marketAddress: values[3],
          };

          this.setState(prevState => ({
            stores: [...prevState.stores, newStore],
          }));
        });
      });
    } catch(e) {
      console.error(e);
    }
  }

  displayStores(stores) {
    if (_.isEmpty(stores)) {
      return (
        <div>
          <p></p>
          <h4>Currently, no stores are in the market.</h4>
        </div>
      );
    }

    return stores.map(store => {
      return (
        <Link to={`/store/${store.address}`} key={store.address}>
          <Card fluid>
            <Card.Content>
              <Card.Header>{store.name}</Card.Header>
              <Card.Meta className='monospace'>{store.address}</Card.Meta>
            </Card.Content>
          </Card>
        </Link>
      )
    });
  }

  render() {
    return (
      <div>
        <h1 style={{width: '75%'}}>List of Stores</h1>
        <Card.Group itemsPerRow={1}>
          {this.displayStores(this.state.stores)}
        </Card.Group>
      </div>
    )
  }
}

export default ListStores;
