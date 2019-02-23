<template>

  <div class="login-wrapper">

    <div class="login-left">
      <img height="100" src="../assets/shop.png">
    </div>
    <form class="login-right" @submit.prevent>
      <div class="h2">Login</div>
      <div class="form-group">
        <input type="text" id="email" placeholder="Email" v-model="form.email">
        <label for="email">Email</label>    
      </div>
      <div class="form-group">
        <input type="password" id="Password" placeholder="Password" v-model="form.password">
        <label for="Password">Password</label>    
      </div>
      <!-- <div class="checkbox-container">
         <input type="checkbox" v-model="rememberMe">
         <div class="text-checkbox">Remember me</div>
       </div> --> 
      <div class="button-area">
        <button class="btn btn-primary float-right" @click="login" >Login</button>
        <router-link to ="/signup" class="btn btn-primary float-right" style="padding-top: 8px">Sign up</router-link>

      </div>
      
    </form>

  </div>
  
</template>

<script>
  import Users from '@/js/users'
  // import { mapState } from 'vuex'
  export default {
    name: 'login',
    data () {
      return {
        form: {
          email: '',
          password: ''
        },
        message: 'me',
        message2: this.message
      }
    },
    beforeCreate: function () {
      Users.init()
    },
    beforeMount () {
      let init = 1000
      setTimeout(function () {
        document.querySelector('.login-wrapper').classList.toggle('open')
        init = 300
      }, init)
    },
    methods: {
      login () {
        if (this.form.email !== '' && this.form.password !== '') {
          let data = {
            email: this.form.email,
            password: this.form.password
          }
          Users.login(data)
          .then(tx => {
            // console.log(1)
            // console.log(tx)
            let load = {
              user: {
                email: data.email,
                address: tx.userAddress
              },
              token: tx.token
            }
            this.$store.commit('loginSuccess', load)// Pass the user deets and the token to the store to register
            this.$store.commit('updateBalance', parseFloat(tx.balance).toFixed(3))
            this.$router.push('/')
          })
          .catch(err => {
            console.log(err)
          })
        }
      },

      test () {
        // let self = this
        console.log(this.email)
        this.$store.commit('update', 'try')
        // console.log(Users.test())
      }
    },

    computed: {
      // ...mapState(['email'])
      email () {
        return this.$store.state.email
      }
    }
  }
</script>

<style>


</style>
