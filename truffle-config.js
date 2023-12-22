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
          '0f076052cb93d4a0851ba051091a4841290e5e633a4399a52072bde48e69537d',
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