/* eslint-disable */
import contract from 'truffle-contract'
import UsersContract from '@contracts/Users.json'
import jwt from 'jsonwebtoken'
import store from '../store'

import config from '../helpers/config'

const Users = {

  contract: null,

  instance: null,

  coinbase: '',

  web3Coinbase: '',

  coinbase_amount: 0,

  userAddress: '',

  init: function () {
    let self = this
    self.setCoinbase()
    return new Promise(function (resolve, reject) {
      self.contract = contract(UsersContract)
      self.contract.setProvider(window.web3.currentProvider)

      self.contract.deployed().then(instance => {
        self.instance = instance
        resolve()
      }).catch(err => {
        reject(err)
      })
    })
  },

  setCoinbase: function () { // Check if app is connected to the blockchain server
    let self = this
    try { // We need to set the coinbase for interactions with the smart contract on ropsten which is in linked by web3
          window.web3.eth.getCoinbase((err, account) => {
          if (err === null) {
            self.web3Coinbase = account
          }
        })
    } catch (err) {
      console.log(err)
    }

    if(window.kaleido){ // Set general coinbase for kaleido
      try {
            window.kaleido.eth.getCoinbase((err, account) => {
            if (err === null) {
              self.coinbase = account
              // $('#account').text(account);
              window.kaleido.eth.getBalance(account, (error, balance) => {
                if (error === null) {
                    self.coinbase_amount = window.kaleido.utils.fromWei(balance, 'ether')
                  // console.log(self.coinbase, self.coinbase_amount)
                }
              })
            }
          })
      } catch (err) {
        console.log(err)
      }
    } else { // if kaleido isnt available, then use the web3 coinbase
      self.coinbase = self.web3Coinbase
    }
  },

  exists: function (email) {
    let self = this

    return new Promise((resolve, reject) => {
      self.instance.exists.call(
        email,
        {from: self.userAddress}
      ).then(exists => {
        resolve(exists)
      }).catch(err => {
        reject(err)
      })
    })
  },

  authenticate: function () {
    let self = this

    return new Promise((resolve, reject) => {
      self.instance.authenticate.call(
        {from: window.web3.eth.accounts[0]}
      ).then(pseudo => {
        resolve(window.web3.toUtf8(pseudo))
      }).catch(err => {
        reject(err)
      })
    })
  },

  login: async function (data) {
    const { email, password } = data
    let self = this
    store.state.message = "Checking your email..."
    const address = await new Promise((resolve, reject) => {//Check if the email exists in the smart contract in ropsten
                        self.instance.get(email,
                          {from: self.coinbase}
                        ).then(data => resolve(data))
                        .catch(err =>{
                          store.state.message = "Invalid credentials"
                          reject('Invalid credentials')
                        })
                     
                    })
    try{//Now try the password
      store.state.message = "Checking your password..."
      if (!window.kaleido) { // If this isnt kaleido
        await window.web3.personal.unlockAccount(address, password, 86400)
      } else {
        await window.kaleido.eth.personal.unlockAccount(address, password, 86400)
      }
      self.userAddress = address
      let tx = {}
      tx.userAddress = self.userAddress
      let token = jwt.sign({ email: email }, config.secret, { expiresIn: 86400 /* expires in 24 hours  */})
      tx.token = token
      const addressBal = await self.getBalance(address) // get the balance of this address
      tx.balance = addressBal
      return tx
    }catch (err){
      store.state.message = "Invalid login"
      throw 'Invalid login'
    }
  },

  create: async function (data) {
    let self = this

    //First create the accound with the provider that fits
    var address
    store.state.message = "Creating your address..."
    if (!window.kaleido) { // If this isnt kaleido
          address = await new Promise((resolve, reject) => {
                            window.web3.personal.newAccount(data.password)
                            .then(address => resolve(address)) // Create a new address with this password
                            .catch(err =>{
                              store.state.message = "An error occurred"
                              reject(err)
                            })
                          })
    } else{
          address = await new Promise((resolve, reject) => {
                        window.kaleido.eth.personal.newAccount(data.password)
                        .then(address => resolve(address)) 
                        .catch(err =>{
                          store.state.message = "An error occurred"
                          reject(err)
                        })
                      })
    }
      // console.log(address)

    // Transfer some ether from the coinbase to it to start with
    store.state.message = "Sending you test ethers..."
    const balance = await new Promise((resolve, reject) => {
      self.transferCoins(self.coinbase, address, data.password)
          .then(bal => resolve(bal))
          .catch(err =>{
            store.state.message = "An error occurred"
            reject(err)
          })
    })
    //Finally create the account
    store.state.message = "Making final configurations..."
    const account = await new Promise((resolve, reject) => {
      self.instance.create( // Store this account on the smart contract with the email
        data.email,
        address,
        {from: self.web3Coinbase}
      ).then(tx => {
        tx.userAddress = address
        let token = jwt.sign({ email: data.email }, config.secret, { expiresIn: 86400 /* expires in 24 hours */ })
        tx.token = token
        tx.balance = balance
        resolve(tx)
      }).catch(err => {
        store.state.message = "An error occurred"
        reject(err)
      })
    })
    return account
    
    },

  transferCoins: async function (coinbaseAddress, address, pwd) {
    try {

      var amt;
      var result;
      if (!window.kaleido) { // Means this isnt kaleido
        amt = window.web3.toWei('0.1', 'ether')
        result = await window.web3.eth.sendTransaction({
          from: coinbaseAddress,
          to: address,
          value: amt,
          gas: 500000
        })
      } else{
        amt = window.kaleido.utils.toWei('0.1', 'ether')
        result = await window.kaleido.eth.sendTransaction({
          from: coinbaseAddress,
          to: address,
          value: amt,
          gas: 500000
        })
      }

      if (result) {
        const addressBal = await window.kaleido.eth.getBalance(address)
        if (!window.kaleido) {
          amt = window.web3.fromWei(addressBal, 'ether')
        } else{
          amt = window.kaleido.utils.fromWei(addressBal, 'ether')
        }
        return amt
      }
    } catch (err) {
      console.log(err)
    }
  },

  getBalance: async function (address) {
    try {
      // console.log(address)
      if (!window.kaleido) { // Means this isnt kaleido
        const addressBal = await window.web3.eth.getBalance(address)
        return window.web3.utils.fromWei(addressBal, 'ether')
      } else{
        const addressBal = await window.kaleido.eth.getBalance(address)
        return window.kaleido.utils.fromWei(addressBal, 'ether')
      }
    } catch (err) {
      console.log(err)
      return 0
    }
  },

}

export default Users
