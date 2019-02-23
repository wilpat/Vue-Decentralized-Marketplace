/* eslint-disable */
import contract from 'truffle-contract'
import UsersContract from '@contracts/Users.json'
import jwt from 'jsonwebtoken'

import config from '../helpers/config'

const Users = {

  contract: null,

  instance: null,

  coinbase: '',

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
    try {
      window.web3.eth.getCoinbase((err, account) => {
        // const test = window.web3.personal.newAccount('pass1234')
        // console.log(test)
        // console.log(account)
        if (err === null) {
          self.coinbase = account
          // $('#account').text(account);
          window.web3.eth.getBalance(account, (error, balance) => {
            if (error === null) {
              if (!window.web3.currentProvider.hdwallet) {
                  self.coinbase_amount = window.web3.fromWei(balance, 'ether')
              } else{
                self.coinbase_amount = window.web3.utils.fromWei(balance, 'ether')
              }
              // console.log(self.coinbase, self.coinbase_amount)
            }
          })
        }
      })
    } catch (err) {
      console.log(err)
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

  create: function (data) {
    let self = this

    return new Promise((resolve, reject) => {
      if (!window.web3.currentProvider.hdwallet) {
          const address = window.web3.personal.newAccount(data.password) // Create a new address with this password
      } else{
        const address = window.web3.eth.personal.newAccount(data.password) // Create a new address with this password
        console.log(data.password)
      }
      self.userAddress = address
      self.transferCoins(self.coinbase, address, data.password) // Transfer some ether from the coinbase to it to start with
          .then(balance => {
            // console.log('As' + balance)
            self.instance.create( // Store this account on the smart contract with the email
                data.email,
                {from: address}
              ).then(tx => {
                tx.userAddress = self.userAddress
                let token = jwt.sign({ email: data.email }, config.secret, { expiresIn: 86400 /* expires in 24 hours */ })
                tx.token = token
                tx.balance = balance
                resolve(tx)
                // console.log(window.web3.eth.accounts)
              }).catch(err => {
                reject(err)
              })
          }).catch(console.log)
    })  
  },

  transferCoins: async function (coinbaseAddress, address, pwd) {
    try {
      // console.log('Coinbase: ' + coinbaseAddress)
      // console.log('Created address: ' + coinbaseAddress)
      await window.web3.personal.unlockAccount(coinbaseAddress, 'pass1234', 1000)
      await window.web3.personal.unlockAccount(address, pwd, 86400)
      var amt;
      if (!window.web3.currentProvider.hdwallet) {
        const amt = window.web3.toWei('0.01', 'ether')
      } else{
        const amt = window.web3.utils.toWei('0.01', 'ether')
      }

      const result = await window.web3.eth.sendTransaction({
        from: coinbaseAddress,
        to: address,
        value: amt,
        gas: 500000
      })
      if (result) {
        // console.log('sent money')
        // console.log('Me ' + result)
        // const coinbaseBal = await window.web3.eth.getBalance(coinbase_address);
        // console.log("coinbase balance" + window.web3.utils.fromWei(coinbaseBal, "ether") + " ETH");
        const addressBal = await window.web3.eth.getBalance(address)
        // console.log("address balance" + window.web3.utils.fromWei(addressBal, "ether") + " ETH");
        return window.web3.utils.fromWei(addressBal, 'ether')
      }
    } catch (err) {
      console.log(err)
    }
  },

  destroy: function (email) {
    let self = this

    return new Promise((resolve, reject) => {
      self.instance.destroy(email,
        {from: self.userAddress}
      ).then(tx => {
        // console.log(email)
        resolve(tx)
      }).catch(err => {
        reject(err)
      })
    })
  },

  getBalance: async function (address) {
    try {
      // console.log(address)
      const addressBal = await window.web3.eth.getBalance(address)
      if (!window.web3.currentProvider.hdwallet) {
        return window.web3.fromWei(addressBal, 'ether')
      } else{
        return window.web3.utils.fromWei(addressBal, 'ether')
      }
    } catch (err) {
      console.log(err)
      return 0
    }
  },

  test: () => {
    return window.web3.eth.accounts
  },

  login: async function (data) {
    const { email, password } = data
    let self = this
    const address = await new Promise((resolve, reject) => {//Try the email
                        self.instance.get(email,
                          {from: self.coinbase}
                        ).then(data => resolve(data))
                        .catch(err =>{
                          reject('Invalid credentials')
                        })
                     
                    })
    try{//Now try the password
      await window.web3.personal.unlockAccount(address, password, 86400)
      self.userAddress = address
      let tx = {}
      tx.userAddress = self.userAddress
      let token = jwt.sign({ email: email }, config.secret, { expiresIn: 86400 /* expires in 24 hours  */})
      tx.token = token
      const addressBal = await self.getBalance(address) // get the balance of this address
      tx.balance = addressBal
      return tx
    }catch (err){
      throw 'Invalid login'
    }
  }

  /*login: async function (data) {
    const { email, password } = data
    let self = this
    const bal = await self.getBalance(self.coinbaseAddress) // get the balance of this address
    console.log(bal)
    return await new Promise((resolve, reject) => {
      self.instance.get(email,
        {from: self.coinbase}
      ).then(address => {
        try{
            window.web3.personal.unlockAccount(address, password, 86400)
            self.userAddress = address
            let tx = {}
            tx.userAddress = self.userAddress
            let token = jwt.sign({ email: email }, config.secret, { expiresIn: 86400 /* expires in 24 hours  })
            tx.token = token
            const addressBal = self.getBalance(address) // get the balance of this address
            tx.balance = addressBal
            resolve(tx)
        } catch (err) {
          reject('Invalid credentials')
        }
      }).catch(err => {
        reject('Invalid login')
      })
    })
  }*/
}

export default Users
