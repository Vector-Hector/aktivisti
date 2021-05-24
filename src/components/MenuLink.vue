<template>
  <router-link
    v-slot="{ href, navigate }"
    class="menu-item-link"
    custom
    :to="to"
  >
    <a
      :href="href"
      class="menu-item-link"
      @click="closeNavbar(() => navigate($event))"
    >
      <slot />
    </a>
  </router-link>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { uiStore } from 'src/store/UiStore'

export default defineComponent({
  name: 'MenuLink',
  props: {
    to: {
      type: Object as PropType<any>,
      required: true
    }
  },
  methods: {
    closeNavbar(navigate: () => void) {
      uiStore.toggleSidebar(false)
      navigate()
    }
  }
})
</script>
