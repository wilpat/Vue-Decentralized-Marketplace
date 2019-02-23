<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
/*@import url(~bulma/css/bulma.css);*/
body, html{
  padding:0;
  margin: 0;
}
/* .footer{
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 114px;
} */

.welcome{
  font-size: 18px;
  display: inline;
  padding: 5px;
} 
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
