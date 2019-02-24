# Vue-Decentralized-Marketplace
This market place is based on the local [decentralized marketplace](https://github.com/wilpat/Decentralized-Marketplace) repo that depended
on metamask but this one was built with vue.js and it works with the rospten testnet as well as a private node to make transactions added 
automatically to the blockchain so users dont need metamask to interact with your application

Live version [here](https://marketplace-dapp.herokuapp.com/)

## Installation
Clone this repo then run `npm install` to get all the dependencies in place

Create a wallet to contain your ropsten ethereum addresses, save the mnemonics somewhere

Signup on [infura](https://infura.io/), create a new application there, then copy the secret(This would be your infura key)

Go [here](https://faucet.ropsten.be) to get 1 free ether (You can get one everyday)

Create an account with [Kaleido](https://kaleido.io/), create a consortium and finally a node then copy the rpc endoint, your username 
and password here. (This would be used for your kaleido-key in the app)

Update the `sec.js` `.ropsten-key` `.kaleido-key` and `.secret` files with your infura secret, your mnemonic and kaleido-key.

Run `truffle migrate --compile-all --reset ropsten` to migrate your contract to the ropsten test net

Run `truffle migrate --compile-all --reset kaleido` to migrate your contract to the your kaleido private network

run `npm run start` to get started

If you've got questions, you can find me [here](https://twitter.com/williamokafor)
