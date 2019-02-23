<template>
  <div class="dashboard">
    <h1>{{ msg }}</h1>
    <div v-if="userExists">
      Welcome {{ user.email }}. <br>
      Your account is {{ user.address }} with a balance of {{ balance }} ETH <br>
      Destroy your account  by clicking 
      <a href="#" @click="destroyAccount">here</a>.

    </div>
    <div v-else>Sign up <router-link to="/signup">here</router-link>.</div>
  </div>
</template>

<script>
import Users from '@/js/users'
import { mapState } from 'vuex'
export default {
  name: 'dashboard',
  data () {
    return {
      msg: 'Welcome to your truffle-vue dApp'
    }
  },
  computed: {
    userExists: function () {
      return (this.user !== null)
    },
    ...mapState(['user', 'balance'])
  },
  created: function () {
    if (this.user !== null) {
      Users.init().then(() => { // Initialize thr contract
        Users.getBalance(this.user.address)// get the balance of this address
            .then((bal) => {
              this.$store.commit('updateBalance', parseFloat(bal).toFixed(3))
            })
            .catch(console.log)
      }).catch(err => {
        console.log(err)
      })
    }
  },
  methods: {
    destroyAccount: function (e) {
      e.preventDefault()
      Users.destroy(this.user.email).then(() => {
        this.$store.commit('logout')
        // this.$router.push('/login')
      }).catch(err => {
        console.log(err)
      })
    },

    test: () => {
      this.$store.commit('update', 'try')
      // console.log(Users.test())
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
  display: block;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
