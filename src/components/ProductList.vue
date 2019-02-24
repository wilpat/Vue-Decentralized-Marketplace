<template>
	<div>
		<div id="cover-spin" v-if="loading">
	      <p id ="content">{{ message }}</p>
	    </div>
		<div class="container">
	        <div class="jumbotron text-center">
	             <h1>Product List</h1>
	        </div>

	        <div class="col-md-12" id="article-list">
	            <div class="row">
	             <div class="col-lg-12">
	               <p id="account" class="welcome float-right">{{ this.user.address }}</p>
	               <p id="accountBalance" class="welcome float-left">{{ this.balance }} ETH</p>
	             </div>
	            </div>
	            
	            <div class="row card card-default">
	              <div class="card-heading clearfix">
	                <div class="card-title">
	                  <button class="btn btn-info btn-lg float-left" data-toggle = "collapse" data-target="#events" aria-expanded="false" aria-controls="events">Events</button>
	                  <button class="btn btn-info btn-lg  ml-3 float-right" @click ="logout">Logout</button>
	                  <button class="btn btn-info btn-lg float-right" @click="sell = true">Sell an item</button>
	                </div>
	              </div>
	              <ul id="events" class="collapse list-group">
	              	<li class ='list-group' v-for="event in events">
	              		{{event._name}} {{ event._buyer ? ' has been bought' : ' is now for sale' }}
	              	</li>
	              </ul>
	            </div>

	            <div id="itemsRow" class="row" style="margin: .25rem!important">
	            	<h5 v-if="!items.length" style="margin: 0 auto;">
	            		{{ loaded ? 'No item for sale.' : 'Loading items' }}
	            	</h5>

	              	<div id="itemTemplate" v-for="item in items" v-if="item[2] === '0x0000000000000000000000000000000000000000'" class="col-lg-4 mr-1">
				       	<div>
				         <div class="card card-default card-article" style="text-align: left;">
				           <div class="card-heading">
				             <h5 class="card-title" style="margin-left: 1.2rem; text-decoration: underline;">{{ item[3] }}</h5>
				           </div>
				           <div class="card-body" style="padding-top: 0">
				             <strong>Description</strong>: <span class="item-description">{{ item[4] }}</span><br/>
				             <strong>Price (ETH)</strong>: <span class="item-price"></span>{{ item[5] }}<br/>
				             <strong>Sold by</strong>: <span class="item-seller"></span>{{ getSeller(item[1]) }}<br/>
				           </div>
				           <div class="card-footer" v-if="user.address.toLowerCase() !== item[1]">
				             <button class="btn btn-primary btn-success btn-buy" type="button" @click="buyItem(item)">Buy</button>
				           </div>
				         </div>
				        </div>
				    </div>
	            </div>
	        </div>
	    </div>

	        <!-- Modal form to sell an item -->
        <div class="modal" id="sellItem" role="dialog" v-if="sell">
          <div class="modal-dialog" v-if="sell">

            <!-- Modal content-->
            <div class="modal-content" v-if="sell">
              <div class="modal-header d-block" v-if="sell">
                <button type="button" class="close" @click ="sell = false">&times;</button>
                <h5 class="modal-title">Sell your item</h5>
              </div>
              <div class="modal-body">

                <div class="row">
                  <div class="col-lg-12">
                    <form>
                      <div class="form-group">
                        <label for="item_name">Item name</label>
                        <input type="text" class="form-control" v-model ="name" placeholder="Enter the name of your item">
                      </div>
                      <div class="form-group">
                        <label for="price">Price in ETH</label>
                        <input type="number" class="form-control" v-model="price" placeholder="1" pattern="[0-9]+([\.,][0-9]+)?" step="0.01">
                      </div>
                      <div class="form-group">
                        <label for="description">Description</label>
                        <textarea type="text" class="form-control vresize" v-model="description" placeholder="Describe your item" maxlength="255"></textarea>
                      </div>
                      <p style="color: red"> {{ report }}</p>
                    </form>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-success" @click="sellItem" >Submit</button>
                <button type="button" class="btn" @click ="sell = false">Close</button>
              </div>
            </div>

          </div>
        </div>
		
		<!-- <footer class="footer mt-2">
			<div class="footer-copyright text-center py-3">&copy; 2019 Copyright:
		      <a href="https://twitter.com/williamokafor"> Okafor William</a>
		    </div>
		</footer> -->
	</div>
</template>

<script>
/* eslint-disable */
	import App from '@/js/app'
	import User from '@/js/users'
	import { mapState, mapMutations } from 'vuex'
	export default {
		name: 'productlist',
		created () {
			App.init(this.user.address)
				.then((data) => {
					// console.log(data)
					App.loadItems()
						.then(items =>{
							this.items = items;
							this.loaded = true;
						})
						.catch(err => {
							this.loaded = true
							console.log(err)
						})
				}).catch(err => {
					this.loaded = true
					console.log(err)
				})
			if(this.balance == 0){//Since balance has a default of 0, if the user refreshes the page, it would be zero refetch the bal
				User.getBalance(this.user.address)
					.then(bal => this.$store.commit('updateBalance', parseFloat(bal).toFixed(3)))
			}
		},
		data () {
			return {
				name: '',
				price: '1',
				description: '',
				items: [],
				loading: false,
				sell: false,
				loaded: false,
				report: ''
			}
		},
		methods: {
			buyItem (item) {
				if(parseFloat(this.balance) >= parseFloat(item[5]))
				{
					this.loading = true
					App.buyItem(item)
						.then(data =>{
							this.items = data
							User.getBalance(this.user.address)
								.then(bal => {
									this.loading = false
									this.$store.commit('updateBalance', parseFloat(bal).toFixed(3))
								})
						})
						.catch(err =>{
							alert('Something went wrong with your request')
							this.loading = false
							console.log(err)
						})
				}else {
					alert('You don\'t have sufficient ethers to buy this.')
				}
			},
			
			sellItem () {
				this.report = ''
				if(this.name.trim() != '' && this.price != '' && this.price != 0 && this.description.trim() != '')
				{
					this.loading = true
					// let price = window.web3.utils.toBN(this.price)
					App.sellItem(this.name, this.price, this.description)
						.then(items =>{
							this.loading = false
							this.sell = false
							this.items = items
						})
						.catch(err => {
							this.report = 'An error occured with your request'
							this.loading = false
							console.log(err)
						})
				}else{
					this.report = 'Missing fields'
				}
				
				// App.test()
			},

			getSeller (sellerAddress) {
				return sellerAddress === this.user.address.toLowerCase() ? 'You' : sellerAddress
			},
			...mapMutations(['logout'])

		},

		computed: {
			...mapState(['balance', 'user', 'events', 'message'])
		}

	}
</script>

<style scoped>
	#itemTemplate{
		padding:0;
	}
	.footer {
	  position: fixed;
	  left: 0;
	  bottom: 0;
	  width: 100%;
	  background-color: teal;
	  color: white;
	  text-align: center;
	}

	.list-group{
		text-align: left
	}
	.modal{
		display: block;
		background: rgba(0,0,0,0.6);
	}
	.col-lg-4{
		max-width: 32%;
	}
</style>