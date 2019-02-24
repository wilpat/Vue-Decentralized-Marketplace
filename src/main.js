// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
import Vue from 'vue'
import App from './App'
import Web3 from 'web3'
import routes from './router/index'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import storeData from './store'
import axios from 'axios'
import {initialize} from './helpers/general.js'
import Web3HDWalletProvider from 'web3-hdwallet-provider'
// import HDWalletProvider from 'truffle-hdwallet-provider'

const mnemonic = "mansion vocal brother anxiety empower oak noise prosper select rival intact rich"

Vue.use(VueRouter)
Vue.use(Vuex)
let store = new Vuex.Store(storeData)
const router = new VueRouter({
  routes,
  mode: 'history'
})
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {//if page requires authentication
      if (localStorage.getItem('user') == null) { //If the user local storage is set
          next({
              path: '/login',
              params: { nextUrl: to.fullPath }
          })
      } else {
          next()
      }
  } else { // meaning the page doesnt need authentication
      next() 
  }
})
Vue.config.productionTip = false
window.axios = axios

window.addEventListener('load', function () {
  if (typeof web3 !== 'undefined') {
    console.log('Web3 injected browser: OK.')
    window.web3 = new Web3(window.web3.currentProvider)
  } else {
    console.log('Web3 injected browser: Fail. You should consider trying MetaMask.')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    // window.web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9ce3fce3a4c34accaa192f68222eff48'))
    // window.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://ropsten.infura.io/v3/9ce3fce3a4c34accaa192f68222eff48'))
    
    // Below uses the Web3 HD Wallet to connect to ropsten
    // -- this help me communicate with my smart contract since kaleido doesnt work atm
    var httpProvider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/9ce3fce3a4c34accaa192f68222eff48')
    var provider = new Web3HDWalletProvider(mnemonic, httpProvider);
    window.web3 = new Web3(provider)

    

    // Below tries to use truffle hdwaller
    // var provider = new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/9ce3fce3a4c34accaa192f68222eff48');

    //This is for kaleido -- it would help me manane user accounts
    provider = new Web3.providers.HttpProvider('https://e0n06zi2jf:o7pe38R9iUyf3Nh5HuYTtV1e_hzQG_DlYckeWA-ICd0@e0ssu47hxk-e0l91isw19-rpc.eu-central-1.kaleido.io')
    window.kaleido = new Web3(provider)
  }
  initialize(store, router)
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
  })
})
