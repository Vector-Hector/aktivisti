<script setup lang="ts">
import { uiStore } from 'src/store/UiStore'
import { RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
}
const props = defineProps<Props>()

function closeNavbar(navigate: () => void) {
  uiStore.toggleSidebar(false)
  navigate()
}
</script>

<template>
  <router-link v-slot="{ href, navigate }" custom :to="props.to">
    <a
      :href="href"
      class="menu-item-link"
      @click="closeNavbar(() => navigate($event))"
    >
      <slot />
    </a>
  </router-link>
</template>

<style lang="scss" scoped>
.menu-item-link {
  align-items: center;
}
</style>
