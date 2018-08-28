import React, { Component } from 'react'
import { List } from 'semantic-ui-react';
import * as _ from 'lodash';

class StoreOwners extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storeOwners: [],
    }
  }

  componentDidMount() {
    if (_.has(this.props.instance, 'allEvents')) {
      this.getStoreOwners();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.instance !== prevProps.instance) {
      this.getStoreOwners();
    }
  }

  getStoreOwners() {
    const events = this.props.instance.allEvents({ fromBlock: 0, toBlock: 'latest' });

    events.get((error, logs) => {
      if (error) {
        console.error(error);
        return;
      }

      let storeOwners = [];
      const storeOwnerEvents = logs.filter(log => log.event === 'StoreOwnerAdded' || log.event === 'StoreOwnerRemoved');

      storeOwnerEvents.forEach(event => {
        if (event.event === 'StoreOwnerAdded') {
          storeOwners.push(event.args.addr);
        } else if (event.event === 'StoreOwnerRemoved') {
          storeOwners = storeOwners.filter(storeOwner => storeOwner !== event.args.addr);
        }
      });

      this.setState({ storeOwners });
    })
  }

  render() {
    return (
      <div>
        <h1>List of Store Owners' addresses</h1>
        <List>
        {
          this.state.storeOwners.map(storeOwner => (
            <List.Item key={storeOwner}>{storeOwner}</List.Item>
          ))
        }
        </List>
      </div>
    )
  }
}

export default StoreOwners;
