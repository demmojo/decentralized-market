import React, { Component } from 'react'
import { BrowserRouter , Route, Link } from 'react-router-dom';
import { Grid, Container, Menu } from 'semantic-ui-react'

import UserRoles from './contracts/UserRoles.json'
import getWeb3 from './utils/getWeb3'
import './App.css';

import AdministratorPanel from './components/AdministratorPanel';
import Administrators from'./components/Administrators';
import Store from './components/Store';
import StoreManagement from './components/StoreManagement';
import Shoppers from './components/Shoppers';
import ListStores from './components/ListStores';
import StoreOwnerPanel from './components/StoreOwnerPanel';
import StoreOwners from './components/StoreOwners';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: [],
      activeAccount: '',
      currentAccount: '',
      contractOwner: '',
      instance: null, 
      logs: [],
      storeOwners: [],
      userType: '',
      watchers: [],
      web3: null,
    };
  }

  async componentWillMount() {
    try {
      const results = await getWeb3;
      this.setState({ web3: results.web3 });
      this.instantiateContract();
    } catch (e) {
      console.error(`Error finding web3: ${e}`);
    }
  }

  componentWillUnmount() {
    this.state.watchers.forEach(watcher => watcher.stopWatching());
  }

  async instantiateContract() {
    /* Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const contract = require('truffle-contract');
    const userRoles = contract(UserRoles);
    userRoles.setProvider(this.state.web3.currentProvider);

    const accounts = this.state.web3.eth.accounts;
    const instance = await userRoles.deployed();
    const contractOwner = await instance.owner.call();
    this.setState({
      accounts,
      blockNumber: 0,
      contractOwner,
      instance,
      currentAccount: accounts[0],
    });

    this.determineUserType();
    this.accountWatcher();
    this.eventWatchers();
  }

  accountWatcher() {
    setInterval(() => {
      if (this.state.web3.eth.accounts[0] !== this.state.currentAccount) {
        window.location.reload();
      }
    }, 1000)
  }

  eventWatchers() {
    this.state.web3.eth.getBlockNumber((error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      this.setState({ blockNumber: result })
    })
  }

  async determineUserType() {
    try {
      const admin = await this.state.instance.administrators.call(this.state.accounts[0]);
      const storeOwner = await this.state.instance.storeOwners.call(this.state.accounts[0]);

      if (admin) {
        this.setState({ userType: 'admin' });
      } else if (storeOwner) {
        this.setState({ userType: 'storeOwner' });
      } else {
        this.setState({ userType: 'shopper' });
      }
    } catch (e) {
      this.setState({ userType: 'shopper' });
      console.error(e);
    }
  }

   displayPanel() {
    if (this.state.userType === 'admin') {
      return <AdministratorPanel
        accounts={this.state.accounts}
        contractOwner={this.state.contractOwner}
        instance={this.state.instance}
      />;
    } else if (this.state.userType === 'storeOwner') {
      return <StoreOwnerPanel
        accounts={this.state.accounts}
        instance={this.state.instance}
      />
    } else if (this.state.userType === 'shopper') {
      return <Shoppers
        accounts={this.state.accounts}
        instance={this.state.instance}
        web3={this.state.web3}
      />
    }

    return;
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <Menu style={{fontSize: 'x-large'}}pointing primary>
            <Link to='/'>
              <Menu.Item name='home' />
            </Link>
            <Link to='/store-owners'>
              <Menu.Item name='store owners' />
            </Link>
            <Link to='/administrators'>
              <Menu.Item name='administrators' />
            </Link>
          </Menu>

          <Container>
            <Grid style={{margin: 'auto',  width: '60%'}} columns={1}>
              <Grid.Column width={20}>
                {this.displayPanel()}
              </Grid.Column>
              <Grid.Column width={20}>
                <Route exact path='/'
                  render={() => <ListStores
                    accounts={this.state.accounts}
                    instance={this.state.instance}
                    web3={this.state.web3}
                  />}
                />
                <Route path='/administrators'
                  render={() => <Administrators
                    instance={this.state.instance}
                  />}
                />
                <Route path='/manage/:address'
                  render={(props) => <StoreManagement
                    {...props}
                    accounts={this.state.accounts}
                    userRolesInstance={this.state.instance}
                    web3={this.state.web3}
                  />}
                />
                <Route path='/store/:address'
                  render={(props) => <Store
                    {...props}
                    accounts={this.state.accounts}
                    web3={this.state.web3}
                  />}
                />
                <Route path='/store-owners'
                  render={() => <StoreOwners
                    instance={this.state.instance}
                  />}
                />
              </Grid.Column>
            </Grid>
          </Container>
        </div>
      </BrowserRouter>
    );
  }
}
