<template>
  <router-link
    v-slot="{ href, navigate }"
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
      type: [String, Object] as PropType<any>,
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
<style lang="scss" scoped>
.menu-item-link {
  align-items: center;
}

</style>
