<template>
  <div id="root">
    <Topbar
      :show-sidebar="showNavigation"
    />
    <NavigationSidebar />

    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Topbar from '@/components/Topbar.vue'
import NavigationSidebar from '@/components/NavigationSidebar.vue'
import { uiStore } from '@/store/UiStore'

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
        label: 'Events',
        icon: 'pi pi-fw pi-calendar',
        to: '/events'
      }]
    }
  },
  computed: {
    showNavigation() {
      return uiStore.getState().showNavigation
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/scss/_globals.scss';

#root {
  display: flex;
  flex-direction: column;
}

.nav {
  padding-bottom: 100px;
}

.router-link {
  padding-right: 10px;
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
