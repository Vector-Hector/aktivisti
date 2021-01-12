<template>
  <div id="root">
    <Topbar />
    <NavigationSidebar />

    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Topbar from '@/components/Topbar.vue'
import NavigationSidebar from '@/components/NavigationSidebar.vue'

export default defineComponent({
  name: 'App',
  components: {
    NavigationSidebar,
    Topbar
  },
  data() {
    return {
      items: [{
        label: 'Kampagnen',
        icon: 'pi pi-plus',
        to: '/campaigns'
      }, {
        label:'Events',
        icon:'pi pi-fw pi-calendar',
        to: '/events'
      }]
    }
  }
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
    cursor: pointer;
  }

  .p-menubar {
    background: white;
    border: 1px solid $red;
  }
</style>
