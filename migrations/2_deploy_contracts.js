var UserRoles = artifacts.require('./UserRoles.sol');

module.exports = function(deployer) {
  deployer.deploy(UserRoles);
};
