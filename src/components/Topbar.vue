<template>
  <div class="topbar">
    <a @click="openSidebar" class="hamburger">
      <i class="pi pi-bars"></i>
    </a>
    <img class="dielinke-logo" alt="Die LINKE Logo" src="../assets/logo_dielinke.png" v-on:click="$router.push('/')">
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { uiStore } from '@/store/UiStore'

export default defineComponent({
  name: 'Topbar',
  components: {},
  data() {
    return {}
  },
  methods: {
    openSidebar() {
      uiStore.openSidebar()
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/scss/_globals.scss';

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

.hamburger {
  position: absolute;
  padding: 0 16px;

  i {
    font-size: 32pt;
  }
}

</style>
