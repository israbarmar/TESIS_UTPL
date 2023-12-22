const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" 
    },
    goerli: {
      provider: function() {
        return new HDWalletProvider(
          'cute roast post exhaust tag task shaft dawn axis scissors arm toy', 
          'https://goerli.infura.io/v3/3461df230aa74ec9a0b6ef606e79906f' 
        );
      },
      network_id: 5,
      gas: 5000000, 
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
      },
    },
  },
};