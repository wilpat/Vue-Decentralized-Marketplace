/* eslint-disable */
import contract from 'truffle-contract'
import ProductList from '@contracts/ProductList.json'
import store from '../store'

const App = {
     web3Provider: null,
     contract: null,
     instance : null,
     loading: false,
     mounted: false,
     coinbase: '',
     userAccount: '',

     init: function (userAccount) {
        let self = this
        self.setCoinbase()
        self.userAccount = userAccount
        return new Promise(function (resolve, reject) {
          self.contract = contract(ProductList)
          self.contract.setProvider(window.web3.currentProvider)
          self.contract.deployed().then(instance => {
          self.instance = instance
          self.listenForEvents()
          resolve(self.coinbase)
          }).catch(err => {
            reject(err)
          })
        })
      },

     setCoinbase: async function () { // Check if app is connected to the blockchain server
        let self = this
        try {
          window.web3.eth.getCoinbase((err, account) => {
            if (err === null) {
              self.coinbase = account
              // console.log(self.instance)
            }
          })
        } catch (err) {
          console.log(err)
        }
      },

      loadItems: async function () {
        let self = this
        self.loading = true
        // retrieve the items placeholder and clear it
        // console.log(self.instance)
        const itemIds = await new Promise(function (resolve, reject) {
          self.instance.getItemsForSale()
          .then(itemIds => {
            resolve(itemIds)
          }).catch(err=>{
            reject(err)
          })
        })

        // let res = await Promise.all([itemIds])

        let itemsArray = []

        for (var i = itemIds.length - 1; i >= 0; i--) {//Iterate and render the items in descending order
          var itemId = itemIds[i];
          // console.log(itemId)
          let itemFromPromise = await new Promise(function (resolve, reject) {

            self.instance.items(parseInt(itemId)).then(item => {//Get the item that corresponds to each id
              item[5] = parseFloat(window.web3.fromWei(item[5], 'ether')).toFixed(2)
              resolve(item)
            })
            .catch(err =>{
              reject(err)
            })
          })
          itemsArray.push(itemFromPromise)
        }
        return itemsArray;
        
      },

      test: function () {
        let self = this
        console.log('here')
        console.log(self.coinbase)

      },
      //getProductItems: async (cart) => {
      // Get product objects
      //   const productItemsPromise = cart.items.map(item => utils.blackAxios.get(`https://vendor-backend.thealternativemall.com/v1/auth/product/byid?_id=${item.product}`, {
      //     headers: {
      //       'Content-Type': 'application/json'
      //     }
      //   }))

      //   let new_cart = JSON.stringify(cart)
      //   new_cart = JSON.parse(new_cart)

      //   const productItems = await Promise.all(productItemsPromise)
      //   const items = []
      //   for (let i = 0; i < new_cart.items.length; i++) {
      //     if (productItems[i].data.status === 'success') {
      //       const item = productItems[i].data.data
      //       new_cart.items[i].product = item
      //       items.push(new_cart.items[i])
      //     }
      //   }
      //   new_cart.items = items
      //   return new_cart
      // }


     sellItem: function (_name, _price, _description) {
      // Retreive the details of the item you wanna sell
      let self = this
      _price = window.web3.toWei(parseInt(_price), 'ether');
      if((_name.trim() == '') || (_price == 0)){
        //Incomplete sales details
      return false;
       }
       
       return new Promise((resolve, reject) => {

        self.instance.sellItem(_name, _description, _price, {
            from: self.userAccount,
            gas: 500000
            })
        .then(result =>{
            self.loadItems()
                .then(data => resolve(data))
                .catch(err=> { reject(data)})
        }).catch(err =>{
          reject(err);
        });
      })
    },

    listenForEvents: function () {
      let self = this
      //Restart chrome if you're unable to receive this event.
      //This is a known issue with MetaMask
      //github.com/MetaMask/metamask-extension/issues/2393
      self.instance.itemSold({}, {}).watch((error, event) =>{
        if(!error){
          // console.log(event)
          store.state.events.push(event.args)
          /*$('#events').append(`<li class ='list-group'>${event.args._name} is now for sale`);
          if(self.mounted){
            self.loadItems();//Rerender the app only after the first loading is complete 
          }*/
        }else{
          console.error(error)
        }
        
      });

      self.instance.itemBought({}, {}).watch((error, event) =>{
        if(!error){
          store.state.events.push(event.args)         
        }else{
          console.error(error)
        }
        
      });

  },
  buyItem: async function (item) {
    let self = this
    var _id = item[0];
    var _price = item[5];
    await self.instance.buyItem(_id, {
      from:self.userAccount,
      value: web3.toWei(_price, 'ether'),
      gas: 500000
    })
    const items = await self.loadItems();
    return items;
  }

};

export default App
