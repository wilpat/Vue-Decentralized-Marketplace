<template>
  <section id='signup'>
    <h1>Login</h1>
    <div class="form">
      <div class="">

        <label for="email">Email</label>
        <input name="email" v-model="form.email">

        <label for="password">Password</label>
        <input name="password" v-model="form.password" type="password">

        <button class="btn" @click="login" name="signup">Login</button>
        <router-link to ="/signup" class="btn">Sign up</router-link>

      </div>
    </div>
  </section>
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

<style lang="scss" scoped>

  #signup {
    text-align: center;
    
    .form {
      display: flex;
      flex-direction: column;
      margin: auto;
      
      .entry {
        display: flex;
        flex-direction: row-reverse;
        justify-content: center;
        
        label {
          margin-right: 20px
        }
        
        button {
          margin-left: 20px
        }  
        
      }
        
    }
    
  }

</style>
