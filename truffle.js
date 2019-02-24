var HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require('fs');
const Web3 = require('web3');

const mnemonics = process.env.MNEMONIC || fs.readFileSync('.secret').toString().trim();
const key = process.env.INFURA_KEY || fs.readFileSync('.api_key').toString().trim();

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 4700000,
      network_id: "*" // Match any network id
    },

    ganache: {
      host: "localhost",
      port: 7545,
      gas: 500000,
      network_id: "*" // Match any network id
    },

    private: {
      host: "127.0.0.1",
      port: 8545,
      gas: 500000,
      network_id: "4224"
    },

    ropsten:{
    	provider: () => new HDWalletProvider(mnemonics, 'https://ropsten.infura.io/v3/' + key),
    	network_id: 3, //Ropsten's id
    	gas: 5000000, //Ropsten has a lower block limit than the main net
    	confirmation: 2, //Number of confs to wait before deployment (Default: 0)
    	timeoutBlocks: 200, // Number of blocks before a deployment times out (minimum / default : 50)
    	skipDryRun: true //Skip dry run before migration? Default is public for public nets
    },

    kaleido: {
      provider: function() {
        return new Web3.providers.HttpProvider('https://e0n06zi2jf:o7pe38R9iUyf3Nh5HuYTtV1e_hzQG_DlYckeWA-ICd0@e0ssu47hxk-e0l91isw19-rpc.eu-central-1.kaleido.io')
      },
      gasPrice: 0,
      gas:5000000,
      network_id: "*"
    },
  }
};
