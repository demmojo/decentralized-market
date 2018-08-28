import React, { Component } from 'react'
import { List } from 'semantic-ui-react';
import * as _ from 'lodash';

class Administrators extends Component {
  constructor(props) {
    super(props);

    this.state = {
      administrators: [],
    }
  }

  componentDidMount() {
    if (_.has(this.props.instance, 'allEvents')) {
      this.getAdmins();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.instance !== prevProps.instance) {
      this.getAdmins();
    }
  }

  getAdmins() {
    const events = this.props.instance.allEvents({ fromBlock: 0, toBlock: 'latest' });

    events.get((error, logs) => {
      if (error) {
        console.error(error);
        return;
      }

      let administrators = [];
      const adminEvents = logs.filter(log => log.event === 'AdministratorAdded' || log.event === 'AdministratorRemoved');

      adminEvents.forEach(event => {
        if (event.event === 'AdministratorAdded') {
          administrators.push(event.args.addr);
        } else if (event.event === 'AdministratorRemoved') {
          administrators = administrators.filter(admin => admin !== event.args.addr);
        }
      });

      this.setState({ administrators });
    })
  }

  render() {
    return (
      <div>
        <h1>List of Administrator addresses</h1>
        <List>
        {
          this.state.administrators.map(admin => (
            <List.Item key={admin}>{admin}</List.Item>
          ))
        }
        </List>
      </div>
    )
  }
}

export default Administrators;