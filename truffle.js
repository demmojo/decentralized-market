const HDWalletProvider = require('truffle-hdwallet-provider');
//const memonic = "enter 12 word seed phrase"

module.exports = {
  contracts_build_directory: `${__dirname}/src/contracts`,
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
/*    rinkeby: {
      provider: function() {
        return new HDWalletProvider(memonic, "https://rinkeby.infura.io/<<e33af986f3a74b8abf894460500bcd58>>")
      },
      network_id: 3
    } */
  }
};
