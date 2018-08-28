var UserRoles = artifacts.require('UserRoles');

contract('UserRoles', (accounts) => {
  const marketOwnerAccount = accounts[0];
  const chris = accounts[1];
  const ali = accounts[2];

  /** Market contract owner is assigned as an administrator successfully.*/
  it('should assign the market contract owner as the administrator.', async () => {
    const instance = await UserRoles.deployed();
    const result = await instance.administrators(marketOwnerAccount);
    const marketOwner = await instance.owner();

    assert.isTrue(result, 'The market contract owner has been assigned as an administrator succesfully.');
  })

  /** The market place owner should be able to add and remove an administrator. */
  it('should add and remove an administrator.', async () => {
    const instance = await UserRoles.deployed();

    await instance.addAdministrator(chris);
    const addAdministrator = await instance.administrators(chris);

    await instance.removeAdministrator(chris);
    const removeAdministrator = await instance.administrators(chris);

    assert.isTrue(addAdministrator, 'chris has been assigned as an administrator.');
    assert.isFalse(removeAdministrator, 'chris has been unassigned as an administrator.');
  })

  /** Non-administrators should not be able to remove or add any store owners or administrators.*/
  it('should confirm that non-administrators cannot add or remove store owners or administrators.', async () => {
    const instance = await UserRoles.deployed();

    try {
      await instance.addAdministrator(chris, { from: ali });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `"revert" expected, however ${error} was received.`);
    }

    try {
      await instance.addStoreOwner(chris, { from: ali });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `"revert" expected, however ${error} was received.`);
      return;
    }

    assert.fail('Unexpected revert.');
  })

  /** The administrator should not be allowed to remove the market owner as an administrator."
    */
  it('should confirm that administrators cannot remove the market owner as administrator', async () => {
    const instance = await UserRoles.deployed();

    try {
      await instance.addAdministrator(chris);
      await instance.removeAdministrator(marketOwnerAccount, { from: chris });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert(revertFound, `"revert" expected, however ${error} was received.`);
      return;
    }

    assert.fail('Unexpected revert.');
  })

  /** The administrator shoudl be able to add as well as remove store owners. */
  it('should add as well as remove a store owner successfully.', async () => {
    const instance = await UserRoles.deployed();
    await instance.addStoreOwner(chris);
    const addStoreOwner = await instance.storeOwners(chris);
    await instance.removeStoreOwner(chris);
    const removeStoreOwner = await instance.storeOwners(chris);

    assert.isTrue(addStoreOwner, 'chris has been assigned a store owner successfully.');
    assert.isFalse(removeStoreOwner, 'chris has been unassigned a store owner successfully.');
  })

})
