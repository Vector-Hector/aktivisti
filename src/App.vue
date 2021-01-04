<template>
  <div id='root'>
    <img class="dielinke-logo" alt="Vue logo" src="./assets/logo_dielinke.png">
    <div class="nav">
      <router-link class="router-link" to='/'>Home</router-link>
      <router-link class="router-link" to='/events'>Events</router-link>
    </div>
    <div class="container">
    <router-view />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'App'
  })
</script>

<style lang="scss" scoped>
  @import 'src/scss/_globals.scss';

  .nav {
    padding-bottom: 100px;
  }

  .router-link {
    padding-right: 10px;
  }

  .container {
    margin-right: auto;
    margin-left:  auto;
    max-width: 960px;
    padding-right: 10px;
    padding-left:  10px;
  }

  .dielinke-logo {
    max-width: 240px;
  }
</style>
