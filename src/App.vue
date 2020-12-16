<template>
  <div id='root'>
      <img alt="Vue logo" src="./assets/logo_dielinke.png">
    <div id='nav'>
      <router-link id="router-link" to='/'>Home</router-link>
      <router-link id="router-link" to='/events'>Events</router-link>
    </div>

    <router-view />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'App'
  })
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');

  html, body {
    font-family: 'Roboto', Arial, Helvetica, Geneva, sans-serif;
  }

  #app {
    font-family: 'Roboto', Arial, Helvetica, Geneva, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
  }

  #nav {
    padding-bottom: 100px;
  }

  #router-link {
    padding-right: 10px;
  }

</style>
