<template>
  <div class="topbar">
    <a
      v-if="showSidebar"
      class="hamburger"
      @click="openSidebar"
    >
      <i class="pi pi-bars" />
    </a>
    <img
      class="dielinke-logo"
      alt="Die LINKE Logo"
      src="../assets/logo_dielinke.png"
      @click="$router.push('/')"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { uiStore } from 'src/store/UiStore'

export default defineComponent({
  name: 'Topbar',
  props: {
    showSidebar: {
      type: Boolean as PropType<boolean>,
      default: true
    }
  },
  data() {
    return {}
  },
  methods: {
    toggleSidebar() {
      uiStore.toggleSidebar()
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/css/_globals.scss';

.topbar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid $red;
}

.dielinke-logo {
  max-width: 240px;
  cursor: pointer;
  margin: auto;
}

a.hamburger {
  color: black;
  position: absolute;
  padding: 0 16px;

  i {
    font-size: 32pt;
  }
}

</style>
