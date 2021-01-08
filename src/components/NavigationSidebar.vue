<template>
  <Sidebar :visible="sidebarExpanded" @update:visible="toggleSidebar">
    <Menu :model="items" />
  </Sidebar>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { uiStateStore } from '@/store/UiStateStore'
  import Sidebar from 'primevue/components/sidebar/Sidebar'
  import Menu from 'primevue/components/menu/Menu'

  export default defineComponent({
    name: 'NavigationSidebar',
    components: {
      Sidebar,
      Menu
    },
    computed: {
      sidebarExpanded() {
        return uiStateStore.getState().sidebarExpanded
      }
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
    },
    methods: {
      toggleSidebar(expanded: boolean) {
        uiStateStore.toggleSidebar(expanded)
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
