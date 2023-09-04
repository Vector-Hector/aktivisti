<script setup lang="ts">
import { computed } from 'vue'
import ResizableBottomSheet from 'components/ResizableBottomSheet.vue'
import MapSidebar from 'components/MapSidebar.vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { userStore } from 'src/store/UserStore'

interface Props {
  showCreateButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCreateButton: false
})

const $q = useQuasar()
const $router = useRouter()
const overlayComponent = computed(() => {
  return $q.screen.lt.md ? ResizableBottomSheet : MapSidebar
})

async function handleCreateEvent() {
  let to = 'create-event-request-permissions'
  if (userStore.hasAtLeastOneManagePermission()) {
    to = 'create-event'
  }
  await $router.push({ name: to })
}
</script>

<template>
  <component
    class="overlay-shadow"
    :is="overlayComponent"
    v-bind="$props"
    :showCreateButton="props.showCreateButton"
    @onCreateEvent="handleCreateEvent"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped>
::v-deep(.overlay-title) {
  background: $grey-1;
  border-bottom: 1px solid $red;
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  line-height: 1.5rem;
}
</style>
