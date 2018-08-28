import React, { Component } from 'react'
import { Button, Input } from 'semantic-ui-react';

import BasicModal from './BasicModal';

class AdministratorPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adminAddress: '',
      header: '',
      message: '',
      open: false,
      storeOwnerAddress: '',
    }
    
    this.pause = this.pause.bind(this);
    this.handleAdminAddress = this.handleAdminAddress.bind(this);
    this.handleStoreOwnerAddress = this.handleStoreOwnerAddress.bind(this);
    this.addAdministrator = this.addAdministrator.bind(this);
    this.addStoreOwner = this.addStoreOwner.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.removeAdministrator = this.removeAdministrator.bind(this);
    this.removeStoreOwner = this.removeStoreOwner.bind(this);

  }

  handleAdminAddress(event) {
    this.setState({ adminAddress: event.target.value });
  }

  handleStoreOwnerAddress(event) {
    this.setState({ storeOwnerAddress: event.target.value });
  }

  closeModal() {
    this.setState({
      open: false,
      header: '',
      message: '',
    });
  }

  async pause() {
    try {
      await this.props.instance.setPause({ from: this.props.accounts[0] });
    } catch (e) {
      console.error(e);
    }
  }

  showEmergencyStopButton() {
        return <Button color='red' style={{width: '53%'}} onClick={this.pause}>Emergency Stop</Button>
  }

  async addStoreOwner() {
    try {
      await this.props.instance.addStoreOwner(this.state.storeOwnerAddress, { from: this.props.accounts[0] });
      this.setState({ storeOwnerAddress: '' });
    } catch (e) {
      console.error(e);
    }
  }

  async removeStoreOwner() {
    try {
      await this.props.instance.removeStoreOwner(this.state.storeOwnerAddress, { from: this.props.accounts[0] });
      this.setState({ storeOwnerAddress: '' });
    } catch (e) {
      console.error(e);
      if (
        String(e).includes('Gas limit has been exceeded.')
        || String(e).includes('Insufficient gas.')
      ) {
        this.setState({
          open: true,
          header: 'Insufficient gas.',
          message: 'Warning: Gas limit should be increased.'
        })
      }
    }
  }

  async addAdministrator() {
    try {
      await this.props.instance.addAdministrator(this.state.adminAddress, { from: this.props.accounts[0] });
      this.setState({ adminAddress: '' });
    } catch (e) {
      console.error(e);
    }
  }

  async removeAdministrator() {
    try {
      await this.props.instance.removeAdministrator(this.state.adminAddress, { from: this.props.accounts[0] });
      this.setState({ adminAddress: '' });
    } catch (e) {
      console.error(e);
      if (
        String(e).includes('Gas limit has been exceeded.')
        || String(e).includes('Insufficient gas.')
      ) {
        this.setState({
          open: true,
          header: 'Insufficient gas.',
          message: 'Warning: Gas limit should be increased.'
        })
      }
    }
  }

  render() {
    return (
      <div>
        <BasicModal open={this.state.open} header={this.state.header} message={this.state.message} close={() => this.closeModal()}  />
        <h1>Administrators Management</h1>
        <div style={{width: '27%'}}>
          <Input style={{width: '200%'}}    placeholder='Enter Ethereum Address...' value={this.state.adminAddress} onChange={this.handleAdminAddress} />
        </div>
        <div>
          <Button basic color='blue' onClick={this.addAdministrator}>Add Administrator</Button>
          {
            this.props.contractOwner === this.props.accounts[0]
              ? <Button basic color='orange' onClick={this.removeAdministrator}>Strip Administrator role</Button>
              : ''
          }
        </div>       
        <h1>Store Owner Management</h1>
        <div style={{width: '26.5%'}}>
          <Input style={{width: '200%'}} placeholder='Enter Ethereum Address...' value={this.state.storeOwnerAddress} onChange={this.handleStoreOwnerAddress} />
        </div>
        <div>
          <Button basic color='blue' onClick={this.addStoreOwner}>Add a Store Owner</Button>
          <Button basic color='orange' onClick={this.removeStoreOwner}>Strip Store Owner role</Button>
        </div>
        {this.showEmergencyStopButton()}
        <p> Only the market owner can pause user activity. </p>
      </div>
    )
  }
}

export default AdministratorPanel;
